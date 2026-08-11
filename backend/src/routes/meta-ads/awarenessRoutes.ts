import { Router, Request, Response } from "express";
import { AwarenessCampaignService } from "../../services/meta-ads/awarenessCampaignService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * POST /api/meta-ads/campaigns/awareness
 * Create a dynamic Awareness Campaign (OUTCOME_AWARENESS)
 */
router.post("/campaigns/awareness", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { name, creativeHeadline, creativeBody } = req.body;

    if (!name || !creativeHeadline || !creativeBody) {
      return res.status(400).json({
        success: false,
        error: "Campaign name, Creative Headline, and Creative Body are required for Awareness Campaign.",
      });
    }

    const campaign = await AwarenessCampaignService.createAwarenessCampaign(orgId, req.body);
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[AwarenessRoutes] Error creating awareness campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
