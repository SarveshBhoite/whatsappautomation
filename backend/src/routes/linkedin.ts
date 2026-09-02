import { Router, Request, Response, NextFunction } from "express";
import prisma from "../utils/prisma";
import {
  LinkedInService,
  LinkedInOrgService,
  LinkedInSyncService,
  LinkedInProviderFactory,
  getLinkedInCredentials,
  getLinkedInOrgCredentials
} from "../services/linkedinService";

const router = Router();
const DEFAULT_ORG_ID = "";

// Task 3 Router Tree Diagnostic Registration
console.log("");
console.log("========== EXPRESS ROUTER REGISTRATION TREE ==========");
console.log("Mounted Router Path: /api/linkedin");
console.log("Registered CRM1 Personal Routes:");
console.log("  GET  /api/linkedin/auth/login        -> handleOAuthConnect");
console.log("  GET  /api/linkedin/auth             -> handleOAuthConnect");
console.log("  GET  /api/linkedin/auth/callback    -> handleOAuthCallback");
console.log("  GET  /api/linkedin/callback         -> handleOAuthCallback");
console.log("  GET  /api/linkedin/config");
console.log("  GET  /api/linkedin/profile");
console.log("  GET  /api/linkedin/posts");
console.log("  POST /api/linkedin/share");
console.log("  POST /api/linkedin/disconnect");
console.log("Registered CRM3 Organization Routes:");
console.log("  GET  /api/linkedin/auth/org/login    -> handleOrgOAuthConnect");
console.log("  GET  /api/linkedin/auth/org/callback -> handleOrgOAuthCallback");
console.log("  GET  /api/linkedin/org/config");
console.log("  GET  /api/linkedin/org/profile");
console.log("  GET  /api/linkedin/org/posts");
console.log("  POST /api/linkedin/org/share");
console.log("  DELETE /api/linkedin/org/posts/:postId");
console.log("  GET  /api/linkedin/org/comments/:postUrn");
console.log("  POST /api/linkedin/org/comments/:postUrn");
console.log("  DELETE /api/linkedin/org/comments/:commentUrn");
console.log("  GET  /api/linkedin/org/reactions/:postUrn");
console.log("  GET  /api/linkedin/org/analytics/followers");
console.log("  GET  /api/linkedin/org/analytics/page");
console.log("  POST /api/linkedin/org/disconnect");
console.log("======================================================");
console.log("");

// Helper to extract organizationId from request headers or query
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.orgId as string) || DEFAULT_ORG_ID;
};

// 1. GET /api/linkedin/config - Fetch LinkedIn configuration & personal profile
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    // Ensure Organization record exists in DB first
    await prisma.organization.upsert({
      where: { id: organizationId },
      update: {},
      create: { id: organizationId, name: `Organization ${organizationId}` }
    });

    let config = await prisma.linkedInConfig.findUnique({
      where: { organizationId },
      include: { profile: true }
    });

    if (!config) {
      config = await prisma.linkedInConfig.create({
        data: {
          organizationId,
          accessToken: "",
          refreshToken: "",
          companyId: "",
          companyName: "",
          memberId: ""
        },
        include: { profile: true }
      });
    }

    const syncLogs = await prisma.linkedInSyncLog.findMany({
      where: { organizationId },
      orderBy: { timestamp: "desc" },
      take: 20
    });

    // Real Account-Specific Statistics from DB
    const [aiHistoryCount, aiPostsCount, publishedPostsCount, draftsCount, scheduledPostsCount] = await Promise.all([
      prisma.aIContentHistory.count({ where: { organizationId } }),
      prisma.aIContentHistory.count({ where: { organizationId, mode: { in: ["Post Generator", "generate", "Post", "Rewrite & Polish"] } } }),
      prisma.linkedInPost.count({ where: { organizationId } }),
      prisma.linkedInSchedule.count({ where: { organizationId, status: "DRAFT" } }),
      prisma.linkedInSchedule.count({ where: { organizationId, status: "SCHEDULED" } })
    ]);

    // Calculate real activity streak from sync logs & posts
    let activityStreak = 0;
    try {
      const recentActivities = await prisma.linkedInSyncLog.findMany({
        where: { organizationId },
        orderBy: { timestamp: "desc" },
        take: 100
      });
      const uniqueDays = new Set(
        recentActivities.map((a: any) => new Date(a.timestamp).toISOString().split("T")[0])
      );
      activityStreak = uniqueDays.size;
    } catch {
      activityStreak = 1;
    }

    return res.status(200).json({
      ...config,
      syncLogs,
      stats: {
        totalAIRequests: aiHistoryCount,
        aiGeneratedPosts: aiPostsCount,
        publishedCount: publishedPostsCount,
        draftsCount: draftsCount,
        scheduledCount: scheduledPostsCount,
        activityStreak: activityStreak || (config.accessToken ? 1 : 0)
      }
    });
  } catch (error: any) {
    console.error("[LINKEDIN] API Error - Fetching config:", error);
    return res.status(500).json({ error: "Failed to fetch LinkedIn config", details: error.message });
  }
});

// 2. GET /api/linkedin/profile - Fetch LinkedIn Member Profile
router.get("/profile", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken) {
      return res.status(200).json({
        connected: false,
        profile: null,
        message: "LinkedIn account not connected"
      });
    }

    let profile = await prisma.linkedInProfile.findUnique({ where: { organizationId } });

    if (!profile && config.accessToken) {
      profile = await LinkedInSyncService.syncPersonalProfile(organizationId);
    }

    return res.status(200).json({
      connected: true,
      profile,
      config
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;
    console.error(`[LINKEDIN] API Error [HTTP ${status}] - Fetching profile:`, details);
    return res.status(status).json({ error: "Failed to fetch LinkedIn profile", details });
  }
});

// 3. GET /api/linkedin/posts - Fetch CRM-published LinkedIn posts
router.get("/posts", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken) {
      return res.status(200).json({
        connected: false,
        permissionGranted: false,
        message: "LinkedIn account not connected",
        posts: []
      });
    }

    // Requirement 10: CRM database is the source of truth for published posts
    let posts = await prisma.linkedInPost.findMany({
      where: { organizationId },
      orderBy: { publishedAt: "desc" }
    });

    if (posts.length === 0) {
      // Check fallback personal posts table
      const personalPosts = await prisma.linkedInPersonalPost.findMany({
        where: { organizationId },
        orderBy: { publishedAt: "desc" }
      });
      posts = personalPosts.map(p => ({
        id: p.id,
        organizationId: p.organizationId,
        postId: p.linkedinPostId || p.id,
        linkedinPostId: p.linkedinPostId,
        authorUrn: p.authorUrn || "",
        author: p.author,
        commentary: p.text || p.summary || "",
        summary: p.summary,
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaUrl ? "IMAGE" : "NONE",
        visibility: "PUBLIC",
        lifecycleState: "PUBLISHED",
        publishedAt: p.publishedAt,
        likesCount: p.likesCount,
        commentsCount: p.commentsCount,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt
      }));
    }

    return res.status(200).json({
      connected: true,
      permissionGranted: true,
      message: "CRM-published LinkedIn posts retrieved successfully.",
      posts
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;
    console.error(`[LINKEDIN] API Error [HTTP ${status}] - Fetching posts:`, details);
    await LinkedInSyncService.logSyncEvent(getOrgId(req), "API Error", "FAILED", `Fetching posts failed: ${details}`);
    return res.status(status).json({
      connected: false,
      permissionGranted: false,
      message: "Failed to fetch LinkedIn posts",
      posts: []
    });
  }
});

// POST /api/linkedin/posts/sync-engagement - Fetch real-time likes & comments from LinkedIn API
router.post("/posts/sync-engagement", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const result = await LinkedInService.syncEngagementForPosts(organizationId);

    // Fetch updated posts
    const updatedPosts = await prisma.linkedInPost.findMany({
      where: { organizationId },
      orderBy: { publishedAt: "desc" }
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      updatedCount: result.updatedCount,
      posts: updatedPosts
    });
  } catch (error: any) {
    const status = error.status || 500;
    console.error("[LINKEDIN] API Error - Engagement Sync Failed:", error.message);
    return res.status(status).json({
      success: false,
      error: error.message || "Failed to synchronize post engagement."
    });
  }
});

