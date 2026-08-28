"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "apps/seller-ui/src/context/web-socket-context";
import useSeller from "apps/seller-ui/src/hooks/useSeller";
import ChatInput from "apps/seller-ui/src/shared/components/chats/chat-input";
import axiosInstance from "apps/seller-ui/src/utils/axiosInstance";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const page = () => {
  const searchParams = useSearchParams();
  const { seller } = useSeller();
  const router = useRouter();
  //const wsRef = useRef<WebSocket | null>(null);
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnchorRef = useRef<HTMLDivElement | null>(null);
  const queryClient = useQueryClient();

  const [chats, setChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [message, setMessage] = useState("");
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasFetchedOnce, setHasFetchedOnce] = useState(false);
  const conversationId = searchParams.get("conversationId");
  const { ws } = useWebSocket();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await axiosInstance.get(
        "/chatting/api/get-seller-conversations");
      return res.data.conversations;
    },
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: async () => {
      if (!conversationId || hasFetchedOnce) return [];
      const res = await axiosInstance.get(
        `/chatting/api/get-seller-messages/${conversationId}?page=1`
    
      );
      setHasFetchedOnce(true);
      return res.data.messages.reverse();
    },
    enabled: !!conversationId,
    staleTime: 2 * 60 * 1000,
  });


  useEffect(() => {
    if (conversations) setChats(conversations);
  }, [conversations]);

  useEffect(() => {
    if(!ws) return ;

    ws.onmessage = (event :any) => {
        const data= JSON.parse(event.data);

        if(data.type === "NEW_MESSAGE"){
            const newMsg = data?.payload;

            if(newMsg.conversationId=== conversationId) {
                queryClient.setQueryData(["messages", conversationId],
                (old:any=[]) => [
                    ...old,
                    {
                        content: newMsg.messageBody || newMsg.content || "",
                        senderType: newMsg.senderType,
                        seen: false,
                        createdAt: newMsg.createdAt || new Date().toISOString()
                    }
                ]
            )
            scrollToBottom()
            }

            setChats((prevChats) =>
                prevChats.map((chat) =>
                    chat.conversationId === newMsg.conversationId
                    ? { ...chat, lastMessage: newMsg.messageBody }
                    : chat,
                ),
                );
        } 

        if(data.type === "UNSEEN_COUNT_UPDATE"){
            const {conversationId, count} = data.payload;
            setChats((prevChats) => 
                prevChats.map((chat) => 
                    chat.conversationId === conversationId ? {...chat, unreadCount: count }: chat
                )
            )
        }
    }
  },[ws, conversationId])

    const handleChatSelect = (chat: any) => {
    setHasFetchedOnce(false);
    setChats((prev) =>
      prev.map((c) =>
        c.conversationId === chat.conversationId ? { ...c, unreadCount: 0 } : c,
      ),
    );
    router.push(`?conversationId=${chat.conversationId}`);

    if(ws && ws.readyState === WebSocket.OPEN){
         ws?.send(JSON.stringify({
        type:"MARK_AS_SEEN",
        conversationId: chat.conversationId
    }))
    }
  };

  const handleSend = async (e: any) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || !ws || ws.readyState !== WebSocket.OPEN) return;

    const payload = {
      fromUserId: seller?.id,
      toUserId: selectedChat?.user?.id,
      conversationId: selectedChat?.conversationId,
      messageBody: message,
      senderType: "seller",
    };


    ws?.send(JSON.stringify(payload));


    setMessage("")
    scrollToBottom()
  };

  useEffect(() => {
    if (conversationId && chats.length > 0) {
      const chat = chats.find((c) => c.conversationId === conversationId);
      setSelectedChat(chat || null);
    }
  }, [conversationId, chats]);
  useEffect(() => {
    if(messages?.length > 0) scrollToBottom()
  },[messages])



  const loadMoreMessages = async () => {
    const nextPage = page + 1;
    const res = await axiosInstance.get(
      `/chatting/api/get-seller-messages/${conversationId}?page=${nextPage}`,
    );

    queryClient.setQueryData(["messages", conversationId], (old: any = []) => [
      ...res.data.messages.reverse(),
      ...old,
    ]);

    setPage(nextPage);
    setHasMore(res.data.hasMore);
  };


  const scrollToBottom = () => {
    requestAnimationFrame(() => {
        setTimeout(() => {
            scrollAnchorRef.current?.scrollIntoView({behavior: "smooth"})
        }, 0) 
    })
  }

  

  return (
    <div className="w-full">
      <div className="flex h-screen shadow-inner overflow-hidden bg-gray-950 text-gray-100">
        <div className="w-[320px] border-r border-gray-800 bg-gray-950">
            <div className="p-4 border-b border-b-gray-800 text-lg font-semibold text-white">
              Messages
            </div>
            <div className="divide-y divide-gray-200">
              {isLoading ? (
                <div className="p-4 text-sm text-gray-500">Loading...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">
                  No Conversations available yet
                </div>
              ) : (
                chats.map((chat) => {
                  const isActive =
                    selectedChat?.conversationId === chat.conversationId;

                  return (
                    <button
                      key={chat.conversationId}
                      onClick={() => handleChatSelect(chat)}
                      className={`w-full text-left px-4 py-3 transition hover:bg-sky-100 ${
                        isActive ? "bg-sky-200" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            chat.user?.avatar ||
                            "https://ik.imagekit.io/amark97/products/3135715.png?updatedAt=1783949179738"
                          }
                          alt={chat.user?.name}
                          width={36}
                          height={36}
                          className="rounded-full border w-[40px] h-[40px] object-cover"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-800 font-semibold">
                              {chat.user?.name}
                            </span>
                            {chat.user?.isOnline && (
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-400 truncate max-w-[170px]">
                                {chat.lastMessage || ""}{" "}
                            </p>
                            {chat.unreadCount > 0 && (
                                <span className="ml-2 text-[10px] bg-sky-600 text-white p-1 rounded-lg">
                                    {chat?.unreadCount > 9 ? "9+" : chat?.unreadCount}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex flex-col flex-1 bg-gray-950">
            {selectedChat ? (
              <>
                <div className="p-4 border-b border-b-gray-800 bg-gray-900 flex items-center gap-3">
                  <Image
                    src={
                      selectedChat.user?.avatar ||
                      "https://ik.imagekit.io/amark97/products/3135715.png?updatedAt=1783949179738"
                    }
                    alt={selectedChat.user?.name}
                    width={40}
                    height={40}
                    className="rounded-full border w-[40px] h-[40px] object-cover text-white border-gray-200"
                  />
                  <div>
                    <h2 className="text-gray-200 font-semibold text-base">
                      {selectedChat.user?.name}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {selectedChat.user?.isOnline ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
                <div
                  ref={messageContainerRef}
                  className="flex-1 overflow-y-auto px-6 space-y-4 text-sm"
                >
                  {hasMore && (
                    <div className="flex justify-center mb-2">
                      <button
                        onClick={loadMoreMessages}
                        className="text-xs px-4 py-1 bg-gray-200 hover:bg-gray-300"
                      >
                        Load previous messages
                      </button>
                    </div>
                  )}

                  {messages?.map((msg: any, index: number) => (
                    <div
                      key={index}
                      className={`flex flex-col ${
                        msg.senderType === "seller"
                          ? "items-end ml-auto"
                          : "items-start"
                      } max-w-[80%]`}
                    >
                      <div
                        className={`${msg.senderType === "seller" ? "bg-sky-600 text-white" : "bg-gray-800 text-gray-100"} px-4 py-2 rounded-lg shadow-sm w-fit mt-2`}
                      >
                        {msg.text || msg.content}
                      </div>
                      <div
                        className={`text-[11px] text-gray-400 flex items-center ${
                          msg.senderType === "seller"
                            ? "mr-1 justify-end"
                            : "ml-1"
                        }`}
                      >
                        {msg.time ||
                          new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollAnchorRef}></div>
                </div>
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSendMessage={handleSend}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                Select Conversation to start chatting
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default page;
