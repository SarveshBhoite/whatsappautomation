import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
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
import seoRouter from "./routes/seo";
import gmailRouter from "./routes/gmail";
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

// Web SEO Audit Router
app.use("/api/seo", seoRouter);

// Gmail Router
app.use("/api/gmail", gmailRouter);

// LinkedIn Integration Router
app.use("/api/linkedin", linkedinRouter);

// Health check endpoints (for Render Keep-Alive cron/uptime pings)
app.get(["/health", "/api/health"], (req, res) => {
  res.status(200).json({
    status: "healthy",
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: "AutomationCRM API Engine"
  });
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
import { syncGmailThreads } from "./services/gmailService";

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

// Background Gmail Threads Polling Scheduler
async function runBackgroundGmailSync() {
  console.log("[BACKGROUND SCHEDULER] Running auto-sync for active Gmail inboxes...");
  try {
    const configs = await prisma.gmailConfig.findMany({
      where: {
        refreshToken: { not: "" }
      }
    });

    console.log(`[BACKGROUND SCHEDULER] Found ${configs.length} active Gmail configurations to sync.`);

    for (const config of configs) {
      await syncGmailThreads(config.organizationId, io);
    }
  } catch (err: any) {
    console.error("[BACKGROUND SCHEDULER] Gmail sync scheduler error:", err.message);
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
    runBackgroundGmailSync();
  }, 15 * 60 * 1000);

  // Check and publish scheduled posts every 60 seconds
  console.log("[BACKGROUND SCHEDULER] Scheduled post publisher to run every 60 seconds.");
  setInterval(() => { runScheduledPostsSync(); }, 60 * 1000);
}

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(Number(PORT), "::", () => {
  console.log(`Backend server running on all interfaces (port ${PORT})`);
  startGmbSyncScheduler();
});

export { io };
