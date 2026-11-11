import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeBroadcast, startPeriodicBroadcast } from "../broadcast";
import { agent25EmbedOriginGuard } from "../agent25.origins";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const trustedProxyHops = process.env.AGENT25_TRUST_PROXY_HOPS?.trim();
  if (trustedProxyHops && /^[1-3]$/.test(trustedProxyHops)) {
    // Trust only the explicitly configured number of reverse-proxy hops.
    // Never use `true`: that would trust arbitrary X-Forwarded-For chains.
    app.set("trust proxy", Number(trustedProxyHops));
  }
  const server = createServer(app);

  // Initialize WebSocket broadcast
  initializeBroadcast(server);
  startPeriodicBroadcast(8000);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  // Apply the exact site-to-origin policy to the iframe document before
  // Vite/static fallback handling. The embedded visitor API remains read-only.
  app.use("/agent25/embed", agent25EmbedOriginGuard);

  // Socket.IO is automatically handled by the server instance
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Socket.IO middleware for CORS in production
  if (process.env.NODE_ENV !== "development") {
    // In production, Socket.IO CORS is configured in initializeBroadcast
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    console.log(`[Broadcast] WebSocket server initialized on ws://localhost:${port}`);
  });
}

startServer().catch(console.error);
