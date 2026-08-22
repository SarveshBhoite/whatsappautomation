import prisma from "../utils/prisma";

export interface RecipientMarketInfo {
  country: string;
  countryCode: string;
  market: string;
}

export class MetaCostingService {
  /**
   * Resolves recipient market and country code from phone number
   */
  public static resolveRecipientMarket(phone: string): RecipientMarketInfo {
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (cleanPhone.startsWith("91")) {
      return { country: "India", countryCode: "IN", market: "IN" };
    } else if (cleanPhone.startsWith("1")) {
      return { country: "United States", countryCode: "US", market: "US" };
    } else if (cleanPhone.startsWith("44")) {
      return { country: "United Kingdom", countryCode: "GB", market: "GB" };
    } else if (cleanPhone.startsWith("971")) {
      return { country: "United Arab Emirates", countryCode: "AE", market: "AE" };
    } else if (cleanPhone.startsWith("966")) {
      return { country: "Saudi Arabia", countryCode: "SA", market: "SA" };
    } else if (cleanPhone.startsWith("61")) {
      return { country: "Australia", countryCode: "AU", market: "AU" };
    }
    return { country: "International", countryCode: "DEFAULT", market: "DEFAULT" };
  }

  /**
   * Fetches time-aware pricing rate for category and market
   */
  public static async getApplicablePricingRate(
    category: string,
    market: string,
    messageDate: Date = new Date()
  ) {
    const cat = (category || "").toUpperCase();

    // 1. Check Database for exact pricing version
    const dbRate = await (prisma as any).metaPricingRate.findFirst({
      where: {
        pricingCategory: cat,
        recipientMarket: market,
        effectiveFrom: { lte: messageDate },
        OR: [
          { effectiveUntil: null },
          { effectiveUntil: { gte: messageDate } }
        ]
      },
      orderBy: { effectiveFrom: "desc" }
    }).catch(() => null);

    if (dbRate) {
      return {
        unitPrice: dbRate.unitPrice,
        currency: dbRate.currency,
        pricingVersion: dbRate.pricingVersion,
        source: dbRate.source
      };
    }

    // 2. Default Official Meta WABA India & Global Pricing fallback
    if (market === "IN") {
      if (cat.includes("MARKETING")) {
        return { unitPrice: 1.11, currency: "INR", pricingVersion: "2026-v1", source: "META_OFFICIAL_PRICING" };
      } else if (cat.includes("UTILITY")) {
        return { unitPrice: 0.308, currency: "INR", pricingVersion: "2026-v1", source: "META_OFFICIAL_PRICING" };
      } else if (cat.includes("AUTHENTICATION") || cat.includes("AUTH")) {
        return { unitPrice: 0.135, currency: "INR", pricingVersion: "2026-v1", source: "META_OFFICIAL_PRICING" };
      }
      return { unitPrice: 0.308, currency: "INR", pricingVersion: "2026-v1", source: "META_OFFICIAL_PRICING" };
    } else if (market === "US") {
      if (cat.includes("MARKETING")) {
        return { unitPrice: 0.025, currency: "USD", pricingVersion: "2026-v1", source: "META_OFFICIAL_PRICING" };
      }
      return { unitPrice: 0.015, currency: "USD", pricingVersion: "2026-v1", source: "META_OFFICIAL_PRICING" };
    }

    // Default global international fallback
    return { unitPrice: 0.02, currency: "USD", pricingVersion: "2026-v1", source: "META_OFFICIAL_PRICING" };
  }

