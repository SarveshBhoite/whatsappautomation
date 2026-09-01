import { Router } from "express";
import { SalesPerformanceMaxService } from "../../services/googleAds/sales/SalesPerformanceMaxService";
import { SalesSearchService } from "../../services/googleAds/sales/SalesSearchService";
import { SalesDemandGenService } from "../../services/googleAds/sales/SalesDemandGenService";
import { SalesVideoService } from "../../services/googleAds/sales/SalesVideoService";
import { SalesDisplayService } from "../../services/googleAds/sales/SalesDisplayService";
import { SalesShoppingService } from "../../services/googleAds/sales/SalesShoppingService";

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
    const result = await SalesPerformanceMaxService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    const errorDetails = error?.response?.data || error.message;
    console.error("Route error:", JSON.stringify(errorDetails, null, 2));

    let detailedMessage = error?.response?.data?.error?.message || error.message;
    
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
    const result = await SalesSearchService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("[Sales Search] Google Ads API Error:", JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({ error: JSON.stringify(error.response.data, null, 2) });
    }
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/demand-gen", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await SalesDemandGenService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("[Sales Demand Gen] Google Ads API Error:", JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({ error: JSON.stringify(error.response.data, null, 2) });
    }
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/video", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await SalesVideoService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/display", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await SalesDisplayService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

router.post("/shopping", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId || "demo-org-123") as string;
    const result = await SalesShoppingService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

export default router;
