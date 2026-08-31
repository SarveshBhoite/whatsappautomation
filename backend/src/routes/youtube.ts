import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import axios from "axios";

const router = Router();
const DEFAULT_ORG_ID = "";

// Helper to resolve org ID from request headers
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.orgId as string) || "";
};

// GET: Fetch YouTube Config credentials
router.get("/config", async (req: Request, res: Response) => {
  try {
    let organizationId = getOrgId(req);
    if (!organizationId) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) organizationId = firstOrg.id;
    }
    const requestedAccountId = req.query.accountId as string;

    let accounts: any[] = [];
    if (organizationId) {
      accounts = await (prisma as any).youTubeConfig.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" }
      });
    }

    let config: any = null;
    if (requestedAccountId) {
      config = accounts.find((a: any) => a.id === requestedAccountId);
    }
    if (!config) {
      config = accounts.find((a: any) => a.isDefault) || accounts[0] || null;
    }

    if (!config && organizationId) {
      const org = await prisma.organization.findUnique({ where: { id: organizationId } });
      if (org) {
        config = await (prisma as any).youTubeConfig.create({
          data: {
            organizationId,
            channelId: "",
            channelTitle: "",
            accessToken: "",
            refreshToken: "",
            isDefault: true,
            isActive: true
          },
        });
        accounts = [config];
      }
    }

    // Auto-backfill & auto-discover all owned (mine=true) and managed (managedByMe=true) channels
    if (config && config.accessToken && organizationId) {
      try {
        let chItems: any[] = [];
        try {
          const mineRes = await axios.get("https://www.googleapis.com/youtube/v3/channels?part=snippet,id&mine=true", {
            headers: { Authorization: `Bearer ${config.accessToken}` }
          });
          chItems = mineRes.data.items || [];
        } catch (mineErr: any) {
          console.warn("Could not fetch mine=true channels:", mineErr.message);
        }

        try {
          const managedRes = await axios.get("https://www.googleapis.com/youtube/v3/channels?part=snippet,id&managedByMe=true", {
            headers: { Authorization: `Bearer ${config.accessToken}` }
          });
          const mItems = managedRes.data.items || [];
          for (const mi of mItems) {
            if (!chItems.some((c: any) => c.id === mi.id)) {
              chItems.push(mi);
            }
          }
        } catch (managedErr: any) {
          console.warn("Could not fetch managedByMe=true channels:", managedErr.message);
        }

        for (const ch of chItems) {
          const chId = ch.id;
          const chTitle = ch.snippet?.title || "YouTube Channel";
          const existingAcc = accounts.find((a: any) => a.channelId === chId);
          if (!existingAcc && chId) {
            const newRecord = await (prisma as any).youTubeConfig.create({
              data: {
                organizationId,
                channelId: chId,
                channelTitle: chTitle,
                accessToken: config.accessToken,
                refreshToken: config.refreshToken || "",
                isDefault: false,
                isActive: true
              }
            });
            accounts.push(newRecord);
          } else if (existingAcc && chTitle && existingAcc.channelTitle !== chTitle) {
            await (prisma as any).youTubeConfig.update({
              where: { id: existingAcc.id },
              data: { channelTitle: chTitle }
            });
            existingAcc.channelTitle = chTitle;
          }
        }
      } catch (err: any) {
        console.warn("Auto-backfill YouTube channel info failed:", err.message);
      }
    }

    return res.status(200).json({ config: config || null, accounts });
  } catch (error: any) {
    console.error("Error fetching YouTube config:", error);
    return res.status(500).json({ error: "Failed to fetch YouTube config", details: error.message });
  }
});

// GET: Fetch all YouTube accounts list
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    let organizationId = getOrgId(req);
    if (!organizationId) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) organizationId = firstOrg.id;
    }

    const accounts = organizationId
      ? await (prisma as any).youTubeConfig.findMany({
          where: { organizationId },
          orderBy: { createdAt: "desc" }
        })
      : [];

    return res.status(200).json({ success: true, accounts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch YouTube accounts", details: error.message });
  }
});

