import { Router } from "express";
import prisma from "../utils/prisma";
import { GoogleAdsService } from "../services/googleAdsService";
import { GoogleAdsBaseService } from "../services/googleAds/shared/GoogleAdsBaseService";
import axios from "axios";
import { GoogleAdsAiAssistantService } from "../services/googleAds/GoogleAdsAiAssistantService";
import {
  CustomerBusinessProfileService,
  validateMediaAsset,
  MediaAssetItem
} from "../services/googleAds/CustomerBusinessProfileService";
import { getGoogleAccessToken } from "../services/gmbSyncService";

const router = Router();
const DEFAULT_ORG_ID = "";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.GROQ_KEY || "";

// Helper: parse orgId from query or body or headers
const getOrgId = (req: any) => (req.headers?.["x-organization-id"] || req.query?.orgId || req.body?.orgId || DEFAULT_ORG_ID) as string;
const getCustomerId = (req: any) => (req.query?.customerId || req.body?.customerId || "") as string;

import { requireCustomerOwnership, validateCustomerOwnership } from "../utils/customerOwnership";

// Mount new isolated campaign routes with customer ownership validation
import salesRoutes from "./campaigns/salesRoutes";
import leadsRoutes from "./campaigns/leadsRoutes";
import websiteTrafficRoutes from "./campaigns/websiteTrafficRoutes";
import appPromotionRoutes from "./campaigns/appPromotionRoutes";
import youtubeReachRoutes from "./campaigns/youtubeReachRoutes";
import storeVisitsRoutes from "./campaigns/storeVisitsRoutes";
import noGuidanceRoutes from "./campaigns/noGuidanceRoutes";
import aiGuidedRoutes from "./campaigns/aiGuidedRoutes";

router.use("/campaigns/sales", requireCustomerOwnership, salesRoutes);
router.use("/campaigns/leads", requireCustomerOwnership, leadsRoutes);
router.use("/campaigns/website-traffic", requireCustomerOwnership, websiteTrafficRoutes);
router.use("/campaigns/app-promotion", requireCustomerOwnership, appPromotionRoutes);
router.use("/campaigns/youtube-reach", requireCustomerOwnership, youtubeReachRoutes);
router.use("/campaigns/store-visits", requireCustomerOwnership, storeVisitsRoutes);
router.use("/campaigns/no-guidance", requireCustomerOwnership, noGuidanceRoutes);
router.use("/ai-guided", aiGuidedRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// ACCOUNTS (MCC-aware)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/ads/accessible-customers
 * Lists all account resource names accessible to this OAuth token.
 */
router.get("/accessible-customers", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const resourceNames = await GoogleAdsService.listAccessibleCustomers(orgId);
    const customerIds = resourceNames.map((rn: string) => rn.split("/")[1]);
    res.status(200).json({ customerIds, resourceNames });
  } catch (error: any) {
    console.error("Failed to list accessible customers:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * POST /api/ads/setup-manager
 * MCC onboarding: saves the manager account and auto-discovers all sub-accounts.
 * Body: { managerCustomerId: "5617051013" }
 */
router.post("/setup-manager", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, managerCustomerId } = req.body;
    const managerId = (managerCustomerId || "").replace(/-/g, "").trim();
    if (!managerId) return res.status(400).json({ error: "managerCustomerId is required" });

    // 1. Save manager ID to config (used as login-customer-id for all API calls)
    const existingAdsConfig = await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId: orgId } });
    if (existingAdsConfig) {
      await (prisma as any).googleBusinessConfig.update({ where: { id: existingAdsConfig.id }, data: { googleAdsCustomerId: managerId } });
    } else {
      await (prisma as any).googleBusinessConfig.create({ data: { organizationId: orgId, googleAdsCustomerId: managerId, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4, isDefault: true } });
    }

    // 2. Save manager account record
    await prisma.googleAdAccount.upsert({
      where: { organizationId_customerId: { organizationId: orgId, customerId: managerId } },
      update: { isManager: true },
      create: { organizationId: orgId, customerId: managerId, name: `Manager (${managerId})`, isManager: true }
    });

    // 3. Fetch all sub-accounts via customer_client GAQL
    let subAccounts: any[] = [];
    try {
      subAccounts = await GoogleAdsService.listSubAccounts(orgId, managerId);
    } catch (subErr: any) {
      console.warn("Could not list sub-accounts:", subErr.message);
    }

    // 4. Save each sub-account
    const savedAccounts: any[] = [];
    for (const acc of subAccounts) {
      const cidStr = String(acc.customerId);
      if (cidStr === managerId) {
        // Update manager name from the GAQL response
        await prisma.googleAdAccount.update({
          where: { organizationId_customerId: { organizationId: orgId, customerId: managerId } },
          data: { name: acc.name, currencyCode: acc.currencyCode, timeZone: acc.timeZone }
        }).catch(() => {});
        continue;
      }
      try {
        const saved = await prisma.googleAdAccount.upsert({
          where: { organizationId_customerId: { organizationId: orgId, customerId: cidStr } },
          update: { name: acc.name, currencyCode: acc.currencyCode, timeZone: acc.timeZone, isManager: acc.isManager },
          create: { organizationId: orgId, customerId: cidStr, name: acc.name, currencyCode: acc.currencyCode, timeZone: acc.timeZone, isManager: acc.isManager }
        });
        savedAccounts.push(saved);
      } catch { /* skip */ }
    }

    res.status(200).json({
      message: "Manager account setup complete",
      managerCustomerId: managerId,
      subAccountsFound: savedAccounts.length,
      subAccounts: savedAccounts
    });
  } catch (error: any) {
    console.error("Setup manager error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * POST /api/ads/gaql
 * Execute a raw GAQL query on a customer account for live verification.
 */
router.post("/gaql", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = (req.query.customerId as string) || req.body.customerId;
    const { query } = req.body;
    if (!customerId || !query) return res.status(400).json({ error: "customerId and query are required" });
    const results = await GoogleAdsService.gaqlSearch(orgId, customerId.replace(/-/g, ""), query);
    res.json({ results });
  } catch (error: any) {
    console.error("GAQL error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * GET /api/ads/sub-accounts?managerCustomerId=XXX
 * Live-fetch sub-accounts from Google Ads API for a given manager.
 */
router.get("/sub-accounts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const managerCustomerId = req.query.managerCustomerId as string;
    if (!managerCustomerId) return res.status(400).json({ error: "managerCustomerId required" });
    const subAccounts = await GoogleAdsService.listSubAccounts(orgId, managerCustomerId);
    res.status(200).json(subAccounts);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * POST /api/ads/connect-customer
 * Add/register a specific client account for this org.
 * Body: { customerId, name?, currencyCode?, timeZone?, isManager? }
 */
router.post("/connect-customer", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, customerId, name, currencyCode, timeZone, isManager } = req.body;
    if (!customerId) return res.status(400).json({ error: "customerId is required" });
    const cidClean = customerId.replace(/-/g, "");

    // If saving a manager account, also update the config
    if (isManager) {
      const existingAdsConfig = await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId: orgId } });
      if (existingAdsConfig) {
        await (prisma as any).googleBusinessConfig.update({ where: { id: existingAdsConfig.id }, data: { googleAdsCustomerId: cidClean } });
      } else {
        await (prisma as any).googleBusinessConfig.create({ data: { organizationId: orgId, googleAdsCustomerId: cidClean, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4, isDefault: true } });
      }
    }

    const saved = await prisma.googleAdAccount.upsert({
      where: { organizationId_customerId: { organizationId: orgId, customerId: cidClean } },
      update: { name: name || `Account ${cidClean}`, currencyCode, timeZone, isManager: isManager || false, isActive: true },
      create: { organizationId: orgId, customerId: cidClean, name: name || `Account ${cidClean}`, currencyCode, timeZone, isManager: isManager || false }
    });

    res.status(200).json({ message: "Account connected", account: saved });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/ads/select-account
 * Sets the active Google Ads customer ID for the organization.
 * Body: { customerId }
 */
router.post("/select-account", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId } = req.body;
    if (!customerId) return res.status(400).json({ error: "customerId is required" });
    const cidClean = customerId.replace(/-/g, "");

    const existingAdsConfig = await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId: orgId } });
    if (existingAdsConfig) {
      await (prisma as any).googleBusinessConfig.update({ where: { id: existingAdsConfig.id }, data: { googleAdsCustomerId: cidClean } });
    } else {
      await (prisma as any).googleBusinessConfig.create({ data: { organizationId: orgId, googleAdsCustomerId: cidClean, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4, isDefault: true } });
    }

    res.status(200).json({ message: "Active account updated successfully", customerId: cidClean });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ads/accounts
 * List all saved accounts for this org. Manager account comes first.
 */
