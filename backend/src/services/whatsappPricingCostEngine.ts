import prisma from "../utils/prisma";

export interface CostCalculationResult {
  billingStatus: "BILLABLE" | "NON_BILLABLE" | "UNKNOWN";
  billingReason: string;
  pricingVersionId: string | null;
  pricingSource: string;
  appliedUnitPrice: number;
  currency: string;
  metaEstimatedCost: number;
  metaReconciledCost: number | null;
  jisnuMarkupAmount: number;
  clientCharge: number;
  clientCurrency: string;
  exchangeRate: number;
  costState: "ESTIMATED" | "RECONCILED" | "UNKNOWN";
  calculatedAt: Date;
}

export class WhatsAppPricingCostEngine {
  // Default fallback exchange rate USD -> INR
  private static DEFAULT_EXCHANGE_RATE = 83.5;

  /**
   * Determine billing eligibility based on Meta category & delivery status
   */
  public static classifyBilling(
    category: string,
    messageStatus: string,
    isFirstInWindow: boolean = true
  ): { billingStatus: "BILLABLE" | "NON_BILLABLE" | "UNKNOWN"; billingReason: string } {
    const statusUpper = (messageStatus || "").toUpperCase();
    const catUpper = (category || "").toUpperCase();

    if (statusUpper === "FAILED" || statusUpper === "CANCELLED") {
      return {
        billingStatus: "NON_BILLABLE",
        billingReason: `Message failed or was cancelled before delivery (${statusUpper})`
      };
    }

    if (statusUpper !== "DELIVERED" && statusUpper !== "READ" && statusUpper !== "SENT") {
      return {
        billingStatus: "UNKNOWN",
        billingReason: `Pending final delivery status event (${statusUpper})`
      };
    }

    // Free tier / Service message window rules
    if (catUpper === "SERVICE" && !isFirstInWindow) {
      return {
        billingStatus: "NON_BILLABLE",
        billingReason: "Service conversation inside active 24-hour customer window"
      };
    }

    return {
      billingStatus: "BILLABLE",
      billingReason: `Standard billable WhatsApp template message (${catUpper})`
    };
  }

  /**
   * Calculate immutable cost snapshot for a specific message timestamp
   */
  public static async calculateMessageCost(params: {
    organizationId: string;
    wabaId?: string;
    phoneNumberId?: string;
    templateCategory: string;
    recipientCountry?: string;
    messageStatus: string;
    messageTimestamp?: Date;
  }): Promise<CostCalculationResult> {
    const timestamp = params.messageTimestamp || new Date();
    const country = (params.recipientCountry || "IN").toUpperCase();
    const category = (params.templateCategory || "MARKETING").toUpperCase();
    const orgId = params.organizationId;

    // 1. Classification
    const classification = this.classifyBilling(category, params.messageStatus);

    if (classification.billingStatus === "NON_BILLABLE") {
      return {
        billingStatus: "NON_BILLABLE",
        billingReason: classification.billingReason,
        pricingVersionId: null,
        pricingSource: "SYSTEM",
        appliedUnitPrice: 0,
        currency: "USD",
        metaEstimatedCost: 0,
        metaReconciledCost: 0,
        jisnuMarkupAmount: 0,
        clientCharge: 0,
        clientCurrency: "INR",
        exchangeRate: this.DEFAULT_EXCHANGE_RATE,
        costState: "ESTIMATED",
        calculatedAt: new Date()
      };
    }

    // 2. Select Applicable Version-Aware Meta Pricing Rule by Timestamp
    const matchedPricing = await this.findApplicablePricingRule(country, category, timestamp, orgId, params.wabaId);

    if (!matchedPricing) {
      return {
        billingStatus: classification.billingStatus === "BILLABLE" ? "UNKNOWN" : classification.billingStatus,
        billingReason: "No active Meta pricing rule found for date/country/category",
        pricingVersionId: null,
        pricingSource: "UNKNOWN",
        appliedUnitPrice: 0,
        currency: "USD",
        metaEstimatedCost: 0,
        metaReconciledCost: null,
        jisnuMarkupAmount: 0,
        clientCharge: 0,
        clientCurrency: "INR",
        exchangeRate: this.DEFAULT_EXCHANGE_RATE,
        costState: "UNKNOWN",
        calculatedAt: new Date()
      };
    }

    const unitPrice = matchedPricing.price;
    const metaEstimatedCost = unitPrice * 1; // 1 Billable conversation

    // 3. Find JISNU Client Markup Configuration
    const markupConfig = await (prisma as any).whatsAppClientMarkupConfig.findFirst({
      where: {
        OR: [
          { organizationId: orgId },
          { organizationId: "GLOBAL" }
        ]
      },
      orderBy: { createdAt: "desc" }
    });

    let markupAmount = 0;
    let clientCharge = metaEstimatedCost;
    const clientCurrency = markupConfig?.currency || "INR";
    const exchangeRate = this.DEFAULT_EXCHANGE_RATE;

    if (markupConfig) {
      if (markupConfig.markupType === "PERCENTAGE") {
        markupAmount = metaEstimatedCost * markupConfig.markupValue;
        clientCharge = metaEstimatedCost + markupAmount;
      } else if (markupConfig.markupType === "FIXED") {
        markupAmount = markupConfig.markupValue;
        clientCharge = metaEstimatedCost + markupAmount;
      }
    }

    // Convert Client Charge to Client Currency (e.g. USD -> INR)
    const convertedClientCharge = clientCurrency === "INR" && matchedPricing.currency === "USD"
      ? clientCharge * exchangeRate
      : clientCharge;

    const convertedMarkupAmount = clientCurrency === "INR" && matchedPricing.currency === "USD"
      ? markupAmount * exchangeRate
      : markupAmount;

    return {
      billingStatus: "BILLABLE",
      billingReason: classification.billingReason,
      pricingVersionId: matchedPricing.id,
      pricingSource: matchedPricing.pricingSource,
      appliedUnitPrice: unitPrice,
      currency: matchedPricing.currency,
      metaEstimatedCost,
      metaReconciledCost: null,
      jisnuMarkupAmount: parseFloat(convertedMarkupAmount.toFixed(4)),
      clientCharge: parseFloat(convertedClientCharge.toFixed(4)),
      clientCurrency,
      exchangeRate,
      costState: "ESTIMATED",
      calculatedAt: new Date()
    };
  }

