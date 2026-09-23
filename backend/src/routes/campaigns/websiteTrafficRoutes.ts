import { Router } from "express";
import { WebsiteTrafficPerformanceMaxService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficPerformanceMaxService";
import { WebsiteTrafficSearchService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficSearchService";
import { WebsiteTrafficDemandGenService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficDemandGenService";
import { WebsiteTrafficVideoService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficVideoService";
import { WebsiteTrafficDisplayService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficDisplayService";
import { WebsiteTrafficShoppingService } from "../../services/googleAds/websiteTraffic/WebsiteTrafficShoppingService";

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
    const result = await WebsiteTrafficPerformanceMaxService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("[Website Traffic PMax] Google Ads API Error:", JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({ error: JSON.stringify(error.response.data, null, 2) });
    }
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/search", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await WebsiteTrafficSearchService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("[Website Traffic Search] Google Ads API Error:", JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({ error: JSON.stringify(error.response.data, null, 2) });
    }
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/demand-gen", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await WebsiteTrafficDemandGenService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/video", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await WebsiteTrafficVideoService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/display", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await WebsiteTrafficDisplayService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/shopping", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await WebsiteTrafficShoppingService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

export default router;
