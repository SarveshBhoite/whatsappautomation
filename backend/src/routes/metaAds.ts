import { Router, Request, Response } from "express";
import { MetaAdsService } from "../services/metaAdsService";
import metaAdsSubRouter from "./meta-ads";

const router = Router();
const DEFAULT_ORG_ID = "";

// Mount modular campaign routes (/campaigns/traffic, /campaigns/awareness, etc.)
router.use(metaAdsSubRouter);

/**
 * GET /api/meta-ads/config
 * Retrieve saved Meta Ads configuration
 */
router.get("/config", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || (req.headers["x-organization-id"] as string) || "";
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
    const scopes = "ads_management,ads_read,business_management,pages_read_engagement,pages_show_list,instagram_basic,whatsapp_business_management";
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
 * GET /api/meta-ads/pages
 * Auto-detect Facebook Pages connected to account
 */
router.get("/pages", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const pages = await MetaAdsService.getPages(orgId);
    res.json({ success: true, pages });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching pages:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/pixels
 * Auto-detect Meta Pixels linked to Ad Account
 */
router.get("/pixels", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const pixels = await MetaAdsService.getPixels(orgId);
    res.json({ success: true, pixels });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching pixels:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/instagram-accounts
 * Fetch Instagram Business Accounts connected to Pages
 */
router.get("/instagram-accounts", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const instagramAccounts = await MetaAdsService.getInstagramAccounts(orgId);
    res.json({ success: true, instagramAccounts });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching Instagram accounts:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/whatsapp-numbers
 * Fetch WhatsApp phone numbers connected to Facebook Pages
 */
router.get("/whatsapp-numbers", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const whatsappNumbers = await MetaAdsService.getWhatsAppNumbers(orgId);
    res.json({ success: true, whatsappNumbers });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching WhatsApp numbers:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/applications
 * Fetch registered Apps connected to Ad Account / Business
 */
router.get("/applications", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const applications = await MetaAdsService.getApplications(orgId);
    res.json({ success: true, applications });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching applications:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/lead-forms
 * Fetch Lead Gen Instant Forms from connected Facebook Page
 */
router.get("/lead-forms", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const pageId = req.query.pageId as string | undefined;
    const forms = await MetaAdsService.getLeadForms(orgId, pageId);
    res.json({ success: true, forms });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching lead forms:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/lead-forms
 * Create a new Instant Lead Form on Facebook Page
 */
router.post("/lead-forms", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { pageId, ...formData } = req.body;
    if (!pageId) {
      return res.status(400).json({ success: false, error: "Facebook pageId is required to create a Lead Form." });
    }
    const result = await MetaAdsService.createLeadForm(orgId, pageId, formData);
    res.json({ success: true, form: result });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error creating lead form:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/lead-forms/:id/leads
 * Pull submitted leads from an Instant Form
 */
router.get("/lead-forms/:id/leads", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const formId = req.params.id as string;
    const leads = await MetaAdsService.getFormLeads(orgId, formId);
    res.json({ success: true, leads });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching form leads:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/search/targeting
 * Search live Meta Graph API targeting specs (interests, behaviors, job titles, demographics)
 */
router.get("/search/targeting", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = (req.query.q as string) || "";
    const type = (req.query.type as string) || "adinterest";
    const results = await MetaAdsService.searchTargeting(orgId, q, type);
    res.json({ success: true, results });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error searching targeting:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/search/locations
 * Search live Meta Graph API geo locations (countries, regions, cities, zips)
 */
router.get("/search/locations", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = (req.query.q as string) || "";
    const locationTypes = (req.query.locationTypes as string) || "country,region,city,zip";
    const results = await MetaAdsService.searchLocations(orgId, q, locationTypes);
    res.json({ success: true, results });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error searching locations:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/search/languages
 * Search live Meta Graph API languages / ad locales
 */
router.get("/search/languages", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const q = (req.query.q as string) || "";
    const results = await MetaAdsService.searchLanguages(orgId, q);
    res.json({ success: true, results });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error searching languages:", error.message);
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
      objectStoreUrl: req.body.objectStoreUrl,
      appStore: req.body.appStore,
      leadGenFormId: req.body.leadGenFormId || req.body.lead_gen_form_id,
      customEventType: req.body.customEventType || "LEAD",
    });

    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error creating campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/campaigns/leads
 * Specialized endpoint to Create & Publish OUTCOME_LEADS campaign
 */
router.post("/campaigns/leads", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const campaign = await MetaAdsService.createCampaign(orgId, {
      ...req.body,
      objective: "OUTCOME_LEADS",
    });
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error creating leads campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/campaigns/awareness
 * Specialized endpoint to Create & Publish OUTCOME_AWARENESS campaign
 */
router.post("/campaigns/awareness", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const campaign = await MetaAdsService.createCampaign(orgId, {
      ...req.body,
      objective: "OUTCOME_AWARENESS",
    });
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error creating awareness campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/campaigns/app-promotion
 * Specialized endpoint to Create & Publish OUTCOME_APP_PROMOTION campaign
 */
router.post("/campaigns/app-promotion", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const campaign = await MetaAdsService.createCampaign(orgId, {
      ...req.body,
      objective: "OUTCOME_APP_PROMOTION",
    });
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error creating app promotion campaign:", error.message);
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

/**
 * POST /api/meta-ads/sync
 * Sync Live Campaigns & Ads from Meta Graph API
 */
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const orgId = req.body?.organizationId || DEFAULT_ORG_ID;
    const adAccountId = req.body?.adAccountId;
    const result = await MetaAdsService.syncCampaigns(orgId, adAccountId);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error syncing campaigns:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
