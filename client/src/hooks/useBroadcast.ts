import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

export interface BroadcastMessage {
  id: string;
  frequency: string;
  message: string;
  timestamp: number;
  type: "transmission" | "announcement" | "alert";
}

export function useBroadcast() {
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Connect to the Socket.IO server
    const newSocket = io(window.location.origin, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("[Broadcast] Connected to server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("[Broadcast] Disconnected from server");
      setIsConnected(false);
    });

    // Receive message history on connection
    newSocket.on("history", (history: BroadcastMessage[]) => {
      console.log("[Broadcast] Received history:", history.length, "messages");
      setMessages(history);
    });

    // Receive new messages in real-time
    newSocket.on("message", (message: BroadcastMessage) => {
      console.log("[Broadcast] Received message:", message.id);
      setMessages((prev) => [message, ...prev.slice(0, 49)]);
    });

    newSocket.on("error", (error) => {
      console.error("[Broadcast] Socket error:", error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  const reconnect = useCallback(() => {
    if (socket) {
      socket.connect();
    }
  }, [socket]);

  return {
    messages,
    isConnected,
    reconnect,
  };
}
