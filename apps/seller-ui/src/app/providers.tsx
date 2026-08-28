"use client"
import React, { useState } from "react";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { WebSocketProvider } from "../context/web-socket-context";
import useSeller from "../hooks/useSeller";

const Providers = ({children}:{children:React.ReactNode}) => {
    const[queryClient] = useState(() => new QueryClient());
    return(
        <QueryClientProvider client={queryClient}>
            <ProivdersWithWebSocket>
                {children}

            </ProivdersWithWebSocket>
            
         </QueryClientProvider>
    )
}

const ProivdersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { seller, isLoading } = useSeller();

  if(isLoading) return null;

  return (
    <>
      {seller && <WebSocketProvider seller={seller}>{children}</WebSocketProvider>}
      {!seller && children}
    </>
  );
};


export default Providers;