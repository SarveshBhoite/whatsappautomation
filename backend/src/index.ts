import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import webhookRouter from "./routes/webhook";
import messagesRouter from "./routes/messages";
import adminRouter from "./routes/admin";
import gmbRouter from "./routes/gmb";
import gmbPerformanceRouter from "./routes/gmbPerformance";
import googleAdsRouter from "./routes/googleAds";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production to match Next.js origin
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase limit for base64 file uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Ensure uploads folder exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", express.static(uploadsDir));

// Webhook Router
app.use("/api/webhook", webhookRouter);

// Messages Router (Manual chat & toggles)
app.use("/api/messages", messagesRouter);

// Admin / Client Portal Router
app.use("/api/admin", adminRouter);

// GMB/Google Business Profile Review Router
app.use("/api/gmb", gmbRouter);

// GMB Performance Analytics Router
app.use("/api/gmb/performance", gmbPerformanceRouter);

// Google Ads Campaign & Analytics Router
app.use("/api/ads", googleAdsRouter);


// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date() });
});

// Socket.io Connection Logic
io.on("connection", (socket) => {
  console.log(`Agent connected: ${socket.id}`);

  // Join a client-specific room so agents only get updates for their company
  socket.on("join-org", (organizationId: string) => {
    socket.join(organizationId);
    console.log(`Socket ${socket.id} joined organization room: ${organizationId}`);
  });

  socket.on("disconnect", () => {
    console.log(`Agent disconnected: ${socket.id}`);
  });
});

import prisma from "./utils/prisma";
import { syncGmbReviews } from "./services/gmbSyncService";

// Background Google Business Profile Reviews Sync Scheduler
async function runBackgroundGmbSync() {
  console.log("[BACKGROUND SCHEDULER] Running auto-sync for active Google locations...");
  try {
    let configs = [];
    try {
      configs = await prisma.googleBusinessConfig.findMany({
        where: {
          googleRefreshToken: { not: null },
          googleLocationId: { not: null }
        }
      });
    } catch (dbErr: any) {
      console.error("[BACKGROUND SCHEDULER] Database query failed (Prisma/DB Schema warning):", dbErr.message);
      return; // Exit scheduler gracefully, keeping the server online
    }

    console.log(`[BACKGROUND SCHEDULER] Found ${configs.length} active configurations to sync.`);

    for (const config of configs) {
      if (!config.googleRefreshToken || !config.googleLocationId) continue;
      try {
        console.log(`[BACKGROUND SCHEDULER] Syncing Organization ID: ${config.organizationId}`);
        const result = await syncGmbReviews(config.organizationId, io);
        console.log(`[BACKGROUND SCHEDULER] Sync successful for ${config.organizationId}. Synced ${result.syncedCount} new reviews.`);
      } catch (err: any) {
        console.error(`[BACKGROUND SCHEDULER] Sync failed for Organization ${config.organizationId}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error("[BACKGROUND SCHEDULER] Main scheduler execution error:", err.message);
  }
}

function startGmbSyncScheduler() {
  console.log("[BACKGROUND SCHEDULER] Scheduled auto-sync to run every 15 minutes.");
  // Sync every 15 minutes
  setInterval(() => {
    runBackgroundGmbSync();
  }, 15 * 60 * 1000);
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(Number(PORT), "::", () => {
  console.log(`Backend server running on all interfaces (port ${PORT})`);
  startGmbSyncScheduler();
});

export { io };
