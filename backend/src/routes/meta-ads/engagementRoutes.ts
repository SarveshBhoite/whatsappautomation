import { Router, Request, Response } from "express";
import { EngagementCampaignService } from "../../services/meta-ads/engagementCampaignService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * POST /api/meta-ads/campaigns/engagement
 * Create a dynamic Engagement Campaign (OUTCOME_ENGAGEMENT)
 */
router.post("/campaigns/engagement", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { name, creativeHeadline, creativeBody } = req.body;

    if (!name || !creativeHeadline || !creativeBody) {
      return res.status(400).json({
        success: false,
        error: "Campaign name, Creative Headline, and Creative Body are required for Engagement Campaign.",
      });
    }

    const campaign = await EngagementCampaignService.createEngagementCampaign(orgId, req.body);
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[EngagementRoutes] Error creating engagement campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
