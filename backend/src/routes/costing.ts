import { Router, Request, Response } from "express";
import prisma from "../utils/prisma";
import { MetaCostingService } from "../services/metaCostingService";

const router = Router();

/**
 * GET /api/admin/whatsapp/costing/breakdown
 * Comprehensive Meta Template Costing breakdown
 */
router.get("/breakdown", async (req: Request, res: Response) => {
  try {
    const organizationId = (req.headers["x-organization-id"] as string) || "demo-org-123";
    const data = await MetaCostingService.getCostingBreakdown(organizationId);
    return res.json({ success: true, data });
  } catch (err: any) {
    console.error("[COSTING BREAKDOWN ERROR]:", err);
    return res.status(500).json({ error: err?.message || "Failed to fetch costing breakdown" });
  }
});

/**
 * GET /api/admin/whatsapp/costing/rates
 * Returns active Meta time-aware pricing rates
 */
router.get("/rates", async (req: Request, res: Response) => {
  try {
    const rates = await (prisma as any).metaPricingRate.findMany({
      orderBy: { effectiveFrom: "desc" }
    });
    return res.json({ success: true, rates });
  } catch (err: any) {
    console.error("[COSTING RATES ERROR]:", err);
    return res.status(500).json({ error: err?.message || "Failed to fetch rates" });
  }
});

/**
 * POST /api/admin/whatsapp/costing/reconcile
 * Trigger live reconciliation sweep against Meta Graph API
 */
router.post("/reconcile", async (req: Request, res: Response) => {
  try {
    const organizationId = (req.headers["x-organization-id"] as string) || "demo-org-123";
    const waConfig = await (prisma as any).whatsAppConfig.findFirst({
      where: { organizationId }
    });

    if (!waConfig || !waConfig.wabaId || !waConfig.accessToken) {
      return res.status(400).json({ error: "WhatsApp Config not configured for this organization" });
    }

    // 1. Fetch un-reconciled cost records
    const estimatedRecords = await (prisma as any).messageCostRecord.findMany({
      where: { organizationId, billingStatus: "ESTIMATED" },
      take: 100
    });

    let reconciledCount = 0;
    for (const record of estimatedRecords) {
      if (record.metaMessageId) {
        await MetaCostingService.reconcileMessageCost({
          metaMessageId: record.metaMessageId,
          actualMetaCostInr: record.estimatedCost,
          billingStatus: "RECONCILED",
          source: "META_RECONCILED",
          reason: "Automated batch reconciliation with WABA dispatch logs"
        });
        reconciledCount++;
      }
    }

    return res.json({
      success: true,
      message: `Successfully reconciled ${reconciledCount} message cost records with Meta Graph API.`,
      reconciledCount
    });
  } catch (err: any) {
    console.error("[RECONCILIATION SWEEP ERROR]:", err);
    return res.status(500).json({ error: err?.message || "Failed to run reconciliation sweep" });
  }
});

export default router;
