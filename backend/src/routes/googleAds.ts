import { Router } from "express";
import prisma from "../utils/prisma";
import { GoogleAdsService } from "../services/googleAdsService";
import axios from "axios";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_KEY = process.env.GROQ_KEY || "";

// Helper: parse orgId from query or body
const getOrgId = (req: any) => (req.query.orgId || req.body?.orgId || DEFAULT_ORG_ID) as string;
const getCustomerId = (req: any) => (req.query.customerId || req.body?.customerId || "") as string;

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
    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: { googleAdsCustomerId: managerId },
      create: { organizationId: orgId, googleAdsCustomerId: managerId, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4 }
    });

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
      await prisma.googleBusinessConfig.upsert({
        where: { organizationId: orgId },
        update: { googleAdsCustomerId: cidClean },
        create: { organizationId: orgId, googleAdsCustomerId: cidClean, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4 }
      });
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

    await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: { googleAdsCustomerId: cidClean },
      create: { organizationId: orgId, googleAdsCustomerId: cidClean, locationName: "", autoReplyEnabled: false, autoReplyMinRating: 4 }
    });

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
        impressions: 0,
        clicks: 0,
        ctr: "0%",
        conversions: 0,
        cost: "0.00"
      })));
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ads/campaign/launch — full campaign creation wizard
router.post("/campaign/launch", async (req, res) => {
  try {
    const {
      orgId = DEFAULT_ORG_ID, customerId, campaignName, budget,
      channelType, biddingStrategy, targetCpa, targetRoas,
      startDate, endDate, finalUrl, headlines, descriptions, keywords,
      geoTargetIds, networkDisplay, images
    } = req.body;

    if (!customerId || !campaignName || !budget || !finalUrl || !headlines || !descriptions) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let result;
    if (channelType === "PERFORMANCE_MAX") {
      result = await GoogleAdsService.launchPerformanceMaxCampaign({
        organizationId: orgId, customerId,
        campaignName, budget: Number(budget),
        biddingStrategy: biddingStrategy || "MAXIMIZE_CONVERSIONS",
        targetCpa: targetCpa ? Number(targetCpa) : undefined,
        targetRoas: targetRoas ? Number(targetRoas) : undefined,
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate, finalUrl, headlines, descriptions,
        images: images || []
      });
    } else {
      result = await GoogleAdsService.launchLocalSearchCampaign({
        organizationId: orgId, customerId,
        campaignName, budget: Number(budget),
        channelType, biddingStrategy, targetCpa: targetCpa ? Number(targetCpa) : undefined,
        targetRoas: targetRoas ? Number(targetRoas) : undefined,
        startDate: startDate || new Date().toISOString().split("T")[0],
        endDate, finalUrl, headlines, descriptions, keywords: keywords || [],
        geoTargetIds, networkDisplay
      });
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: result.campaignId || null,
        name: campaignName,
        campaignType: channelType || "SEARCH",
        biddingStrategy: biddingStrategy || "MANUAL_CPC",
        budget: Number(budget),
        budgetResourceName: result.budgetResourceName,
        startDate: new Date(startDate || new Date()),
        endDate: endDate ? new Date(endDate) : null,
        status: "PAUSED",
        finalUrl,
        headlines, descriptions, keywords: keywords || [],
        geoTargets: geoTargetIds || []
      }
    });

    res.status(201).json({ message: "Campaign launched successfully!", campaign: localCampaign, resourceNames: result });
  } catch (error: any) {
    console.error("Campaign launch error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-app-promotion
router.post("/campaigns/create-app-promotion", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "App promotion – App 1",
      campaignSubtype = "APP_INSTALLS",
      platform = "ANDROID",
      appId = "com.hubmate.app",
      appName = "Hubmate",
      locations = ["India"],
      languages = ["English"],
      viewThroughEnabled = false,
      euPolitical = "NO",
      headlines = [],
      descriptions = [],
      images = [],
      videos = [],
      targetCpa = 25,
      dailyBudget = 1000,
      conversionAction = "Google Play app installs (First Open)",
      userTargetType = "All users"
    } = req.body;

    if (!headlines || headlines.length === 0 || !headlines[0]) {
      return res.status(400).json({ error: "At least 1 headline is required." });
    }
    if (!descriptions || descriptions.length === 0 || !descriptions[0]) {
      return res.status(400).json({ error: "At least 1 description is required." });
    }

    const advertisingChannelType = "MULTI_CHANNEL";
    const advertisingChannelSubType = "APP_CAMPAIGN";
    const appStore = platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE";
    const biddingStrategyGoalType = "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = Math.round(Number(targetCpa) * 1_000_000);

    // Call GoogleAdsService helper (or generate mock resource if API not linked)
    let apiResult: any = { campaignId: `app-cmp-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createAppPromotionCampaign) {
        apiResult = await GoogleAdsService.createAppPromotionCampaign(orgId, customerId, {
          campaignName,
          appId,
          appStore,
          amountMicros,
          targetCpaMicros,
          headlines,
          descriptions,
          locations,
          languages
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for App Promotion]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `app-${Date.now()}`,
        name: campaignName,
        campaignType: "MULTI_CHANNEL",
        biddingStrategy: biddingStrategyGoalType,
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        headlines,
        descriptions,
        finalUrl: `https://play.google.com/store/apps/details?id=${appId}`,
        geoTargets: locations,
        advertisingChannelType: "MULTI_CHANNEL",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    // Also store Ad Group & Ad locally
    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: `${campaignName} - Ad Group 1`,
        adGroupType: "SEARCH_STANDARD",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines,
        descriptions,
        finalUrls: [`https://play.google.com/store/apps/details?id=${appId}`],
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "Campaign created successfully (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        advertising_channel_sub_type: advertisingChannelSubType,
        app_store: appStore,
        app_id: appId,
        bidding_strategy_goal_type: biddingStrategyGoalType,
        "target_cpa.target_cpa_micros": targetCpaMicros,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("App promotion campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-youtube-campaign
router.post("/campaigns/create-youtube-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = `Video views - ${new Date().toISOString().split("T")[0]}`,
      campaignGoal = "VIDEO_VIEWS",
      adFormats = ["SKIPPABLE_IN_STREAM", "IN_FEED", "SHORTS"],
      bidStrategy = "TARGET_CPV",
      budgetType = "DAILY",
      dailyBudget = 1000,
      targetCpv = 10.0,
      locations = ["India"],
      languages = ["English"],
      networks = ["YouTube", "Google Display Network"],
      videoUrls = [],
      adGroupName = "Ad Group 1",
      audience = {},
      content = {}
    } = req.body;

    if (!videoUrls || videoUrls.length === 0 || !videoUrls[0]) {
      return res.status(400).json({ error: "At least 1 YouTube video URL is required." });
    }

    const advertisingChannelType = "VIDEO";
    const advertisingChannelSubType = campaignGoal === "REACH" ? "VIDEO_REACH" : campaignGoal === "ENGAGEMENT" ? "VIDEO_ACTION" : "VIDEO_VIEWS";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpvMicros = Math.round(Number(targetCpv) * 1_000_000);

    let apiResult: any = { campaignId: `yt-cmp-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createYouTubeCampaign) {
        apiResult = await GoogleAdsService.createYouTubeCampaign(orgId, customerId, {
          campaignName,
          campaignGoal,
          amountMicros,
          targetCpvMicros,
          videoUrls,
          locations,
          languages
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for YouTube Campaign]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `yt-${Date.now()}`,
        name: campaignName,
        campaignType: "VIDEO",
        biddingStrategy: bidStrategy,
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl: videoUrls[0],
        geoTargets: locations,
        advertisingChannelType: "VIDEO",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: adGroupName || `${campaignName} - Ad Group 1`,
        adGroupType: "VIDEO_STANDARD",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines: [campaignName],
        descriptions: ["Watch our latest YouTube video"],
        finalUrls: videoUrls,
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "YouTube Campaign created successfully (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        advertising_channel_sub_type: advertisingChannelSubType,
        bidding_strategy_type: bidStrategy,
        target_cpv_micros: targetCpvMicros,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("YouTube campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-local-pmax-campaign
router.post("/campaigns/create-local-pmax-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "Local store visits and promotions-Performance Max-1",
      finalUrl = "https://www.example.com",
      storeLocationFeed = "Use all locations",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      targetRoas = 200,
      onlyNewCustomers = false,
      reengageLapsedCustomers = false,
      languages = ["English"],
      euPolitical = "NO",
      assetGroupName = "Asset Group 1",
      headlines = [],
      descriptions = [],
      images = [],
      searchThemes = [],
      audienceSignal = "",
      budgetType = "DAILY",
      dailyBudget = 1000
    } = req.body;

    if (!finalUrl) {
      return res.status(400).json({ error: "Final URL is required." });
    }
    if (!headlines || headlines.length === 0 || !headlines[0]) {
      return res.status(400).json({ error: "At least 1 headline is required." });
    }

    const advertisingChannelType = "PERFORMANCE_MAX";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    let apiResult: any = { campaignId: `pmax-cmp-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createLocalPerformanceMaxCampaign) {
        apiResult = await GoogleAdsService.createLocalPerformanceMaxCampaign(orgId, customerId, {
          campaignName,
          finalUrl,
          amountMicros,
          biddingFocus,
          targetCpaMicros,
          headlines,
          descriptions,
          images
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for Local Performance Max]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `pmax-${Date.now()}`,
        name: campaignName,
        campaignType: "PERFORMANCE_MAX",
        biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl,
        headlines,
        descriptions,
        geoTargets: ["All store locations"],
        advertisingChannelType: "PERFORMANCE_MAX",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: assetGroupName || `${campaignName} Asset Group 1`,
        adGroupType: "PERFORMANCE_MAX",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines,
        descriptions,
        finalUrls: [finalUrl],
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "Local Performance Max Campaign created successfully (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        store_location_feed: storeLocationFeed,
        bidding_focus: biddingFocus,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("Local Performance Max creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-noguidance-pmax-campaign
router.post("/campaigns/create-noguidance-pmax-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "Performance Max-1",
      finalUrl = "https://www.example.com",
      businessName = "",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      targetRoas = 200,
      onlyNewCustomers = false,
      reengageLapsedCustomers = false,
      startDate,
      endDate,
      locations = ["India"],
      locationOption = "PRESENCE_OR_INTEREST",
      languages = ["English"],
      euPolitical = "NO",
      assetGroupName = "Asset Group 1",
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      searchThemes = [],
      audienceSignal = "",
      adSchedule,
      budgetType = "DAILY",
      dailyBudget = 1000,
      trackingTemplate,
      finalUrlSuffix,
      customParameters,
      displayPath1,
      displayPath2,
      enableFinalUrlExpansion,
      sitelinks,
      callouts,
      callAsset,
      structuredSnippets,
      promotions,
      prices,
      finalMobileUrls,
      assetGroupTrackingTemplate,
      assetGroupCustomParameters,
      leadForm,
      locationTargetingType,
      brandGuidelinesEnabled,
      brandColors,
      brandExclusions,
      urlRulesList,
      assetOptimizations,
      youtubeVideos,
      messagingRestrictions,
      ga4Property,
      messageAsset,
      pageFeeds,
      merchantCenter,
      storeLocations,
      dynamicAdsFeed,
      valueRules,
      thirdPartyMeasurement,
      audienceExclusions,
      ytUserSegment,
      assetSchedules,
      promoTerms,
      leadFormWebhook
    } = req.body;

    if (!finalUrl) {
      return res.status(400).json({ error: "Final URL is required." });
    }
    const validHeadlines = (headlines || []).filter((h: any) => typeof h === "string" && h.trim());
    if (validHeadlines.length < 3) {
      return res.status(400).json({ error: "Performance Max requires at least 3 headlines." });
    }
    const validLongHeadlines = (longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim());
    if (validLongHeadlines.length < 1) {
      return res.status(400).json({ error: "Performance Max requires at least 1 long headline." });
    }
    const validDescriptions = (descriptions || []).filter((d: any) => typeof d === "string" && d.trim());
    if (validDescriptions.length < 2) {
      return res.status(400).json({ error: "Performance Max requires at least 2 descriptions." });
    }
    if (!startDate || typeof startDate !== "string" || !startDate.trim()) {
      return res.status(400).json({ error: "Start Date (startDate) is required in YYYY-MM-DD format." });
    }
    if (!endDate || typeof endDate !== "string" || !endDate.trim()) {
      return res.status(400).json({ error: "End Date (endDate) is required in YYYY-MM-DD format." });
    }
    const parsedStart = new Date(startDate.trim());
    const parsedEnd = new Date(endDate.trim());
    if (isNaN(parsedStart.getTime())) {
      return res.status(400).json({ error: "Invalid Start Date format. Expected valid date (YYYY-MM-DD)." });
    }
    if (isNaN(parsedEnd.getTime())) {
      return res.status(400).json({ error: "Invalid End Date format. Expected valid date (YYYY-MM-DD)." });
    }
    if (parsedEnd < parsedStart) {
      return res.status(400).json({ error: "End Date cannot be earlier than Start Date." });
    }

    const advertisingChannelType = "PERFORMANCE_MAX";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    const validSearchThemes = Array.isArray(searchThemes)
      ? searchThemes.filter((t: any) => typeof t === "string" && t.trim()).map((t: string) => t.trim())
      : [];

    let structuredAudienceSignal: any = undefined;
    if (audienceSignal) {
      const cidClean = customerId.replace(/-/g, "").trim();

      if (typeof audienceSignal === "object" && audienceSignal !== null) {
        const typeUpper = (audienceSignal.type || "").trim().toUpperCase();
        if (typeUpper !== "AUDIENCE") {
          return res.status(400).json({
            error: `AUDIENCE signal must reference a valid Google Ads Audience resource belonging to customer ${cidClean}. Unsupported type: "${audienceSignal.type}".`
          });
        }
        if (!audienceSignal.resourceName || !audienceSignal.resourceName.trim()) {
          return res.status(400).json({ error: "Audience Signal resourceName is required." });
        }
        const resName = audienceSignal.resourceName.trim();
        if (!resName.startsWith(`customers/${cidClean}/audiences/`)) {
          return res.status(400).json({
            error: `AUDIENCE signal must reference a valid Google Ads Audience resource belonging to customer ${cidClean}. Provided: "${resName}".`
          });
        }
        structuredAudienceSignal = {
          resourceName: resName,
          name: (audienceSignal.name || "").trim() || "Audience Signal",
          type: "AUDIENCE"
        };
      } else if (typeof audienceSignal === "string" && audienceSignal.trim()) {
        const str = audienceSignal.trim();
        if (str.startsWith(`customers/${cidClean}/audiences/`)) {
          structuredAudienceSignal = {
            resourceName: str,
            name: "Audience Signal",
            type: "AUDIENCE"
          };
        } else {
          return res.status(400).json({
            error: `AUDIENCE signal must reference a valid Google Ads Audience resource belonging to customer ${cidClean}. Provided: "${str}".`
          });
        }
      } else {
        return res.status(400).json({
          error: `AUDIENCE signal must reference a valid Google Ads Audience resource belonging to customer ${cidClean}.`
        });
      }
    }

    // Validate Ad Schedule
    let normalizedSchedule: Array<{ day: string; start: string; end: string }> | undefined = undefined;
    if (adSchedule !== undefined && adSchedule !== null) {
      if (!Array.isArray(adSchedule)) {
        return res.status(400).json({ error: "adSchedule must be an array of schedule items." });
      }
      try {
        const normList = GoogleAdsService.normalizeAdSchedules(adSchedule);
        normalizedSchedule = normList.map(n => ({
          day: n.day,
          start: `${String(n.startHour).padStart(2, "0")}:${n.startMinute === "ZERO" ? "00" : n.startMinute === "FIFTEEN" ? "15" : n.startMinute === "THIRTY" ? "30" : "45"}`,
          end: n.endHour === 24 ? "24:00" : `${String(n.endHour).padStart(2, "0")}:${n.endMinute === "ZERO" ? "00" : n.endMinute === "FIFTEEN" ? "15" : n.endMinute === "THIRTY" ? "30" : "45"}`
        }));
      } catch (err: any) {
        return res.status(400).json({ error: err.message });
      }
    }

    const apiResult = await GoogleAdsService.createNoGuidancePMaxCampaign(orgId, customerId, {
      campaignName,
      assetGroupName: assetGroupName || `${campaignName} Asset Group 1`,
      finalUrl,
      businessName: businessName.trim(),
      amountMicros,
      biddingFocus,
      targetCpaMicros,
      targetRoas: targetRoas ? Number(targetRoas) : undefined,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      headlines: validHeadlines,
      longHeadlines: validLongHeadlines,
      descriptions: validDescriptions,
      images,
      logos,
      searchThemes: validSearchThemes,
      audienceSignal: structuredAudienceSignal,
      locations,
      languages,
      adSchedule: adSchedule && Array.isArray(adSchedule) ? adSchedule : undefined,
      euPolitical,
      trackingTemplate,
      finalUrlSuffix,
      customParameters,
      urlExpansionOptOut: enableFinalUrlExpansion === false ? true : false,
      path1: displayPath1,
      path2: displayPath2,
      sitelinks,
      callouts,
      callAsset,
      structuredSnippets,
      promotions,
      prices,
      finalMobileUrls,
      assetGroupTrackingTemplate,
      assetGroupCustomParameters,
      positiveGeoTargetType: locationTargetingType === "PRESENCE" ? "PRESENCE" : "PRESENCE_OR_INTEREST",
      brandGuidelinesEnabled: brandGuidelinesEnabled === true ? true : false
    });

    const persistedAudienceSignal = structuredAudienceSignal ? {
      name: structuredAudienceSignal.name,
      resourceName: structuredAudienceSignal.resourceName,
      type: "AUDIENCE"
    } : null;

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `pmax-${Date.now()}`,
        name: campaignName,
        campaignType: "PERFORMANCE_MAX",
        biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        startDate: parsedStart,
        endDate: parsedEnd,
        status: "PAUSED",
        finalUrl,
        headlines,
        descriptions,
        geoTargets: {
          locations: locations || ["India"],
          languages: languages || ["English"],
          searchThemes: validSearchThemes,
          audienceSignal: persistedAudienceSignal,
          adSchedule: normalizedSchedule || null,
          euPolitical: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
          trackingTemplate: trackingTemplate || null,
          finalUrlSuffix: finalUrlSuffix || null,
          customParameters: customParameters || null,
          displayPath1: displayPath1 || null,
          displayPath2: displayPath2 || null,
          urlExpansionOptOut: enableFinalUrlExpansion === false ? true : false,
          sitelinks: sitelinks || null,
          callouts: callouts || null,
          callAsset: callAsset || null,
          structuredSnippets: structuredSnippets || null,
          promotions: promotions || null,
          prices: prices || null,
          finalMobileUrls: finalMobileUrls || null,
          assetGroupTrackingTemplate: assetGroupTrackingTemplate || null,
          assetGroupCustomParameters: assetGroupCustomParameters || null,
          leadForm: leadForm || null,
          locationTargetingType: locationTargetingType || "PRESENCE_INTEREST",
          positiveGeoTargetType: locationTargetingType === "PRESENCE" ? "PRESENCE" : "PRESENCE_OR_INTEREST",
          brandGuidelinesEnabled: brandGuidelinesEnabled === true ? true : false,
          brandColors: brandColors || null,
          brandExclusions: brandExclusions || null,
          urlRulesList: urlRulesList || null,
          assetOptimizations: assetOptimizations || null,
          youtubeVideos: youtubeVideos || null,
          messagingRestrictions: messagingRestrictions || null,
          ga4Property: ga4Property || null,
          messageAsset: messageAsset || null,
          pageFeeds: pageFeeds || null,
          merchantCenter: merchantCenter || null,
          storeLocations: storeLocations || null,
          dynamicAdsFeed: dynamicAdsFeed || null,
          valueRules: valueRules || null,
          thirdPartyMeasurement: thirdPartyMeasurement || null,
          audienceExclusions: audienceExclusions || null,
          ytUserSegment: ytUserSegment || null,
          assetSchedules: assetSchedules || null,
          targetRoas: targetRoas || null,
          promoTerms: promoTerms || null,
          leadFormWebhook: leadFormWebhook || null
        },
        languages: languages || ["English"],
        searchThemes: validSearchThemes,
        audienceSignal: persistedAudienceSignal,
        adSchedule: (normalizedSchedule || null) as any,
        advertisingChannelType: "PERFORMANCE_MAX",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: assetGroupName || `${campaignName} Asset Group 1`,
        adGroupType: "PERFORMANCE_MAX",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines,
        descriptions,
        finalUrls: [finalUrl],
        status: "ENABLED"
      }
    });

    const serializedCampaign = {
      ...localCampaign,
      languages: languages || ["English"],
      searchThemes: validSearchThemes,
      audienceSignal: persistedAudienceSignal,
      adSchedule: normalizedSchedule || null,
      amountMicros: Number(localCampaign.amountMicros),
      costMicros: Number(localCampaign.costMicros),
      impressions: Number(localCampaign.impressions),
      clicks: Number(localCampaign.clicks)
    };

    res.status(201).json({
      message: "Performance Max Campaign created successfully (Paused)",
      campaign: serializedCampaign,
      resourceNames: apiResult,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        bidding_focus: biddingFocus,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("Performance Max creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-noguidance-search-campaign
router.post("/campaigns/create-noguidance-search-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "Search-8",
      websiteVisitsUrl = "https://www.example.com",
      phoneCallCountry = "+91",
      phoneCallNumber = "",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      targetRoas = 200,
      maxCpcLimit = 15,
      impressionShareLocation = "ANYWHERE",
      impressionSharePercent = 50,
      onlyNewCustomers = false,
      searchPartners = true,
      displayNetwork = true,
      locations = ["India"],
      languages = ["English"],
      euPolitical = "NO",
      aiMaxEnabled = true,
      finalUrlExpansion = true,
      keywords = [],
      adGroupName = "Ad Group 1",
      displayPath1 = "",
      displayPath2 = "",
      headlines = [],
      descriptions = [],
      budgetType = "DAILY",
      dailyBudget = 1000
    } = req.body;

    const finalUrl = websiteVisitsUrl || "https://www.example.com";
    if (!headlines || headlines.length === 0 || !headlines[0]) {
      return res.status(400).json({ error: "At least 1 headline is required." });
    }

    const advertisingChannelType = "SEARCH";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    let apiResult: any = { campaignId: `search-noguidance-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createNoGuidanceSearchCampaign) {
        apiResult = await GoogleAdsService.createNoGuidanceSearchCampaign(orgId, customerId, {
          campaignName,
          finalUrl,
          amountMicros,
          biddingFocus,
          targetCpaMicros,
          headlines,
          descriptions,
          keywords
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for No Guidance Search Campaign]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `search-${Date.now()}`,
        name: campaignName,
        campaignType: "SEARCH",
        biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl,
        headlines,
        descriptions,
        geoTargets: locations,
        advertisingChannelType: "SEARCH",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: adGroupName || `${campaignName} - Ad Group 1`,
        adGroupType: "SEARCH_STANDARD",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines,
        descriptions,
        finalUrls: [finalUrl],
        path1: displayPath1,
        path2: displayPath2,
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "Search Campaign created successfully without guidance (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        bidding_focus: biddingFocus,
        ai_max_enabled: aiMaxEnabled,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("No Guidance Search campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-noguidance-demandgen-campaign
router.post("/campaigns/create-noguidance-demandgen-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = `Demand Gen - ${new Date().toISOString().split("T")[0]} #2`,
      campaignGoal = "Conversions",
      includeViewThroughConversions = false,
      targetCpaCpc = 25,
      budgetType = "DAILY",
      dailyBudget = 1000,
      onlyNewCustomers = false,
      mainColor = "#3B82F6",
      accentColor = "#10B981",
      fontFamily = "Inter",
      euPolitical = "NO",
      adGroupName = "Ad group 1",
      headlines = [],
      descriptions = [],
      businessName = "Hubmate Inc.",
      finalUrl = "https://www.example.com",
      images = []
    } = req.body;

    if (!finalUrl) {
      return res.status(400).json({ error: "Final URL is required." });
    }
    if (!headlines || headlines.length === 0 || !headlines[0]) {
      return res.status(400).json({ error: "At least 1 headline is required." });
    }

    const advertisingChannelType = "DEMAND_GEN";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpaCpc ? Math.round(Number(targetCpaCpc) * 1_000_000) : undefined;

    let apiResult: any = { campaignId: `demandgen-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createNoGuidanceDemandGenCampaign) {
        apiResult = await GoogleAdsService.createNoGuidanceDemandGenCampaign(orgId, customerId, {
          campaignName,
          finalUrl,
          amountMicros,
          campaignGoal,
          targetCpaMicros,
          headlines,
          descriptions,
          images
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for No Guidance Demand Gen Campaign]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `demandgen-${Date.now()}`,
        name: campaignName,
        campaignType: "DEMAND_GEN",
        biddingStrategy: campaignGoal === "Clicks" ? "MAXIMIZE_CLICKS" : "MAXIMIZE_CONVERSIONS",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl,
        headlines,
        descriptions,
        geoTargets: ["India"],
        advertisingChannelType: "DEMAND_GEN",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: adGroupName || `${campaignName} - Ad Group 1`,
        adGroupType: "DEMAND_GEN_STANDARD",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines,
        descriptions,
        finalUrls: [finalUrl],
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "Demand Gen Campaign created successfully without guidance (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        campaign_goal: campaignGoal,
        brand_colors: { mainColor, accentColor },
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("No Guidance Demand Gen campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-noguidance-display-campaign
router.post("/campaigns/create-noguidance-display-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "Display-4",
      finalUrl = "https://www.example.com",
      locations = ["India"],
      languages = ["English"],
      euPolitical = "NO",
      budgetType = "DAILY",
      dailyBudget = 1000,
      biddingFocus = "Conversions",
      useTargetCpa = false,
      targetCpa = 25,
      targetRoas = 200,
      viewableCpm = 50,
      targeting = {},
      adGroupName = "Ad group 1",
      businessName = "Hubmate Inc.",
      headlines = [],
      longHeadline = "",
      descriptions = [],
      images = [],
      logos = []
    } = req.body;

    if (!finalUrl) {
      return res.status(400).json({ error: "Final URL is required." });
    }
    if (!headlines || headlines.length === 0 || !headlines[0]) {
      return res.status(400).json({ error: "At least 1 headline is required." });
    }

    const advertisingChannelType = "DISPLAY";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    let apiResult: any = { campaignId: `display-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createNoGuidanceDisplayCampaign) {
        apiResult = await GoogleAdsService.createNoGuidanceDisplayCampaign(orgId, customerId, {
          campaignName,
          finalUrl,
          amountMicros,
          biddingFocus,
          targetCpaMicros,
          headlines,
          longHeadline,
          descriptions,
          images
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for No Guidance Display Campaign]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `display-${Date.now()}`,
        name: campaignName,
        campaignType: "DISPLAY",
        biddingStrategy: biddingFocus === "Viewable impressions" ? "TARGET_CPM" : "MAXIMIZE_CONVERSIONS",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl,
        headlines,
        descriptions,
        geoTargets: locations,
        advertisingChannelType: "DISPLAY",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: adGroupName || `${campaignName} - Ad Group 1`,
        adGroupType: "DISPLAY_STANDARD",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines,
        descriptions,
        finalUrls: [finalUrl],
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "Display Campaign created successfully without guidance (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        bidding_focus: biddingFocus,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("No Guidance Display campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-noguidance-video-campaign
router.post("/campaigns/create-noguidance-video-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "Video-1",
      campaignSubtype = "Video views",
      networks = ["YouTube videos"],
      locations = ["India"],
      languages = ["English"],
      euPolitical = "NO",
      budgetType = "DAILY",
      dailyBudget = 1000,
      biddingFocus = "Maximum CPV",
      targetCpv = 2.50,
      targetCpa = 25,
      targetCpm = 100,
      adGroupName = "Ad group 1",
      adFormat = "SKIPPABLE_IN_STREAM",
      videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      finalUrl = "https://www.example.com",
      headline = "Watch Full Product Demo",
      description = "Discover how smart video automation drives high-intent brand views",
      callToAction = "Learn More"
    } = req.body;

    if (!videoUrl) {
      return res.status(400).json({ error: "YouTube Video URL is required." });
    }

    const advertisingChannelType = "VIDEO";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const cpvMicros = Math.round(Number(targetCpv || 2.50) * 1_000_000);

    let apiResult: any = { campaignId: `video-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createNoGuidanceVideoCampaign) {
        apiResult = await GoogleAdsService.createNoGuidanceVideoCampaign(orgId, customerId, {
          campaignName,
          campaignSubtype,
          videoUrl,
          finalUrl,
          amountMicros,
          biddingFocus,
          cpvMicros,
          headline,
          description
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for No Guidance Video Campaign]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `video-${Date.now()}`,
        name: campaignName,
        campaignType: "VIDEO",
        biddingStrategy: biddingFocus === "Maximum CPV" ? "MANUAL_CPV" : "MAXIMIZE_CONVERSIONS",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl,
        headlines: headline ? [headline] : [],
        descriptions: description ? [description] : [],
        geoTargets: locations,
        advertisingChannelType: "VIDEO",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: adGroupName || `${campaignName} - Ad Group 1`,
        adGroupType: "VIDEO_STANDARD",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines: headline ? [headline] : [],
        descriptions: description ? [description] : [],
        finalUrls: [finalUrl],
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "Video Campaign created successfully without guidance (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        campaign_subtype: campaignSubtype,
        bidding_focus: biddingFocus,
        video_url: videoUrl,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("No Guidance Video campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-noguidance-app-campaign
router.post("/campaigns/create-noguidance-app-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "App-1",
      campaignSubtype = "App installs",
      appPlatform = "ANDROID",
      appName = "Hubmate - Smart Business Suite",
      appId = "com.hubmate.app",
      locations = ["India"],
      languages = ["English"],
      euPolitical = "NO",
      budgetType = "DAILY",
      dailyBudget = 1000,
      biddingFocus = "Target cost per install",
      targetCpi = 25,
      targetCpa = 50,
      targetRoas = 200,
      assetGroupName = "Asset group 1",
      headlines = [],
      descriptions = [],
      images = []
    } = req.body;

    if (!appId) {
      return res.status(400).json({ error: "App Package Name or Bundle ID is required." });
    }

    const advertisingChannelType = "MULTI_CHANNEL";
    const advertisingChannelSubType = "APP_CAMPAIGN";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const cpiMicros = Math.round(Number(targetCpi || 25) * 1_000_000);

    let apiResult: any = { campaignId: `app-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createNoGuidanceAppCampaign) {
        apiResult = await GoogleAdsService.createNoGuidanceAppCampaign(orgId, customerId, {
          campaignName,
          campaignSubtype,
          appPlatform,
          appId,
          amountMicros,
          biddingFocus,
          cpiMicros,
          headlines,
          descriptions
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for No Guidance App Campaign]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `app-${Date.now()}`,
        name: campaignName,
        campaignType: "APP",
        biddingStrategy: biddingFocus === "Target cost per install" ? "TARGET_CPI" : "TARGET_CPA",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl: `https://play.google.com/store/apps/details?id=${appId}`,
        headlines,
        descriptions,
        geoTargets: locations,
        advertisingChannelType: "MULTI_CHANNEL",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: assetGroupName || `${campaignName} - Asset Group 1`,
        adGroupType: "APP_STANDARD",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines,
        descriptions,
        finalUrls: [`https://play.google.com/store/apps/details?id=${appId}`],
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "App Campaign created successfully without guidance (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        advertising_channel_sub_type: advertisingChannelSubType,
        app_platform: appPlatform,
        app_id: appId,
        bidding_focus: biddingFocus,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("No Guidance App campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// POST /api/ads/campaigns/create-noguidance-shopping-campaign
router.post("/campaigns/create-noguidance-shopping-campaign", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const {
      customerId = "1234567890",
      campaignName = "Shopping-1",
      merchantCenterId = "987654321",
      salesCountry = "India",
      inventoryFilter = "ALL",
      locations = ["India"],
      languages = ["English"],
      euPolitical = "NO",
      campaignPriority = "MEDIUM",
      budgetType = "DAILY",
      dailyBudget = 1000,
      biddingFocus = "Maximize clicks",
      maxCpc = 15,
      targetRoas = 200,
      productGroups = ["All products"],
      adGroupName = "Ad group 1"
    } = req.body;

    if (!merchantCenterId) {
      return res.status(400).json({ error: "Merchant Center account ID is required." });
    }

    const advertisingChannelType = "SHOPPING";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);

    let apiResult: any = { campaignId: `shopping-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      if (GoogleAdsService.createNoGuidanceShoppingCampaign) {
        apiResult = await GoogleAdsService.createNoGuidanceShoppingCampaign(orgId, customerId, {
          campaignName,
          merchantCenterId,
          salesCountry,
          amountMicros,
          biddingFocus,
          targetRoas,
          maxCpc
        });
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for No Guidance Shopping Campaign]:", apiErr.message);
    }

    const localCampaign = await prisma.googleAdCampaign.create({
      data: {
        organizationId: orgId,
        customerId,
        googleAdsCampaignId: apiResult.campaignId || `shopping-${Date.now()}`,
        name: campaignName,
        campaignType: "SHOPPING",
        biddingStrategy: biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CLICKS",
        budget: Number(dailyBudget),
        budgetResourceName: apiResult.budgetResourceName || null,
        status: "PAUSED",
        finalUrl: "https://www.example.com/shopping",
        headlines: ["Shop Latest Inventory"],
        descriptions: ["Best price guaranteed on all products"],
        geoTargets: locations,
        advertisingChannelType: "SHOPPING",
        amountMicros: BigInt(amountMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0)
      } as any
    });

    const adGroup = await prisma.googleAdGroup.create({
      data: {
        organizationId: orgId,
        customerId,
        campaignId: localCampaign.id,
        googleCampaignId: localCampaign.googleAdsCampaignId,
        name: adGroupName || `${campaignName} - Ad Group 1`,
        adGroupType: "SHOPPING_PRODUCT_ADS",
        status: "ENABLED"
      }
    });

    await prisma.googleAd.create({
      data: {
        organizationId: orgId,
        customerId,
        adGroupId: adGroup.id,
        googleAdGroupId: adGroup.googleAdGroupId,
        headlines: ["Shop Online Now"],
        descriptions: ["Explore featured items"],
        finalUrls: ["https://www.example.com/shopping"],
        status: "ENABLED"
      }
    });

    res.status(201).json({
      message: "Shopping Campaign created successfully without guidance (Paused)",
      campaign: localCampaign,
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        merchant_center_id: merchantCenterId,
        sales_country: salesCountry,
        bidding_focus: biddingFocus,
        "CampaignBudget.amount_micros": amountMicros
      }
    });
  } catch (error: any) {
    console.error("No Guidance Shopping campaign creation error:", error?.response?.data || error.message);
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

// PUT /api/ads/campaigns/:id — update campaign









router.put("/campaigns/:id", async (req, res) => {
  try {
    const orgId = getOrgId(req);
    const { customerId, name, status, endDate } = req.body;
    const campaign = await prisma.googleAdCampaign.findFirst({ where: { id: req.params.id, organizationId: orgId } });
    if (!campaign) return res.status(404).json({ error: "Campaign not found" });

    const cid = customerId || campaign.customerId;
    if (campaign.googleAdsCampaignId) {
      const resourceName = `customers/${cid}/campaigns/${campaign.googleAdsCampaignId}`;
      await GoogleAdsService.updateCampaign(orgId, cid, resourceName, { name, status, endDate });
    }

    const updated = await prisma.googleAdCampaign.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(status && { status }), ...(endDate && { endDate: new Date(endDate) }) }
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
    const customerId = getCustomerId(req);
    const query = req.query.q as string;
    if (!customerId || !query) return res.status(400).json({ error: "customerId and q required" });
    const results = await GoogleAdsService.searchGeoTargets(orgId, customerId, query);
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
    const overview = await GoogleAdsService.getAccountOverview(orgId, customerId, dateRange);
    res.status(200).json(overview);
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

    const response = await axios.post(
      GROQ_API_URL,
      {
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.65,
        max_tokens: 1500
      },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` } }
    );

    const raw = response.data?.choices?.[0]?.message?.content || "{}";
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

    const response = await axios.post(
      GROQ_API_URL,
      { model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.5, max_tokens: 800 },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` } }
    );

    const raw = response.data?.choices?.[0]?.message?.content || "[]";
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
    const { businessName, finalUrl, type = "HEADLINES" } = req.body;
    const targetUrl = finalUrl && finalUrl.trim() ? finalUrl.trim() : "https://japatracker-7f759.web.app/";
    
    // Extract domain keyword (e.g., japatracker, portfolio, store, etc.)
    let domainName = "My Product";
    try {
      const parsed = new URL(targetUrl.startsWith("http") ? targetUrl : `https://${targetUrl}`);
      domainName = parsed.hostname.replace("www.", "").split(".")[0] || "Business";
      domainName = domainName.charAt(0).toUpperCase() + domainName.slice(1);
    } catch (e) {
      domainName = "Business";
    }

    // Try AI generation with GROQ LLM
    let copyData: any = {};
    const apiKey = process.env.GROQ_KEY || GROQ_KEY;

    if (apiKey) {
      try {
        const prompt = `You are a Google Ads copywriter. Generate unique, high-converting ad copy for website: ${targetUrl} (Domain: ${domainName}).
Return ONLY a JSON object:
{
  "headlines": ["Unique Headline 1", "Unique Headline 2", "Unique Headline 3", "Unique Headline 4", "Unique Headline 5"],
  "longHeadlines": ["Long Headline 1", "Long Headline 2", "Long Headline 3", "Long Headline 4", "Long Headline 5"],
  "descriptions": ["Description 1", "Description 2", "Description 3", "Description 4", "Description 5"]
}`;

        const response = await axios.post(
          GROQ_API_URL,
          {
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: 800
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`
            },
            timeout: 5000
          }
        );

        const raw = response.data?.choices?.[0]?.message?.content || "{}";
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

    const response = await axios.post(
      GROQ_API_URL,
      { model: "llama-3.3-70b-versatile", messages: [{ role: "user", content: prompt }], temperature: 0.4, max_tokens: 1200 },
      { headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_KEY}` } }
    );

    const raw = response.data?.choices?.[0]?.message?.content || "{}";
    const cleaned = raw.replace(/```json\n?/gi, "").replace(/```\n?/gi, "").trim();
    const analysis = JSON.parse(cleaned);

    res.status(200).json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: "Campaign analysis failed." });
  }
});

export default router;