// 4. POST /api/linkedin/share - Share a post directly on LinkedIn and save to CRM DB
router.post("/share", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { text, mediaUrl } = req.body;

    if (!text || text.trim().length === 0) {
      await LinkedInSyncService.logSyncEvent(organizationId, "API Error", "FAILED", "Post creation failed: Empty post content");
      return res.status(400).json({ error: "Post content text is required." });
    }

    const post = await LinkedInService.publishPost(organizationId, text.trim(), mediaUrl?.trim());

    // Emit socket event for real-time UI updates
    try {
      const { io } = require("../index");
      if (io) {
        io.to(organizationId).emit("linkedin-post-created", { organizationId, post });
        io.to(organizationId).emit("linkedin-sync-completed", { organizationId });
      }
    } catch (socketErr: any) {
      console.warn("[LINKEDIN] Socket notification notice:", socketErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Post shared successfully and confirmed by LinkedIn API.",
      post
    });
  } catch (error: any) {
    const status = error.status || error.response?.status || 403;
    const details = error.details || error.response?.data || error.message;
    console.error(`[LINKEDIN] API Error [HTTP ${status}] - Share post failed:`, details);
    return res.status(status).json({
      success: false,
      error: "LinkedIn API Rejected Publication Request",
      details,
      post: error.post || null
    });
  }
});

// DELETE /api/linkedin/posts/:id - Delete post from LinkedIn live feed and CRM database
router.delete("/posts/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const postId = String(req.params.id);

    if (!postId) {
      return res.status(400).json({ error: "Post ID parameter is required." });
    }

    const result = await LinkedInService.deletePublishedPost(organizationId, postId);

    // Socket notification for real-time synchronization across clients
    try {
      const { io } = require("../index");
      if (io) {
        io.to(organizationId).emit("linkedin-post-deleted", { organizationId, postId });
        io.to(organizationId).emit("linkedin-sync-completed", { organizationId });
      }
    } catch (socketErr: any) {
      console.warn("[LINKEDIN] Socket notification notice:", socketErr.message);
    }

    return res.status(200).json({
      success: true,
      message: "Post deleted successfully from LinkedIn live feed and CRM database.",
      result
    });
  } catch (error: any) {
    const status = error.response?.status || error.status || 500;
    const errorDetails = error.response?.data || error.message;
    console.error(`[LINKEDIN] API Error [HTTP ${status}] - Post deletion failed:`, errorDetails);
    await LinkedInSyncService.logSyncEvent(getOrgId(req), "API Error", "FAILED", `Post deletion failed: ${errorDetails}`);

    return res.status(status).json({
      success: false,
      error: error.message || "Failed to delete post from LinkedIn."
    });
  }
});

// 5. GET /api/linkedin/activity - Fetch Activity Log events
router.get("/activity", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const syncLogs = await prisma.linkedInSyncLog.findMany({
      where: { organizationId },
      orderBy: { timestamp: "desc" },
      take: 50
    });

    return res.status(200).json({
      success: true,
      activities: syncLogs
    });
  } catch (error: any) {
    console.error("[LINKEDIN] API Error - Fetching activity log:", error);
    return res.status(500).json({ error: "Failed to fetch activity log", details: error.message });
  }
});

// 6. POST /api/linkedin/sync - Manually trigger LinkedIn profile synchronization
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { io } = require("../index");

    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken) {
      await LinkedInSyncService.logSyncEvent(organizationId, "API Error", "WARNING", "LinkedIn account not connected during sync attempt");
      return res.status(200).json({
        connected: false,
        message: "LinkedIn account is not connected."
      });
    }

    await LinkedInSyncService.logSyncEvent(organizationId, "Refresh Profile", "SUCCESS", "Manual profile synchronization triggered");
    const profile = await LinkedInSyncService.syncPersonalProfile(organizationId, io);
    const updatedConfig = await prisma.linkedInConfig.findUnique({ where: { organizationId }, include: { profile: true } });

    return res.status(200).json({
      connected: true,
      message: "LinkedIn profile synchronized successfully",
      timestamp: updatedConfig?.updatedAt || new Date(),
      config: updatedConfig,
      profile
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;
    console.error(`[LINKEDIN] API Error [HTTP ${status}] - Manual sync failed:`, details);
    await LinkedInSyncService.logSyncEvent(getOrgId(req), "API Error", "FAILED", `Manual profile sync failed: ${details}`);
    return res.status(status).json({ error: "Failed to synchronize LinkedIn account", details });
  }
});

// 5. POST /api/linkedin/disconnect - Disconnect LinkedIn account
router.post("/disconnect", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    await prisma.linkedInProfile.deleteMany({ where: { organizationId } });

    const config = await prisma.linkedInConfig.upsert({
      where: { organizationId },
      update: {
        accessToken: "",
        refreshToken: "",
        expiresIn: null,
        tokenExpiry: null,
        companyId: "",
        companyName: "",
        memberId: "",
        memberName: "",
        memberEmail: "",
        memberPicture: "",
        headline: "",
        vanityName: "",
        companyLogo: "",
        website: "",
        industry: "",
        description: ""
      },
      create: {
        organizationId,
        accessToken: "",
        refreshToken: "",
        companyId: "",
        companyName: "",
        memberId: ""
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Account Disconnected", "SUCCESS", "Cleared OAuth tokens and profile details");
    return res.status(200).json({ message: "LinkedIn account disconnected successfully", data: config });
  } catch (error: any) {
    console.error("[LINKEDIN] API Error - Disconnect:", error);
    return res.status(500).json({ error: "Failed to disconnect LinkedIn", details: error.message });
  }
});

// Task 1 & 2: OAuth connect handler with pre-flight validation
const handleOAuthConnect = (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const redirectPath = (req.query.redirect as string) || "/linkedin";
    const authUrl = LinkedInService.generateAuthUrl(orgId, redirectPath);
    return res.redirect(authUrl);
  } catch (error: any) {
    console.error("[LINKEDIN TASK 10 FAIL] OAuth Pre-flight Validation Error:", error.message);
    return res.status(400).json({
      error: "LinkedIn OAuth Validation Error",
      message: error.message
    });
  }
};