// POST: Update YouTube Config credentials
router.post("/config", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { channelId, channelTitle, accessToken, refreshToken } = req.body;

    let existing = await (prisma as any).youTubeConfig.findFirst({ where: { organizationId } });
    let config: any = null;
    if (existing) {
      config = await (prisma as any).youTubeConfig.update({
        where: { id: existing.id },
        data: {
          channelId,
          channelTitle,
          accessToken,
          refreshToken,
        }
      });
    } else {
      config = await (prisma as any).youTubeConfig.create({
        data: {
          organizationId,
          channelId: channelId || "",
          channelTitle: channelTitle || "",
          accessToken: accessToken || "",
          refreshToken: refreshToken || "",
          isDefault: true,
          isActive: true
        }
      });
    }

    return res.status(200).json({ message: "YouTube configuration updated successfully", data: config });
  } catch (error: any) {
    console.error("Error updating YouTube config:", error);
    return res.status(500).json({ error: "Failed to update YouTube config", details: error.message });
  }
});

// POST: Set default active YouTube channel account
router.post("/set-default", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { accountId } = req.body;

    if (!accountId) return res.status(400).json({ error: "Missing accountId" });

    // Reset all accounts in organization to isDefault: false
    await (prisma as any).youTubeConfig.updateMany({
      where: { organizationId },
      data: { isDefault: false }
    });

    // Set target account as the single primary account
    const account = await (prisma as any).youTubeConfig.update({
      where: { id: accountId },
      data: { isDefault: true }
    });

    return res.status(200).json({ success: true, account });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to set default YouTube account", details: error.message });
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

    // YouTube read/write/delete comments scope, YouTube Analytics scope, and Google Profile
    const scopes = [
      "https://www.googleapis.com/auth/youtube.force-ssl",
      "https://www.googleapis.com/auth/yt-analytics.readonly",
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email"
    ].join(" ");
    
    const statePayload = JSON.stringify({ orgId, redirect: redirectPath });
    const oauthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=select_account%20consent&state=${encodeURIComponent(statePayload)}`;
    
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

    // Fetch channel details to automatically capture channel ID and channelTitle (both mine=true and managedByMe=true)
    let fetchedChannels: any[] = [];
    try {
      const channelRes = await axios.get("https://www.googleapis.com/youtube/v3/channels?part=snippet,id&mine=true", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      fetchedChannels = channelRes.data.items || [];
    } catch (channelErr: any) {
      console.warn("Could not retrieve mine=true channel info:", channelErr.message);
    }

    try {
      const managedRes = await axios.get("https://www.googleapis.com/youtube/v3/channels?part=snippet,id&managedByMe=true", {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      const managedItems = managedRes.data.items || [];
      for (const mItem of managedItems) {
        if (!fetchedChannels.some((c: any) => c.id === mItem.id)) {
          fetchedChannels.push(mItem);
        }
      }
    } catch (managedErr: any) {
      console.warn("Could not retrieve managedByMe=true channel info:", managedErr.message);
    }

    let validOrgId = orgId;
    if (!validOrgId) {
      const firstOrg = await prisma.organization.findFirst();
      if (firstOrg) validOrgId = firstOrg.id;
    }

    if (validOrgId) {
      if (fetchedChannels.length > 0) {
        for (let i = 0; i < fetchedChannels.length; i++) {
          const ch = fetchedChannels[i];
          const chId = ch.id;
          const chTitle = ch.snippet?.title || "YouTube Channel";

          const existing = await (prisma as any).youTubeConfig.findFirst({
            where: { organizationId: validOrgId, channelId: chId }
          });

          if (existing) {
            await (prisma as any).youTubeConfig.update({
              where: { id: existing.id },
              data: {
                accessToken: access_token,
                ...(refresh_token && { refreshToken: refresh_token }),
                channelTitle: chTitle,
              }
            });
          } else {
            const hasDefault = await (prisma as any).youTubeConfig.findFirst({
              where: { organizationId: validOrgId, isDefault: true }
            });
            await (prisma as any).youTubeConfig.create({
              data: {
                organizationId: validOrgId,
                accessToken: access_token,
                refreshToken: refresh_token || "",
                channelId: chId,
                channelTitle: chTitle,
                isDefault: !hasDefault && i === 0,
                isActive: true
              }
            });
          }
        }
      } else {
        // Fallback: If channel snippet wasn't retrieved, fetch userinfo from Google profile
        let channelTitle = "";
        let channelId = "";
        try {
          const userRes = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${access_token}` }
          });
          if (userRes.data) {
            channelTitle = userRes.data.name || userRes.data.email || "YouTube Channel";
            channelId = "UC-" + (userRes.data.id || (validOrgId ? validOrgId.slice(-8) : "ACCOUNT"));
          }
        } catch (uErr: any) {
          console.warn("Could not retrieve Google userinfo fallback:", uErr.message);
        }
        if (!channelTitle) channelTitle = "YouTube Connected Channel";
        if (!channelId) channelId = "UC-CONNECTED-" + (validOrgId ? validOrgId.slice(-6) : "OK");

        const existing = await (prisma as any).youTubeConfig.findFirst({
          where: { organizationId: validOrgId, channelId }
        });
        if (existing) {
          await (prisma as any).youTubeConfig.update({
            where: { id: existing.id },
            data: {
              accessToken: access_token,
              ...(refresh_token && { refreshToken: refresh_token }),
              channelTitle,
            }
          });
        } else {
          const count = await (prisma as any).youTubeConfig.count({ where: { organizationId: validOrgId } });
          await (prisma as any).youTubeConfig.create({
            data: {
              organizationId: validOrgId,
              accessToken: access_token,
              refreshToken: refresh_token || "",
              channelId,
              channelTitle,
              isDefault: count === 0,
              isActive: true
            }
          });
        }
      }
    }

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

