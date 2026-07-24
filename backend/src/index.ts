import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import { validateLinkedInEnv } from "./services/linkedinService";

validateLinkedInEnv();
import cors from "cors";
import path from "path";
import fs from "fs";
import webhookRouter from "./routes/webhook";
import messagesRouter from "./routes/messages";
import adminRouter from "./routes/admin";
import gmbRouter from "./routes/gmb";
import gmbPerformanceRouter from "./routes/gmbPerformance";
import googleAdsRouter from "./routes/googleAds";
import youtubeRouter from "./routes/youtube";
import linkedinRouter from "./routes/linkedin";


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

// YouTube Comments & Config Router
app.use("/api/youtube", youtubeRouter);

// LinkedIn Integration Router
app.use("/api/linkedin", linkedinRouter);



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
import { syncGmbReviews, syncGmbPosts, publishPostToGmb } from "./services/gmbSyncService";
import { YouTubeService } from "./services/youtubeService";
import { LinkedInService, LinkedInSyncService } from "./services/linkedinService";

// Background LinkedIn Profile & Data Sync Scheduler (Runs every 15 minutes)
async function runBackgroundLinkedInSync() {
  console.log("[LINKEDIN] Sync Started");
  try {
    const configs = await prisma.linkedInConfig.findMany();
    console.log(`[LINKEDIN] Found ${configs.length} active LinkedIn configuration(s) to sync.`);
    for (const config of configs) {
      if (config.accessToken) {
        await LinkedInSyncService.syncPersonalProfile(config.organizationId, io);
      }
    }
    console.log("[LINKEDIN] Sync Complete");
  } catch (err: any) {
    console.error("[LINKEDIN] API Error - Background sync execution error:", err.message);
  }
}

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

        // Also sync GMB posts from Google into local DB
        try {
          const postsResult = await syncGmbPosts(config.organizationId, io);
          console.log(`[BACKGROUND SCHEDULER] Posts sync for ${config.organizationId}: ${postsResult.length} posts total.`);
        } catch (postErr: any) {
          // Post sync failures are non-fatal (GMB My Business API may not be enabled)
          console.warn(`[BACKGROUND SCHEDULER] Posts sync skipped for ${config.organizationId}: ${postErr.message}`);
        }
      } catch (err: any) {
        console.error(`[BACKGROUND SCHEDULER] Sync failed for Organization ${config.organizationId}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error("[BACKGROUND SCHEDULER] Main scheduler execution error:", err.message);
  }
}

// Background YouTube Comments Polling Scheduler
async function runBackgroundYoutubeSync() {
  console.log("[BACKGROUND SCHEDULER] Running auto-sync for active YouTube channels...");
  try {
    const configs = await prisma.youTubeConfig.findMany({
      where: {
        channelId: { not: "" }
      }
    });

    console.log(`[BACKGROUND SCHEDULER] Found ${configs.length} active YouTube configurations to sync.`);

    for (const config of configs) {
      await YouTubeService.syncComments(config.organizationId, io);
    }
  } catch (err: any) {
    console.error("[BACKGROUND SCHEDULER] YouTube sync scheduler error:", err.message);
  }
}

// Background: check every 60 seconds for SCHEDULED posts due to be published,
// and auto-retry FAILED posts (up to 3 attempts)
async function runScheduledPostsSync() {
  try {
    const now = new Date();
    const pendingPosts = await prisma.googlePost.findMany({
      where: {
        OR: [
          { status: "SCHEDULED", scheduledAt: { lte: now } },
          { status: "FAILED", retryCount: { lt: 3 }, scheduledAt: { not: null, lte: now } }
        ]
      }
    });

    if (pendingPosts.length > 0) {
      console.log(`[SCHEDULED PUBLISHER] ${pendingPosts.length} post(s) due to publish.`);
      for (const post of pendingPosts) {
        try {
          await publishPostToGmb(post.id, io);
        } catch (err: any) {
          console.error(`[SCHEDULED PUBLISHER] Error publishing post ${post.id}:`, err.message);
        }
      }
    }
  } catch (err: any) {
    console.error("[SCHEDULED PUBLISHER] Scheduler error:", err.message);
  }
}

function startGmbSyncScheduler() {
  console.log("[BACKGROUND SCHEDULER] Scheduled auto-sync to run every 15 minutes.");
  setInterval(() => {
    runBackgroundGmbSync();
    runBackgroundYoutubeSync();
    runBackgroundLinkedInSync();
  }, 15 * 60 * 1000);

  // Check and publish scheduled posts every 60 seconds
  console.log("[BACKGROUND SCHEDULER] Scheduled post publisher to run every 60 seconds.");
  setInterval(() => { runScheduledPostsSync(); }, 60 * 1000);
}

import net from "net";

// Helper to check if a port is available
function checkPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net.createServer()
      .once("error", (err: any) => {
        if (err.code === "EADDRINUSE") {
          resolve(false);
        } else {
          resolve(false);
        }
      })
      .once("listening", () => {
        tester.once("close", () => {
          resolve(true);
        }).close();
      })
      .listen(port);
  });
}

// Start Server with Robust Port Availability Detection & Graceful Error Handling
async function startServer() {
  console.log("Backend starting...");
  console.log(`[LINKEDIN] process.env.LINKEDIN_MEMBER_CLIENT_ID: ${process.env.LINKEDIN_MEMBER_CLIENT_ID || "NOT SET"}`);
  console.log(`[LINKEDIN] process.env.LINKEDIN_MEMBER_REDIRECT_URI: ${process.env.LINKEDIN_MEMBER_REDIRECT_URI || "NOT SET"}`);
  console.log("Checking port...");

  const PORT = Number(process.env.PORT) || 5000;

  const isAvailable = await checkPortAvailable(PORT);

  if (!isAvailable) {
    console.log("");
    console.log("----------------------------------------");
    console.log(`Port ${PORT} is already in use.`);
    console.log("Existing backend process detected.");
    console.log("Please stop the running instance or choose another port.");
    console.log("----------------------------------------");
    console.log("");
    process.exit(0);
    return;
  }

  console.log("Port available.");

  server.on("error", (err: any) => {
    if (err.code === "EADDRINUSE") {
      console.log("");
      console.log("----------------------------------------");
      console.log(`Port ${PORT} is already in use.`);
      console.log("Existing backend process detected.");
      console.log("Please stop the running instance or choose another port.");
      console.log("----------------------------------------");
      console.log("");
      process.exit(0);
    } else {
      console.error("Backend server startup error:", err.message);
      process.exit(1);
    }
  });

  server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}.`);
    startGmbSyncScheduler();
  });
}

startServer();

export { io };