  /**
   * Calculates and creates an immutable MessageCostRecord for a dispatched template message
   */
  public static async calculateAndRecordEstimatedCost(params: {
    messageId?: string;
    metaMessageId?: string;
    organizationId: string;
    wabaId?: string;
    phoneNumberId?: string;
    templateId?: string;
    templateName: string;
    templateLanguage?: string;
    templateCategory: string;
    recipientPhone: string;
    campaignId?: string;
    automationId?: string;
    messageSentAt?: Date;
    jisnuMarkupInr?: number;
  }) {
    try {
      const sentAt = params.messageSentAt || new Date();
      const marketInfo = this.resolveRecipientMarket(params.recipientPhone);
      const pricing = await this.getApplicablePricingRate(
        params.templateCategory,
        marketInfo.market,
        sentAt
      );

      const exchangeRate = 83.0; // 1 USD = 83.0 INR
      let estimatedCostInr = pricing.unitPrice;
      let metaCostUsd = pricing.currency === "USD" ? pricing.unitPrice : pricing.unitPrice / exchangeRate;

      if (pricing.currency === "USD") {
        estimatedCostInr = Number((pricing.unitPrice * exchangeRate).toFixed(2));
      }

      const markup = params.jisnuMarkupInr || 0.0;
      const clientCharge = Number((estimatedCostInr + markup).toFixed(2));

      const record = await (prisma as any).messageCostRecord.create({
        data: {
          messageId: params.messageId || null,
          metaMessageId: params.metaMessageId || null,
          organizationId: params.organizationId,
          wabaId: params.wabaId || null,
          phoneNumberId: params.phoneNumberId || null,
          templateId: params.templateId || null,
          templateName: params.templateName,
          templateLanguage: params.templateLanguage || "en",
          templateCategory: params.templateCategory,
          recipientPhoneCountry: marketInfo.country,
          recipientCountryCode: marketInfo.countryCode,
          recipientMarket: marketInfo.market,
          campaignId: params.campaignId || null,
          automationId: params.automationId || null,
          messageSentAt: sentAt,
          billingStatus: "ESTIMATED",
          billingSource: "OFFICIAL_PRICING_CALCULATION",
          pricingVersion: pricing.pricingVersion,
          unitPrice: pricing.unitPrice,
          currency: pricing.currency,
          billableQuantity: 1,
          metaCost: metaCostUsd,
          estimatedCost: estimatedCostInr,
          reconciledCost: null,
          costCalculatedAt: new Date(),
          metaCurrency: pricing.currency,
          clientCurrency: "INR",
          exchangeRate: exchangeRate,
          convertedCost: estimatedCostInr,
          jisnuMarkup: markup,
          clientCharge: clientCharge
        }
      });

      console.log(`[META COSTING SERVICE] Created Cost Record ${record.id} for ${params.templateName} (${marketInfo.market}): ₹${estimatedCostInr}`);
      return record;
    } catch (err: any) {
      console.error("[META COSTING SERVICE ERROR] Failed to record cost:", err?.message || err);
      return null;
    }
  }

  /**
   * Reconciles internal message record against authoritative Meta usage data
   */
  public static async reconcileMessageCost(params: {
    metaMessageId: string;
    actualMetaCostInr?: number;
    billingStatus?: "AUTHORITATIVE" | "RECONCILED";
    source?: string;
    reason?: string;
  }) {
    try {
      const record = await (prisma as any).messageCostRecord.findUnique({
        where: { metaMessageId: params.metaMessageId }
      });

      if (!record) {
        console.warn(`[META RECONCILIATION] No cost record found for metaMessageId: ${params.metaMessageId}`);
        return null;
      }

      const prevStatus = record.billingStatus;
      const prevCost = record.reconciledCost ?? record.estimatedCost;
      const newCost = params.actualMetaCostInr ?? record.estimatedCost;
      const newStatus = params.billingStatus || "RECONCILED";
      const source = params.source || "META_RECONCILED";

      // 1. Update Cost Record
      const updated = await (prisma as any).messageCostRecord.update({
        where: { id: record.id },
        data: {
          billingStatus: newStatus,
          billingSource: source,
          reconciledCost: newCost,
          updatedAt: new Date()
        }
      });

      // 2. Audit Trail
      await (prisma as any).messageCostAuditLog.create({
        data: {
          costRecordId: record.id,
          previousStatus: prevStatus,
          newStatus: newStatus,
          previousCost: prevCost,
          newCost: newCost,
          source: source,
          reason: params.reason || "Reconciled with Meta API Usage Data"
        }
      });

      console.log(`[META RECONCILIATION] Reconciled ${params.metaMessageId}: ${prevStatus} -> ${newStatus} (Cost: ₹${newCost})`);
      return updated;
    } catch (err: any) {
      console.error("[META RECONCILIATION ERROR]:", err?.message || err);
      return null;
    }
  }

