import { Router, Request, Response } from "express";
import { AppPromotionCampaignService } from "../../services/meta-ads/appPromotionCampaignService";

const router = Router();

/**
 * POST /api/meta-ads/campaigns/app-promotion
 * Create a dynamic App Promotion Campaign (OUTCOME_APP_PROMOTION)
 */
router.post("/campaigns/app-promotion", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || (req.headers["x-organization-id"] as string) || "";
    if (!orgId) {
      return res.status(400).json({ success: false, error: "Organization required" });
    }
    const { name, creativeHeadline, creativeBody } = req.body;

    if (!name || !creativeHeadline || !creativeBody) {
      return res.status(400).json({
        success: false,
        error: "Campaign name, Creative Headline, and Creative Body are required for App Promotion Campaign.",
      });
    }

    const campaign = await AppPromotionCampaignService.createAppPromotionCampaign(orgId, req.body);
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[AppPromotionRoutes] Error creating app promotion campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