// Task 3, 4, 5, 6, 7, 8, 10, 11: OAuth callback handler with structured execution logs
const handleOAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const stateStr = req.query.state as string;
  const oauthError = req.query.error as string;
  const oauthErrorDesc = req.query.error_description as string;

  // Task 4 Log Output Sequence
  console.log("");
  console.log("========== EXECUTION LOG SEQUENCE ==========");
  console.log(`Received OAuth Code: ${code || "NONE"}`);
  console.log(`Received State: ${stateStr || "NONE"}`);
  console.log(`Query Error: ${oauthError || "NONE"}`);
  console.log(`Error Description: ${oauthErrorDesc || "NONE"}`);
  console.log("===========================================");
  console.log("");

    let orgId = DEFAULT_ORG_ID;
  let targetPath = "/linkedin";

  if (stateStr) {
    try {
      const parsed = JSON.parse(stateStr);
      orgId = parsed.orgId || DEFAULT_ORG_ID;
      targetPath = parsed.redirect || "/linkedin";
    } catch {
      orgId = stateStr;
    }
  }

  const { redirectUri } = getLinkedInCredentials();
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").trim();

  // Helper to build clean redirection URL without duplicate tab query parameters
  const buildPersonalRedirect = (params: Record<string, string>) => {
    try {
      const baseUrl = targetPath.startsWith("http") ? targetPath : `${frontendUrl}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;
      const urlObj = new URL(baseUrl);
      urlObj.searchParams.set("tab", "profile");
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) urlObj.searchParams.set(k, v);
      });
      return urlObj.toString();
    } catch {
      return `${frontendUrl}/linkedin?tab=profile&${new URLSearchParams(params).toString()}`;
    }
  };

  if (oauthError) {
    // Task 10: Error Analysis
    console.error("");
    console.error("========== LINKEDIN OAUTH CALLBACK ERROR (TASK 10) ==========");
    console.error(`HTTP Status: 400 Bad Request`);
    console.error(`Response Body: ${JSON.stringify(req.query)}`);
    console.error(`Error Code: ${oauthError}`);
    console.error(`Error Description: ${oauthErrorDesc || "N/A"}`);
    
    let cause = "LinkedIn returned an error in callback query parameters.";
    let fix = "Check product settings and client configuration in LinkedIn Developer Portal.";
    if (oauthError === "access_denied") {
      cause = "User rejected permission consent on LinkedIn login screen.";
      fix = "Prompt user to click 'Allow' on LinkedIn OAuth dialog.";
    } else if (oauthError === "invalid_scope") {
      cause = "One or more requested scopes are not provisioned on Developer Portal.";
      fix = "Configure scopes to strictly 'openid profile email'.";
    }
    console.error(`Likely Cause: ${cause}`);
    console.error(`Suggested Fix: ${fix}`);
    console.error("=============================================================");
    console.error("");

    await LinkedInSyncService.logSyncEvent(orgId, "OAuth Rejected", "FAILED", `Error: ${oauthError} - ${oauthErrorDesc || ""}`);
    return res.redirect(buildPersonalRedirect({
      oauth: "error",
      error: oauthError,
      description: oauthErrorDesc || "",
      platform: "linkedin"
    }));
  }

  if (!code) {
    console.error("[LINKEDIN TASK 10 FAIL] Missing OAuth Code in callback URL query params.");
    await LinkedInSyncService.logSyncEvent(orgId, "OAuth Failed", "FAILED", "Missing authorization code");
    return res.redirect(buildPersonalRedirect({
      oauth: "error",
      error: "missing_code",
      description: "No authorization code provided.",
      platform: "linkedin"
    }));
  }

  try {
    // Task 5: Token exchange
    const tokenData = await LinkedInService.exchangeCodeForToken(code, redirectUri);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || "";
    const expiresIn = tokenData.expires_in || 5184000;
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000);

    if (!accessToken) {
      throw new Error("[LINKEDIN TASK 10 FAIL] No access_token returned in token response.");
    }

    // Task 6: User Info
    console.log("[LINKEDIN] Fetching Member Profile");
    const member = await LinkedInService.getMember(accessToken);

    // Task 7: Database Upsert
    console.log("[LINKEDIN] Saving Database");

    // Ensure Organization record exists in DB first to satisfy foreign key constraint
    await prisma.organization.upsert({
      where: { id: orgId },
      update: {},
      create: { id: orgId, name: `Organization ${orgId}` }
    });

    const config = await prisma.linkedInConfig.upsert({
      where: { organizationId: orgId },
      update: {
        accessToken,
        refreshToken: refreshToken || undefined,
        expiresIn,
        tokenExpiry,
        memberId: member.id || "",
        memberName: member.name || "",
        memberEmail: member.email || "",
        memberPicture: member.picture || "",
        headline: member.headline || "LinkedIn Member",
        updatedAt: new Date()
      },
      create: {
        organizationId: orgId,
        accessToken,
        refreshToken: refreshToken || "",
        expiresIn,
        tokenExpiry,
        memberId: member.id || "",
        memberName: member.name || "",
        memberEmail: member.email || "",
        memberPicture: member.picture || "",
        headline: member.headline || "LinkedIn Member"
      }
    });

    let savedProfile = null;
    if (member.id) {
      savedProfile = await prisma.linkedInProfile.upsert({
        where: { organizationId: orgId },
        update: {
          memberId: member.id,
          name: member.name,
          email: member.email,
          headline: member.headline,
          picture: member.picture,
          locale: member.locale,
          updatedAt: new Date()
        },
        create: {
          organizationId: orgId,
          configId: config.id,
          memberId: member.id,
          name: member.name,
          email: member.email,
          headline: member.headline,
          picture: member.picture,
          locale: member.locale
        }
      });
    }

    console.log("[LINKEDIN] Login Success");
    await LinkedInSyncService.logSyncEvent(orgId, "Login", "SUCCESS", `User logged in via LinkedIn OAuth 2.0: ${member.name} (${member.id})`);
    await LinkedInSyncService.logSyncEvent(orgId, "OAuth Success", "SUCCESS", `Connected member ${member.name} (${member.id})`);

    const jsonResponseData = {
      success: true,
      connected: true,
      memberName: member.name || "",
      email: member.email || "",
      avatar: member.picture || ""
    };

    // Task 11: Verification Summary Log
    const authUrlSample = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${process.env.LINKEDIN_MEMBER_CLIENT_ID || "78rqpry2mgjgqy"}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=openid%20profile%20email`;
    console.log("");
    console.log("========== LINKEDIN OAUTH VERIFICATION SUMMARY ==========");
    console.log(`OAuth URL: ${authUrlSample}`);
    console.log(`Token Response: ${JSON.stringify({ access_token: "[TOKEN_EXISTS]", expires_in: expiresIn })}`);
    console.log(`UserInfo Response: ${JSON.stringify(member)}`);
    console.log(`Database Save Result: SUCCESS (Config ID: ${config.id})`);
    console.log(`Frontend Response: ${JSON.stringify(jsonResponseData)}`);
    console.log(`Connection Status: CONNECTED`);
    console.log(`Final Result: PASS`);
    console.log("========================================================");
    console.log("");

    try {
      const { io } = require("../index");
      await LinkedInSyncService.syncPersonalProfile(orgId, io);
    } catch (syncErr: any) {
      console.warn("[LINKEDIN] Initial sync notice during callback:", syncErr.message);
    }

    // Task 8: If JSON API request return JSON, else redirect to frontend
    if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
      return res.status(200).json(jsonResponseData);
    }

    const redirectUrl = buildPersonalRedirect({
      oauth: "success",
      platform: "linkedin"
    });
    console.log(`[LINKEDIN] Redirecting to frontend: ${redirectUrl}`);
    return res.redirect(redirectUrl);

  } catch (error: any) {
    const errorMsg = error?.response?.data?.error_description || error?.response?.data?.message || error.message;
    console.error("[LINKEDIN TASK 10 FAIL] OAuth Callback Processing Exception:", errorMsg, error?.stack);
    await LinkedInSyncService.logSyncEvent(orgId, "API Error", "FAILED", `OAuth exchange failed: ${errorMsg}`);
    
    console.log("");
    console.log("========== LINKEDIN OAUTH VERIFICATION SUMMARY ==========");
    console.log(`Final Result: FAIL`);
    console.error(`Failing Step: OAuth Callback / Token Exchange`);
    console.error(`LinkedIn Error: ${errorMsg}`);
    console.log("========================================================");
    console.log("");

    return res.redirect(buildPersonalRedirect({
      oauth: "error",
      error: "api_error",
      description: errorMsg,
      platform: "linkedin"
    }));
  }
};

// ─── CRM3 ORGANIZATION OAUTH HANDLERS ─────────────────────────────────────────

const handleOrgOAuthConnect = (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    const redirectPath = (req.query.redirect as string) || "/linkedin";
    const authUrl = LinkedInOrgService.generateOrgAuthUrl(orgId, redirectPath);
    return res.redirect(authUrl);
  } catch (error: any) {
    console.error("[LINKEDIN ORG] OAuth Connect Error:", error.message);
    return res.status(400).json({
      error: "LinkedIn Organization OAuth Validation Error",
      message: error.message
    });
  }
};

const handleOrgOAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const stateStr = req.query.state as string;
  const oauthError = req.query.error as string;
  const oauthErrorDesc = req.query.error_description as string;

  console.log("");
  console.log("========== LINKEDIN CRM3 ORG OAUTH CALLBACK ==========");
  console.log(`Received Code: ${code ? "[EXISTS]" : "NONE"}`);
  console.log(`Query Error: ${oauthError || "NONE"}`);
  console.log("======================================================");
  console.log("");

  let orgId = DEFAULT_ORG_ID;
  let targetPath = "/linkedin";

  if (stateStr) {
    try {
      const parsed = JSON.parse(stateStr);
      orgId = parsed.orgId || DEFAULT_ORG_ID;
      targetPath = parsed.redirect || "/linkedin";
    } catch {
      orgId = stateStr;
    }
  }

  const { redirectUri } = getLinkedInOrgCredentials();
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").trim();

  // Helper to build clean redirection URL without duplicate tab query parameters
  const buildOrgRedirect = (params: Record<string, string>) => {
    try {
      const baseUrl = targetPath.startsWith("http") ? targetPath : `${frontendUrl}${targetPath.startsWith("/") ? "" : "/"}${targetPath}`;
      const urlObj = new URL(baseUrl);
      urlObj.searchParams.set("tab", "company");
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) urlObj.searchParams.set(k, v);
      });
      return urlObj.toString();
    } catch {
      return `${frontendUrl}/linkedin?tab=company&${new URLSearchParams(params).toString()}`;
    }
  };

  if (oauthError) {
    await LinkedInSyncService.logSyncEvent(orgId, "Org OAuth Rejected", "FAILED", `Error: ${oauthError} - ${oauthErrorDesc || ""}`);
    return res.redirect(buildOrgRedirect({
      oauth: "error",
      error: oauthError,
      description: oauthErrorDesc || "",
      platform: "linkedin_org"
    }));
  }

  if (!code) {
    await LinkedInSyncService.logSyncEvent(orgId, "Org OAuth Failed", "FAILED", "Missing authorization code");
    return res.redirect(buildOrgRedirect({
      oauth: "error",
      error: "missing_code",
      description: "No authorization code provided.",
      platform: "linkedin_org"
    }));
  }

  try {
    const tokenData = await LinkedInOrgService.exchangeOrgCodeForToken(code, redirectUri);
    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token || "";
    const expiresIn = tokenData.expires_in || 5184000;
    const tokenExpiry = new Date(Date.now() + expiresIn * 1000);
    const scopes = tokenData.scope || "";

    if (!accessToken) {
      throw new Error("No access_token returned in CRM3 organization token response.");
    }

    // Ensure Organization record exists in DB
    await prisma.organization.upsert({
      where: { id: orgId },
      update: {},
      create: { id: orgId, name: `Organization ${orgId}` }
    });

    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    console.log("[CRM3] Fetching admin organizations for token...");
    const adminOrgs = await orgProvider.getAdminOrganizations(accessToken);
    console.log(`[CRM3] Admin organizations retrieved: ${adminOrgs.length}`);

    const primaryOrg = adminOrgs.length > 0 ? adminOrgs[0] : null;

    const companyId = primaryOrg?.companyId || primaryOrg?.id || "";
    const companyName = primaryOrg?.companyName || primaryOrg?.name || "";
    const vanityName = primaryOrg?.vanityName || "";
    const companyLogo = primaryOrg?.companyLogo || primaryOrg?.logo || "";
    const website = primaryOrg?.website || "";
    const industry = primaryOrg?.industry || "";
    const description = primaryOrg?.description || "";
    const authorUrn = primaryOrg?.organizationUrn || (companyId ? `urn:li:organization:${companyId}` : "");

    console.log(`[CRM3] Primary Organization Identified: ${companyName || "N/A"} (${companyId || "N/A"})`);
    console.log(`[CRM3] Logo URL: ${companyLogo ? "[EXISTS]" : "NONE"}`);
    console.log(`[CRM3] Website: ${website || "NONE"}`);

    // Fetch initial followers count
    let followersCount = 0;
    let organicFollowers = 0;
    let paidFollowers = 0;
    if (authorUrn) {
      try {
        const followerStats = await orgProvider.getFollowers(accessToken, authorUrn);
        followersCount = followerStats.totalFollowers || 0;
        organicFollowers = followerStats.organicFollowers || 0;
        paidFollowers = followerStats.paidFollowers || 0;
      } catch (fErr: any) {
        console.warn("[LINKEDIN ORG] Initial follower fetch notice:", fErr.message);
      }
    }

    // Persist CRM3 Company token & company profile directly to database
    const orgConfig = await prisma.linkedInConfig.upsert({
      where: { organizationId: orgId },
      update: {
        accessToken,
        refreshToken: refreshToken || undefined,
        expiresIn,
        tokenExpiry,
        companyId,
        companyName,
        vanityName,
        companyLogo,
        website,
        industry,
        description,
        authorUrn,
        updatedAt: new Date()
      },
      create: {
        organizationId: orgId,
        accessToken,
        refreshToken: refreshToken || "",
        expiresIn,
        tokenExpiry,
        companyId,
        companyName,
        vanityName,
        companyLogo,
        website,
        industry,
        description,
        authorUrn
      }
    });

    if (companyId || companyName) {
      await prisma.linkedInProfile.upsert({
        where: { organizationId: orgId },
        update: {
          name: companyName || "Company Page",
          headline: industry ? `${industry} • LinkedIn Company Page` : "LinkedIn Company Page",
          picture: companyLogo || "",
          locale: "en_US",
          updatedAt: new Date()
        },
        create: {
          organizationId: orgId,
          configId: orgConfig.id,
          name: companyName || "Company Page",
          headline: industry ? `${industry} • LinkedIn Company Page` : "LinkedIn Company Page",
          picture: companyLogo || "",
          locale: "en_US"
        }
      });
    }

    await LinkedInSyncService.logSyncEvent(orgId, "Org OAuth Success", "SUCCESS", `Connected LinkedIn Company Page: ${companyName} (${companyId || "Pending"})`);

    if (req.headers.accept?.includes("application/json") || req.query.format === "json") {
      return res.status(200).json({
        success: true,
        connected: true,
        companyName,
        companyId,
        companyLogo
      });
    }

    const redirectUrl = buildOrgRedirect({
      oauth: "success",
      platform: "linkedin_org"
    });
    return res.redirect(redirectUrl);
  } catch (error: any) {
    const errorMsg = error?.response?.data?.error_description || error?.response?.data?.message || error.message;
    console.error("[LINKEDIN ORG] OAuth Callback Exception:", errorMsg);
    await LinkedInSyncService.logSyncEvent(orgId, "Org API Error", "FAILED", `Org OAuth exchange failed: ${errorMsg}`);
    return res.redirect(buildOrgRedirect({
      oauth: "error",
      error: "api_error",
      description: errorMsg,
      platform: "linkedin_org"
    }));
  }
};

// ─── CRM3 ORGANIZATION API ROUTES ─────────────────────────────────────────────

// 1. GET /api/linkedin/org/config
router.get("/org/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    await prisma.organization.upsert({
      where: { id: organizationId },
      update: {},
      create: { id: organizationId, name: `Organization ${organizationId}` }
    });

    let config = await prisma.linkedInConfig.findUnique({
      where: { organizationId },
      include: { profile: true }
    });

    if (!config) {
      config = await prisma.linkedInConfig.create({
        data: {
          organizationId,
          accessToken: "",
          refreshToken: "",
          companyId: "",
          companyName: "",
          authorUrn: ""
        },
        include: { profile: true }
      });
    }

    const isConnected = Boolean(config.accessToken && config.accessToken.trim().length > 10 && config.companyId);
    
    // Synthesize dedicated organization profile format
    const orgProfile = isConnected ? {
      id: config.companyId,
      companyId: config.companyId,
      companyName: config.companyName || config.profile?.name || "",
      vanityName: config.vanityName || "",
      companyLogo: config.companyLogo || config.profile?.picture || "",
      website: config.website || "",
      industry: config.industry || "",
      description: config.description || "",
      followersCount: 0
    } : null;

    console.log(`[CRM3] /api/linkedin/org/config requested for org ${organizationId}. Connected: ${isConnected}, Company: ${config.companyName || "None"}`);

    return res.status(200).json({
      connected: isConnected,
      config,
      profile: orgProfile
    });
  } catch (err: any) {
    console.error("[LINKEDIN ORG] Fetch org config error:", err);
    return res.status(500).json({ error: "Failed to fetch organization config", details: err.message });
  }
});

// 2. GET /api/linkedin/org/profile
router.get("/org/profile", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId },
      include: { profile: true }
    });

    if (!config || !config.accessToken || !config.companyId) {
      return res.status(200).json({ connected: false, profile: null, config: null });
    }

    // Try to fetch latest live details if available or return stored DB fields
    let followersCount = 0;
    let organicFollowers = 0;
    let paidFollowers = 0;

    const orgUrn = config.authorUrn || `urn:li:organization:${config.companyId}`;
    try {
      const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
      const stats = await orgProvider.getFollowers(config.accessToken, orgUrn);
      followersCount = stats.totalFollowers || 0;
      organicFollowers = stats.organicFollowers || 0;
      paidFollowers = stats.paidFollowers || 0;
    } catch (fErr: any) {
      console.warn("[LINKEDIN ORG] Follower stats notice:", fErr.message);
    }

    const orgProfile = {
      id: config.companyId,
      companyId: config.companyId,
      companyName: config.companyName || config.profile?.name || "",
      vanityName: config.vanityName || "",
      companyLogo: config.companyLogo || config.profile?.picture || "",
      website: config.website || "",
      industry: config.industry || "",
      description: config.description || "",
      followersCount,
      organicFollowers,
      paidFollowers
    };

    console.log(`[CRM3] /api/linkedin/org/profile requested for org ${organizationId}. Company: ${orgProfile.companyName}, Followers: ${followersCount}`);

    return res.status(200).json({
      connected: true,
      profile: orgProfile,
      config
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch organization profile", details: err.message });
  }
});

