import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import {
  LinkedInService,
  LinkedInSyncService,
  LinkedInProviderFactory,
  getLinkedInCredentials
} from "../services/linkedinService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Task 3 Router Tree Diagnostic Registration
console.log("");
console.log("========== EXPRESS ROUTER REGISTRATION TREE ==========");
console.log("Mounted Router Path: /api/linkedin");
console.log("Registered Routes:");
console.log("  GET  /api/linkedin/auth/login -> handleOAuthConnect");
console.log("  GET  /api/linkedin/auth       -> handleOAuthConnect");
console.log("  GET  /api/linkedin/auth/callback -> handleOAuthCallback");
console.log("  GET  /api/linkedin/callback      -> handleOAuthCallback");
console.log("  GET  /api/linkedin/config");
console.log("  GET  /api/linkedin/profile");
console.log("  GET  /api/linkedin/posts");
console.log("  POST /api/linkedin/sync");
console.log("  POST /api/linkedin/disconnect");
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

    return res.status(200).json({
      ...config,
      syncLogs
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

// 3. GET /api/linkedin/posts - Fetch personal LinkedIn posts
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

    const personalProvider = LinkedInProviderFactory.getPersonalProvider();
    const result = await personalProvider.getPosts(organizationId);

    const personalPosts = await prisma.linkedInPersonalPost.findMany({
      where: { organizationId },
      orderBy: { publishedAt: "desc" }
    });

    return res.status(200).json({
      connected: true,
      permissionGranted: result.permissionGranted || personalPosts.length > 0,
      message: result.message || "Personal posts retrieved",
      posts: personalPosts
    });
  } catch (error: any) {
    const status = error.response?.status || 500;
    const details = error.response?.data || error.message;
    console.error(`[LINKEDIN] API Error [HTTP ${status}] - Fetching posts:`, details);
    return res.status(status).json({
      connected: false,
      permissionGranted: false,
      message: "Failed to fetch LinkedIn posts",
      posts: []
    });
  }
});

// 4. POST /api/linkedin/sync - Manually trigger LinkedIn profile synchronization
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { io } = require("../index");

    const config = await prisma.linkedInConfig.findUnique({ where: { organizationId } });

    if (!config || !config.accessToken) {
      await LinkedInSyncService.logSyncEvent(organizationId, "Sync Skipped", "WARNING", "LinkedIn account not connected");
      return res.status(200).json({
        connected: false,
        message: "LinkedIn account is not connected."
      });
    }

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
    await LinkedInSyncService.logSyncEvent(getOrgId(req), "API Error", "FAILED", `Manual sync failed: ${details}`);
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
  let redirectPath = "/linkedin";

  if (stateStr) {
    try {
      const parsed = JSON.parse(stateStr);
      orgId = parsed.orgId || DEFAULT_ORG_ID;
      redirectPath = parsed.redirect || "/linkedin";
    } catch {
      orgId = stateStr;
    }
  }

  const { redirectUri } = getLinkedInCredentials();
  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:3000").trim();

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
    return res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=overview&oauth=error&error=${encodeURIComponent(oauthError)}&description=${encodeURIComponent(oauthErrorDesc || "")}&platform=linkedin`);
  }

  if (!code) {
    console.error("[LINKEDIN TASK 10 FAIL] Missing OAuth Code in callback URL query params.");
    await LinkedInSyncService.logSyncEvent(orgId, "OAuth Failed", "FAILED", "Missing authorization code");
    return res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=overview&oauth=error&error=missing_code&description=${encodeURIComponent("No authorization code provided.")}&platform=linkedin`);
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

    const redirectUrl = `${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=overview&oauth=success&platform=linkedin`;
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

    return res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=overview&oauth=error&error=api_error&description=${encodeURIComponent(errorMsg)}&platform=linkedin`);
  }
};

// Task 3: Router Registration
router.get("/auth/login", handleOAuthConnect);
router.get("/auth", handleOAuthConnect);
router.get("/oauth/connect", handleOAuthConnect);

router.get("/auth/callback", handleOAuthCallback);
router.get("/callback", handleOAuthCallback);

export default router;