// POST: Disconnect YouTube Account
router.post("/disconnect", async (req: Request, res: Response) => {
  try {
    const orgId = (req.headers["x-organization-id"] as string) || (req.body && req.body.orgId) || "demo-org-123";
    const accountId = req.body && req.body.accountId;

    if (accountId) {
      await (prisma as any).youTubeConfig.deleteMany({
        where: { id: accountId, organizationId: orgId }
      });
    } else {
      await (prisma as any).youTubeConfig.deleteMany({
        where: { organizationId: orgId }
      });
    }

    return res.status(200).json({ success: true, message: "YouTube account disconnected successfully" });
  } catch (error: any) {
    console.error("Error disconnecting YouTube account:", error);
    return res.status(500).json({ error: "Failed to disconnect YouTube account", details: error.message });
  }
});

import { getGoogleAccessToken } from "../services/gmbSyncService";

// Helper to format Date objects as YYYY-MM-DD strings
function formatDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper to get active access token for YouTube config
async function getYoutubeAccessToken(orgId: string, accountId?: string): Promise<{ accessToken: string; config: any }> {
  let config = accountId
    ? await (prisma as any).youTubeConfig.findFirst({ where: { id: accountId, organizationId: orgId } })
    : await (prisma as any).youTubeConfig.findFirst({ where: { organizationId: orgId, isDefault: true } });

  if (!config) {
    config = await (prisma as any).youTubeConfig.findFirst({
      where: { organizationId: orgId },
      orderBy: { updatedAt: "desc" }
    });
  }

  if (!config || !config.refreshToken) {
    if (config && config.accessToken) {
      return { accessToken: config.accessToken, config };
    }
    throw new Error("YouTube account not connected. Please go to settings and connect it first.");
  }
  const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    if (config.accessToken) {
      return { accessToken: config.accessToken, config };
    }
    throw new Error("YOUTUBE_CLIENT_ID / GOOGLE_CLIENT_ID or secrets not configured in .env");
  }

  try {
    const accessToken = await getGoogleAccessToken(clientId, clientSecret, config.refreshToken);
    // Update accessToken in DB
    await prisma.youTubeConfig.update({
      where: { id: config.id },
      data: { accessToken }
    });
    return { accessToken, config: { ...config, accessToken } };
  } catch (error: any) {
    console.error(`[YOUTUBE OAUTH] Token refresh failed for org ${orgId}:`, error?.response?.data || error.message);
    throw new Error("YouTube access token expired or revoked. Please reconnect your YouTube account in Settings.");
  }
}