  /**
   * Find matching pricing configuration rule based on timestamp & country
   */
  private static async findApplicablePricingRule(
    country: string,
    category: string,
    timestamp: Date,
    organizationId: string,
    wabaId?: string
  ): Promise<any | null> {
    const rules = await (prisma as any).whatsAppMetaPricingConfig.findMany({
      where: {
        category,
        OR: [
          { country },
          { country: "GLOBAL" },
          { country: "ALL" }
        ],
        effectiveFrom: { lte: timestamp }
      },
      orderBy: [
        { effectiveFrom: "desc" },
        { createdAt: "desc" }
      ]
    });

    // Filter rule where timestamp <= effectiveUntil (or effectiveUntil is null)
    const matched = rules.find((r: any) => !r.effectiveUntil || new Date(r.effectiveUntil) >= timestamp);
    if (matched) return matched;

    // Fallback default pricing estimates if database is unseeded
    const defaultPrices: Record<string, number> = {
      MARKETING: 0.0099, // ~0.0099 USD per marketing message in India
      UTILITY: 0.0020,   // ~0.0020 USD per utility message
      AUTHENTICATION: 0.0018,
      SERVICE: 0.0040
    };

    return {
      id: "default_fallback_rule",
      pricingVersion: "v2026.1_default",
      pricingSource: "ESTIMATED",
      country,
      category,
      currency: "USD",
      price: defaultPrices[category] || 0.0099,
      effectiveFrom: new Date("2026-01-01")
    };
  }

  /**
   * Calculate cost per successful message metrics safely
   */
  public static calculateCostPerMessageMetrics(
    totalCost: number,
    sentCount: number,
    deliveredCount: number,
    readCount: number
  ) {
    return {
      costPerSent: sentCount > 0 ? parseFloat((totalCost / sentCount).toFixed(4)) : null,
      costPerDelivered: deliveredCount > 0 ? parseFloat((totalCost / deliveredCount).toFixed(4)) : null,
      costPerRead: readCount > 0 ? parseFloat((totalCost / readCount).toFixed(4)) : null,
      deliveryRate: sentCount > 0 ? parseFloat(((deliveredCount / sentCount) * 100).toFixed(1)) : 0,
      readRate: deliveredCount > 0 ? parseFloat(((readCount / deliveredCount) * 100).toFixed(1)) : 0,
      failureRate: sentCount > 0 ? parseFloat((((sentCount - deliveredCount) / sentCount) * 100).toFixed(1)) : 0
    };
  }
}