  /**
   * Generates comprehensive costing analytics broken down by Template, Category, Date & Organization
   */
  public static async getCostingBreakdown(organizationId: string) {
    const records = await (prisma as any).messageCostRecord.findMany({
      where: { organizationId },
      orderBy: { messageSentAt: "desc" }
    });

    let totalMessages = records.length;
    let totalEstimatedCostInr = 0;
    let totalReconciledCostInr = 0;

    const byTemplate: Record<string, any> = {};
    const byCategory: Record<string, any> = {};

    for (const r of records) {
      const est = r.estimatedCost || 0;
      const rec = r.reconciledCost ?? est;

      totalEstimatedCostInr += est;
      totalReconciledCostInr += rec;

      // By Template
      if (!byTemplate[r.templateName]) {
        byTemplate[r.templateName] = {
          templateName: r.templateName,
          templateCategory: r.templateCategory,
          count: 0,
          estimatedCostInr: 0,
          reconciledCostInr: 0,
          recipientMarkets: new Set<string>()
        };
      }
      byTemplate[r.templateName].count += 1;
      byTemplate[r.templateName].estimatedCostInr += est;
      byTemplate[r.templateName].reconciledCostInr += rec;
      byTemplate[r.templateName].recipientMarkets.add(r.recipientMarket);

      // By Category
      if (!byCategory[r.templateCategory]) {
        byCategory[r.templateCategory] = {
          category: r.templateCategory,
          count: 0,
          estimatedCostInr: 0,
          reconciledCostInr: 0
        };
      }
      byCategory[r.templateCategory].count += 1;
      byCategory[r.templateCategory].estimatedCostInr += est;
      byCategory[r.templateCategory].reconciledCostInr += rec;
    }

    return {
      summary: {
        totalMessages,
        totalEstimatedCostInr: Number(totalEstimatedCostInr.toFixed(2)),
        totalReconciledCostInr: Number(totalReconciledCostInr.toFixed(2)),
        currency: "INR"
      },
      byTemplate: Object.values(byTemplate).map((t: any) => ({
        ...t,
        estimatedCostInr: Number(t.estimatedCostInr.toFixed(2)),
        reconciledCostInr: Number(t.reconciledCostInr.toFixed(2)),
        recipientMarkets: Array.from(t.recipientMarkets)
      })),
      byCategory: Object.values(byCategory).map((c: any) => ({
        ...c,
        estimatedCostInr: Number(c.estimatedCostInr.toFixed(2)),
        reconciledCostInr: Number(c.reconciledCostInr.toFixed(2))
      })),
      recentRecords: records.slice(0, 50)
    };
  }

  /**
   * Diagnostic summary explaining exact source of truth, price version, market, and reconciliation state for every template
   */
  public static async getDiagnostics(organizationId: string) {
    const records = await (prisma as any).messageCostRecord.findMany({
      where: { organizationId },
      include: { auditLogs: true },
      orderBy: { messageSentAt: "desc" }
    });

    return {
      organizationId,
      totalRecordsLogged: records.length,
      sourcePriority: [
        "1. Meta Authoritative Billing Data (AUTHORITATIVE / RECONCILED)",
        "2. Meta WABA Analytics Usage + Official Pricing",
        "3. Official Meta Pricing Engine (ESTIMATED)",
        "4. Internal Estimate",
        "5. UNKNOWN (never ₹0)"
      ],
      diagnostics: records.map((r: any) => ({
        id: r.id,
        metaMessageId: r.metaMessageId,
        templateName: r.templateName,
        templateCategory: r.templateCategory,
        recipientMarket: r.recipientMarket,
        messageSentAt: r.messageSentAt,
        billingStatus: r.billingStatus,
        billingSource: r.billingSource,
        pricingVersion: r.pricingVersion,
        unitPrice: r.unitPrice,
        currency: r.currency,
        estimatedCost: r.estimatedCost,
        reconciledCost: r.reconciledCost,
        metaOfficialCost: r.reconciledCost ?? r.estimatedCost,
        auditHistory: r.auditLogs
      }))
    };
  }
}