// GET: Fetch YouTube Channel Analytics summary & timeline performance
router.get("/analytics", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accountId = req.query.accountId as string;
    const { accessToken, config } = await getYoutubeAccessToken(organizationId, accountId);

    if (!config || !config.channelId) {
      return res.status(400).json({ error: "Channel ID is not set. Please connect YouTube first." });
    }

    const channelId = config.channelId;

    // Get summary report for last 30 days (YouTube Analytics API requires a 2-day processing latency safety window)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2);
    const endDateStr = formatDateString(endDate);

    const startDate = new Date(endDate);
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

    let topVideos = topVideosRaw.map((row: any) => {
      const id = row[0];
      const meta = videoMetadataMap[id] || { title: `Video (${id})`, thumbnail: "" };
      const rawLikes = Number(row[2] || 0);
      return {
        id,
        title: meta.title,
        thumbnail: meta.thumbnail,
        views: Number(row[1] || 0),
        likes: rawLikes < 0 ? 0 : rawLikes,
        likesHidden: rawLikes < 0,
        estimatedMinutesWatched: Number(row[3] || 0)
      };
    });

    // Fallback: If Analytics API returns 0 or few videos (e.g. videos with 0 views in last 30 days), fetch directly from playlistItems
    if (topVideos.length < 5) {
      try {
        const uploadsPlaylistId = `UU${channelId.length > 2 ? channelId.substring(2) : channelId}`;
        const playlistRes = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const fallbackIds = (playlistRes.data.items || []).map((it: any) => it.contentDetails?.videoId || it.snippet?.resourceId?.videoId).filter(Boolean);
        const missingIds = fallbackIds.filter((id: string) => !topVideos.some((tv: any) => tv.id === id));
        if (missingIds.length > 0) {
          const vRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${missingIds.slice(0, 50).join(",")}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          const fetchedItems = vRes.data.items || [];
          fetchedItems.forEach((item: any) => {
            const rawL = Number(item.statistics?.likeCount ?? 0);
            topVideos.push({
              id: item.id,
              title: item.snippet?.title || "Video",
              thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.default?.url || "",
              views: Number(item.statistics?.viewCount || 0),
              likes: rawL < 0 ? 0 : rawL,
              likesHidden: rawL < 0,
              estimatedMinutesWatched: 0
            });
          });
        }
      } catch (fbErr: any) {
        console.warn("Fallback top videos fetch failed:", fbErr.message);
      }
    }

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
// Helper to parse ISO 8601 duration string (e.g. PT1M15S -> 75 seconds)
function parseIsoDuration(durationStr: string): number {
  if (!durationStr) return 0;
  const match = durationStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}

// GET: Comparative Month-over-Month & Custom Period Analytics
router.get("/analytics/comparative", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accountId = req.query.accountId as string;
    const { accessToken, config } = await getYoutubeAccessToken(organizationId, accountId);

    if (!config || !config.channelId) {
      return res.status(400).json({ error: "Channel ID is not set. Please connect YouTube first." });
    }

    const channelId = config.channelId;
    const daysParam = (req.query.days as string) || "30";
    const isLifetime = daysParam === "0" || daysParam === "lifetime";
    const days = isLifetime ? 3650 : parseInt(daysParam, 10);

    // Current period dates (subtract 2 days for YouTube Analytics API latency compliance)
    const currentEnd = new Date();
    currentEnd.setDate(currentEnd.getDate() - 2);

    const currentStart = new Date(currentEnd);
    if (isLifetime) {
      currentStart.setFullYear(2005, 0, 1);
    } else {
      currentStart.setDate(currentStart.getDate() - days);
    }

    // Previous period dates
    const prevEnd = new Date(currentStart);
    prevEnd.setDate(prevEnd.getDate() - 1);
    const prevStart = new Date(prevEnd);
    if (isLifetime) {
      prevStart.setFullYear(2000, 0, 1);
    } else {
      prevStart.setDate(prevStart.getDate() - days);
    }

    const currentStartStr = formatDateString(currentStart);
    const currentEndStr = formatDateString(currentEnd);
    const prevStartStr = formatDateString(prevStart);
    const prevEndStr = formatDateString(prevEnd);

    const analyticsUrl = "https://youtubeanalytics.googleapis.com/v2/reports";
    const metricsStr = "views,likes,comments,subscribersGained,subscribersLost,estimatedMinutesWatched,averageViewDuration";

    // Fetch current period summary
    const currentRes = await axios.get(analyticsUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: {
        ids: `channel==${channelId}`,
        startDate: currentStartStr,
        endDate: currentEndStr,
        metrics: metricsStr,
      }
    });

    // Fetch previous period summary
    let prevRes = { data: { rows: [] } };
    if (!isLifetime) {
      try {
        prevRes = await axios.get(analyticsUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: {
            ids: `channel==${channelId}`,
            startDate: prevStartStr,
            endDate: prevEndStr,
            metrics: metricsStr,
          }
        });
      } catch (err) {
        console.warn("Previous period query notice:", err);
      }
    }

    const cRow = currentRes.data.rows?.[0] || [0, 0, 0, 0, 0, 0, 0];
    const pRow = prevRes.data.rows?.[0] || [0, 0, 0, 0, 0, 0, 0];

    const currentMetrics = {
      views: Number(cRow[0] || 0),
      likes: Number(cRow[1] || 0),
      comments: Number(cRow[2] || 0),
      subsGained: Number(cRow[3] || 0),
      subsLost: Number(cRow[4] || 0),
      netSubs: Number(cRow[3] || 0) - Number(cRow[4] || 0),
      watchTimeMin: Number(cRow[5] || 0),
      avgDurationSec: Number(cRow[6] || 0)
    };

    const prevMetrics = {
      views: Number(pRow[0] || 0),
      likes: Number(pRow[1] || 0),
      comments: Number(pRow[2] || 0),
      subsGained: Number(pRow[3] || 0),
      subsLost: Number(pRow[4] || 0),
      netSubs: Number(pRow[3] || 0) - Number(pRow[4] || 0),
      watchTimeMin: Number(pRow[5] || 0),
      avgDurationSec: Number(pRow[6] || 0)
    };

    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
    };

    const growth = {
      views: isLifetime ? 100 : calcGrowth(currentMetrics.views, prevMetrics.views),
      likes: isLifetime ? 100 : calcGrowth(currentMetrics.likes, prevMetrics.likes),
      comments: isLifetime ? 100 : calcGrowth(currentMetrics.comments, prevMetrics.comments),
      netSubs: isLifetime ? 100 : calcGrowth(currentMetrics.netSubs, prevMetrics.netSubs),
      watchTimeMin: isLifetime ? 100 : calcGrowth(currentMetrics.watchTimeMin, prevMetrics.watchTimeMin),
      avgDurationSec: isLifetime ? 100 : calcGrowth(currentMetrics.avgDurationSec, prevMetrics.avgDurationSec)
    };

    res.status(200).json({
      periodDays: isLifetime ? "lifetime" : days,
      currentRange: { start: currentStartStr, end: currentEndStr },
      previousRange: { start: prevStartStr, end: prevEndStr },
      current: currentMetrics,
      previous: prevMetrics,
      growth
    });
  } catch (error: any) {
    console.error("Error fetching comparative analytics:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch comparative analytics", details: error?.response?.data || error.message });
  }
});

