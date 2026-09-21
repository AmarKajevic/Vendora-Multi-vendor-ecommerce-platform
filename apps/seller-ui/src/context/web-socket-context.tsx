"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react";
import axiosInstance from "../utils/axiosInstance";

const WebSocketContext = createContext<any>(null)


export const WebSocketProvider = ({
    children,
    seller
}: {
    children: React.ReactNode;
    seller: any
}) => {
    const [wsReady, setWsReady] = useState(false);
    const wsRef = useRef<WebSocket | null>(null)
    const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({})

    useEffect(() => {
        if(!seller?.id) return;
        let ws: WebSocket;
        let cancelled = false;

        const connect = async () => {
            const { data } = await axiosInstance.get("/api/ws-token");
            if(cancelled) return;

            ws = new WebSocket(process.env.NEXT_PUBLIC_CHATTING_WEBSOCKET_URI!)
            wsRef.current = ws;

            ws.onopen = () => {
                ws.send(data.wsToken);
                setWsReady(true);
            }

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                if(data.type === "UNSEEN_COUNT_UPDATE"){
                    const {conversationid, count} = data.payload;
                    setUnreadCounts((prev) => ({
                        ...prev, [conversationid]: count
                    }))
                }
            }
        };
        connect();

        return () => {
            cancelled = true;
            ws?.close()
        }
    },[seller?.id])

    if(!wsReady) return null;

    return <WebSocketContext.Provider value={{ws: wsRef.current, unreadCounts}}>

        {children}
    </WebSocketContext.Provider>
}

export const useWebSocket = () => useContext(WebSocketContext)