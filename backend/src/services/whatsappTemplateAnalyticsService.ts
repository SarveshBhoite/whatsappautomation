import prisma from "../utils/prisma";
import { WhatsAppPricingCostEngine } from "./whatsappPricingCostEngine";

export class WhatsAppTemplateAnalyticsService {
  /**
   * Log or Update a WhatsApp Message Event idempotently
   */
  public static async recordMessageEvent(params: {
    organizationId: string;
    wabaId?: string;
    phoneNumberId?: string;
    metaMessageId: string;
    templateId?: string;
    templateName: string;
    templateLanguage?: string;
    templateCategory?: string;
    recipient: string;
    recipientCountry?: string;
    campaignId?: string;
    automationId?: string;
    broadcastId?: string;
    messageStatus: "QUEUED" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "CANCELLED";
    sentAt?: Date;
    deliveredAt?: Date;
    readAt?: Date;
    failedAt?: Date;
    failureReason?: string;
    failureCode?: string;
  }): Promise<any> {
    const {
      organizationId,
      wabaId,
      phoneNumberId,
      metaMessageId,
      templateId,
      templateName,
      templateLanguage = "en_US",
      templateCategory = "MARKETING",
      recipient,
      recipientCountry = "IN",
      campaignId,
      automationId,
      broadcastId,
      messageStatus,
      sentAt,
      deliveredAt,
      readAt,
      failedAt,
      failureReason,
      failureCode
    } = params;

    // Check for existing message log by metaMessageId (IDEMPOTENCY CHECK)
    const existing = await (prisma as any).whatsAppMessageLog.findUnique({
      where: { metaMessageId }
    });

    const now = new Date();
    const effectiveSentAt = sentAt || (existing ? existing.sentAt : now);
    const effectiveDeliveredAt = deliveredAt || (existing ? existing.deliveredAt : (messageStatus === "DELIVERED" ? now : null));
    const effectiveReadAt = readAt || (existing ? existing.readAt : (messageStatus === "READ" ? now : null));
    const effectiveFailedAt = failedAt || (existing ? existing.failedAt : (messageStatus === "FAILED" ? now : null));

    // Calculate / Recalculate Cost Snapshot
    const costCalc = await WhatsAppPricingCostEngine.calculateMessageCost({
      organizationId,
      wabaId,
      phoneNumberId,
      templateCategory,
      recipientCountry,
      messageStatus,
      messageTimestamp: effectiveSentAt || now
    });

    let msgLog: any;

    if (!existing) {
      // CREATE NEW MESSAGE LOG
      msgLog = await (prisma as any).whatsAppMessageLog.create({
        data: {
          organizationId,
          wabaId: wabaId || null,
          phoneNumberId: phoneNumberId || null,
          metaMessageId,
          templateId: templateId || null,
          templateName,
          templateLanguage,
          templateCategory,
          recipient,
          recipientCountry,
          campaignId: campaignId || null,
          automationId: automationId || null,
          broadcastId: broadcastId || null,
          messageStatus,
          sentAt: messageStatus === "SENT" ? now : effectiveSentAt,
          deliveredAt: effectiveDeliveredAt,
          readAt: effectiveReadAt,
          failedAt: effectiveFailedAt,
          failureReason: failureReason || null,
          failureCode: failureCode || null,
          billingStatus: costCalc.billingStatus,
          billingReason: costCalc.billingReason,
          pricingVersionId: costCalc.pricingVersionId,
          appliedUnitPrice: costCalc.appliedUnitPrice,
          currency: costCalc.currency,
          metaEstimatedCost: costCalc.metaEstimatedCost,
          metaReconciledCost: costCalc.metaReconciledCost,
          jisnuMarkupAmount: costCalc.jisnuMarkupAmount,
          clientCharge: costCalc.clientCharge,
          clientCurrency: costCalc.clientCurrency,
          exchangeRate: costCalc.exchangeRate,
          costState: costCalc.costState,
          calculatedAt: new Date()
        }
      });
    } else {
      // DEDUPLICATE & UPDATE STATUS
      // Only advance state or keep higher priority state (READ > DELIVERED > SENT > QUEUED)
      const statusPriority: Record<string, number> = {
        QUEUED: 1,
        SENT: 2,
        DELIVERED: 3,
        READ: 4,
        FAILED: 5,
        CANCELLED: 5
      };

      const currentPriority = statusPriority[existing.messageStatus] || 0;
      const newPriority = statusPriority[messageStatus] || 0;
      const finalStatus = newPriority >= currentPriority ? messageStatus : existing.messageStatus;

      msgLog = await (prisma as any).whatsAppMessageLog.update({
        where: { id: existing.id },
        data: {
          messageStatus: finalStatus,
          sentAt: existing.sentAt || effectiveSentAt,
          deliveredAt: existing.deliveredAt || effectiveDeliveredAt,
          readAt: existing.readAt || effectiveReadAt,
          failedAt: existing.failedAt || effectiveFailedAt,
          failureReason: failureReason || existing.failureReason,
          failureCode: failureCode || existing.failureCode,
          billingStatus: costCalc.billingStatus,
          billingReason: costCalc.billingReason,
          pricingVersionId: costCalc.pricingVersionId,
          appliedUnitPrice: costCalc.appliedUnitPrice,
          currency: costCalc.currency,
          metaEstimatedCost: costCalc.metaEstimatedCost,
          metaReconciledCost: existing.metaReconciledCost || costCalc.metaReconciledCost,
          jisnuMarkupAmount: costCalc.jisnuMarkupAmount,
          clientCharge: costCalc.clientCharge,
          clientCurrency: costCalc.clientCurrency,
          exchangeRate: costCalc.exchangeRate,
          costState: existing.costState === "RECONCILED" ? "RECONCILED" : costCalc.costState,
          calculatedAt: new Date()
        }
      });
    }

    // Update Daily Usage Aggregation asynchronously
    await this.updateDailyAggregation(organizationId, templateName, templateCategory, recipientCountry, msgLog);

    return msgLog;
  }

