import { Router, Request, Response } from "express";
import { MetaAdsCoreService } from "../../services/meta-ads/metaAdsCoreService";

const router = Router();
const DEFAULT_ORG_ID = "demo-org-123";

/**
 * GET /api/meta-ads/config
 */
router.get("/config", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const config = await MetaAdsCoreService.getConfig(orgId);
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/meta-ads/config
 */
router.post("/config", async (req: Request, res: Response) => {
  try {
    const orgId = req.body.organizationId || DEFAULT_ORG_ID;
    const config = await MetaAdsCoreService.saveConfig(orgId, req.body);
    res.json({ success: true, config });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/connectivity-check
 */
router.get("/connectivity-check", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const diagnostic = await MetaAdsCoreService.runConnectivityCheck(orgId);
    res.json({ success: true, diagnostic });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/pages
 */
router.get("/pages", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const pages = await MetaAdsCoreService.getPages(orgId);
    res.json({ success: true, pages });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/pixels
 */
router.get("/pixels", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const pixels = await MetaAdsCoreService.getPixels(orgId);
    res.json({ success: true, pixels });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/instagram-accounts
 */
router.get("/instagram-accounts", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const instagramAccounts = await MetaAdsCoreService.getInstagramAccounts(orgId);
    res.json({ success: true, instagramAccounts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/whatsapp-numbers
 */
router.get("/whatsapp-numbers", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const whatsappNumbers = await MetaAdsCoreService.getWhatsAppNumbers(orgId);
    res.json({ success: true, whatsappNumbers });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/audiences
 */
router.get("/audiences", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const audiences = await MetaAdsCoreService.getAudiences(orgId);
    res.json({ success: true, audiences });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/meta-ads/media
 */
router.get("/media", async (req: Request, res: Response) => {
  try {
    const orgId = (req.query.organizationId as string) || DEFAULT_ORG_ID;
    const media = await MetaAdsCoreService.getMediaAssets(orgId);
    res.json({ success: true, media });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
