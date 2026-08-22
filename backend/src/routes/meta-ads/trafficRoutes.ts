import { Router, Request, Response } from "express";
import { TrafficCampaignService } from "../../services/meta-ads/trafficCampaignService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * POST /api/meta-ads/campaigns/traffic
 * Create a dynamic Traffic Campaign (OUTCOME_TRAFFIC)
 */
router.post("/campaigns/traffic", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { name, creativeHeadline, creativeBody } = req.body;

    if (!name || !creativeHeadline || !creativeBody) {
      return res.status(400).json({
        success: false,
        error: "Campaign name, Creative Headline, and Creative Body are required for Traffic Campaign.",
      });
    }

    const campaign = await TrafficCampaignService.createTrafficCampaign(orgId, req.body);
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[TrafficRoutes] Error creating traffic campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
