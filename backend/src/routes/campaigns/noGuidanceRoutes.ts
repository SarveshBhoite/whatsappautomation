import { Router } from "express";
import { NoGuidancePerformanceMaxService } from "../../services/googleAds/noGuidance/NoGuidancePerformanceMaxService";
import { NoGuidanceSearchService } from "../../services/googleAds/noGuidance/NoGuidanceSearchService";
import { NoGuidanceDemandGenService } from "../../services/googleAds/noGuidance/NoGuidanceDemandGenService";
import { NoGuidanceVideoService } from "../../services/googleAds/noGuidance/NoGuidanceVideoService";
import { NoGuidanceDisplayService } from "../../services/googleAds/noGuidance/NoGuidanceDisplayService";
import { NoGuidanceShoppingService } from "../../services/googleAds/noGuidance/NoGuidanceShoppingService";
import { NoGuidanceAppService } from "../../services/googleAds/noGuidance/NoGuidanceAppService";

const router = Router();

const validatePayload = (req: any, res: any, next: any) => {
  const { customerId, campaignName } = req.body;
  if (!customerId || !campaignName) {
    return res.status(400).json({ error: "Missing required fields: customerId, campaignName" });
  }
  next();
};

router.post("/performance-max", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await NoGuidancePerformanceMaxService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/search", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await NoGuidanceSearchService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("[No Guidance Search] Google Ads API Error:", JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({ error: JSON.stringify(error.response.data, null, 2) });
    }
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/demand-gen", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await NoGuidanceDemandGenService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/video", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await NoGuidanceVideoService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/display", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await NoGuidanceDisplayService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/shopping", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await NoGuidanceShoppingService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/app", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await NoGuidanceAppService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

export default router;
