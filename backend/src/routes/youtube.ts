import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import axios from "axios";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

// Helper to resolve org ID from request headers
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || DEFAULT_ORG_ID;
};

// GET: Fetch YouTube Config credentials
router.get("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);

    let config = await prisma.youTubeConfig.findUnique({
      where: { organizationId },
    });

    if (!config) {
      config = await prisma.youTubeConfig.create({
        data: {
          organizationId,
          channelId: "",
          channelTitle: "",
          accessToken: "",
          refreshToken: "",
        },
      });
    }

    return res.status(200).json(config);
  } catch (error: any) {
    console.error("Error fetching YouTube config:", error);
    return res.status(500).json({ error: "Failed to fetch YouTube config", details: error.message });
  }
});

// POST: Update YouTube Config credentials
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { channelId, channelTitle, accessToken, refreshToken } = req.body;

    const config = await prisma.youTubeConfig.upsert({
      where: { organizationId },
      update: {
        channelId,
        channelTitle,
        accessToken,
        refreshToken,
      },
      create: {
        organizationId,
        channelId: channelId || "",
        channelTitle: channelTitle || "",
        accessToken: accessToken || "",
        refreshToken: refreshToken || "",
      },
    });

    return res.status(200).json({ message: "YouTube configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating YouTube config:", error);
    return res.status(500).json({ error: "Failed to update YouTube config", details: error.message });
  }
});

const handleOAuthConnect = (req: Request, res: Response) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const redirectPath = (req.query.redirect as string) || "/youtube";
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI?.replace("gmb", "youtube") || "http://localhost:5000/api/youtube/auth/callback";

    if (!clientId) {
      return res.status(400).send("GOOGLE_CLIENT_ID is not configured in backend .env");
    }

    // YouTube read/write/delete comments scope
    const scopes = ["https://www.googleapis.com/auth/youtube.force-ssl"].join(" ");
    
    const statePayload = JSON.stringify({ orgId, redirect: redirectPath });
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${encodeURIComponent(statePayload)}`;
    
    res.redirect(oauthUrl);
  } catch (error: any) {
    res.status(500).send(`OAuth redirection error: ${error.message}`);
  }
};

const handleOAuthCallback = async (req: Request, res: Response) => {
  const code = req.query.code as string;
  const stateStr = req.query.state as string;
  
  let orgId = DEFAULT_ORG_ID;
  let redirectPath = "/youtube";

  if (stateStr) {
    try {
      const parsed = JSON.parse(stateStr);
      orgId = parsed.orgId || DEFAULT_ORG_ID;
      redirectPath = parsed.redirect || "/youtube";
    } catch {
      orgId = stateStr;
    }
  }

  if (!code) {
    return res.status(400).send("No authorization code returned from Google");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI?.replace("gmb", "youtube") || "http://localhost:5000/api/youtube/auth/callback";

  if (!clientId || !clientSecret) {
    return res.status(500).send("Google OAuth keys (GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET) missing in backend .env");
  }

  try {
    const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code"
    });

    const { refresh_token, access_token } = tokenRes.data;

    // Fetch channel details to automatically capture channel ID and channelTitle
    let channelId = "";
    let channelTitle = "";
    try {
      const channelRes = await axios.get("https://www.googleapis.com/youtube/v3/channels?part=snippet,id&mine=true", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const channels = channelRes.data.items || [];
      if (channels.length > 0) {
        channelId = channels[0].id;
        channelTitle = channels[0].snippet?.title || "";
      }
    } catch (channelErr: any) {
      console.warn("Could not retrieve channel info automatically via OAuth token:", channelErr.message);
    }

    // Save tokens in database
    await prisma.youTubeConfig.upsert({
      where: { organizationId: orgId },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token || undefined, // Keep existing if not returned by Google
        channelId: channelId || undefined,
        channelTitle: channelTitle || undefined
      },
      create: {
        organizationId: orgId,
        accessToken: access_token,
        refreshToken: refresh_token || "",
        channelId: channelId || "",
        channelTitle: channelTitle || ""
      }
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=success`);
  } catch (error: any) {
    console.error("YouTube OAuth Token Exchange Error:", error?.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=error`);
  }
};

// GET: Redirect to Google OAuth for YouTube DMs (Both /auth and /oauth/connect routes supported)
router.get("/oauth/connect", handleOAuthConnect);
router.get("/auth", handleOAuthConnect);

// GET: Handle Google OAuth Callback code swap (Both /auth/callback and /oauth/callback routes supported)
router.get("/oauth/callback", handleOAuthCallback);
router.get("/auth/callback", handleOAuthCallback);

export default router;
