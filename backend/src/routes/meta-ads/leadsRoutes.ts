import { Router, Request, Response } from "express";
import { LeadsCampaignService } from "../../services/meta-ads/leadsCampaignService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * POST /api/meta-ads/campaigns/leads
 * Create a dynamic Leads Campaign (OUTCOME_LEADS)
 */
router.post("/campaigns/leads", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const { name, creativeHeadline, creativeBody } = req.body;

    if (!name || !creativeHeadline || !creativeBody) {
      return res.status(400).json({
        success: false,
        error: "Campaign name, Creative Headline, and Creative Body are required for Leads Campaign.",
      });
    }

    const campaign = await LeadsCampaignService.createLeadsCampaign(orgId, req.body);
    res.json({ success: true, campaign });
  } catch (error: any) {
    console.error("[LeadsRoutes] Error creating leads campaign:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