// 3. GET /api/linkedin/org/posts
router.get("/org/posts", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const result = await orgProvider.getPosts(organizationId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch organization posts", details: err.message });
  }
});

// 4. POST /api/linkedin/org/share - Publish company post
router.post("/org/share", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { text, commentary, mediaUrl } = req.body;
    const content = (text || commentary || "").trim();

    if (!content) {
      return res.status(400).json({ error: "Post content text is required." });
    }

    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.accessToken || !config.companyId) {
      return res.status(401).json({ error: "LinkedIn Company Page is not connected. Please authenticate first." });
    }

    const orgUrn = config.authorUrn || `urn:li:organization:${config.companyId}`;
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const result = await orgProvider.publishPost(config.accessToken, orgUrn, content, mediaUrl);

    // Save to CRM database
    const savedPost = await prisma.linkedInPost.create({
      data: {
        organizationId,
        author: config.companyName || "LinkedIn Company Page",
        authorUrn: orgUrn,
        summary: content,
        commentary: content,
        mediaUrl: mediaUrl || null,
        mediaType: result.mediaCategory || "NONE",
        visibility: "PUBLIC",
        publishedAt: new Date()
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Org Post Published", "SUCCESS", `Published company post (${result.id || result.urn})`);

    return res.status(200).json({
      success: true,
      post: savedPost,
      urn: result.urn
    });
  } catch (err: any) {
    console.error("[LINKEDIN ORG] Publish error:", err);
    return res.status(500).json({ error: "Failed to publish company post", details: err.message });
  }
});

// 5. DELETE /api/linkedin/org/posts/:postId
router.delete("/org/posts/:postId", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const postId = (req.params.postId as string) || "";

    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });
    if (config?.accessToken) {
      const personalProvider = LinkedInProviderFactory.getPersonalProvider();
      try {
        await personalProvider.deletePost(config.accessToken, postId);
      } catch (delErr: any) {
        console.warn("[LINKEDIN ORG] Live post deletion notice:", delErr.message);
      }
    }

    await prisma.linkedInPost.deleteMany({
      where: {
        organizationId,
        OR: [{ id: postId }, { postId }]
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Org Post Deleted", "SUCCESS", `Deleted company post ${postId}`);
    return res.status(200).json({ success: true, message: "Company post deleted successfully." });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete company post", details: err.message });
  }
});

// 6. GET /api/linkedin/org/comments/:postUrn
router.get("/org/comments/:postUrn", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const postUrn = (req.params.postUrn as string) || "";
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken) {
      return res.status(200).json({ comments: [] });
    }

    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const comments = await orgProvider.getComments(config.accessToken, postUrn);
    return res.status(200).json({ success: true, comments });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch comments", details: err.message });
  }
});

// 7. POST /api/linkedin/org/comments/:postUrn - Reply as company
router.post("/org/comments/:postUrn", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const postUrn = (req.params.postUrn as string) || "";
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Comment message is required." });
    }

    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });
    if (!config || !config.accessToken || !config.companyId) {
      return res.status(401).json({ error: "LinkedIn Company Page is not connected." });
    }

    const orgUrn = config.authorUrn || `urn:li:organization:${config.companyId}`;
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const result = await orgProvider.replyToComment(config.accessToken, postUrn, orgUrn, message.trim());

    return res.status(200).json({ success: true, result });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to post comment", details: err.message });
  }
});

// 8. DELETE /api/linkedin/org/comments/:postUrn/:commentUrn
router.delete("/org/comments/:postUrn/:commentUrn", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const postUrn = (req.params.postUrn as string) || "";
    const commentUrn = (req.params.commentUrn as string) || "";
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken) {
      return res.status(401).json({ error: "LinkedIn Company Page not connected." });
    }

    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const result = await orgProvider.deleteComment(config.accessToken, postUrn, commentUrn);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete comment", details: err.message });
  }
});

// 9. GET /api/linkedin/org/reactions/:postUrn
router.get("/org/reactions/:postUrn", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const postUrn = (req.params.postUrn as string) || "";
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken) {
      return res.status(200).json({ totalLikes: 0, likes: [] });
    }

    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const result = await orgProvider.getReactions(config.accessToken, postUrn);
    return res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch reactions", details: err.message });
  }
});

// 10. GET /api/linkedin/org/analytics/followers
router.get("/org/analytics/followers", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken || !config.companyId) {
      return res.status(200).json({ totalFollowers: 0, organicFollowers: 0, paidFollowers: 0 });
    }

    const orgUrn = config.authorUrn || `urn:li:organization:${config.companyId}`;
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const stats = await orgProvider.getFollowers(config.accessToken, orgUrn);
    return res.status(200).json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch follower analytics", details: err.message });
  }
});

// 11. GET /api/linkedin/org/analytics/page
router.get("/org/analytics/page", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken || !config.companyId) {
      return res.status(200).json({ views: 0, uniqueViews: 0, clicks: 0 });
    }

    const orgUrn = config.authorUrn || `urn:li:organization:${config.companyId}`;
    const orgProvider = LinkedInProviderFactory.getOrganizationProvider();
    const stats = await orgProvider.getAnalytics(config.accessToken, orgUrn);
    return res.status(200).json({ success: true, stats });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch page analytics", details: err.message });
  }
});

// 12. POST /api/linkedin/org/disconnect
router.post("/org/disconnect", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    await prisma.linkedInProfile.deleteMany({ where: { organizationId } });

    const config = await prisma.linkedInConfig.upsert({
      where: { organizationId },
      update: {
        accessToken: "",
        refreshToken: "",
        expiresIn: null,
        tokenExpiry: null,
        companyId: "",
        companyName: "",
        vanityName: "",
        companyLogo: "",
        website: "",
        industry: "",
        description: "",
        authorUrn: ""
      },
      create: {
        organizationId,
        accessToken: "",
        refreshToken: "",
        companyId: "",
        companyName: "",
        authorUrn: ""
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Company Page Disconnected", "SUCCESS", "Cleared CRM3 Organization tokens and company profile details");
    return res.status(200).json({ message: "LinkedIn Company Page disconnected successfully", data: config });
  } catch (error: any) {
    console.error("[LINKEDIN ORG] API Error - Disconnect:", error);
    return res.status(500).json({ error: "Failed to disconnect LinkedIn Company Page", details: error.message });
  }
});

// POST /api/linkedin/link-preview - Extract OpenGraph / metadata for link preview card
router.post("/link-preview", async (req: Request, res: Response) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== "string" || !url.startsWith("http")) {
      return res.status(400).json({ error: "Valid HTTP/HTTPS URL is required." });
    }

    const axios = require("axios");
    const response = await axios.get(url, {
      timeout: 8000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    const html = response.data;
    if (typeof html !== "string") {
      return res.status(200).json({
        success: true,
        preview: {
          url,
          domain: new URL(url).hostname.replace("www.", ""),
          title: url,
          description: "",
          image: ""
        }
      });
    }

    // Extract OpenGraph tags
    const getMetaTag = (prop: string) => {
      const match =
        html.match(new RegExp(`<meta\\s+(?:property|name)=["'](?:og:)?${prop}["']\\s+content=["']([^"']*)["']`, "i")) ||
        html.match(new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+(?:property|name)=["'](?:og:)?${prop}["']`, "i"));
      return match ? match[1] : null;
    };

    let title = getMetaTag("title") || getMetaTag("twitter:title");
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      title = titleMatch ? titleMatch[1].trim() : "";
    }

    let description = getMetaTag("description") || getMetaTag("twitter:description");
    let image = getMetaTag("image") || getMetaTag("twitter:image");

    if (image && !image.startsWith("http")) {
      try {
        image = new URL(image, url).href;
      } catch (e) {}
    }

    const domain = new URL(url).hostname.replace("www.", "");

    return res.status(200).json({
      success: true,
      preview: {
        url,
        domain,
        title: title || domain,
        description: description || "",
        image: image || ""
      }
    });
  } catch (err: any) {
    console.warn("[LINKEDIN] Link preview extraction notice:", err.message);
    try {
      const fallbackDomain = new URL(req.body?.url).hostname.replace("www.", "");
      return res.status(200).json({
        success: true,
        preview: {
          url: req.body?.url,
          domain: fallbackDomain,
          title: fallbackDomain,
          description: "",
          image: ""
        }
      });
    } catch (e) {
      return res.status(500).json({ error: "Failed to parse link metadata", details: err.message });
    }
  }
});

// ─── PHASE 2B: DRAFT & SCHEDULED POST API ROUTES ─────────────────────────────

// GET /api/linkedin/drafts - Fetch all drafts
router.get("/drafts", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const drafts = await prisma.linkedInSchedule.findMany({
      where: { organizationId, status: "DRAFT" },
      orderBy: { updatedAt: "desc" }
    });
    return res.status(200).json({ success: true, drafts });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch drafts", details: err.message });
  }
});

