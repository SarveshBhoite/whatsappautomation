import { Router, Request, Response } from "express";
import { SalesCampaignService } from "../../services/meta-ads/salesCampaignService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * POST /api/meta-ads/campaigns/sales
 * Create a dynamic Sales Campaign (OUTCOME_SALES)
 */
router.post("/campaigns/sales", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { name, creativeHeadline, creativeBody } = req.body;

    if (!name || !creativeHeadline || !creativeBody) {
      return res.status(400).json({
        success: false,
        error: "Campaign name, Creative Headline, and Creative Body are required for Sales Campaign.",
      });
    }

    const campaign = await SalesCampaignService.createSalesCampaign(orgId, req.body);
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[SalesRoutes] Error creating sales campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
