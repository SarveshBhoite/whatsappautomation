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

/**
 * GET /api/meta-ads/leadgen-forms
 * Fetch Instant Lead Forms connected to Facebook Page
 */
router.get("/leadgen-forms", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const pageId = req.query.pageId as string;
    const forms = await LeadsCampaignService.getLeadGenForms(orgId, pageId);
    res.json({ success: true, forms });
  } catch (error: any) {
    console.error("[LeadsRoutes] Error fetching leadgen forms:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/leadgen-forms
 * Create Instant Lead Form
 */
router.post("/leadgen-forms", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const pageId = req.body.pageId;
    if (!pageId) {
      return res.status(400).json({ success: false, error: "Facebook Page ID is required to create a Lead Form." });
    }
    const form = await LeadsCampaignService.createLeadGenForm(orgId, pageId, req.body);
    res.json({ success: true, form });
  } catch (error: any) {
    console.error("[LeadsRoutes] Error creating leadgen form:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/leadgen-forms/:id/leads
 * Fetch captured leads from an Instant Form
 */
router.get("/leadgen-forms/:id/leads", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const formId = req.params.id as string;
    const leads = await LeadsCampaignService.getFormLeads(orgId, formId);
    res.json({ success: true, leads });
  } catch (error: any) {
    console.error("[LeadsRoutes] Error fetching leads:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