// GET: Videos vs. Shorts Performance Breakdown
router.get("/analytics/videos-shorts", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accountId = req.query.accountId as string;
    const { accessToken, config } = await getYoutubeAccessToken(organizationId, accountId);

    if (!config || !config.channelId) {
      return res.status(400).json({ error: "Channel ID is not set. Please connect YouTube first." });
    }

    const channelId = config.channelId;

    // 1. Fetch channel uploads playlist ID
    let uploadsPlaylistId = `UU${channelId.length > 2 ? channelId.substring(2) : channelId}`;
    try {
      const chRes = await axios.get(`https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const fetchedUploads = chRes.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (fetchedUploads) {
        uploadsPlaylistId = fetchedUploads;
      }
    } catch (e: any) {
      console.warn("Notice fetching channel uploads playlist ID:", e.message);
    }

    // 2. Fetch video IDs from channel uploads playlist with pagination
    let rawVideoIds: string[] = [];
    let pageToken = "";
    try {
      do {
        const playlistRes: any = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50${pageToken ? `&pageToken=${pageToken}` : ""}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const items = playlistRes.data.items || [];
        const ids = items.map((it: any) => it.contentDetails?.videoId || it.snippet?.resourceId?.videoId).filter(Boolean);
        rawVideoIds.push(...ids);
        pageToken = playlistRes.data.nextPageToken || "";
      } while (pageToken && rawVideoIds.length < 250);
    } catch (e: any) {
      console.warn("Notice fetching playlistItems from uploads playlist:", e.message);
    }

    // Supplementary search query to ensure all videos are captured
    try {
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=50&order=date&type=video`;
      const searchRes = await axios.get(searchUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const searchIds = (searchRes.data.items || []).map((it: any) => it.id?.videoId).filter(Boolean);
      for (const sId of searchIds) {
        if (!rawVideoIds.includes(sId)) {
          rawVideoIds.push(sId);
        }
      }
    } catch (e: any) {
      console.warn("Notice fetching search videos:", e.message);
    }

    const uniqueIds = Array.from(new Set(rawVideoIds));
    if (uniqueIds.length === 0) {
      return res.status(200).json({ videos: [], shorts: [], summary: { videoCount: 0, shortCount: 0, videoViews: 0, shortViews: 0 } });
    }

    // 3. Fetch full metadata & statistics in 50-item batches to avoid YouTube API truncation limits
    const videoItems: any[] = [];
    for (let i = 0; i < uniqueIds.length; i += 50) {
      const chunkStr = uniqueIds.slice(i, i + 50).join(",");
      try {
        const videosRes = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${chunkStr}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        videoItems.push(...(videosRes.data.items || []));
      } catch (err: any) {
        console.warn("Batch video details fetch warning:", err.message);
      }
    }

    const videosList: any[] = [];
    const shortsList: any[] = [];

    videoItems.forEach((item: any) => {
      const durationSec = parseIsoDuration(item.contentDetails?.duration);
      const title = item.snippet?.title || "Untitled";
      const titleLower = title.toLowerCase();
      const descLower = (item.snippet?.description || "").toLowerCase();

      let isShort = false;
      if (durationSec > 0 && durationSec <= 60) {
        isShort = true;
      } else if (titleLower.includes("#shorts") || descLower.includes("#shorts")) {
        isShort = true;
      }

      const rawLikes = Number(item.statistics?.likeCount ?? 0);
      const likes = rawLikes < 0 ? 0 : rawLikes;
      const views = Number(item.statistics?.viewCount || 0);
      const comments = Number(item.statistics?.commentCount || 0);

      const videoData = {
        id: item.id,
        title,
        description: item.snippet?.description || "",
        thumbnail: item.snippet?.thumbnails?.medium?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.default?.url || "",
        publishedAt: item.snippet?.publishedAt,
        durationSec,
        isShort,
        views,
        likes,
        likesHidden: rawLikes < 0,
        comments,
        engagementRate: views > 0 
          ? parseFloat((((likes + comments) / views) * 100).toFixed(2))
          : 0
      };

      if (isShort) {
        shortsList.push(videoData);
      } else {
        videosList.push(videoData);
      }
    });

    const videoViews = videosList.reduce((acc, curr) => acc + curr.views, 0);
    const shortViews = shortsList.reduce((acc, curr) => acc + curr.views, 0);
    const videoLikes = videosList.reduce((acc, curr) => acc + curr.likes, 0);
    const shortLikes = shortsList.reduce((acc, curr) => acc + curr.likes, 0);

    res.status(200).json({
      videos: videosList,
      shorts: shortsList,
      summary: {
        videoCount: videosList.length,
        shortCount: shortsList.length,
        videoViews,
        shortViews,
        videoLikes,
        shortLikes,
        avgVideoEngagement: videosList.length > 0 ? parseFloat((videosList.reduce((acc, curr) => acc + curr.engagementRate, 0) / videosList.length).toFixed(2)) : 0,
        avgShortEngagement: shortsList.length > 0 ? parseFloat((shortsList.reduce((acc, curr) => acc + curr.engagementRate, 0) / shortsList.length).toFixed(2)) : 0
      }
    });
  } catch (error: any) {
    console.error("Error fetching videos vs shorts analytics:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch videos vs shorts analytics", details: error?.response?.data || error.message });
  }
});