// POST /api/linkedin/draft - Create draft
router.post("/draft", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { summary, mediaUrl } = req.body;

    if (!summary || !summary.trim()) {
      return res.status(400).json({ error: "Draft summary content is required." });
    }

    const draft = await prisma.linkedInSchedule.create({
      data: {
        organizationId,
        summary: summary.trim(),
        mediaUrl: mediaUrl?.trim() || null,
        status: "DRAFT"
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Draft Created", "SUCCESS", `Created draft ID ${draft.id}`);
    return res.status(201).json({ success: true, draft, message: "Draft saved successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to create draft", details: err.message });
  }
});

// PUT /api/linkedin/draft - Edit draft
router.put("/draft", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id, summary, mediaUrl } = req.body;

    if (!id) return res.status(400).json({ error: "Draft ID is required." });

    const draft = await prisma.linkedInSchedule.update({
      where: { id },
      data: {
        summary: summary?.trim(),
        mediaUrl: mediaUrl?.trim() || null,
        updatedAt: new Date()
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Draft Updated", "SUCCESS", `Updated draft ID ${draft.id}`);
    return res.status(200).json({ success: true, draft, message: "Draft updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update draft", details: err.message });
  }
});

// DELETE /api/linkedin/draft - Delete draft
router.delete("/draft", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const id = (req.query.id as string) || req.body.id;

    if (!id) return res.status(400).json({ error: "Draft ID is required." });

    await prisma.linkedInSchedule.delete({ where: { id } });
    await LinkedInSyncService.logSyncEvent(organizationId, "Draft Deleted", "SUCCESS", `Deleted draft ID ${id}`);

    return res.status(200).json({ success: true, message: "Draft deleted successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete draft", details: err.message });
  }
});

// GET /api/linkedin/scheduled - Fetch scheduled posts queue
router.get("/scheduled", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const scheduledPosts = await prisma.linkedInSchedule.findMany({
      where: {
        organizationId,
        status: { in: ["SCHEDULED", "FAILED", "CANCELLED"] }
      },
      orderBy: { scheduledAt: "desc" }
    });
    return res.status(200).json({ success: true, scheduledPosts });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch schedule queue", details: err.message });
  }
});

// POST /api/linkedin/schedule - Schedule a post
router.post("/schedule", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { summary, mediaUrl, scheduledAt } = req.body;

    if (!summary || !summary.trim()) {
      return res.status(400).json({ error: "Post content text is required." });
    }

    if (!scheduledAt) {
      return res.status(400).json({ error: "Scheduled date and time is required." });
    }

    const targetDate = new Date(scheduledAt);
    if (isNaN(targetDate.getTime()) || targetDate <= new Date()) {
      return res.status(400).json({ error: "Scheduled date/time must be in the future." });
    }

    // Check account connection and token status
    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });
    if (!config || !config.accessToken) {
      return res.status(401).json({ error: "LinkedIn account is disconnected. Please connect your account first." });
    }

    if (config.tokenExpiry && new Date() > config.tokenExpiry) {
      return res.status(401).json({ error: "LinkedIn token has expired. Please re-authenticate." });
    }

    const scheduledPost = await prisma.linkedInSchedule.create({
      data: {
        organizationId,
        summary: summary.trim(),
        mediaUrl: mediaUrl?.trim() || null,
        scheduledAt: targetDate,
        status: "SCHEDULED"
      }
    });

    await LinkedInSyncService.logSyncEvent(
      organizationId,
      "Schedule Created",
      "SUCCESS",
      `Scheduled post for ${targetDate.toISOString()} (ID: ${scheduledPost.id})`
    );

    return res.status(201).json({ success: true, scheduledPost, message: "Post scheduled successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to schedule post", details: err.message });
  }
});

// PUT /api/linkedin/schedule - Update scheduled post
router.put("/schedule", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id, summary, mediaUrl, scheduledAt } = req.body;

    if (!id) return res.status(400).json({ error: "Schedule ID is required." });

    const targetDate = scheduledAt ? new Date(scheduledAt) : undefined;
    if (targetDate && (isNaN(targetDate.getTime()) || targetDate <= new Date())) {
      return res.status(400).json({ error: "Scheduled date/time must be in the future." });
    }

    const updatedSchedule = await prisma.linkedInSchedule.update({
      where: { id },
      data: {
        ...(summary ? { summary: summary.trim() } : {}),
        mediaUrl: mediaUrl !== undefined ? (mediaUrl?.trim() || null) : undefined,
        ...(targetDate ? { scheduledAt: targetDate } : {}),
        updatedAt: new Date()
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Schedule Updated", "SUCCESS", `Updated scheduled post ID ${id}`);
    return res.status(200).json({ success: true, scheduledPost: updatedSchedule, message: "Scheduled post updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update schedule", details: err.message });
  }
});

// DELETE /api/linkedin/schedule - Cancel/delete scheduled post
router.delete("/schedule", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const id = (req.query.id as string) || req.body.id;

    if (!id) return res.status(400).json({ error: "Schedule ID is required." });

    await prisma.linkedInSchedule.delete({ where: { id } });
    await LinkedInSyncService.logSyncEvent(organizationId, "Schedule Cancelled", "SUCCESS", `Cancelled scheduled post ID ${id}`);

    return res.status(200).json({ success: true, message: "Scheduled post cancelled successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to cancel schedule", details: err.message });
  }
});

// POST /api/linkedin/publish-now - Convert draft/schedule to immediate publish
router.post("/publish-now", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id, summary, mediaUrl } = req.body;

    const textToPublish = summary || (id ? (await prisma.linkedInSchedule.findUnique({ where: { id } }))?.summary : "");
    const mediaToPublish = mediaUrl || (id ? (await prisma.linkedInSchedule.findUnique({ where: { id } }))?.mediaUrl : undefined);

    if (!textToPublish) {
      return res.status(400).json({ error: "No post content to publish." });
    }

    const post = await LinkedInService.publishPost(organizationId, textToPublish, mediaToPublish || undefined);

    if (id) {
      await prisma.linkedInSchedule.update({
        where: { id },
        data: { status: "PUBLISHED", updatedAt: new Date() }
      });
    }

    return res.status(200).json({ success: true, post, message: "Post published immediately to LinkedIn." });
  } catch (err: any) {
    const status = err.status || 403;
    const details = err.details || err.message || "LinkedIn API rejected publication request.";

    if (req.body.id) {
      try {
        await prisma.linkedInSchedule.update({
          where: { id: req.body.id },
          data: { status: "FAILED", errorMessage: details, updatedAt: new Date() }
        });
      } catch (updateErr: any) {
        console.warn("[LINKEDIN] Failed to update schedule status on error:", updateErr.message);
      }
    }

    return res.status(status).json({ success: false, error: "Publish Now failed", details, post: err.post || null });
  }
});

// ─── PHASE 2C: AI CONTENT ASSISTANT API ROUTES ──────────────────────────────

import { LinkedInAIService } from "../services/aiService";

