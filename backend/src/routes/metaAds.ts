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
      objective = "MESSAGES",
      dailyBudget = 10,
      adSetName,
      destinationType = "WHATSAPP",
      targeting = {},
      adName,
      creativeHeadline,
      creativeBody,
      creativeMediaUrl,
      whatsappNumber,
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
      dailyBudget: Number(dailyBudget),
      adSetName: adSetName || `${name} - Ad Set`,
      destinationType,
      targeting,
      adName: adName || `${name} - Ad`,
      creativeHeadline,
      creativeBody,
      creativeMediaUrl,
      whatsappNumber,
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
 * POST /api/meta-ads/sync
 * Live sync with Meta Graph API
 */
router.post("/sync", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const syncResult = await MetaAdsService.syncCampaigns(orgId);
    res.json({ success: true, result: syncResult });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error syncing with Meta Graph API:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/approvals
 * Live approval status and policy review inspection
 */
router.get("/approvals", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const summary = await MetaAdsService.getApprovalStatus(orgId);
    res.json({ success: true, summary });
  } catch (error: any) {
    console.error("[MetaAdsRouter] Error fetching approval status:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
