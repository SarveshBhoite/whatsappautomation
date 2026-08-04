import { Router, Request, Response } from "express";
import { MetaAdsService } from "../services/metaAdsService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * GET /api/meta-ads/config
 * Retrieve saved Meta Ads configuration
 */
router.get("/config", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const config = await MetaAdsService.getConfig(orgId);
    res.json({ success: true, config });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching config:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/oauth/connect
 * Redirect to Facebook Login for Business OAuth dialog
 */
router.get("/oauth/connect", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.orgId as string) || DEFAULT_ORG_ID;
    const redirect = (req.query.redirect as string) || "/ads";
    const appId = process.env.META_APP_ID || "36702477879366478";
    const redirectUri = process.env.META_REDIRECT_URI || "https://crmapi.jisnudigital.com/api/meta/callback";
    const scopes = "ads_management,ads_read,business_management,pages_read_engagement,pages_show_list";
    const statePayload = Buffer.from(JSON.stringify({ orgId, redirect })).toString("base64");

    const authUrl = `https://www.facebook.com/v26.0/dialog/oauth?client_id=${encodeURIComponent(appId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${encodeURIComponent(statePayload)}`;
    
    res.redirect(authUrl);
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error generating OAuth connect URL:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta/callback & /api/meta-ads/callback
 * Handle Meta OAuth Callback
 */
router.get(["/callback", "/meta/callback"], async (req: Request, res: Response) => {
  try {
    const code = req.query.code as string;
    const stateStr = req.query.state as string;
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    let orgId = DEFAULT_ORG_ID;
    let redirectPath = "/ads";
    if (stateStr) {
      try {
        const decoded = JSON.parse(Buffer.from(stateStr, "base64").toString("utf-8"));
        if (decoded.orgId) orgId = decoded.orgId;
        if (decoded.redirect) redirectPath = decoded.redirect;
      } catch (e) {}
    }

    if (code) {
      const appId = process.env.META_APP_ID || "36702477879366478";
      const appSecret = process.env.META_APP_SECRET || "";
      const redirectUri = process.env.META_REDIRECT_URI || "https://crmapi.jisnudigital.com/api/meta/callback";

      if (appSecret) {
        const tokenRes = await fetch(
          `https://graph.facebook.com/v26.0/oauth/access_token?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${appSecret}&code=${code}`
        );
        const tokenData = await tokenRes.json();
        if (tokenData.access_token) {
          await MetaAdsService.saveConfig(orgId, {
            appId,
            appSecret,
            accessToken: tokenData.access_token,
          });
        }
      }
    }

    res.redirect(`${frontendUrl}${redirectPath}?platform=meta&oauth=success`);
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error handling callback:", error.message);
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    res.redirect(`${frontendUrl}/ads?platform=meta&oauth=error`);
  }
});

/**
 * POST /api/meta-ads/config
 * Save or update Meta Ads configuration
 */
router.post("/config", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const config = await MetaAdsService.saveConfig(orgId, req.body);
    res.json({ success: true, config });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error saving config:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/connectivity-check
 * Run 5-Step Connectivity Diagnostic & Policy Standing Check
 */
router.get("/connectivity-check", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const diagnostic = await MetaAdsService.runConnectivityCheck(orgId);
    res.json({ success: true, diagnostic });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error running connectivity check:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/accounts
 * Get accessible Meta Ad Accounts
 */
router.get("/accounts", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const accounts = await MetaAdsService.getAdAccounts(orgId);
    res.json({ success: true, accounts });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching ad accounts:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/campaigns
 * Get Meta campaigns
 */
router.get("/campaigns", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const campaigns = await MetaAdsService.getCampaigns(orgId);
    res.json({ success: true, campaigns });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching campaigns:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/campaigns
 * Create Meta Campaign, Ad Set, and Ad
 */
router.post("/campaigns", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const {
      name,
      objective = "OUTCOME_LEADS",
      buyingType = "AUCTION",
      specialAdCategory = "NONE",
      cboEnabled = true,
      advantagePlus = false,
      bidStrategy = "LOWEST_COST_WITHOUT_CAP",
      dailyBudget = 500,
      lifetimeBudget,
      adSetName,
      destinationType = "WHATSAPP",
      optimizationGoal = "MESSAGES",
      targeting = {},
      advantagePlusAudience = true,
      placements = [],
      advantagePlusPlacement = true,
      deviceTypes = ["desktop", "mobile"],
      attributionWindow = "7d_click_1d_view",
      adName,
      adFormat = "SINGLE_IMAGE",
      creativeHeadline,
      creativeBody,
      creativeDescription,
      creativeMediaUrl,
      callToAction = "WHATSAPP_MESSAGE",
      whatsappNumber,
      utmParameters,
    } = req.body;

    if (!name || !creativeHeadline || !creativeBody) {
      return res.status(400).json({
        success: false,
        error: "Campaign name, Creative Headline, and Creative Body are required.",
      });
    }

    const campaign = await MetaAdsService.createCampaign(orgId, {
      name,
      objective,
      buyingType,
      specialAdCategory,
      cboEnabled,
      advantagePlus,
      bidStrategy,
      dailyBudget: Number(dailyBudget),
      lifetimeBudget: lifetimeBudget ? Number(lifetimeBudget) : undefined,
      adSetName: adSetName || `${name} - Ad Set`,
      destinationType,
      optimizationGoal,
      targeting,
      advantagePlusAudience,
      placements,
      advantagePlusPlacement,
      deviceTypes,
      attributionWindow,
      adName: adName || `${name} - Ad`,
      adFormat,
      creativeHeadline,
      creativeBody,
      creativeDescription,
      creativeMediaUrl,
      callToAction,
      whatsappNumber,
      utmParameters,
    });

    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error creating campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/campaigns/:id/status
 * Toggle Campaign Status (ACTIVE / PAUSED)
 */
router.post("/campaigns/:id/status", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const campaignId = req.params.id as string;
    const { status } = req.body;

    if (!status || !["ACTIVE", "PAUSED"].includes(status)) {
      return res.status(400).json({ success: false, error: "Status must be 'ACTIVE' or 'PAUSED'." });
    }

    const updated = await MetaAdsService.toggleCampaignStatus(orgId, campaignId, status);
    res.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error updating campaign status:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/campaigns/:id
 * Fetch single campaign details with ad sets and ads
 */
router.get("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const campaignId = req.params.id as string;
    const campaign = await MetaAdsService.getCampaignById(orgId, campaignId);
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/meta-ads/campaigns/:id
 * Update Meta Campaign parameters (Name, Budget, Status, Bid Strategy)
 */
router.put("/campaigns/:id", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const campaignId = req.params.id as string;
    const updated = await MetaAdsService.updateCampaign(orgId, campaignId, req.body);
    res.json({ success: true, campaign: updated });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error updating campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/meta-ads/ad-sets/:id
 * Update Meta Ad Set parameters (Targeting, Budget, Optimization Goal, Placements)
 */
router.put("/ad-sets/:id", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const adSetId = req.params.id as string;
    const updated = await MetaAdsService.updateAdSet(orgId, adSetId, req.body);
    res.json({ success: true, adSet: updated });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error updating ad set:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PUT /api/meta-ads/ads/:id
 * Update Meta Ad Creative parameters (Headline, Body, Image URL, CTA)
 */
router.put("/ads/:id", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const adId = req.params.id as string;
    const updated = await MetaAdsService.updateAd(orgId, adId, req.body);
    res.json({ success: true, ad: updated });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error updating ad creative:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/audiences
 * Get Custom & Lookalike Audiences
 */
router.get("/audiences", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const audiences = await MetaAdsService.getAudiences(orgId);
    res.json({ success: true, audiences });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching audiences:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/media
 * Fetch Live Ad Images and Ad Videos from Meta Graph API Library
 */
router.get("/media", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const media = await MetaAdsService.getMediaAssets(orgId);
    res.json({ success: true, media });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching media assets:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
