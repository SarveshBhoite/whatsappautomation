import { Router } from "express";
import { LeadsPerformanceMaxService } from "../../services/googleAds/leads/LeadsPerformanceMaxService";
import { LeadsSearchService } from "../../services/googleAds/leads/LeadsSearchService";
import { LeadsDemandGenService } from "../../services/googleAds/leads/LeadsDemandGenService";
import { LeadsVideoService } from "../../services/googleAds/leads/LeadsVideoService";
import { LeadsDisplayService } from "../../services/googleAds/leads/LeadsDisplayService";
import { LeadsShoppingService } from "../../services/googleAds/leads/LeadsShoppingService";

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
    const result = await LeadsPerformanceMaxService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    const errorDetails = error?.response?.data || error.message;
    console.error("Route error:", JSON.stringify(errorDetails, null, 2));

    let detailedMessage = error?.response?.data?.error?.message || error.message;
    
    // Google Ads API typically nests details under error.details or within an array
    const detailsObj = error?.response?.data?.[0]?.error?.details 
                    || error?.response?.data?.error?.details 
                    || error?.response?.data?.details;
                    
    if (detailsObj) {
      detailedMessage += "\n\nAPI Details:\n" + JSON.stringify(detailsObj, null, 2);
    }

    res.status(error?.response?.status || 500).json({
      error: detailedMessage,
      details: errorDetails
    });
  }
});

router.post("/search", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await LeadsSearchService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("[Leads Search] Google Ads API Error:", JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({ error: JSON.stringify(error.response.data, null, 2) });
    }
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/demand-gen", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await LeadsDemandGenService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/video", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await LeadsVideoService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/display", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await LeadsDisplayService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/shopping", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await LeadsShoppingService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

export default router;