// GET: Demographics, Traffic Sources & Devices Breakdown
router.get("/analytics/demographics", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accountId = req.query.accountId as string;
    const { accessToken, config } = await getYoutubeAccessToken(organizationId, accountId);

    if (!config || !config.channelId) {
      return res.status(400).json({ error: "Channel ID is not set. Please connect YouTube first." });
    }

    const channelId = config.channelId;
    const endDate = new Date();
    endDate.setDate(endDate.getDate() - 2);
    const endDateStr = formatDateString(endDate);

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 30);
    const startDateStr = formatDateString(startDate);

    const analyticsUrl = "https://youtubeanalytics.googleapis.com/v2/reports";

    // 1. Age & Gender
    let ageGender: any[] = [];
    try {
      const agRes = await axios.get(analyticsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          ids: `channel==${channelId}`,
          startDate: startDateStr,
          endDate: endDateStr,
          metrics: "viewerPercentage",
          dimensions: "ageGroup,gender"
        }
      });
      ageGender = (agRes.data.rows || []).map((row: any) => ({
        ageGroup: row[0]?.replace("age", "").replace("_", "-"),
        gender: row[1],
        percentage: Number(row[2] || 0)
      }));
    } catch (err: any) {
      console.warn("Age/Gender query notice:", err?.response?.data?.error?.message || err.message);
    }

    // 2. Top Countries
    let countries: any[] = [];
    try {
      const countryRes = await axios.get(analyticsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          ids: `channel==${channelId}`,
          startDate: startDateStr,
          endDate: endDateStr,
          metrics: "views,estimatedMinutesWatched",
          dimensions: "country",
          sort: "-views",
          maxResults: 8
        }
      });
      countries = (countryRes.data.rows || []).map((row: any) => ({
        country: row[0],
        views: Number(row[1] || 0),
        watchTimeMin: Number(row[2] || 0)
      }));
    } catch (err: any) {
      console.warn("Country query notice:", err?.response?.data?.error?.message || err.message);
    }

    // 3. Traffic Sources
    let trafficSources: any[] = [];
    try {
      const tsRes = await axios.get(analyticsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          ids: `channel==${channelId}`,
          startDate: startDateStr,
          endDate: endDateStr,
          metrics: "views,estimatedMinutesWatched",
          dimensions: "insightTrafficSourceType",
          sort: "-views"
        }
      });
      trafficSources = (tsRes.data.rows || []).map((row: any) => ({
        sourceType: row[0],
        views: Number(row[1] || 0),
        watchTimeMin: Number(row[2] || 0)
      }));
    } catch (err: any) {
      console.warn("Traffic source query notice:", err?.response?.data?.error?.message || err.message);
    }

    // 4. Device Breakdown
    let devices: any[] = [];
    try {
      const devRes = await axios.get(analyticsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          ids: `channel==${channelId}`,
          startDate: startDateStr,
          endDate: endDateStr,
          metrics: "views,estimatedMinutesWatched",
          dimensions: "deviceType",
          sort: "-views"
        }
      });
      devices = (devRes.data.rows || []).map((row: any) => ({
        deviceType: row[0],
        views: Number(row[1] || 0),
        watchTimeMin: Number(row[2] || 0)
      }));
    } catch (err: any) {
      console.warn("Device query notice:", err?.response?.data?.error?.message || err.message);
    }

    res.status(200).json({
      ageGender,
      countries,
      trafficSources,
      devices
    });
  } catch (error: any) {
    console.error("Error fetching demographics analytics:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch demographics analytics", details: error?.response?.data || error.message });
  }
});

