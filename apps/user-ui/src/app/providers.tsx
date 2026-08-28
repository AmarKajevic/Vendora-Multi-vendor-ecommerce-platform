"use client";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import useUser from "../hooks/useUser";
import { WebSocketProvider } from "../context/web-socket-context";
import { Loader2 } from "lucide-react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5,
          },
        },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
        <ProivdersWithWebSocket>
             {children}
        </ProivdersWithWebSocket>
  
      <Toaster />
    </QueryClientProvider>
  );
};

const ProivdersWithWebSocket = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user, isLoading } = useUser();

 if (isLoading) {
    return <div className="flex justify-center items-center h-[40vh]">
                <Loader2 className='aniamte-spin w-6 h-6 text-gray-600'/>
            </div> // ili spinner
  }

  return (
    <>
      {user && <WebSocketProvider user={user}>{children}</WebSocketProvider>}
      {!user && children}
    </>
  );
};

export default Providers;
