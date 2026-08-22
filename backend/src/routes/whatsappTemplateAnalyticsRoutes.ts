import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { WhatsAppTemplateSyncService } from "../services/whatsappTemplateSyncService";
import { WhatsAppTemplateAnalyticsService } from "../services/whatsappTemplateAnalyticsService";
import { WhatsAppPricingCostEngine } from "../services/whatsappPricingCostEngine";

const router = Router();

// Helper to get organizationId from headers or query
const getOrgId = (req: Request): string => {
  return (req.headers["x-organization-id"] as string) || (req.query.organizationId as string) || "demo-org-123";
};

// ─── 1. POST /api/admin/whatsapp/templates/sync ─────────────────────────────
// Sync templates from Meta Graph API with master records, versioning & status history
router.post("/templates/sync", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const result = await WhatsAppTemplateSyncService.syncTemplatesForOrg(organizationId);
    return res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to sync templates", details: error.message });
  }
});

// ─── 2. GET /api/admin/whatsapp/templates/analytics ──────────────────────────
// Fetch production analytics, delivery/read rates, estimated costs, forecasting & anomalies
router.get("/templates/analytics", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const timeframe = (req.query.timeframe as string) || "30d";
    
    // Perform sync check if master data empty
    const count = await (prisma as any).whatsAppTemplateMaster.count({ where: { organizationId } });
    if (count === 0) {
      await WhatsAppTemplateSyncService.syncTemplatesForOrg(organizationId).catch(() => {});
    }

    const analytics = await WhatsAppTemplateAnalyticsService.getOrganizationAnalytics(organizationId, timeframe);
    return res.status(200).json({ success: true, ...analytics });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch template analytics", details: error.message });
  }
});

// ─── 3. GET /api/admin/whatsapp/templates/comparison ─────────────────────────
// Compare performance and costs between templates
router.get("/templates/comparison", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const timeframe = (req.query.timeframe as string) || "30d";
    const analytics = await WhatsAppTemplateAnalyticsService.getOrganizationAnalytics(organizationId, timeframe);
    
    const templates = Object.values(analytics.templateBreakdown);
    return res.status(200).json({
      success: true,
      timeframe,
      templateCount: templates.length,
      templates
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch template comparison", details: error.message });
  }
});

// ─── 4. GET & POST /api/admin/whatsapp/pricing-configs ───────────────────────
// Manage Meta Pricing Configurations Matrix
router.get("/pricing-configs", async (req: Request, res: Response) => {
  try {
    const configs = await (prisma as any).whatsAppMetaPricingConfig.findMany({
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json({ success: true, configs });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch pricing configs", details: error.message });
  }
});

router.post("/pricing-configs", async (req: Request, res: Response) => {
  try {
    const { country, category, price, currency, pricingVersion, pricingSource, effectiveFrom, effectiveUntil } = req.body;
    const organizationId = getOrgId(req);

    const config = await (prisma as any).whatsAppMetaPricingConfig.create({
      data: {
        country: (country || "IN").toUpperCase(),
        category: (category || "MARKETING").toUpperCase(),
        price: parseFloat(price || 0.0099),
        currency: currency || "USD",
        pricingVersion: pricingVersion || "v2026.1",
        pricingSource: pricingSource || "MANUAL",
        effectiveFrom: effectiveFrom ? new Date(effectiveFrom) : new Date(),
        effectiveUntil: effectiveUntil ? new Date(effectiveUntil) : null,
        organizationId
      }
    });

    // Record Audit Log
    await (prisma as any).whatsAppAuditTrail.create({
      data: {
        organizationId,
        entityType: "PRICING_CONFIG",
        entityId: config.id,
        action: "CREATE",
        performedBy: "ADMIN",
        newValue: config,
        reason: "Added new Meta pricing configuration rule"
      }
    });

    return res.status(201).json({ success: true, config });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create pricing config", details: error.message });
  }
});

// ─── 5. GET & POST /api/admin/whatsapp/markup-configs ────────────────────────
// Manage JISNU Client Markup Configuration
router.get("/markup-configs", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const configs = await (prisma as any).whatsAppClientMarkupConfig.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json({ success: true, configs });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch markup configs", details: error.message });
  }
});

router.post("/markup-configs", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { markupType, markupValue, currency } = req.body;

    const config = await (prisma as any).whatsAppClientMarkupConfig.create({
      data: {
        organizationId,
        markupType: markupType || "PERCENTAGE",
        markupValue: parseFloat(markupValue || 0.10),
        currency: currency || "INR"
      }
    });

    return res.status(201).json({ success: true, config });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create markup config", details: error.message });
  }
});

// ─── 6. GET & POST /api/admin/whatsapp/reconciliation ────────────────────────
// Run & View Reconciliation Logs
router.get("/reconciliation", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const logs = await (prisma as any).whatsAppTemplateReconciliationLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" }
    });
    return res.status(200).json({ success: true, logs });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch reconciliation logs", details: error.message });
  }
});

router.post("/reconciliation", async (req: Request, res: Response) => {
  try {
    const organizationId = getOrgId(req);
    const { periodStart, periodEnd, metaReportedCount, metaReportedInvoicedCost } = req.body;

    const rec = await WhatsAppTemplateAnalyticsService.reconcileMetaBilling({
      organizationId,
      periodStart: periodStart ? new Date(periodStart) : new Date(Date.now() - 30 * 86400000),
      periodEnd: periodEnd ? new Date(periodEnd) : new Date(),
      metaReportedCount: metaReportedCount ? parseInt(metaReportedCount) : undefined,
      metaReportedInvoicedCost: metaReportedInvoicedCost ? parseFloat(metaReportedInvoicedCost) : undefined
    });

    return res.status(201).json({ success: true, reconciliation: rec });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to run reconciliation", details: error.message });
  }
});

export default router;
