import { Router } from "express";
import { AppPromotionAppService } from "../../services/googleAds/appPromotion/AppPromotionAppService";

const router = Router();

const validatePayload = (req: any, res: any, next: any) => {
  const { customerId, campaignName } = req.body;
  if (!customerId || !campaignName) {
    return res.status(400).json({ error: "Missing required fields: customerId, campaignName" });
  }
  next();
};

router.post("/app", validatePayload, async (req, res) => {
  try {
    const { customerId, ...payload } = req.body;
    const orgId = (req.headers["x-organization-id"] || req.query.orgId || req.body.orgId) as string;
    if (!orgId || orgId.trim().length === 0 || orgId === "demo-org-123") {
      return res.status(400).json({ error: "A valid Organization ID is required (header 'x-organization-id' or body 'orgId'). Demo organization IDs are not allowed." });
    }
    const result = await AppPromotionAppService.createCampaign(orgId, customerId, payload);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error?.response?.data?.error?.message || error.message });
  }
});

export default router;