// POST /api/linkedin/ai/generate - AI Post Generator
router.post("/ai/generate", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { topic, industry, goal, targetAudience, tone, length, provider } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic prompt is required." });
    }

    const result = await LinkedInAIService.generatePost(organizationId, {
      topic: topic.trim(),
      industry,
      goal,
      targetAudience,
      tone,
      length,
      provider
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "AI Generation failed", details: err.message });
  }
});

// POST /api/linkedin/ai/rewrite - AI Rewrite Post
router.post("/ai/rewrite", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { content, mode, provider } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content to rewrite is required." });
    }

    const result = await LinkedInAIService.rewritePost(organizationId, {
      content: content.trim(),
      mode: mode || "professional",
      provider
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "AI Rewrite failed", details: err.message });
  }
});

// GET /api/linkedin/ai/ideas - Dynamic Account-Specific Content Idea Suggestions
router.get("/ai/ideas", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId },
      include: { profile: true }
    });

    const headline = config?.profile?.headline || config?.headline || "Software & Automation Leader";
    const companyName = config?.companyName || "Jisnu Digitals";

    const result = await LinkedInAIService.generateIdeas(organizationId, headline, companyName);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to generate ideas", details: err.message });
  }
});

// POST /api/linkedin/ai/templates - AI Template Blueprint Generator
router.post("/ai/templates", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { topic, category } = req.body;

    const result = await LinkedInAIService.generateTemplate(organizationId, {
      topic: topic || category || "Cold Email Outreach"
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Template generation failed", details: err.message });
  }
});

// POST /api/linkedin/ai/refine - Contextual AI Refinement (Follow-up chat remembering last generated response)
router.post("/ai/refine", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { originalPrompt, lastGeneratedContent, instruction } = req.body;

    if (!lastGeneratedContent || !lastGeneratedContent.trim()) {
      return res.status(400).json({ error: "lastGeneratedContent is required for contextual refine." });
    }
    if (!instruction || !instruction.trim()) {
      return res.status(400).json({ error: "Follow-up instruction is required." });
    }

    const result = await LinkedInAIService.refineContent(organizationId, {
      originalPrompt,
      lastGeneratedContent: lastGeneratedContent.trim(),
      instruction: instruction.trim()
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Contextual refine failed", details: err.message });
  }
});

// POST /api/linkedin/ai/hashtags - AI Hashtags Generator
router.post("/ai/hashtags", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { content, count } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required for generating hashtags." });
    }

    const result = await LinkedInAIService.generateHashtags(organizationId, content.trim(), count || 10);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Hashtag generation failed", details: err.message });
  }
});

// POST /api/linkedin/ai/grammar - AI Grammar & Spell Check
router.post("/ai/grammar", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required for grammar check." });
    }

    const result = await LinkedInAIService.fixGrammar(organizationId, content.trim());
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Grammar check failed", details: err.message });
  }
});

// POST /api/linkedin/ai/cta - AI Call To Action Generator
router.post("/ai/cta", async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const result = await LinkedInAIService.generateCTA(type || "Contact Us");
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "CTA generation failed", details: err.message });
  }
});

// POST /api/linkedin/ai/chat - Universal CRM AI Assistant (Intent-Driven Groq llama-3.3-70b-versatile)
router.post("/ai/chat", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { prompt, message } = req.body;
    const userQuery = (prompt || message || "").trim();

    if (!userQuery) {
      return res.status(400).json({ error: "Prompt/message query is required." });
    }

    const result = await LinkedInAIService.askUniversalAI(organizationId, userQuery);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Universal AI request failed", details: err.message });
  }
});

// GET /api/linkedin/ai/history - Fetch AI Content Generation History List (Newest first, search support)
router.get("/ai/history", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const result = await LinkedInAIService.getHistoryList(organizationId, search);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch AI history", details: err.message });
  }
});

// GET /api/linkedin/ai/history/:id - Fetch Single AI History Item
router.get("/ai/history/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const id = String(req.params.id);
    const result = await LinkedInAIService.getHistoryById(organizationId, id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch history record", details: err.message });
  }
});

// POST /api/linkedin/ai/history - Save AI History Record Manually
router.post("/ai/history", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { prompt, generatedContent, mode, tone, model, userId } = req.body;

    if (!prompt || !generatedContent) {
      return res.status(400).json({ error: "prompt and generatedContent are required." });
    }

    const record = await LinkedInAIService.saveHistory({
      organizationId,
      userId,
      prompt,
      generatedContent,
      mode: mode || "Post Generator",
      tone: tone || "Professional",
      model: model || "Groq-openai/gpt-oss-120b"
    });

    return res.status(201).json({ success: true, item: record });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to save AI history record", details: err.message });
  }
});

// DELETE /api/linkedin/ai/history/:id - Delete Single AI History Item
router.delete("/ai/history/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const id = String(req.params.id);
    const result = await LinkedInAIService.deleteHistoryById(organizationId, id);
    if (!result.success) {
      return res.status(404).json(result);
    }
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to delete AI history record", details: err.message });
  }
});

// PUT /api/linkedin/schedule - Update scheduled post
router.put("/schedule", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id, summary, mediaUrl, scheduledAt } = req.body;

    if (!id) return res.status(400).json({ error: "Schedule ID is required." });

    const targetDate = scheduledAt ? new Date(scheduledAt) : undefined;
    if (targetDate && (isNaN(targetDate.getTime()) || targetDate <= new Date())) {
      return res.status(400).json({ error: "Scheduled date/time must be in the future." });
    }

    const updatedSchedule = await prisma.linkedInSchedule.update({
      where: { id },
      data: {
        ...(summary ? { summary: summary.trim() } : {}),
        mediaUrl: mediaUrl !== undefined ? (mediaUrl?.trim() || null) : undefined,
        ...(targetDate ? { scheduledAt: targetDate } : {}),
        updatedAt: new Date()
      }
    });

    await LinkedInSyncService.logSyncEvent(organizationId, "Schedule Updated", "SUCCESS", `Updated scheduled post ID ${id}`);
    return res.status(200).json({ success: true, scheduledPost: updatedSchedule, message: "Scheduled post updated successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to update schedule", details: err.message });
  }
});

// DELETE /api/linkedin/schedule - Cancel/delete scheduled post
router.delete("/schedule", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const id = (req.query.id as string) || req.body.id;

    if (!id) return res.status(400).json({ error: "Schedule ID is required." });

    await prisma.linkedInSchedule.delete({ where: { id } });
    await LinkedInSyncService.logSyncEvent(organizationId, "Schedule Cancelled", "SUCCESS", `Cancelled scheduled post ID ${id}`);

    return res.status(200).json({ success: true, message: "Scheduled post cancelled successfully" });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to cancel schedule", details: err.message });
  }
});

// POST /api/linkedin/publish-now - Convert draft/schedule to immediate publish
router.post("/publish-now", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { id, summary, mediaUrl } = req.body;

    const textToPublish = summary || (id ? (await prisma.linkedInSchedule.findUnique({ where: { id } }))?.summary : "");
    const mediaToPublish = mediaUrl || (id ? (await prisma.linkedInSchedule.findUnique({ where: { id } }))?.mediaUrl : undefined);

    if (!textToPublish) {
      return res.status(400).json({ error: "No post content to publish." });
    }

    const post = await LinkedInService.publishPost(organizationId, textToPublish, mediaToPublish || undefined);

    if (id) {
      await prisma.linkedInSchedule.update({
        where: { id },
        data: { status: "PUBLISHED", updatedAt: new Date() }
      });
    }

    return res.status(200).json({ success: true, post, message: "Post published immediately to LinkedIn." });
  } catch (err: any) {
    const status = err.status || 403;
    const details = err.details || err.message || "LinkedIn API rejected publication request.";

    if (req.body.id) {
      try {
        await prisma.linkedInSchedule.update({
          where: { id: req.body.id },
          data: { status: "FAILED", errorMessage: details, updatedAt: new Date() }
        });
      } catch (updateErr: any) {
        console.warn("[LINKEDIN] Failed to update schedule status on error:", updateErr.message);
      }
    }

    return res.status(status).json({ success: false, error: "Publish Now failed", details, post: err.post || null });
  }
});

// POST /api/linkedin/ai/generate - AI Post Generator
router.post("/ai/generate", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { topic, industry, goal, targetAudience, tone, length, provider } = req.body;

    if (!topic || !topic.trim()) {
      return res.status(400).json({ error: "Topic prompt is required." });
    }

    const result = await LinkedInAIService.generatePost(organizationId, {
      topic: topic.trim(),
      industry,
      goal,
      targetAudience,
      tone,
      length,
      provider
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "AI Generation failed", details: err.message });
  }
});