router.get("/accounts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const accounts = await prisma.googleAdAccount.findMany({
      where: { organizationId: orgId, isActive: true },
      orderBy: [{ isManager: "desc" }, { createdAt: "asc" }]
    });
    res.status(200).json(accounts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/ads/customer-info — Get live account info from Google Ads API
 */
router.get("/customer-info", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId query param required" });
    const info = await GoogleAdsService.getCustomerInfo(orgId, customerId);
    res.status(200).json(info);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

/**
 * GET /api/ads/customer-profile — Fetch complete Google Ads Customer Profile
 * Scoped strictly to the selected customerId:
 * - Common business info (organizationName, businessName, userName, userEmail, GMB location)
 * - Google Ads account details (customerId, name, currencyCode, timeZone, status, isManager, optimizationScore)
 * - Merchant Account: Yes/No (hasMerchantAccount, merchantCenterId)
 * - App Account: Yes/No (hasAppAccount, appId)
 */
router.get("/customer-profile", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req);
    if (!rawCid) {
      return res.status(400).json({ error: "customerId query param is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    // Verify ownership before returning profile
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    // 1. Fetch organization & user details
    const org = await (prisma.organization as any).findUnique({
      where: { id: orgId },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        gmbConfig: true,
        aiAgentConfig: true,
        googleAdAccounts: { where: { customerId: cleanCid } }
      }
    });

    const currentAccount = org?.googleAdAccounts?.[0] || null;
    const firstUser = org?.users?.[0];
    const orgName = org?.name || "Organization";
    const gmbLocation = org?.gmbConfig?.locationName || "";

    // 2. Query live Google Ads account details
    let liveInfo: any = null;
    try {
      liveInfo = await GoogleAdsService.getCustomerInfo(orgId, cleanCid);
    } catch (liveErr: any) {
      console.warn("[customer-profile] live getCustomerInfo fallback:", liveErr?.message);
    }

    // 3. Detect Merchant Account (Shopping campaigns / Merchant Center links / local drafts)
    let hasMerchantAccount = false;
    let merchantCenterId: string | null = null;

    // Check campaigns in local database for merchantId / shopping
    const shoppingCampaign = await prisma.googleAdCampaign.findFirst({
      where: {
        organizationId: orgId,
        customerId: cleanCid,
        OR: [
          { campaignType: "SHOPPING" },
          { advertisingChannelType: "SHOPPING" }
        ]
      }
    });

    if (shoppingCampaign) {
      hasMerchantAccount = true;
      const draftData: any = shoppingCampaign.audienceSignal || {};
      if (draftData?.merchantCenterAccount) {
        merchantCenterId = String(draftData.merchantCenterAccount);
      }
    }

    // 4. Detect App Account (App promotion campaigns / Universal App Campaigns)
    let hasAppAccount = false;
    let appId: string | null = null;

    const appCampaign = await prisma.googleAdCampaign.findFirst({
      where: {
        organizationId: orgId,
        customerId: cleanCid,
        OR: [
          { campaignType: "APP" },
          { campaignType: "APP_PROMOTION" },
          { advertisingChannelType: "MULTI_CHANNEL" }
        ]
      }
    });

    if (appCampaign) {
      hasAppAccount = true;
      const draftData: any = appCampaign.audienceSignal || {};
      if (draftData?.appId) {
        appId = String(draftData.appId);
      }
    }

    // 5. Query saved Customer Business & Marketing Profile
    const savedProfile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);

    const businessName = savedProfile?.businessName || currentAccount?.name || liveInfo?.descriptiveName || gmbLocation || orgName || `Account ${cleanCid}`;
    const accountName = liveInfo?.descriptiveName || currentAccount?.name || `Account ${cleanCid}`;
    const currencyCode = liveInfo?.currencyCode || currentAccount?.currencyCode || "INR";
    const timeZone = liveInfo?.timeZone || currentAccount?.timeZone || "Asia/Kolkata";
    const status = liveInfo?.status || (currentAccount?.isActive ? "ENABLED" : "PAUSED");
    const isManager = liveInfo?.manager !== undefined ? Boolean(liveInfo.manager) : Boolean(currentAccount?.isManager);
    const optimizationScore = liveInfo?.optimizationScore ? Number(liveInfo.optimizationScore) : null;

    res.status(200).json({
      success: true,
      customerId: cleanCid,
      formattedCustomerId: cleanCid.length === 10 ? `${cleanCid.slice(0, 3)}-${cleanCid.slice(3, 6)}-${cleanCid.slice(6)}` : cleanCid,
      accountName,
      businessName,
      organizationName: orgName,
      userName: firstUser?.name || firstUser?.email?.split("@")[0] || "User",
      userEmail: firstUser?.email || "",
      userRole: firstUser?.role || "agent",
      locationName: gmbLocation,
      currencyCode,
      timeZone,
      status,
      isManager,
      optimizationScore,
      // Capabilities: savedProfile takes absolute priority if present, fallback to campaign detection only if no profile has ever been saved
      hasMerchantAccount: savedProfile ? Boolean(savedProfile.hasMerchantAccount) : hasMerchantAccount,
      merchantCenterId: savedProfile ? (savedProfile.hasMerchantAccount ? savedProfile.merchantCenterId : null) : merchantCenterId,
      merchantDetails: savedProfile ? (savedProfile.hasMerchantAccount ? savedProfile.merchantDetails : null) : null,
      hasAppAccount: savedProfile ? Boolean(savedProfile.hasAppAccount) : hasAppAccount,
      appId: savedProfile ? (savedProfile.hasAppAccount ? (appId || savedProfile?.appDetails?.[0]?.appId || null) : null) : (appId || null),
      appDetails: savedProfile ? (savedProfile.hasAppAccount ? (savedProfile?.appDetails || []) : []) : (appId ? [{ id: "app-default", platform: "ANDROID", appId }] : []),
      billingStatus: savedProfile?.billingStatus || currentAccount?.billingStatus || "ACTIVE",
      googleTagId: savedProfile?.googleTagId || currentAccount?.googleTagId || null,
      // Marketing & Business Profile Fields
      legalBusinessName: savedProfile?.legalBusinessName || null,
      businessCategory: savedProfile?.businessCategory || null,
      customerType: savedProfile?.customerType || null,
      businessModel: savedProfile?.businessModel || null,
      businessEmail: savedProfile?.businessEmail || null,
      businessPhone: savedProfile?.businessPhone || null,
      whatsappNumber: savedProfile?.whatsappNumber || null,
      businessAddress: savedProfile?.businessAddress || null,
      serviceAreas: savedProfile?.serviceAreas || [],
      languagesServed: savedProfile?.languagesServed || [],
      primaryWebsite: savedProfile?.primaryWebsite || null,
      additionalWebsites: savedProfile?.additionalWebsites || [],
      youtubeLinks: savedProfile?.youtubeLinks || savedProfile?.metadata?.youtubeLinks || [],
      youtubeChannels: savedProfile?.metadata?.youtubeChannels || [],
      businessDescription: savedProfile?.businessDescription || null,
      industry: savedProfile?.industry || null,
      products: savedProfile?.products || [],
      services: savedProfile?.services || [],
      targetAudiences: savedProfile?.targetAudiences || [],
      customerPersonas: savedProfile?.customerPersonas || [],
      locationRecords: savedProfile?.locationRecords || [],
      locationsMaster: savedProfile?.locationRecords || [],
      conversionGoals: savedProfile?.conversionGoals || [],
      brandProfile: savedProfile?.brandProfile || null,
      competitors: savedProfile?.competitors || [],
      seoKeywords: savedProfile?.seoKeywords || [],
      negativeKeywords: savedProfile?.negativeKeywords || [],
      faqs: savedProfile?.faqs || [],
      aiSuggestions: savedProfile?.aiSuggestions || [],
      mediaAssets: savedProfile?.mediaAssets || [],
      targetAudience: savedProfile?.targetAudience || null,
      keyOfferings: savedProfile?.keyOfferings || [],
      locations: (savedProfile?.locations && Array.isArray(savedProfile.locations) && savedProfile.locations.length > 0)
        ? savedProfile.locations
        : (gmbLocation ? [gmbLocation] : ["India"]),
      isApproved: Boolean(savedProfile?.isApproved),
      approvedAt: savedProfile?.approvedAt || null
    });
  } catch (error: any) {
    console.error("[customer-profile] error:", error);
    res.status(500).json({ error: error?.message || "Failed to fetch customer profile" });
  }
});

/**
 * POST /api/ads/customer-profile — Save or Approve Customer Business & Marketing Profile
 * Body: BusinessProfilePayload
 */
router.post("/customer-profile", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req) || req.body?.customerId;
    if (!rawCid) {
      return res.status(400).json({ error: "customerId is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    // Verify ownership before modifying profile
    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    const isApproved = Boolean(req.body.isApproved);
    const saved = await CustomerBusinessProfileService.saveProfile(orgId, cleanCid, req.body, isApproved);
    res.status(200).json({ success: true, profile: saved });
  } catch (error: any) {
    console.error("[customer-profile POST] error:", error);
    res.status(400).json({ error: error?.message || "Failed to save profile" });
  }
});

/**
 * POST /api/ads/customer-profile/disconnect — Disconnect Merchant Center or Mobile Apps
 * Body: { customerId: string, type: 'merchant' | 'apps' | 'all' }
 */
