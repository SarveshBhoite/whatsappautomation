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
    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || "http://localhost:5000/api/youtube/auth/callback";

    if (!clientId) {
      return res.status(400).send("YOUTUBE_CLIENT_ID or GOOGLE_CLIENT_ID is not configured in backend .env");
    }

    // YouTube read/write/delete comments scope and YouTube Analytics scope
    const scopes = [
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/yt-analytics.readonly"
    ].join(" ");
    
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

  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.YOUTUBE_REDIRECT_URI || "http://localhost:5000/api/youtube/auth/callback";

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
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=success&platform=youtube`);
  } catch (error: any) {
    console.error("YouTube OAuth Token Exchange Error:", error?.response?.data || error.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}${redirectPath}${redirectPath.includes("?") ? "&" : "?"}tab=settings&oauth=error&platform=youtube`);
  }
};

// GET: Redirect to Google OAuth for YouTube DMs (Both /auth and /oauth/connect routes supported)
router.get("/oauth/connect", handleOAuthConnect);
router.get("/auth", handleOAuthConnect);

// GET: Handle Google OAuth Callback code swap (Both /auth/callback and /oauth/callback routes supported)
router.get("/oauth/callback", handleOAuthCallback);
router.get("/auth/callback", handleOAuthCallback);

import { getGoogleAccessToken } from "../services/gmbSyncService";

// Helper to format Date objects as YYYY-MM-DD strings
function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to get active access token for YouTube config
async function getYoutubeAccessToken(orgId: string): Promise<string> {
  const config = await prisma.youTubeConfig.findUnique({
    where: { organizationId: orgId }
  });
  if (!config || !config.refreshToken) {
    throw new Error("YouTube account not connected. Please go to settings and connect it first.");
  }
  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("YOUTUBE_CLIENT_ID / GOOGLE_CLIENT_ID or secrets not configured in .env");
  }

  try {
    const accessToken = await getGoogleAccessToken(clientId, clientSecret, config.refreshToken);
    // Update accessToken in DB
    await prisma.youTubeConfig.update({
      where: { organizationId: orgId },
      data: { accessToken }
    });
    return accessToken;
  } catch (error: any) {
    if (config.accessToken) {
      console.warn("Refresh token failed, falling back to cached access token:", error.message);
      return config.accessToken;
    }
    throw error;
  }
}

// GET: Fetch YouTube Channel Analytics summary & timeline performance
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accessToken = await getYoutubeAccessToken(organizationId);

    const config = await prisma.youTubeConfig.findUnique({
      where: { organizationId }
    });

    if (!config || !config.channelId) {
      return res.status(400).json({ error: "Channel ID is not set. Please connect YouTube first." });
    }

    const channelId = config.channelId;

    // Get summary report for last 30 days
    const endDateStr = formatDateString(new Date());
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = formatDateString(startDate);

    // Call YouTube Analytics API
    const analyticsUrl = "https://youtubeanalytics.googleapis.com/v2/reports";
    
    // Fetch summary metrics
    const summaryRes = await axios.get(analyticsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        ids: `channel==${channelId}`,
        startDate: startDateStr,
        endDate: endDateStr,
        metrics: "views,likes,comments,subscribersGained,estimatedMinutesWatched,averageViewDuration",
      }
    });

    // Fetch daily metrics for timeline chart
    const dailyRes = await axios.get(analyticsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        ids: `channel==${channelId}`,
        startDate: startDateStr,
        endDate: endDateStr,
        metrics: "views,likes,comments,subscribersGained",
        dimensions: "day",
        sort: "day"
      }
    });

    // Fetch top videos report
    const topVideosRes = await axios.get(analyticsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        ids: `channel==${channelId}`,
        startDate: startDateStr,
        endDate: endDateStr,
        metrics: "views,likes,estimatedMinutesWatched",
        dimensions: "video",
        maxResults: 5,
        sort: "-views"
      }
    });

    // Fetch video metadata details using Data API v3
    const topVideosRaw = topVideosRes.data.rows || [];
    const videoIds = topVideosRaw.map((row: any) => row[0]).join(",");

    let videoMetadataMap: { [id: string]: { title: string, thumbnail: string } } = {};
    if (videoIds) {
      try {
        const dataApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoIds}`;
        const videosRes = await axios.get(dataApiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const items = videosRes.data.items || [];
        items.forEach((item: any) => {
          videoMetadataMap[item.id] = {
            title: item.snippet?.title || "Unknown Title",
            thumbnail: item.snippet?.thumbnails?.default?.url || ""
          };
        });
      } catch (err: any) {
        console.warn("Failed to fetch video details from Data API:", err.message);
      }
    }

    const topVideos = topVideosRaw.map((row: any) => {
      const id = row[0];
      const meta = videoMetadataMap[id] || { title: `Video (${id})`, thumbnail: "" };
      return {
        id,
        title: meta.title,
        thumbnail: meta.thumbnail,
        views: Number(row[1] || 0),
        likes: Number(row[2] || 0),
        estimatedMinutesWatched: Number(row[3] || 0)
      };
    });

    res.status(200).json({
      summary: summaryRes.data,
      daily: dailyRes.data,
      topVideos
    });
  } catch (error: any) {
    console.error("Error fetching YouTube Analytics:", error?.response?.data || error.message);
    res.status(500).json({
      error: "Failed to fetch YouTube Analytics",
      details: error?.response?.data || error.message
    });
  }
});

export default router;