// GET: Fetch Comments & Threads for a Specific Video / Short
router.get("/comments/video/:videoId", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accountId = req.query.accountId as string;
    const { accessToken } = await getYoutubeAccessToken(organizationId, accountId);
    const videoId = req.params.videoId;

    if (!videoId) {
      return res.status(400).json({ error: "videoId parameter is required." });
    }

    // Fetch video details
    let videoMeta: any = null;
    try {
      const videoDetailUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}`;
      const videoDetailRes = await axios.get(videoDetailUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      videoMeta = videoDetailRes.data.items?.[0] || null;
    } catch (e: any) {
      console.warn("Notice fetching video meta:", e.message);
    }

    // Fetch comment threads for this video
    let threads: any[] = [];
    let commentsDisabled = false;

    try {
      const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet,replies&videoId=${videoId}&maxResults=50&order=time`;
      const commentsRes = await axios.get(commentsUrl, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      threads = (commentsRes.data.items || []).map((thread: any) => {
        const topComment = thread.snippet?.topLevelComment?.snippet;
        const replies = (thread.replies?.comments || []).map((rep: any) => ({
          id: rep.id,
          authorName: rep.snippet?.authorDisplayName,
          authorAvatar: rep.snippet?.authorProfileImageUrl,
          authorChannelUrl: rep.snippet?.authorChannelUrl,
          text: rep.snippet?.textDisplay,
          likeCount: rep.snippet?.likeCount,
          publishedAt: rep.snippet?.publishedAt
        }));

        return {
          id: thread.id,
          videoId: thread.snippet?.videoId,
          authorName: topComment?.authorDisplayName || "Viewer",
          authorAvatar: topComment?.authorProfileImageUrl || "",
          authorChannelUrl: topComment?.authorChannelUrl || "",
          text: topComment?.textDisplay || "",
          likeCount: topComment?.likeCount || 0,
          publishedAt: topComment?.publishedAt,
          replyCount: thread.snippet?.totalReplyCount || 0,
          replies
        };
      });
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message || "";
      if (msg.toLowerCase().includes("disabled comments") || err?.response?.status === 403) {
        commentsDisabled = true;
      } else {
        console.warn("Notice fetching commentThreads:", msg);
        commentsDisabled = true;
      }
    }

    res.status(200).json({
      video: videoMeta ? {
        id: videoMeta.id,
        title: videoMeta.snippet?.title,
        thumbnail: videoMeta.snippet?.thumbnails?.medium?.url || videoMeta.snippet?.thumbnails?.default?.url,
        views: videoMeta.statistics?.viewCount,
        likes: videoMeta.statistics?.likeCount,
        commentsCount: videoMeta.statistics?.commentCount
      } : null,
      commentsDisabled,
      comments: threads
    });
  } catch (error: any) {
    console.error("Error fetching video comments:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch video comments", details: error?.response?.data || error.message });
  }
});