router.post("/customer-profile/disconnect", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req) || req.body?.customerId;
    if (!rawCid) {
      return res.status(400).json({ error: "customerId is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    const { type } = req.body;
    if (!type || !["merchant", "apps", "all"].includes(type)) {
      return res.status(400).json({ error: "Invalid disconnect type. Must be 'merchant', 'apps', or 'all'." });
    }

    const updateData: any = {};
    if (type === "merchant" || type === "all") {
      updateData.hasMerchantAccount = false;
      updateData.merchantCenterId = null;
      updateData.merchantDetails = null;
    }
    if (type === "apps" || type === "all") {
      updateData.hasAppAccount = false;
      updateData.appDetails = [];
    }

    const updated = await (prisma as any).googleAdsCustomerProfile.upsert({
      where: {
        organizationId_customerId: { organizationId: orgId, customerId: cleanCid }
      },
      update: updateData,
      create: {
        organizationId: orgId,
        customerId: cleanCid,
        ...updateData
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully disconnected ${type}`,
      profile: updated
    });
  } catch (error: any) {
    console.error("[customer-profile/disconnect] error:", error);
    res.status(500).json({ error: error?.message || "Failed to disconnect account" });
  }
});

/**
 * POST /api/ads/customer-profile/sync-youtube
 * On-demand YouTube channel sync using stored Google refresh token.
 * Fetches fresh channel list from YouTube Data API v3 and merges into profile.
 * Body: { customerId }
 */
router.post("/customer-profile/sync-youtube", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req) || req.body?.customerId;
    if (!rawCid) {
      return res.status(400).json({ error: "customerId is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    // Get the stored Google refresh token
    const gConfig = await prisma.googleBusinessConfig.findFirst({
      where: { organizationId: orgId }
    });
    if (!gConfig?.googleRefreshToken) {
      return res.status(400).json({
        error: "Google account not connected. Please reconnect via the Google Sign-In button."
      });
    }

    // Get a fresh access token using the stored refresh token
    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    let access_token: string;
    try {
      access_token = await getGoogleAccessToken(clientId, clientSecret, gConfig.googleRefreshToken);
    } catch (tokenErr: any) {
      return res.status(401).json({
        error: "Failed to refresh Google access token. Please reconnect your Google account.",
        details: tokenErr.message
      });
    }

    // Fetch all YouTube channels from the Google account
    const discoveredChannels: { id: string; title: string; handle?: string; url: string }[] = [];
    const discoveredLinks: string[] = [];
    try {
      const ytRes = await axios.get(
        "https://www.googleapis.com/youtube/v3/channels?part=snippet,id&mine=true&maxResults=50",
        { headers: { Authorization: `Bearer ${access_token}` } }
      );
      const items = ytRes.data?.items || [];
      for (const ch of items) {
        const cid = ch.id;
        const title = ch.snippet?.title || "My YouTube Channel";
        const customUrl = ch.snippet?.customUrl;
        const url = customUrl
          ? `https://www.youtube.com/${customUrl}`
          : `https://www.youtube.com/channel/${cid}`;
        discoveredChannels.push({ id: cid, title, handle: customUrl || undefined, url });
        discoveredLinks.push(url);
      }
    } catch (ytErr: any) {
      return res.status(400).json({
        error: "Could not fetch YouTube channels from Google API. Make sure the Google account has the YouTube scope.",
        details: ytErr?.response?.data?.error?.message || ytErr.message
      });
    }

    if (discoveredLinks.length === 0) {
      return res.status(200).json({
        success: true,
        found: 0,
        message: "No YouTube channels found on this Google account.",
        youtubeLinks: [],
        youtubeChannels: []
      });
    }

    // Merge with existing links from the profile
    const existingProfile = await (prisma as any).googleAdsCustomerProfile.findFirst({
      where: { organizationId: orgId, customerId: cleanCid }
    });
    const existingLinks: string[] = existingProfile?.metadata?.youtubeLinks || [];
    const mergedLinks = Array.from(new Set([...existingLinks, ...discoveredLinks]));

    await (prisma as any).googleAdsCustomerProfile.upsert({
      where: {
        organizationId_customerId: { organizationId: orgId, customerId: cleanCid }
      },
      update: {
        metadata: {
          ...(existingProfile?.metadata || {}),
          youtubeLinks: mergedLinks,
          youtubeChannels: discoveredChannels
        }
      },
      create: {
        organizationId: orgId,
        customerId: cleanCid,
        metadata: { youtubeLinks: mergedLinks, youtubeChannels: discoveredChannels }
      }
    });

    console.log(`[sync-youtube] Synced ${discoveredChannels.length} channel(s) for org ${orgId}, cid ${cleanCid}`);

    return res.status(200).json({
      success: true,
      found: discoveredChannels.length,
      message: `Found and synced ${discoveredChannels.length} YouTube channel(s).`,
      youtubeLinks: mergedLinks,
      youtubeChannels: discoveredChannels
    });
  } catch (error: any) {
    console.error("[customer-profile/sync-youtube] error:", error);
    res.status(500).json({ error: error?.message || "Failed to sync YouTube channels" });
  }
});

/**
 * POST /api/ads/disconnect — Log out / Disconnect Google Ads connection
 * Clears Google Ads refresh token, active customer ID, and resets accounts for the organization.
 */
router.post("/disconnect", async (req, res) => {
  try {
    const orgId = getOrgId(req);

    // 1. Clear Google Ads refresh token and active customer ID from config
    await prisma.googleBusinessConfig.updateMany({
      where: { organizationId: orgId },
      data: {
        googleRefreshToken: null,
        googleAdsCustomerId: null
      }
    });

    // 2. Mark Google Ads accounts as inactive for this organization
    await prisma.googleAdAccount.updateMany({
      where: { organizationId: orgId },
      data: { isActive: false }
    });

    res.status(200).json({
      success: true,
      message: "Successfully disconnected from Google Ads and logged out."
    });
  } catch (error: any) {
    console.error("[/api/ads/disconnect error]:", error);
    res.status(500).json({ error: error?.message || "Failed to disconnect Google Ads" });
  }
});

/**
 * POST /api/ads/customer-profile/media/upload — Upload & Validate Creative Media Asset
 * Body: { customerId, asset: Partial<MediaAssetItem>, file?: string }
 */
router.post("/customer-profile/media/upload", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req) || req.body?.customerId;
    if (!rawCid) {
      return res.status(400).json({ error: "customerId is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    const { asset, file } = req.body;
    if (!asset || typeof asset !== "object") {
      return res.status(400).json({ error: "Asset metadata is required." });
    }

    let fileUrl = asset.fileUrl;
    let thumbnailUrl = asset.thumbnailUrl;

    // Optional: Upload base64 data to ImageKit Cloud Storage if configured
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
    if (file && typeof file === "string") {
      if (file.startsWith("data:") || !file.startsWith("http")) {
        if (privateKey) {
          try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("fileName", asset.fileName || `media_${Date.now()}`);
            formData.append("useUniqueFileName", "true");
            formData.append("folder", `/google_ads/customers/${cleanCid}/media`);
            formData.append("tags", `google_ads,profile_media,${(asset.type || "image").toLowerCase()}`);

            const authHeader = Buffer.from(`${privateKey}:`).toString("base64");
            const ikRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", formData, {
              headers: { Authorization: `Basic ${authHeader}` }
            });
            fileUrl = ikRes.data.url;
            thumbnailUrl = ikRes.data.thumbnailUrl || ikRes.data.url;
          } catch (ikErr: any) {
            console.warn("[customer-profile/media/upload] ImageKit upload error, fallback to data url:", ikErr.message);
            fileUrl = file;
          }
        } else {
          fileUrl = file;
        }
      } else if (file.startsWith("http")) {
        fileUrl = file;
      }
    }

    if (!fileUrl) {
      return res.status(400).json({ error: "A valid file or file URL is required." });
    }

    const assetToValidate: Partial<MediaAssetItem> = {
      ...asset,
      fileUrl,
      thumbnailUrl: thumbnailUrl || fileUrl,
      legalRightsConfirmed: Boolean(asset.legalRightsConfirmed)
    };

    // Server-side validation
    const validation = validateMediaAsset(assetToValidate);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error || "Media asset validation failed." });
    }

    if (validation.detectedSubtype) {
      assetToValidate.subtype = validation.detectedSubtype;
    }
    if (validation.detectedAspectRatio) {
      assetToValidate.aspectRatio = validation.detectedAspectRatio;
    }

    const savedAsset = await CustomerBusinessProfileService.upsertMediaAsset(orgId, cleanCid, assetToValidate);
    return res.status(200).json({ success: true, asset: savedAsset });
  } catch (error: any) {
    console.error("[customer-profile/media/upload POST] error:", error);
    return res.status(500).json({ error: error?.message || "Failed to upload media asset" });
  }
});

/**
 * DELETE /api/ads/customer-profile/media/:assetId — Delete Media Asset Scoped to Customer
 */
router.delete("/customer-profile/media/:assetId", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req) || req.body?.customerId || (req.query?.customerId as string);
    if (!rawCid) {
      return res.status(400).json({ error: "customerId is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    const { assetId } = req.params;
    if (!assetId) {
      return res.status(400).json({ error: "assetId is required" });
    }

    const success = await CustomerBusinessProfileService.deleteMediaAsset(orgId, cleanCid, assetId);
    return res.status(200).json({ success });
  } catch (error: any) {
    console.error("[customer-profile/media DELETE] error:", error);
    return res.status(500).json({ error: error?.message || "Failed to delete media asset" });
  }
});

/**
 * PATCH /api/ads/customer-profile/media/:assetId/status — Toggle Media Asset Status (ACTIVE/INACTIVE)
 */
router.patch("/customer-profile/media/:assetId/status", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req) || req.body?.customerId;
    if (!rawCid) {
      return res.status(400).json({ error: "customerId is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    const { assetId } = req.params;
    const { status } = req.body;
    if (!assetId) {
      return res.status(400).json({ error: "assetId is required" });
    }

    const updated = await CustomerBusinessProfileService.toggleMediaAssetStatus(orgId, cleanCid, assetId, status);
    return res.status(200).json({ success: true, asset: updated });
  } catch (error: any) {
    console.error("[customer-profile/media/status PATCH] error:", error);
    return res.status(500).json({ error: error?.message || "Failed to update media asset status" });
  }
});

/**
 * POST /api/ads/customer-profile/analyze-website — AI Website Analysis & Sub-Page Discovery
 * Body: { customerId, url, isPrimary, currentProfile }
 */
