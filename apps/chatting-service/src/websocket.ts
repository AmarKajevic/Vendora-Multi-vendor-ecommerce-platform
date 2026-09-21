import redis from "@packages/libs/redis";
import {Server as HttpServer} from "http";
import { kafka } from "@packages/utils/kafka";
import {WebSocketServer, WebSocket} from "ws";
import jwt from "jsonwebtoken";


const producer = kafka.producer();
const connectedUsers: Map<string, WebSocket> = new Map()
const unseenCounts:Map<string, number> = new Map()

type IncomingMessage = {
    type?: string;
    fromUserId: string;
    toUserId: string;
    messageBody: string;
    conversationId: string;
    senderType: string;
}

export async function createWebSocketServer(server: HttpServer) {
    const wss = new WebSocketServer({server});

    await producer.connect()
    console.log("Kafka producer connected!")

    wss.on("connection", (ws: WebSocket)=> {
        console.log("new websocket connection");

        let registeredUserId: string | null =null;

        ws.on("message", async(rawMessage) => {
            try {
                const messageStr = rawMessage.toString();
                //register connection on the first message: a short-lived JWT (from /api/ws-token), not a raw claimed id
                if(!registeredUserId && !messageStr.startsWith("{")){
                    let decoded: { id: string; role: string };
                    try {
                        decoded = jwt.verify(
                            messageStr,
                            process.env.ACCESS_TOKEN_SECRET as string,
                        ) as { id: string; role: string };
                    } catch (err) {
                        console.warn("WebSocket auth failed:", (err as Error).message);
                        ws.close(4001, "Unauthorized");
                        return;
                    }

                    registeredUserId = decoded.role === "seller" ? `seller_${decoded.id}` : `user_${decoded.id}`;
                    connectedUsers.set(registeredUserId, ws)
                    console.log(`register websocket for userId: ${registeredUserId}`)

                    const isSeller = registeredUserId.startsWith("seller_")
                    const redisKey = isSeller ? `online:seller:${registeredUserId.replace("seller_", "")}` : `online:user:${registeredUserId}`
                    await redis.set(redisKey, "1")
                    await redis.expire(redisKey, 300)
                    return;
                }

                //process JSON message

                const data:IncomingMessage = JSON.parse(messageStr);

                //if it's seen update

                if(data.type === "MARK_AS_SEEN" && registeredUserId){
                    const seenKey= `${registeredUserId}_${data.conversationId}`;
                    unseenCounts.set(seenKey, 0);
                    return;
                }

                //regular message
                const {
                 fromUserId,
                 toUserId,
                 messageBody,
                 conversationId,
                 senderType   
                } = data;

                if(!data || !toUserId || !messageBody || !conversationId) {
                    console.warn("invalid message format:", data)
                    return
                }

                const now = new Date().toISOString();

                const messagePayload = {
                    conversationId,
                    senderId: fromUserId,
                    senderType,
                    content: messageBody,
                    createdAt: now
                }

                const messageEvent = JSON.stringify({
                    type: "NEW_MESSAGE",
                    payload: messagePayload

                })

                const receiverKey = senderType === "user"? `seller_${toUserId}` : `user_${toUserId}`
                const senderKey = senderType === "user" ? `user_${fromUserId}` : `seller_${fromUserId}`

                //update unseen count dynamically
                const unseenKey = `${receiverKey}_${conversationId}`;
                const prevCount = unseenCounts.get(unseenKey) || 0;
                unseenCounts.set(unseenKey, prevCount + 1);

                //send new message to receiver

                const receiverSocket = connectedUsers.get(receiverKey);
                if(receiverSocket && receiverSocket.readyState === WebSocket.OPEN) {
                    receiverSocket.send(messageEvent)

                    //aslo notify unseen count

                    receiverSocket.send(
                        JSON.stringify({
                            type: "UNSEEN_COUNT_UPDATE",
                            payload: {
                                conversationId,
                                count: prevCount + 1
                            }
                        })
                    )
                    console.log(`Delivered message + unseen count to ${receiverKey}`)
                }else {
                    console.log(`user ${receiverKey} is offline. message queued`)
                }


                //echo to sender

                const senderSocket = connectedUsers.get(senderKey)
                if(senderSocket && senderSocket.readyState === WebSocket.OPEN){
                    senderSocket.send(messageEvent);
                    console.log(`Echoed message to sender ${ senderKey}`)
                }

                //push to kafka consumer
                await producer.send({
                    topic: "chat.new_message",
                    messages: [
                        {
                            key: conversationId,
                            value: JSON.stringify(messagePayload)
                        }
                    ]
                })

                console.log(`message queued to kafka: ${conversationId}`)
            } catch (error) {
                console.error("Error processing WebSocket message:", error)
            }
        })

        ws.on("close", async() => {
            if(registeredUserId) {
                connectedUsers.delete(registeredUserId)
                console.log(`disconnected user ${registeredUserId}`)

                const isSeller = registeredUserId.startsWith("seller_")
                const redisKey = isSeller
                ? `online:seller:${registeredUserId.replace("seller_","")}`
                : `online:user:${registeredUserId}`

                await redis.del(redisKey)

            }
        })
        ws.on("error", (err) => {
            console.error("Websocket error", err)
        })
    })

    console.log("WebSocket server ready")
}