// POST: Reply to a YouTube Comment / Video Thread
router.post("/comments/reply", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const accountId = req.query.accountId as string;
    const { accessToken } = await getYoutubeAccessToken(organizationId, accountId);
    const { parentId, videoId, text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Comment text is required." });
    }

    if (parentId) {
      // Reply to an existing comment thread
      const replyUrl = "https://www.googleapis.com/youtube/v3/comments?part=snippet";
      const replyRes = await axios.post(replyUrl, {
        snippet: {
          parentId,
          textOriginal: text
        }
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return res.status(200).json({ message: "Reply posted successfully", data: replyRes.data });
    } else if (videoId) {
      // Post new top-level comment on a video
      const threadUrl = "https://www.googleapis.com/youtube/v3/commentThreads?part=snippet";
      const threadRes = await axios.post(threadUrl, {
        snippet: {
          videoId,
          topLevelComment: {
            snippet: {
              textOriginal: text
            }
          }
        }
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      return res.status(200).json({ message: "Comment posted successfully", data: threadRes.data });
    } else {
      return res.status(400).json({ error: "Either parentId or videoId is required to post a comment." });
    }
  } catch (error: any) {
    console.error("Error posting YouTube comment reply:", error?.response?.data || error.message);
    res.status(500).json({ error: "Failed to post YouTube comment reply", details: error?.response?.data || error.message });
  }
});

// POST: Disconnect YouTube Channel
router.post("/disconnect", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    if (organizationId) {
      await prisma.youTubeConfig.updateMany({
        where: { organizationId },
        data: {
          channelId: "",
          channelTitle: "",
          accessToken: "",
          refreshToken: null,
          tokenExpiresAt: null,
        },
      });
    }
    return res.status(200).json({ success: true, message: "YouTube channel disconnected successfully." });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to disconnect YouTube channel", details: error.message });
  }
});

export default router;
