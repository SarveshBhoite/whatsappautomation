import { Router } from "express";
import { StoreVisitsPerformanceMaxService } from "../../services/googleAds/storeVisits/StoreVisitsPerformanceMaxService";

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
    const result = await StoreVisitsPerformanceMaxService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    if (error?.response?.data) {
      console.error("[Store Visits PMax] Google Ads API Error:", JSON.stringify(error.response.data, null, 2));
      return res.status(400).json({ error: JSON.stringify(error.response.data, null, 2) });
    }
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

export default router;
