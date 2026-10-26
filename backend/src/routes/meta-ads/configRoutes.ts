import { Router, Request, Response } from "express";
import { MetaAdsCoreService } from "../../services/meta-ads/metaAdsCoreService";

const router = Router();

const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.organizationId as string) || (req.query.orgId as string) || (req.body?.organizationId as string) || (req.body?.orgId as string) || "";
};

/**
 * GET /api/meta-ads/config
 */
router.get("/config", async (req: Request, res: Response) => {
  try {
    const orgId = getOrgId(req);
    if (!orgId) {
      return res.json({ success: true, config: null });
    }
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
    const orgId = getOrgId(req);
    if (!orgId) {
      return res.status(400).json({ success: false, error: "Organization required" });
    }
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
    const orgId = getOrgId(req);
    if (!orgId) return res.json({ success: true });
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
    const orgId = getOrgId(req);
    if (!orgId) return res.json({ success: true });
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
    const orgId = getOrgId(req);
    if (!orgId) return res.json({ success: true });
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
    const orgId = getOrgId(req);
    if (!orgId) return res.json({ success: true });
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
    const orgId = getOrgId(req);
    if (!orgId) return res.json({ success: true });
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
    const orgId = getOrgId(req);
    if (!orgId) return res.json({ success: true });
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
    const orgId = getOrgId(req);
    if (!orgId) return res.json({ success: true });
    const media = await MetaAdsCoreService.getMediaAssets(orgId);
    res.json({ success: true, media });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