router.post("/customer-profile/analyze-website", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req) || req.body?.customerId;
    if (!rawCid) {
      return res.status(400).json({ error: "customerId is required" });
    }
    const cleanCid = rawCid.replace(/-/g, "").trim();

    const isOwned = await validateCustomerOwnership(orgId, cleanCid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    const targetUrl = req.body?.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "url is required" });
    }

    const currentProfileOverride = req.body?.currentProfile;
    const result = await CustomerBusinessProfileService.analyzeWebsiteAndExtractIntelligence(
      targetUrl,
      orgId,
      cleanCid,
      currentProfileOverride
    );
    res.status(200).json(result);
  } catch (error: any) {
    console.error("[customer-profile/analyze-website POST] error:", error);
    res.status(400).json({ error: error?.message || "Website analysis failed" });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE MERCHANT CENTER DISCOVERY & ACCOUNTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/ads/merchant-accounts
 * Discovers and queries live Merchant Center accounts associated with this organization's Google OAuth connection.
 */
router.get("/merchant-accounts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const config = await prisma.googleBusinessConfig.findFirst({
      where: { organizationId: orgId }
    });

    if (!config?.googleRefreshToken) {
      return res.status(400).json({
        success: false,
        error: "Google account not connected for this organization. Please connect Google first."
      });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";

    const accessToken = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);

    // Call Google Shopping Content API: authinfo endpoint
    let accountIdentifiers: Array<{ merchantId?: string; aggregatorId?: string }> = [];
    try {
      const authRes = await axios.get("https://shoppingcontent.googleapis.com/content/v2.1/accounts/authinfo", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      accountIdentifiers = authRes.data?.accountIdentifiers || [];
    } catch (apiErr: any) {
      console.warn("[merchant-accounts] authinfo query failed:", apiErr?.response?.data || apiErr.message);
      return res.status(200).json({
        success: true,
        connected: true,
        accounts: [],
        message: "No Google Merchant Center accounts associated with this Google connection, or permissions pending."
      });
    }

    const accounts: Array<{
      merchantId: string;
      name: string;
      sellerUrl?: string;
      websiteUrl?: string;
      adultContent?: boolean;
    }> = [];

    // Query details for each discovered merchantId
    for (const item of accountIdentifiers) {
      const mId = item.merchantId || item.aggregatorId;
      if (!mId) continue;

      try {
        const detailRes = await axios.get(`https://shoppingcontent.googleapis.com/content/v2.1/${mId}/accounts/${mId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const d = detailRes.data;
        accounts.push({
          merchantId: String(mId),
          name: d?.name || `Merchant Center (${mId})`,
          sellerUrl: d?.sellerUrl || d?.websiteUrl || "",
          websiteUrl: d?.websiteUrl || "",
          adultContent: Boolean(d?.adultContent)
        });
      } catch (detErr: any) {
        // Fallback with minimal info if sub-account fetch fails
        accounts.push({
          merchantId: String(mId),
          name: `Merchant Center (${mId})`
        });
      }
    }

    return res.status(200).json({
      success: true,
      connected: true,
      accounts
    });
  } catch (error: any) {
    console.error("[merchant-accounts] error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to retrieve Google Merchant Center accounts"
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE CONNECTED MOBILE APPS (Play Store / App Store Discovery)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/ads/connected-apps
 * Retrieves connected and linked mobile applications for the customer and organization:
 * 1. Checks customer profile appDetails & campaign asset links
 * 2. Queries live Google Ads App assets (ASSET where type = MOBILE_APP) if available
 * 3. Returns { success: true, connected: true, apps: [...] }
 */
router.get("/connected-apps", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req);
    const cleanCid = (rawCid || "").replace(/-/g, "").trim();

    const config = await prisma.googleBusinessConfig.findFirst({
      where: { organizationId: orgId }
    });

    if (!config?.googleRefreshToken) {
      return res.status(400).json({
        success: false,
        error: "Google account not connected for this organization. Please connect Google first."
      });
    }

    const appsMap: Map<string, {
      id: string;
      platform: "ANDROID" | "IOS";
      appId: string;
      appName?: string;
      appUrl?: string;
      source?: string;
    }> = new Map();

    // 1. Check existing saved CustomerBusinessProfile for apps
    if (cleanCid) {
      try {
        const profile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
        const existingApps = profile?.appDetails || [];
        for (const app of existingApps) {
          if (app.appId) {
            appsMap.set(app.appId.toLowerCase(), {
              id: app.id || `app-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              platform: (app.platform as "ANDROID" | "IOS") || "ANDROID",
              appId: app.appId,
              appName: app.appName || app.appId,
              appUrl: app.appUrl || (app.platform === "IOS"
                ? `https://apps.apple.com/app/id${app.appId}`
                : `https://play.google.com/store/apps/details?id=${app.appId}`),
              source: "Profile"
            });
          }
        }
      } catch (_profErr) {}
    }

    // 2. Check local database GoogleAdCampaign audienceSignal / draft data for appId
    try {
      const appCampaigns = await prisma.googleAdCampaign.findMany({
        where: {
          organizationId: orgId,
          ...(cleanCid ? { customerId: cleanCid } : {}),
          OR: [
            { campaignType: "APP" },
            { campaignType: "APP_PROMOTION" },
            { advertisingChannelType: "MULTI_CHANNEL" }
          ]
        }
      });

      for (const camp of appCampaigns) {
        const sig: any = camp.audienceSignal || {};
        const appId = sig.appId || sig.packageId;
        if (appId && !appsMap.has(String(appId).toLowerCase())) {
          const isIos = /^\d+$/.test(String(appId));
          const platform = (sig.platform === "IOS" || isIos) ? "IOS" : "ANDROID";
          appsMap.set(String(appId).toLowerCase(), {
            id: `camp-app-${camp.id}`,
            platform,
            appId: String(appId),
            appName: sig.appName || camp.name,
            appUrl: sig.appUrl || (platform === "IOS"
              ? `https://apps.apple.com/app/id${appId}`
              : `https://play.google.com/store/apps/details?id=${appId}`),
            source: `Campaign: ${camp.name}`
          });
        }
      }
    } catch (_campErr) {}

    // 3. Query live Google Ads API for APP / MOBILE_APP assets
    if (cleanCid) {
      try {
        const clientId = process.env.GOOGLE_CLIENT_ID || "";
        const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
        const devToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
        const accessToken = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);

        const managerAccount = await prisma.googleAdAccount.findFirst({
          where: { organizationId: orgId, isManager: true }
        });
        const loginCustomerId = managerAccount?.customerId?.replace(/-/g, "") || cleanCid;

        const headers: Record<string, string> = {
          Authorization: `Bearer ${accessToken}`,
          "developer-token": devToken,
          "Content-Type": "application/json",
          ...(loginCustomerId ? { "login-customer-id": loginCustomerId } : {})
        };

        const query = `
          SELECT
            asset.id,
            asset.name,
            asset.type,
            asset.app_asset.app_id,
            asset.app_asset.app_store
          FROM asset
          WHERE asset.type = 'MOBILE_APP'
          LIMIT 50
        `;

        const adsBase = "https://googleads.googleapis.com/v24";
        const gaqlRes = await axios.post(`${adsBase}/customers/${cleanCid}/googleAds:search`, { query }, { headers });
        const results = gaqlRes.data?.results || [];

        for (const row of results) {
          const a = row.asset;
          const aId = a?.appAsset?.appId;
          if (aId && !appsMap.has(String(aId).toLowerCase())) {
            const store = a?.appAsset?.appStore;
            const isIos = store === "APPLE_APP_STORE" || /^\d+$/.test(String(aId));
            const platform = isIos ? "IOS" : "ANDROID";
            appsMap.set(String(aId).toLowerCase(), {
              id: `live-asset-${a.id}`,
              platform,
              appId: String(aId),
              appName: a.name || `Mobile App (${aId})`,
              appUrl: platform === "IOS"
                ? `https://apps.apple.com/app/id${aId}`
                : `https://play.google.com/store/apps/details?id=${aId}`,
              source: "Google Ads Assets"
            });
          }
        }
      } catch (liveErr: any) {
        console.warn("[connected-apps] Live GAQL app assets query fallback:", liveErr?.response?.data || liveErr.message);
      }
    }

    const apps = Array.from(appsMap.values());

    return res.status(200).json({
      success: true,
      connected: true,
      apps
    });
  } catch (error: any) {
    console.error("[connected-apps] error:", error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to retrieve connected apps"
    });
  }
});



