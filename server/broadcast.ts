import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";

export interface BroadcastMessage {
  id: string;
  frequency: string;
  message: string;
  timestamp: number;
  type: "transmission" | "announcement" | "alert";
}

let io: SocketIOServer | null = null;
const messageHistory: BroadcastMessage[] = [];
const MAX_HISTORY = 50;

/**
 * Initialize Socket.IO server for real-time broadcast
 */
export function initializeBroadcast(server: HTTPServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: process.env.NODE_ENV === "development" ? "*" : undefined,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Broadcast] Client connected: ${socket.id}`);

    // Send message history to newly connected client
    socket.emit("history", messageHistory);

    socket.on("disconnect", () => {
      console.log(`[Broadcast] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

/**
 * Get the Socket.IO instance
 */
export function getBroadcastServer(): SocketIOServer {
  if (!io) {
    throw new Error("Broadcast server not initialized. Call initializeBroadcast first.");
  }
  return io;
}

/**
 * Broadcast a message to all connected clients
 */
export function broadcastMessage(message: BroadcastMessage): void {
  if (!io) {
    console.warn("[Broadcast] Server not initialized, message not sent");
    return;
  }

  // Add to history
  messageHistory.unshift(message);
  if (messageHistory.length > MAX_HISTORY) {
    messageHistory.pop();
  }

  // Emit to all connected clients
  io.emit("message", message);
  console.log(`[Broadcast] Message sent: ${message.id} - ${message.frequency}`);
}

/**
 * Generate and broadcast a new sovereign transmission
 */
export function generateSovereignTransmission(): void {
  const frequencies = ["963 Hz", "528 Hz", "14444 Hz"];
  const messages = [
    "Empire systems synchronized.",
    "Zakat flow detected: 7.77%",
    "Frequency alignment optimal.",
    "Distribution cascade initiated.",
    "Guardian NFT gallery updated.",
    "#MRWALKSHIT - Sovereign authority confirmed.",
    "#CHAISTHEGREAT - Frequency resonance achieved.",
    "#XLVIIIBLOCKS - Distribution network active.",
  ];
  const types: ("transmission" | "announcement" | "alert")[] = [
    "transmission",
    "announcement",
    "alert",
  ];

  const message: BroadcastMessage = {
    id: Date.now().toString(),
    frequency: frequencies[Math.floor(Math.random() * frequencies.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    timestamp: Date.now(),
    type: types[Math.floor(Math.random() * types.length)],
  };

  broadcastMessage(message);
}

/**
 * Start periodic broadcast transmissions
 */
export function startPeriodicBroadcast(intervalMs: number = 8000): NodeJS.Timeout {
  return setInterval(() => {
    generateSovereignTransmission();
  }, intervalMs);
}