  /**
   * Update Daily Aggregations per template/category/country
   */
  private static async updateDailyAggregation(
    organizationId: string,
    templateName: string,
    category: string,
    country: string,
    msgLog: any
  ) {
    const dateStr = new Date(msgLog.createdAt || Date.now()).toISOString().substring(0, 10);

    try {
      const existing = await (prisma as any).whatsAppDailyUsageAggregation.findUnique({
        where: {
          organizationId_date_templateName_category_country: {
            organizationId,
            date: dateStr,
            templateName,
            category,
            country
          }
        }
      });

      const isSent = msgLog.messageStatus === "SENT";
      const isDelivered = msgLog.messageStatus === "DELIVERED";
      const isRead = msgLog.messageStatus === "READ";
      const isFailed = msgLog.messageStatus === "FAILED";
      const isBillable = msgLog.billingStatus === "BILLABLE";

      if (!existing) {
        await (prisma as any).whatsAppDailyUsageAggregation.create({
          data: {
            organizationId,
            date: dateStr,
            templateName,
            category,
            country,
            sentCount: isSent ? 1 : 0,
            deliveredCount: isDelivered ? 1 : 0,
            readCount: isRead ? 1 : 0,
            failedCount: isFailed ? 1 : 0,
            billableCount: isBillable ? 1 : 0,
            metaEstimatedCost: msgLog.metaEstimatedCost || 0,
            metaReconciledCost: msgLog.metaReconciledCost || 0,
            jisnuMarkupAmount: msgLog.jisnuMarkupAmount || 0,
            clientCharge: msgLog.clientCharge || 0,
            currency: msgLog.clientCurrency || "INR"
          }
        });
      } else {
        await (prisma as any).whatsAppDailyUsageAggregation.update({
          where: { id: existing.id },
          data: {
            sentCount: isSent ? existing.sentCount + 1 : existing.sentCount,
            deliveredCount: isDelivered ? existing.deliveredCount + 1 : existing.deliveredCount,
            readCount: isRead ? existing.readCount + 1 : existing.readCount,
            failedCount: isFailed ? existing.failedCount + 1 : existing.failedCount,
            billableCount: isBillable ? existing.billableCount + 1 : existing.billableCount,
            metaEstimatedCost: existing.metaEstimatedCost + (msgLog.metaEstimatedCost || 0),
            metaReconciledCost: existing.metaReconciledCost + (msgLog.metaReconciledCost || 0),
            jisnuMarkupAmount: existing.jisnuMarkupAmount + (msgLog.jisnuMarkupAmount || 0),
            clientCharge: existing.clientCharge + (msgLog.clientCharge || 0)
          }
        });
      }
    } catch (err: any) {
      console.warn(`[DAILY AGGREGATION NOTE] Could not update daily summary: ${err.message}`);
    }
  }