// ─────────────────────────────────────────────────────────────────────────────
// BUDGETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/budgets
router.get("/budgets", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const budgets = await GoogleAdsService.listBudgets(orgId, customerId);
    res.status(200).json(budgets);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/budgets
router.post("/budgets", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, amountPerDay, deliveryMethod, shared } = req.body;
    if (!customerId || !amountPerDay) return res.status(400).json({ error: "customerId and amountPerDay required" });
    const resourceName = await GoogleAdsService.createBudget(orgId, customerId, { name, amountPerDay: Number(amountPerDay), deliveryMethod, shared });
    res.status(201).json({ message: "Budget created", resourceName });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/budgets/:budgetId — update budget amount
router.put("/budgets/:budgetId", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, amountPerDay, resourceName: explicitResourceName } = req.body;
    const resourceName = explicitResourceName || `customers/${customerId}/campaignBudgets/${req.params.budgetId}`;
    const result = await GoogleAdsService.updateBudget(orgId, customerId, resourceName, Number(amountPerDay));
    res.status(200).json({ message: "Budget updated", result });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CAMPAIGNS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/campaigns — list campaigns with live performance
router.get("/campaigns", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);

    // Get from DB first
    const whereClause: any = { organizationId: orgId };
    if (customerId) whereClause.customerId = customerId;
    const localCampaigns = await prisma.googleAdCampaign.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" }
    });

    const serializeCamp = (c: any) => ({
      ...c,
      amountMicros: c.amountMicros != null ? Number(c.amountMicros) : 0,
      costMicros: c.costMicros != null ? Number(c.costMicros) : 0,
      impressions: c.impressions != null ? Number(c.impressions) : 0,
      clicks: c.clicks != null ? Number(c.clicks) : 0
    });

    if (!customerId) return res.status(200).json(localCampaigns.map(serializeCamp));

    try {
      const livePerformance = await GoogleAdsService.getCampaignPerformance(orgId, customerId);

      // Auto-sync any Google campaigns not in DB
      for (const lp of livePerformance) {
        const existing = localCampaigns.find(lc => lc.googleAdsCampaignId === String(lp.id));
        if (!existing) {
          try {
            const created = await prisma.googleAdCampaign.create({
              data: {
                organizationId: orgId,
                customerId,
                googleAdsCampaignId: String(lp.id),
                name: lp.name,
                campaignType: lp.channelType || "SEARCH",
                biddingStrategy: lp.biddingStrategy,
                budget: lp.budgetAmountMicros ? Number(lp.budgetAmountMicros) / 1_000_000 : 0,
                budgetResourceName: lp.budgetResourceName,
                startDate: lp.startDate ? new Date(lp.startDate) : new Date(),
                status: lp.status,
                headlines: [],
                descriptions: [],
                keywords: []
              }
            });
            localCampaigns.push(created);
          } catch { /* skip */ }
        } else {
          // Sync name/status/budget
          const needsUpdate = existing.name !== lp.name || existing.status !== lp.status;
          if (needsUpdate) {
            try {
              await prisma.googleAdCampaign.update({
                where: { id: existing.id },
                data: { name: lp.name, status: lp.status, biddingStrategy: lp.biddingStrategy }
              });
            } catch { /* skip */ }
          }
        }
      }

      const combined = localCampaigns.map(lc => {
        const lm = livePerformance.find((lp: any) => String(lp.id) === lc.googleAdsCampaignId);
        return {
          ...serializeCamp(lc),
          live: lm || null,
          impressions: lm?.impressions || 0,
          clicks: lm?.clicks || 0,
          ctr: lm?.ctr || "0%",
          conversions: lm?.conversions || 0,
          cost: lm?.cost || "0.00",
          avgCpc: lm?.avgCpc || "0.00"
        };
      });

      res.status(200).json(combined);
    } catch (apiErr: any) {
      console.warn("Live data unavailable, returning local:", apiErr.message);
      res.status(200).json(localCampaigns.map(lc => ({
        ...serializeCamp(lc),
        live: null,
        impressions: lc.impressions != null ? Number(lc.impressions) : 0,
        clicks: lc.clicks != null ? Number(lc.clicks) : 0,
        ctr: "0%",
        conversions: 0,
        cost: "0.00"
      })));
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ads/campaign/draft — save campaign as a draft
router.post("/campaign/draft", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      draftId,
      customerId,
      campaignName = "Untitled Campaign Draft",
      campaignType = "",
      biddingStrategy,
      budget,
      startDate,
      endDate,
      finalUrl,
      headlines,
      descriptions,
      keywords,
      geoTargets,
      languages,
      searchThemes,
      audienceSignal,
      adSchedule,
      draftData
    } = req.body;

    const cidClean = (customerId || "default").replace(/-/g, "");

    let draftCampaign: any;
    if (draftId) {
      draftCampaign = await prisma.googleAdCampaign.update({
        where: { id: draftId },
        data: {
          name: campaignName,
          campaignType: campaignType || "",
          biddingStrategy: biddingStrategy || null,
          budget: budget ? Number(budget) : null,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          status: "DRAFT",
          finalUrl: finalUrl || null,
          headlines: headlines || [],
          descriptions: descriptions || [],
          keywords: keywords || [],
          geoTargets: geoTargets || [],
          languages: languages || [],
          searchThemes: searchThemes || [],
          audienceSignal: audienceSignal || (draftData ? draftData : null),
          adSchedule: adSchedule || null
        } as any
      });
    } else {
      draftCampaign = await prisma.googleAdCampaign.create({
        data: {
          organizationId: orgId,
          customerId: cidClean,
          name: campaignName,
          campaignType: campaignType || "",
          biddingStrategy: biddingStrategy || null,
          budget: budget ? Number(budget) : null,
          startDate: startDate ? new Date(startDate) : new Date(),
          endDate: endDate ? new Date(endDate) : null,
          status: "DRAFT",
          finalUrl: finalUrl || null,
          headlines: headlines || [],
          descriptions: descriptions || [],
          keywords: keywords || [],
          geoTargets: geoTargets || [],
          languages: languages || [],
          searchThemes: searchThemes || [],
          audienceSignal: audienceSignal || (draftData ? draftData : null),
          adSchedule: adSchedule || null
        } as any
      });
    }

    const serializedDraft = {
      ...draftCampaign,
      amountMicros: Number((draftCampaign as any).amountMicros || 0),
      costMicros: Number((draftCampaign as any).costMicros || 0),
      impressions: Number((draftCampaign as any).impressions || 0),
      clicks: Number((draftCampaign as any).clicks || 0)
    };

    res.status(201).json({ message: "Draft saved successfully", draft: serializedDraft });
  } catch (error: any) {
    console.error("Save draft error:", error?.message);
    res.status(500).json({ error: error?.message || "Failed to save draft" });
  }
});

// GET /api/ads/campaigns/drafts — list existing campaign drafts
router.get("/campaigns/drafts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const rawCid = getCustomerId(req);
    const cidClean = rawCid ? rawCid.replace(/-/g, "") : "";

    const whereClause: any = { organizationId: orgId, status: "DRAFT" };
    if (cidClean && cidClean !== "default") {
      // Customer-specific query: ONLY return drafts for this exact customerId
      whereClause.OR = [
        { customerId: cidClean },
        { customerId: rawCid }
      ];
    } else if (cidClean === "default" || rawCid === "default") {
      // Explicit non-customer default draft query
      whereClause.customerId = "default";
    }

    const drafts = await prisma.googleAdCampaign.findMany({
      where: whereClause,
      orderBy: { updatedAt: "desc" }
    });

    const serializedDrafts = drafts.map(d => ({
      ...d,
      amountMicros: Number(d.amountMicros || 0),
      costMicros: Number(d.costMicros || 0),
      impressions: Number(d.impressions || 0),
      clicks: Number(d.clicks || 0)
    }));

    res.status(200).json(serializedDrafts);
  } catch (error: any) {
    res.status(500).json({ error: error?.message || "Failed to fetch drafts" });
  }
});

// PUT /api/ads/campaigns/:id — update campaign