// POST /api/linkedin/ai/rewrite - AI Rewrite Post
router.post("/ai/rewrite", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { content, mode, provider } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content to rewrite is required." });
    }

    const result = await LinkedInAIService.rewritePost(organizationId, {
      content: content.trim(),
      mode: mode || "professional",
      provider
    });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "AI Rewrite failed", details: err.message });
  }
});

// POST /api/linkedin/ai/hashtags - AI Hashtags Generator
router.post("/ai/hashtags", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { content, count } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required for generating hashtags." });
    }

    const result = await LinkedInAIService.generateHashtags(organizationId, content.trim(), count || 10);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Hashtag generation failed", details: err.message });
  }
});

// POST /api/linkedin/ai/grammar - AI Grammar & Spell Check
router.post("/ai/grammar", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: "Content is required for grammar check." });
    }

    const result = await LinkedInAIService.fixGrammar(organizationId, content.trim());
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Grammar check failed", details: err.message });
  }
});

// POST /api/linkedin/ai/cta - AI Call To Action Generator
router.post("/ai/cta", async (req: Request, res: Response) => {
  try {
    const { type } = req.body;
    const result = await LinkedInAIService.generateCTA(type || "Contact Us");
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "CTA generation failed", details: err.message });
  }
});

// GET /api/linkedin/ai/history - Fetch AI Content Generation History
router.get("/ai/history", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const result = await LinkedInAIService.getHistory(organizationId);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to fetch AI history", details: err.message });
  }
});

// ─── MEDIA COMPOSER UPLOAD ENDPOINT ──────────────────────────────────────────

import multer from "multer";
import path from "path";
import fs from "fs";

// Multer memory storage for direct cloud upload to ImageKit
const memoryStorage = multer.memoryStorage();
const mediaUpload = multer({
  storage: memoryStorage,
  limits: { fileSize: 200 * 1024 * 1024 } // 200MB max limit
});

// POST /api/linkedin/upload - Media Upload Handler with Direct ImageKit Cloud Storage
router.post(
  "/upload",
  (req: Request, res: Response, next: NextFunction) => {
    mediaUpload.single("file")(req, res, (err: any) => {
      if (err) {
        console.error("[LINKEDIN UPLOAD MULTER ERROR]:", err.message || err);
        const isSizeLimit = err instanceof multer.MulterError && err.code === "LIMIT_FILE_SIZE";
        return res.status(400).json({
          success: false,
          error: isSizeLimit ? "File Size Limit Exceeded" : "Upload Failed",
          message: isSizeLimit
            ? "File exceeds maximum allowed size of 200MB."
            : err.message || "Invalid file payload."
        });
      }
      next();
    });
  },
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "Missing File",
          message: "No media file provided for upload."
        });
      }

      const file = req.file;
      const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
      const mime = file.mimetype.toLowerCase();

      // Explicit Audio Rejection
      const audioExts = ["mp3", "wav", "flac", "aac", "ogg", "m4a", "wma"];
      if (audioExts.includes(ext) || mime.startsWith("audio/")) {
        console.warn(`[LINKEDIN UPLOAD REJECTED]: Audio file type (.${ext}) rejected.`);
        return res.status(400).json({
          success: false,
          error: "Unsupported File Type",
          message: `Audio files (.${ext}) are not supported for LinkedIn posts. Please upload an MP4, MOV, AVI, WEBM or MPEG video instead.`
        });
      }

      // Explicit Executable Rejection
      const execExts = ["exe", "bat", "cmd", "sh", "msi", "app", "dmg", "vbs"];
      if (execExts.includes(ext)) {
        console.warn(`[LINKEDIN UPLOAD REJECTED]: Executable file type (.${ext}) rejected.`);
        return res.status(400).json({
          success: false,
          error: "Unsupported File Type",
          message: `Executable files (.${ext}) are rejected for security reasons.`
        });
      }

      // Allowed Categories: Image, Video, Document ONLY
      const imageExts = ["jpg", "jpeg", "png", "webp"];
      const videoExts = ["mp4", "mov", "mpeg", "avi", "webm"];
      const docExts = ["pdf", "doc", "docx", "ppt", "pptx"];

      let mediaType: "image" | "video" | "document" | null = null;
      let isLinkedInSupported = false;
      let warning: string | null = null;

      if (imageExts.includes(ext) || mime.startsWith("image/")) {
        mediaType = "image";
        isLinkedInSupported = true;
      } else if (videoExts.includes(ext) || mime.startsWith("video/")) {
        mediaType = "video";
        isLinkedInSupported = true;
      } else if (docExts.includes(ext)) {
        mediaType = "document";
        isLinkedInSupported = ext === "pdf";
        if (ext !== "pdf") {
          warning = `Word/PowerPoint files (.${ext}) require conversion to PDF for native LinkedIn carousel posting. Saved in ImageKit.`;
        }
      } else {
        return res.status(400).json({
          success: false,
          error: "Unsupported File Type",
          message: `Only Image (JPG, PNG, WEBP), Video (MP4, MOV, AVI, WEBM, MPEG), and Document (PDF, DOCX, PPTX) files are allowed.`
        });
      }

      // Upload directly to ImageKit Cloud Storage
      const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
      const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || "";
      const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";

      if (!privateKey || !urlEndpoint) {
        console.error("[LINKEDIN UPLOAD ERROR]: IMAGEKIT_PRIVATE_KEY or IMAGEKIT_URL_ENDPOINT is missing in backend/.env");
        return res.status(500).json({
          success: false,
          error: "Cloud Storage Configuration Error",
          message: "ImageKit credentials are not configured on backend server. Localhost upload fallbacks are disabled."
        });
      }

      console.log(`[MEDIA AUDIT 1/4] Local file received: ${file.originalname} (${file.size} bytes, type: ${mediaType})`);
      
      const fileBase64 = file.buffer.toString("base64");
      const cleanFilename = `${Date.now()}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;

      const formData = new FormData();
      formData.append("file", fileBase64);
      formData.append("fileName", cleanFilename);
      formData.append("useUniqueFileName", "true");
      formData.append("folder", "/linkedin");

      const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
      const axios = require("axios");

      const ikResponse = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
        headers: {
          Authorization: authHeader
        }
      });

      const publicUrl = ikResponse.data?.url;

      if (!publicUrl || publicUrl.includes("localhost") || publicUrl.includes("127.0.0.1")) {
        console.error("[LINKEDIN UPLOAD ERROR]: ImageKit API failed to return a valid CDN URL:", JSON.stringify(ikResponse.data));
        return res.status(500).json({
          success: false,
          error: "ImageKit Upload Failed",
          message: "Failed to receive valid ImageKit Cloud CDN URL from ImageKit API."
        });
      }

      console.log(`[MEDIA AUDIT 2/4] ImageKit upload success for ${file.originalname}`);
      console.log(`[MEDIA AUDIT 3/4] ImageKit CDN URL: ${publicUrl}`);

      return res.status(200).json({
        success: true,
        file: {
          url: publicUrl,
          filename: ikResponse.data.name || cleanFilename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          extension: ext,
          mediaType,
          isLinkedInSupported,
          warning
        }
      });
    } catch (err: any) {
      console.error("[LINKEDIN UPLOAD FAILED]: ImageKit cloud upload error:", err?.response?.data || err.message || err);
      return res.status(500).json({
        success: false,
        error: "ImageKit Upload Failed",
        message: err?.response?.data?.message || err.message || "An unexpected error occurred while uploading file to ImageKit Cloud Storage."
      });
    }
  }
);

// CRM1 Personal OAuth Registration
router.get("/auth/login", handleOAuthConnect);
router.get("/auth", handleOAuthConnect);
router.get("/oauth/connect", handleOAuthConnect);
router.get("/auth/callback", handleOAuthCallback);
router.get("/callback", handleOAuthCallback);

// CRM3 Organization OAuth Registration
router.get("/auth/org/login", handleOrgOAuthConnect);
router.get("/auth/org", handleOrgOAuthConnect);
router.get("/auth/org/callback", handleOrgOAuthCallback);

export default router;