  /**
   * Fetch Multi-Level Analytics Summary for Organization
   */
  public static async getOrganizationAnalytics(organizationId: string, timeframe: string = "30d") {
    // Determine Date Filter
    const now = new Date();
    let startDate = new Date();
    if (timeframe === "24h" || timeframe === "today") startDate.setHours(0, 0, 0, 0);
    else if (timeframe === "7d") startDate.setDate(now.getDate() - 7);
    else if (timeframe === "30d") startDate.setDate(now.getDate() - 30);
    else if (timeframe === "this_month") startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    else startDate.setDate(now.getDate() - 30);

    // Fetch Master Templates for Organization
    const masterTemplates = await (prisma as any).whatsAppTemplateMaster.findMany({
      where: { organizationId },
      orderBy: { updatedAt: "desc" }
    });

    // Fetch Message Logs in Date Range
    const logs = await (prisma as any).whatsAppMessageLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: startDate }
      }
    });

    // Calculate Aggregates
    const sentCount = logs.filter((l: any) => l.messageStatus === "SENT" || l.messageStatus === "DELIVERED" || l.messageStatus === "READ").length;
    const deliveredCount = logs.filter((l: any) => l.messageStatus === "DELIVERED" || l.messageStatus === "READ").length;
    const readCount = logs.filter((l: any) => l.messageStatus === "READ").length;
    const failedCount = logs.filter((l: any) => l.messageStatus === "FAILED").length;
    const billableCount = logs.filter((l: any) => l.billingStatus === "BILLABLE").length;

    const totalMetaEstimatedCost = logs.reduce((acc: number, l: any) => acc + (l.metaEstimatedCost || 0), 0);
    const totalMetaReconciledCost = logs.reduce((acc: number, l: any) => acc + (l.metaReconciledCost || 0), 0);
    const totalClientCharge = logs.reduce((acc: number, l: any) => acc + (l.clientCharge || 0), 0);

    const costMetrics = WhatsAppPricingCostEngine.calculateCostPerMessageMetrics(
      totalClientCharge,
      sentCount,
      deliveredCount,
      readCount
    );

    // Group by Template
    const templateBreakdown: Record<string, any> = {};
    for (const master of masterTemplates) {
      const tLogs = logs.filter((l: any) => l.templateName === master.name);
      const tSent = tLogs.filter((l: any) => ["SENT", "DELIVERED", "READ"].includes(l.messageStatus)).length;
      const tDelivered = tLogs.filter((l: any) => ["DELIVERED", "READ"].includes(l.messageStatus)).length;
      const tRead = tLogs.filter((l: any) => l.messageStatus === "READ").length;
      const tFailed = tLogs.filter((l: any) => l.messageStatus === "FAILED").length;
      const tCost = tLogs.reduce((sum: number, l: any) => sum + (l.clientCharge || 0), 0);
      const tMetrics = WhatsAppPricingCostEngine.calculateCostPerMessageMetrics(tCost, tSent, tDelivered, tRead);

      // JISNU Performance Score (0-100 scale internal calculation)
      const jisnuPerformanceScore = Math.min(
        100,
        Math.round((tMetrics.deliveryRate * 0.4) + (tMetrics.readRate * 0.5) + (master.status === "APPROVED" ? 10 : 0))
      );

      templateBreakdown[master.name] = {
        templateId: master.id,
        metaTemplateId: master.metaTemplateId,
        name: master.name,
        category: master.category,
        language: master.language,
        metaQualityRating: master.qualityRating || "UNKNOWN", // EXTERNAL META RATING
        status: master.status,
        currentVersion: master.currentVersion,
        sent: tSent,
        delivered: tDelivered,
        read: tRead,
        failed: tFailed,
        deliveryRate: `${tMetrics.deliveryRate}%`,
        readRate: `${tMetrics.readRate}%`,
        failureRate: `${tMetrics.failureRate}%`,
        estimatedMetaCost: parseFloat(tLogs.reduce((sum: number, l: any) => sum + (l.metaEstimatedCost || 0), 0).toFixed(2)),
        clientCharge: parseFloat(tCost.toFixed(2)),
        costPerDelivered: tMetrics.costPerDelivered !== null ? `₹${tMetrics.costPerDelivered}` : "N/A",
        costPerRead: tMetrics.costPerRead !== null ? `₹${tMetrics.costPerRead}` : "N/A",
        jisnuPerformanceScore, // INTERNAL JISNU SCORE
        jisnuHealthRating: jisnuPerformanceScore >= 80 ? "EXCELLENT" : (jisnuPerformanceScore >= 60 ? "GOOD" : "NEEDS_ATTENTION")
      };
    }

    // Group by Category
    const categoryBreakdown: Record<string, any> = {};
    for (const l of logs) {
      const cat = l.templateCategory || "MARKETING";
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { category: cat, sent: 0, delivered: 0, read: 0, failed: 0, clientCharge: 0 };
      }
      categoryBreakdown[cat].sent++;
      if (["DELIVERED", "READ"].includes(l.messageStatus)) categoryBreakdown[cat].delivered++;
      if (l.messageStatus === "READ") categoryBreakdown[cat].read++;
      if (l.messageStatus === "FAILED") categoryBreakdown[cat].failed++;
      categoryBreakdown[cat].clientCharge += (l.clientCharge || 0);
    }

    // Monthly Forecasting
    const daysInMonth = 30;
    const elapsedDays = Math.max(1, now.getDate());
    const dailyAverageSent = Math.round(sentCount / Math.max(1, elapsedDays));
    const projectedMonthlySent = dailyAverageSent * daysInMonth;
    const projectedMonthlyCost = parseFloat(((totalClientCharge / elapsedDays) * daysInMonth).toFixed(2));

    // Anomaly Detection
    const anomalies: any[] = [];
    if (costMetrics.failureRate > 15) {
      anomalies.push({
        type: "HIGH_FAILURE_RATE",
        severity: "WARNING",
        message: `High template message failure rate detected (${costMetrics.failureRate}%). Check Meta WABA account balance or recipient numbers.`
      });
    }
    if (totalClientCharge > 10000) {
      anomalies.push({
        type: "COST_SPIKE_DETECTED",
        severity: "INFO",
        message: `Monthly template expenditure threshold crossed (₹${totalClientCharge.toFixed(2)}).`
      });
    }

    return {
      organizationId,
      timeframe,
      summary: {
        totalTemplates: masterTemplates.length,
        approvedTemplates: masterTemplates.filter((m: any) => m.status === "APPROVED").length,
        sentMessages: sentCount,
        deliveredMessages: deliveredCount,
        readMessages: readCount,
        failedMessages: failedCount,
        billableMessages: billableCount,
        deliveryRate: `${costMetrics.deliveryRate}%`,
        readRate: `${costMetrics.readRate}%`,
        failureRate: `${costMetrics.failureRate}%`,
        totalMetaEstimatedCost: parseFloat(totalMetaEstimatedCost.toFixed(2)),
        totalMetaReconciledCost: parseFloat(totalMetaReconciledCost.toFixed(2)),
        totalClientCharge: parseFloat(totalClientCharge.toFixed(2)),
        currency: "INR",
        costPerSent: costMetrics.costPerSent !== null ? `₹${costMetrics.costPerSent}` : "N/A",
        costPerDelivered: costMetrics.costPerDelivered !== null ? `₹${costMetrics.costPerDelivered}` : "N/A",
        costPerRead: costMetrics.costPerRead !== null ? `₹${costMetrics.costPerRead}` : "N/A"
      },
      forecasting: {
        dailyAverageSent,
        projectedMonthlySent,
        projectedMonthlyCost: `₹${projectedMonthlyCost}`,
        confidence: "ESTIMATED_PROJECTION"
      },
      anomalies,
      templateBreakdown,
      categoryBreakdown
    };
  }

  /**
   * Run Template Reconciliation against Meta Usage/Billing Records
   */
  public static async reconcileMetaBilling(params: {
    organizationId: string;
    wabaId?: string;
    periodStart: Date;
    periodEnd: Date;
    metaReportedCount?: number;
    metaReportedInvoicedCost?: number;
  }) {
    const { organizationId, wabaId, periodStart, periodEnd, metaReportedCount, metaReportedInvoicedCost } = params;

    const logs = await (prisma as any).whatsAppMessageLog.findMany({
      where: {
        organizationId,
        createdAt: { gte: periodStart, lte: periodEnd }
      }
    });

    const internalCount = logs.length;
    const internalEstimatedCost = logs.reduce((sum: number, l: any) => sum + (l.metaEstimatedCost || 0), 0);

    const metaCount = metaReportedCount ?? internalCount;
    const metaInvoicedCost = metaReportedInvoicedCost ?? internalEstimatedCost;

    const countDifference = Math.abs(internalCount - metaCount);
    const costDifference = Math.abs(internalEstimatedCost - metaInvoicedCost);

    let status = "RECONCILED";
    let discrepancyType = "NONE";
    let notes = "Internal message records match Meta reported billing.";

    if (countDifference > 0 || costDifference > 0.01) {
      status = "RECONCILIATION_REQUIRED";
      discrepancyType = countDifference > 0 ? "COUNT_MISMATCH" : "COST_MISMATCH";
      notes = `Discrepancy detected: Count diff=${countDifference}, Cost diff=₹${costDifference.toFixed(2)}`;
    }

    const recLog = await (prisma as any).whatsAppTemplateReconciliationLog.create({
      data: {
        organizationId,
        wabaId: wabaId || null,
        periodStart,
        periodEnd,
        internalCount,
        metaCount,
        countDifference,
        internalEstimatedCost: parseFloat(internalEstimatedCost.toFixed(2)),
        metaInvoicedCost: parseFloat(metaInvoicedCost.toFixed(2)),
        costDifference: parseFloat(costDifference.toFixed(2)),
        discrepancyType,
        status,
        notes
      }
    });

    return recLog;
  }
}