router.put("/campaigns/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, status, budget, endDate, finalUrl, headlines, descriptions, keywords, biddingStrategy, geoTargets, languages, searchThemes, audienceSignal } = req.body;
    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const cid = customerId || campaign.customerId;
    const isOwned = await validateCustomerOwnership(orgId, cid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    if (campaign.googleAdsCampaignId) {
      const resourceName = `customers/${cid}/campaigns/${campaign.googleAdsCampaignId}`;
      await GoogleAdsService.updateCampaign(orgId, cid, resourceName, { name, status, endDate });
      
      if (budget !== undefined && budget !== null && Number(budget) > 0) {
        if (campaign.budgetResourceName) {
          try {
            await GoogleAdsService.updateBudget(orgId, cid, campaign.budgetResourceName, Number(budget));
          } catch (bErr: any) {
            console.warn("[updateCampaign] updateBudget error:", bErr.message);
          }
        }
      }

      // Sync updated locations (Cities, Regions, and Proximity Radius) to Google Ads API
      if (geoTargets !== undefined) {
        try {
          const locList = Array.isArray(geoTargets)
            ? geoTargets
            : typeof geoTargets === "object" && geoTargets !== null
              ? (Array.isArray((geoTargets as any).locations) ? (geoTargets as any).locations : [geoTargets])
              : [geoTargets];

          // 1. Remove existing location/proximity criteria to prevent duplicates and stale locations
          try {
            const { headers } = await GoogleAdsService.getAdsHeaders(orgId, cid);
            const ADS_BASE = "https://googleads.googleapis.com/v24";
            const searchRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:search`, {
              query: `SELECT campaign_criterion.resource_name, campaign_criterion.type FROM campaign_criterion WHERE campaign.id = ${campaign.googleAdsCampaignId} AND campaign_criterion.type IN ('LOCATION', 'PROXIMITY')`
            }, { headers });

            const rows = searchRes.data?.results || [];
            if (rows.length > 0) {
              const removeOps = rows.map((r: any) => ({
                remove: r.campaignCriterion.resourceName
              }));
              await axios.post(`${ADS_BASE}/customers/${cid}/campaignCriteria:mutate`, {
                operations: removeOps
              }, { headers });
            }
          } catch (cleanErr: any) {
            console.warn("[updateCampaign] Notice: Cleaning prior geo criteria:", cleanErr?.response?.data || cleanErr.message);
          }

          // 2. Add new location targets (Supports City, Region, Geo Constants, or Radius/Proximity targeting)
          await GoogleAdsBaseService.mutateCampaignGeoAndLanguageCriteria(
            orgId,
            cid,
            resourceName,
            { locations: locList }
          );
        } catch (geoErr: any) {
          console.warn("[updateCampaign] Geo target sync error:", geoErr?.response?.data || geoErr.message);
        }
      }
    }

    const updated = await prisma.googleAdCampaign.update({
      where: { id: req.params.id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(budget !== undefined && budget !== null && Number(budget) > 0 ? { budget: Number(budget) } : {}),
        ...(endDate !== undefined ? { endDate: endDate ? new Date(endDate) : null } : {}),
        ...(finalUrl !== undefined ? { finalUrl } : {}),
        ...(headlines !== undefined ? { headlines } : {}),
        ...(descriptions !== undefined ? { descriptions } : {}),
        ...(keywords !== undefined ? { keywords } : {}),
        ...(biddingStrategy !== undefined ? { biddingStrategy } : {}),
        ...(geoTargets !== undefined ? { geoTargets } : {}),
        ...(languages !== undefined ? { languages } : {}),
        ...(searchThemes !== undefined ? { searchThemes } : {}),
        ...(audienceSignal !== undefined ? { audienceSignal } : {})
      }
    });
    res.status(200).json({ message: "Campaign updated", campaign: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaign/status — toggle enabled/paused
router.post("/campaign/status", async (req, res) => {
  try {
    const { orgId = DEFAULT_ORG_ID, campaignId, customerId, status } = req.body;
    if (!campaignId || !status) return res.status(400).json({ error: "campaignId and status required" });
    if (!["ENABLED", "PAUSED"].includes(status)) return res.status(400).json({ error: "status must be ENABLED or PAUSED" });

    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: campaignId, organizationId: orgId } });
    if (!campaign?.googleAdsCampaignId) return res.status(404).json({ error: "Campaign not found" });

    const cid = customerId || campaign.customerId;
    const isOwned = await validateCustomerOwnership(orgId, cid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    const resourceName = `customers/${cid}/campaigns/${campaign.googleAdsCampaignId}`;
    await GoogleAdsService.updateCampaign(orgId, cid, resourceName, { status });

    const updated = await prisma.googleAdCampaign.update({ where: { id: campaignId }, data: { status } });
    res.status(200).json({ message: `Campaign ${status.toLowerCase()} successfully`, campaign: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/campaigns/:id
router.delete("/campaigns/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const cid = customerId || campaign.customerId;
    const isOwned = await validateCustomerOwnership(orgId, cid);
    if (!isOwned) {
      return res.status(403).json({ error: "Access denied. The specified Google Ads account is not associated with this organization." });
    }

    if (campaign.googleAdsCampaignId) {
      const resourceName = `customers/${cid}/campaigns/${campaign.googleAdsCampaignId}`;
      await GoogleAdsService.removeCampaign(orgId, cid, resourceName);
    }

    await prisma.googleAdCampaign.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Campaign removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});


// ─────────────────────────────────────────────────────────────────────────────
// AD GROUPS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/ad-groups
router.get("/ad-groups", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const campaignId = req.query.campaignId as string;
    if (!customerId) return res.status(400).json({ error: "customerId required" });

    const adGroups = await GoogleAdsService.listAdGroups(orgId, customerId, campaignId);

    // Sync to local DB
    for (const ag of adGroups) {
      try {
        // Find local campaign
        const localCampaign = campaignId
          ? await prisma.googleAdCampaign.findFirst({ where: { googleAdsCampaignId: campaignId, organizationId: orgId } })
          : null;

        if (localCampaign) {
          await prisma.googleAdGroup.upsert({
            where: { googleAdGroupId: ag.id },
            update: { name: ag.name, status: ag.status },
            create: {
              organizationId: orgId,
              campaignId: localCampaign.id,
              customerId,
              googleAdGroupId: ag.id,
              googleCampaignId: campaignId,
              name: ag.name,
              status: ag.status,
              adGroupType: ag.type || "SEARCH_STANDARD"
            }
          });
        }
      } catch { /* skip */ }
    }

    res.status(200).json(adGroups);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/ad-groups
router.post("/ad-groups", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignId, campaignResourceName, name, type, cpcBid } = req.body;
    if (!customerId || !name || !campaignResourceName) return res.status(400).json({ error: "customerId, name, campaignResourceName required" });

    const adGroupRef = await GoogleAdsService.createAdGroup(orgId, customerId, {
      name, campaignResourceName, type,
      cpcBidMicros: cpcBid ? Math.round(Number(cpcBid) * 1_000_000) : undefined
    });

    const adGroupId = adGroupRef?.split("/").pop();

    // Save to local DB
    if (campaignId && adGroupId) {
      await prisma.googleAdGroup.create({
        data: {
          organizationId: orgId,
          campaignId,
          customerId,
          googleAdGroupId: adGroupId,
          googleCampaignId: campaignResourceName.split("/").pop(),
          name,
          status: "ENABLED",
          adGroupType: type || "SEARCH_STANDARD"
        }
      });
    }

    res.status(201).json({ message: "Ad Group created", resourceName: adGroupRef, adGroupId });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/ad-groups/:id
router.put("/ad-groups/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, status, cpcBid } = req.body;
    const localAg = await prisma.googleAdGroup.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAg) return res.status(404).json({ error: "Ad Group not found" });

    const cid = customerId || localAg.customerId;
    const resourceName = `customers/${cid}/adGroups/${localAg.googleAdGroupId}`;
    await GoogleAdsService.updateAdGroup(orgId, cid, resourceName, {
      name, status,
      cpcBidMicros: cpcBid ? Math.round(Number(cpcBid) * 1_000_000) : undefined
    });

    const updated = await prisma.googleAdGroup.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(status && { status }) }
    });
    res.status(200).json({ message: "Ad Group updated", adGroup: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/ad-groups/:id
router.delete("/ad-groups/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const localAg = await prisma.googleAdGroup.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAg) return res.status(404).json({ error: "Ad Group not found" });

    const cid = customerId || localAg.customerId;
    if (localAg.googleAdGroupId) {
      await GoogleAdsService.removeAdGroup(orgId, cid, `customers/${cid}/adGroups/${localAg.googleAdGroupId}`);
    }
    await prisma.googleAdGroup.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Ad Group removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/ads
router.get("/ads", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const adGroupId = req.query.adGroupId as string;
    if (!customerId) return res.status(400).json({ error: "customerId required" });

    const ads = await GoogleAdsService.listAds(orgId, customerId, adGroupId);
    res.status(200).json(ads);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/ads
router.post("/ads", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, adGroupId, adGroupResourceName, finalUrls, headlines, descriptions, path1, path2 } = req.body;
    if (!customerId || !adGroupResourceName || !finalUrls || !headlines || !descriptions) {
      return res.status(400).json({ error: "customerId, adGroupResourceName, finalUrls, headlines, descriptions required" });
    }

    const adRef = await GoogleAdsService.createAd(orgId, customerId, {
      adGroupResourceName, finalUrls,
      headlines: headlines.map((h: string | object) => typeof h === "string" ? { text: h } : h),
      descriptions: descriptions.map((d: string | object) => typeof d === "string" ? { text: d } : d),
      path1, path2
    });

    // Save to local DB
    if (adGroupId) {
      const localAg = await prisma.googleAdGroup.findFirst({ where: { googleAdGroupId: adGroupId, organizationId: orgId } });
      if (localAg) {
        await prisma.googleAd.create({
          data: {
            organizationId: orgId,
            adGroupId: localAg.id,
            customerId,
            googleAdId: adRef?.split("/").pop(),
            googleAdGroupId: adGroupId,
            status: "ENABLED",
            headlines,
            descriptions,
            finalUrls,
            path1, path2
          }
        });
      }
    }

    res.status(201).json({ message: "Ad created", resourceName: adRef });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/ads/:id
router.put("/ads/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, adGroupId, status, finalUrls } = req.body;
    const localAd = await prisma.googleAd.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAd) return res.status(404).json({ error: "Ad not found" });

    const cid = customerId || localAd.customerId;
    const adResourceName = `customers/${cid}/adGroupAds/${localAd.googleAdGroupId}~${localAd.googleAdId}`;
    await GoogleAdsService.updateAd(orgId, cid, adResourceName, { status, finalUrls });

    const updated = await prisma.googleAd.update({ where: { id: req.params.id }, data: { ...(status && { status }), ...(finalUrls && { finalUrls }) } });
    res.status(200).json({ message: "Ad updated", ad: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/ads/:id
router.delete("/ads/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const localAd = await prisma.googleAd.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!localAd) return res.status(404).json({ error: "Ad not found" });

    const cid = customerId || localAd.customerId;
    if (localAd.googleAdGroupId && localAd.googleAdId) {
      await GoogleAdsService.removeAd(orgId, cid, `customers/${cid}/adGroupAds/${localAd.googleAdGroupId}~${localAd.googleAdId}`);
    }
    await prisma.googleAd.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Ad removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// KEYWORDS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/keywords
router.get("/keywords", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const adGroupId = req.query.adGroupId as string;
    const includeNegatives = req.query.includeNegatives !== "false";
    if (!customerId) return res.status(400).json({ error: "customerId required" });

    const keywords = await GoogleAdsService.listKeywords(orgId, customerId, adGroupId, includeNegatives);
    res.status(200).json(keywords);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/keywords
router.post("/keywords", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, adGroupId, adGroupResourceName, keywords } = req.body;
    if (!customerId || !adGroupResourceName || !keywords?.length) {
      return res.status(400).json({ error: "customerId, adGroupResourceName, and keywords array required" });
    }

    const results = await GoogleAdsService.addKeywords(orgId, customerId, adGroupResourceName, keywords);

    // Sync to local DB
    const localAg = await prisma.googleAdGroup.findFirst({ where: { googleAdGroupId: adGroupId, organizationId: orgId } });
    if (localAg) {
      for (let i = 0; i < keywords.length; i++) {
        const kw = keywords[i];
        const kwId = results[i]?.resourceName?.split("/").pop();
        await prisma.googleAdKeyword.create({
          data: {
            organizationId: orgId,
            adGroupId: localAg.id,
            customerId,
            googleKeywordId: kwId,
            googleAdGroupId: adGroupId,
            text: kw.text,
            matchType: kw.matchType || "BROAD",
            isNegative: kw.isNegative || false,
            status: "ENABLED"
          }
        }).catch(() => {});
      }
    }

    res.status(201).json({ message: "Keywords added", results });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/keywords/:id
router.put("/keywords/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, status, cpcBid } = req.body;
    const kw = await prisma.googleAdKeyword.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!kw) return res.status(404).json({ error: "Keyword not found" });

    const cid = customerId || kw.customerId;
    const resourceName = `customers/${cid}/adGroupCriteria/${kw.googleAdGroupId}~${kw.googleKeywordId}`;
    await GoogleAdsService.updateKeyword(orgId, cid, resourceName, {
      status,
      cpcBidMicros: cpcBid ? Math.round(Number(cpcBid) * 1_000_000) : undefined
    });

    const updated = await prisma.googleAdKeyword.update({ where: { id: req.params.id }, data: { ...(status && { status }) } });
    res.status(200).json({ message: "Keyword updated", keyword: updated });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// DELETE /api/ads/keywords/:id
router.delete("/keywords/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const kw = await prisma.googleAdKeyword.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!kw) return res.status(404).json({ error: "Keyword not found" });

    const cid = customerId || kw.customerId;
    if (kw.googleAdGroupId && kw.googleKeywordId) {
      await GoogleAdsService.removeKeyword(orgId, cid, `customers/${cid}/adGroupCriteria/${kw.googleAdGroupId}~${kw.googleKeywordId}`);
    }
    await prisma.googleAdKeyword.delete({ where: { id: req.params.id } });
    res.status(200).json({ message: "Keyword removed" });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// EXTENSIONS / ASSETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/extensions
router.get("/extensions", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const extensions = await GoogleAdsService.listExtensions(orgId, customerId);
    res.status(200).json(extensions);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/extensions/sitelinks
router.post("/extensions/sitelinks", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignResourceName, sitelinks } = req.body;
    if (!customerId || !campaignResourceName || !sitelinks?.length) {
      return res.status(400).json({ error: "customerId, campaignResourceName, sitelinks required" });
    }
    const refs = await GoogleAdsService.createSitelinkExtension(orgId, customerId, campaignResourceName, sitelinks);
    res.status(201).json({ message: "Sitelinks created", resourceNames: refs });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/extensions/callouts
router.post("/extensions/callouts", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignResourceName, callouts } = req.body;
    if (!customerId || !campaignResourceName || !callouts?.length) {
      return res.status(400).json({ error: "customerId, campaignResourceName, callouts required" });
    }
    const refs = await GoogleAdsService.createCalloutExtension(orgId, customerId, campaignResourceName, callouts);
    res.status(201).json({ message: "Callouts created", resourceNames: refs });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSIONS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/conversions
router.get("/conversions", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const conversions = await GoogleAdsService.listConversions(orgId, customerId);
    res.status(200).json(conversions);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/conversions
router.post("/conversions", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, category, value, countingType, lookbackDays } = req.body;
    if (!customerId || !name || !category) return res.status(400).json({ error: "customerId, name, category required" });
    const resourceName = await GoogleAdsService.createConversion(orgId, customerId, { name, category, value, countingType, lookbackDays });
    res.status(201).json({ message: "Conversion action created", resourceName });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AUDIENCES
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/audiences
router.get("/audiences", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const audiences = await GoogleAdsService.listAudiences(orgId, customerId);
    res.status(200).json(audiences);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GEO TARGETS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/geo-targets/search
router.get("/geo-targets/search", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req) || "";
    const query = (req.query.q || "") as string;
    const locale = (req.query.locale || "en") as string;
    if (!query) return res.status(200).json([]);
    const results = await GoogleAdsService.searchGeoTargets(orgId, customerId, query, locale);
    res.status(200).json(results);
  } catch (error: any) {
    res.status(200).json([]);
  }
});

// GET /api/ads/places/autocomplete - Google Places & Geocode proxy
router.get("/places/autocomplete", async (req, res) => {
  try {
    const query = ((req.query.input || req.query.q || "") as string).trim();
    const mode = (req.query.mode || "location") as string; // 'location' | 'radius'
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!query) return res.status(200).json({ predictions: [] });
    if (!apiKey) return res.status(200).json({ predictions: [] });

    const isPinCode = /^\d{3,10}$/.test(query.replace(/\s+/g, ""));

    // If query is a Postal/PIN code, query Geocoding API first to get city, district, state
    if (isPinCode) {
      try {
        const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${apiKey}`;
        const geoRes = await axios.get(geoUrl, { timeout: 8000 });
        const results = geoRes.data?.results || [];

        if (results.length > 0) {
          const pinPredictions = results.map((item: any) => {
            let locality = "";
            let district = "";
            let state = "";
            let country = "";
            let postalCode = query;

            for (const comp of item.address_components || []) {
              if (comp.types.includes("postal_code")) postalCode = comp.long_name;
              if (comp.types.includes("locality")) locality = comp.long_name;
              if (comp.types.includes("administrative_area_level_2")) district = comp.long_name;
              if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
              if (comp.types.includes("country")) country = comp.long_name;
            }

            const mainCity = locality || district || item.formatted_address.split(",")[0];
            const secondary = [district && district !== mainCity ? district : null, state, country].filter(Boolean).join(", ");
            const description = `${mainCity} (${postalCode}), ${secondary}`;

            return {
              placeId: item.place_id,
              description: description || item.formatted_address,
              mainText: `${mainCity} (${postalCode})`,
              secondaryText: secondary || item.formatted_address,
              types: ["postal_code"],
              lat: item.geometry?.location?.lat,
              lng: item.geometry?.location?.lng
            };
          });

          return res.status(200).json({ predictions: pinPredictions });
        }
      } catch (geoErr: any) {
        console.warn("Postal code geocode error:", geoErr.message);
      }
    }

    // Autocomplete for all cities, areas, neighborhoods, districts, postal codes & landmarks
    const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${apiKey}`;
    let response = await axios.get(url, { timeout: 8000 });

    if (response.data?.status && response.data.status !== "OK" && response.data.status !== "ZERO_RESULTS") {
      console.warn(`[GooglePlaces] Autocomplete status: ${response.data.status}, error_message: ${response.data.error_message || "none"}`);
    }

    let predictions = (response.data?.predictions || []).map((pred: any) => ({
      placeId: pred.place_id,
      description: pred.description,
      mainText: pred.structured_formatting?.main_text || pred.description,
      secondaryText: pred.structured_formatting?.secondary_text || "",
      types: pred.types || []
    }));

    res.status(200).json({ predictions });
  } catch (err: any) {
    console.error("Places autocomplete error:", err?.response?.data || err.message);
    res.status(200).json({ predictions: [], error: err.message });
  }
});

// GET /api/ads/places/details - Geocode placeId / coordinates
router.get("/places/details", async (req, res) => {
  try {
    const placeId = (req.query.placeId || "") as string;
    const address = (req.query.address || "") as string;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(400).json({ error: "GOOGLE_PLACES_API_KEY is not configured on the server." });
    }

    if (placeId) {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=name,formatted_address,geometry,address_components&key=${apiKey}`;
      const response = await axios.get(url, { timeout: 8000 });
      const result = response.data?.result;
      if (result) {
        return res.status(200).json({
          name: result.name,
          formattedAddress: result.formatted_address,
          lat: result.geometry?.location?.lat,
          lng: result.geometry?.location?.lng,
          viewport: result.geometry?.viewport
        });
      }
    } else if (address) {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
      const response = await axios.get(url, { timeout: 8000 });
      const result = response.data?.results?.[0];
      if (result) {
        return res.status(200).json({
          name: address,
          formattedAddress: result.formatted_address,
          lat: result.geometry?.location?.lat,
          lng: result.geometry?.location?.lng,
          viewport: result.geometry?.viewport
        });
      }
    }

    res.status(404).json({ error: "Place details not found." });
  } catch (err: any) {
    console.error("Place details error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ads/places/config - Provide Google Places/Maps API key for interactive map preview
router.get("/places/config", async (_req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_API_KEY || "";
  res.status(200).json({ apiKey, hasKey: Boolean(apiKey) });
});

// GET /api/ads/languages
router.get("/languages", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const results = await GoogleAdsService.getLanguageConstants(orgId, customerId);
    res.status(200).json(results);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/geo-targets
router.post("/geo-targets", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, campaignResourceName, geoTargetIds } = req.body;
    if (!customerId || !campaignResourceName || !geoTargetIds?.length) {
      return res.status(400).json({ error: "customerId, campaignResourceName, geoTargetIds required" });
    }
    const results = await GoogleAdsService.addGeoTargets(orgId, customerId, campaignResourceName, geoTargetIds);
    res.status(201).json({ message: "Geo targets added", results });
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE REPORTS
// ─────────────────────────────────────────────────────────────────────────────

// GET /api/ads/reports/overview
router.get("/reports/overview", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    
    try {
      const overview = await GoogleAdsService.getAccountOverview(orgId, customerId, dateRange);
      return res.status(200).json(overview);
    } catch (liveErr: any) {
      console.warn("[Google Ads Overview] Live API overview failed, aggregating from database:", liveErr.message);
      
      const localCampaigns = await prisma.googleAdCampaign.findMany({
        where: { organizationId: orgId, customerId }
      });

      const totalImpressions = localCampaigns.reduce((s, c) => s + Number(c.impressions || 0), 0);
      const totalClicks = localCampaigns.reduce((s, c) => s + Number(c.clicks || 0), 0);
      const totalCostMicros = localCampaigns.reduce((s, c) => s + Number(c.costMicros || 0), 0);
      const totalCost = (totalCostMicros / 1_000_000).toFixed(2);
      const totalConversions = localCampaigns.reduce((s, c) => s + (c.conversions || 0), 0);
      const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) + "%" : "0.00%";
      const avgCpc = totalClicks > 0 ? ((totalCostMicros / totalClicks) / 1_000_000).toFixed(2) : "0.00";

      return res.status(200).json({
        impressions: totalImpressions,
        clicks: totalClicks,
        cost: totalCost,
        ctr,
        conversions: totalConversions,
        avgCpc,
        allConversionsValue: "0.00",
        costPerConversion: totalConversions > 0 ? (Number(totalCost) / totalConversions).toFixed(2) : "0.00"
      });
    }
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// GET /api/ads/reports/daily
router.get("/reports/daily", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const data = await GoogleAdsService.getPerformanceByDate(orgId, customerId, dateRange);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// GET /api/ads/reports/search-terms
router.get("/reports/search-terms", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const data = await GoogleAdsService.getSearchTermsReport(orgId, customerId, dateRange);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// GET /api/ads/reports/ads
router.get("/reports/ads", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const customerId = getCustomerId(req);
    const dateRange = (req.query.dateRange as string) || "LAST_30_DAYS";
    if (!customerId) return res.status(400).json({ error: "customerId required" });
    const data = await GoogleAdsService.getAdPerformanceReport(orgId, customerId, dateRange);
    res.status(200).json(data);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// AI COPY GENERATION
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/ads/generate-copy — AI-generated RSA headlines, descriptions, keywords
router.post("/generate-copy", async (req, res) => {
  try {
    const { businessDescription, campaignTheme, targetLocation, keywords, campaignType } = req.body;

    if (!businessDescription || !campaignTheme) {
      return res.status(400).json({ error: "businessDescription and campaignTheme are required." });
    }

    const prompt = `You are an expert Google Ads specialist with 10+ years experience writing high-converting ${campaignType || "Search"} ads.

Write compelling ad copy for a Google ${campaignType || "Search"} campaign:
- Business: ${businessDescription}
- Goal/Theme: ${campaignTheme}
- Target Location: ${targetLocation || "Local area"}
- Seed Keywords: ${keywords ? (Array.isArray(keywords) ? keywords.join(", ") : keywords) : "local search"}

STRICT Google Ads character limits:
- Headlines: MAXIMUM 30 characters each (including spaces)
- Descriptions: MAXIMUM 90 characters each

Requirements:
1. Generate exactly 15 unique headlines (max 30 chars each) — include primary keyword in at least 3
2. Generate exactly 4 unique descriptions (max 90 chars each) — with clear CTAs
3. Generate exactly 15 relevant keywords (mix of broad, phrase [in quotes], exact [in brackets])
4. Generate 5 sitelink suggestions (linkText: max 25 chars, description1: max 35 chars, description2: max 35 chars)
5. Generate 5 callout text suggestions (max 25 chars each)
6. Double-check ALL character limits before responding

Return ONLY a raw JSON object (no markdown, no explanation):
{
  "headlines": ["...(max 30 chars)..."],
  "descriptions": ["...(max 90 chars)..."],
  "keywords": ["keyword1", "\\"phrase match\\"", "[exact match]"],
  "sitelinks": [{"linkText": "...", "description1": "...", "description2": "...", "url": ""}],
  "callouts": ["...", "..."]
}`;

    const result = await GoogleAdsAiAssistantService.executeGroqChat({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.65,
      max_tokens: 1500,
      response_format: { type: "json_object" }
    });

    const raw = result.content || "{}";
    const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    const parsed = JSON.parse(cleaned);

    res.status(200).json({
      headlines: (parsed.headlines || []).map((h: string) => h.substring(0, 30)),
      descriptions: (parsed.descriptions || []).map((d: string) => d.substring(0, 90)),
      keywords: parsed.keywords || [],
      sitelinks: parsed.sitelinks || [],
      callouts: parsed.callouts || []
    });
  } catch (error: any) {
    console.error("Ad copy generation error:", error?.response?.data || error.message);
    res.status(500).json({ error: "AI copy generation failed. Please try again." });
  }
});

// POST /api/ads/generate-keywords — AI keyword expansion
router.post("/generate-keywords", async (req, res) => {
  try {
    const { seedKeywords, businessDescription, targetLocation } = req.body;
    if (!seedKeywords?.length) return res.status(400).json({ error: "seedKeywords required" });

    const prompt = `You are a Google Ads keyword research expert.

Expand these seed keywords for a Google Ads campaign:
Seeds: ${Array.isArray(seedKeywords) ? seedKeywords.join(", ") : seedKeywords}
Business: ${businessDescription || ""}
Location: ${targetLocation || ""}

Generate 30 highly relevant keywords in all 3 match types:
- 10 broad match (just the keyword)
- 10 phrase match (in "quotes")
- 10 exact match (in [brackets])

Focus on: commercial intent, local search, problem-solving queries.

Return ONLY a JSON array of strings (no markdown):
["keyword1", "\\"phrase match\\"", "[exact match]", ...]`;

    const result = await GoogleAdsAiAssistantService.executeGroqChat({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 800
    });

    const raw = result.content || "[]";
    const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    const keywords = JSON.parse(cleaned);

    res.status(200).json({ keywords: Array.isArray(keywords) ? keywords : [] });
  } catch (error: any) {
    res.status(500).json({ error: "Keyword generation failed." });
  }
});

// POST /api/ads/generate-copy — AI ad copy generation using env API key (GROQ_KEY)
router.post("/generate-copy", async (req, res) => {
  try {
    const { businessName, finalUrl, type = "HEADLINES", language = "English", prompt: userCustomPrompt } = req.body;
    const targetUrl = finalUrl && finalUrl.trim() ? finalUrl.trim() : "https://japatracker-7f759.web.app/";
    
    // Extract domain keyword (e.g., japatracker, portfolio, store, etc.)
    let domainName = businessName || "My Product";
    try {
      const parsed = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      if (!businessName) {
        domainName = parsed.hostname.replace("www.", "").split(".")[0] || "Business";
        domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
      }
    } catch (e) {
      if (!businessName) domainName = "Business";
    }

    // Try AI generation with GROQ LLM
    let copyData: any = {};
    const apiKey = process.env.GROQ_KEY || GROQ_KEY;

    if (apiKey) {
      try {
        const langInstruction = language && language.toLowerCase() !== "english"
          ? `CRITICAL LANGUAGE REQUIREMENT: Generate all headlines, long headlines, and descriptions in ${language} (or in the language of the prompt).`
          : `Generate ad copy in English or the natural language of the business/prompt.`;

        const prompt = `You are an expert Google Ads copywriter. Generate unique, high-converting ad copy for business: "${domainName}" (Website: ${targetUrl}).
${userCustomPrompt ? `User Instructions/Context: ${userCustomPrompt}` : ""}
${langInstruction}

Rules:
- Headlines: 5 distinct headlines (each <= 30 characters).
- Long Headlines: 5 distinct long headlines (each <= 90 characters).
- Descriptions: 5 distinct descriptions (each <= 90 characters).

Return ONLY a JSON object:
{
  "headlines": ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"],
  "longHeadlines": ["Long Headline 1", "Long Headline 2", "Long Headline 3", "Long Headline 4", "Long Headline 5"],
  "descriptions": ["Description 1", "Description 2", "Description 3", "Description 4", "Description 5"]
}`;

        const result = await GoogleAdsAiAssistantService.executeGroqChat({
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 800,
          response_format: { type: "json_object" }
        });

        const raw = result.content || "{}";
        const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
        copyData = JSON.parse(cleaned);
      } catch (aiErr: any) {
        console.warn("[AI Copy LLM Warning]: Using dynamic domain copy fallback for", targetUrl);
      }
    }

    // Fallbacks tailored directly to the specified domain
    const headlines = (Array.isArray(copyData.headlines) && copyData.headlines.length >= 5)
      ? copyData.headlines.map((s: string) => s.substring(0, 30))
      : [
          `${domainName} Official Site`,
          `Explore ${domainName} Deals`,
          `Top ${domainName} Services`,
          `Get Started With ${domainName}`,
          `Instant ${domainName} Solutions`
        ];

    const longHeadlines = (Array.isArray(copyData.longHeadlines) && copyData.longHeadlines.length >= 5)
      ? copyData.longHeadlines.map((s: string) => s.substring(0, 90))
      : [
          `Experience Industry-Leading Digital Solutions With ${domainName} Official Website`,
          `Streamline Customer Operations & Growth - Visit ${domainName} Online Today`,
          `Discover Top Rated Features & Exclusive Offerings Tailored For ${domainName} Users`,
          `Maximize Conversions & Business Reach With ${domainName} Smart Software Tools`,
          `Get Fast 24/7 Access To Premium Features Available Directly On ${domainName}`
        ];

    const descriptions = (Array.isArray(copyData.descriptions) && copyData.descriptions.length >= 5)
      ? copyData.descriptions.map((s: string) => s.substring(0, 90))
      : [
          `Discover premium solutions and fast services on ${domainName}. Visit our website today!`,
          `Streamline your workflows and boost results with ${domainName}. Explore all features online.`,
          `Get started with ${domainName} for real-time tracking, automated tools, and 24/7 support.`,
          `Try ${domainName} today to scale your business efficiency and reach maximum customer potential.`,
          `Visit ${domainName} now to unlock exclusive digital tools and transform your operations.`
        ];

    return res.status(200).json({ headlines, longHeadlines, descriptions });
  } catch (error: any) {
    console.error("[AI Copy Generation Error]:", error?.message);
    res.status(500).json({ error: "Failed to generate AI copy" });
  }
});

// POST /api/ads/analyze-campaign — AI campaign health analysis
router.post("/analyze-campaign", async (req, res) => {
  try {
    const { campaignData, adGroups, keywords, searchTerms } = req.body;
    if (!campaignData) return res.status(400).json({ error: "campaignData required" });

    const prompt = `You are a Google Ads expert analyzing campaign performance.

Campaign: ${JSON.stringify(campaignData)}
${adGroups ? `Ad Groups: ${JSON.stringify(adGroups).substring(0, 500)}` : ""}
${keywords ? `Top Keywords: ${JSON.stringify(keywords).substring(0, 500)}` : ""}
${searchTerms ? `Search Terms: ${JSON.stringify(searchTerms).substring(0, 500)}` : ""}

Provide an expert analysis with:
1. Overall performance assessment (score 1-10)
2. Top 3 strengths
3. Top 3 issues found
4. 5 specific optimization recommendations (with exact actions)
5. Suggested bid adjustments
6. Negative keyword suggestions based on search terms

Return ONLY a JSON object:
{
  "score": 7,
  "assessment": "...",
  "strengths": ["...", "...", "..."],
  "issues": ["...", "...", "..."],
  "recommendations": [{"title": "...", "action": "...", "impact": "HIGH/MEDIUM/LOW"}],
  "bidAdjustments": ["..."],
  "negativeKeywords": ["..."]
}`;

    const result = await GoogleAdsAiAssistantService.executeGroqChat({
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
      max_tokens: 1200,
      response_format: { type: "json_object" }
    });

    const raw = result.content || "{}";
    const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    const analysis = JSON.parse(cleaned);

    res.status(200).json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: "Campaign analysis failed." });
  }
});

export default router;
