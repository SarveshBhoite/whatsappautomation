import { CampaignPlan, PreflightIssue, CampaignPlanPreflightChecks } from "./CampaignPlan";
import {
  CommonCampaignRules,
  SearchCampaignRules,
  PerformanceMaxCampaignRules,
  DisplayCampaignRules,
  DemandGenCampaignRules,
  ShoppingCampaignRules,
  AppCampaignRules,
  StructuredCampaignError
} from "./GoogleAdsCampaignRules";
import { validateCustomerOwnership } from "../../../utils/customerOwnership";
import { GoogleAdsBillingService } from "../GoogleAdsBillingService";
import { CustomerBusinessProfileService } from "../CustomerBusinessProfileService";
import prisma from "../../../utils/prisma";

export class CampaignPlanValidator {
  /**
   * Deterministically validates the campaign configuration and readiness before creation.
   * Performs schema checks, type-specific asset constraints, ownership validation, and account readiness.
   */
  public static async validate(
    orgId: string,
    customerId: string,
    plan: CampaignPlan
  ): Promise<CampaignPlanPreflightChecks> {
    const issues: PreflightIssue[] = [];
    const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";

    // ── 1. Organization & Customer Ownership Validation ──────────────────────
    if (!orgId || !orgId.trim()) {
      issues.push({
        severity: "CRITICAL",
        field: "organizationId",
        code: "MISSING_ORG_ID",
        message: "Organization ID is required."
      });
    }

    if (!cleanCid || !/^\d{10}$/.test(cleanCid)) {
      issues.push({
        severity: "CRITICAL",
        field: "customerId",
        code: "INVALID_CUSTOMER_ID",
        message: "A valid 10-digit Google Ads Customer ID is required."
      });
    }

    let ownershipVerified = false;
    if (orgId && cleanCid && /^\d{10}$/.test(cleanCid)) {
      ownershipVerified = await validateCustomerOwnership(orgId, cleanCid);
      if (!ownershipVerified) {
        issues.push({
          severity: "CRITICAL",
          field: "customerId",
          code: "CUSTOMER_ACCESS_DENIED",
          message: "Access denied. The specified Google Ads account is not associated with this organization."
        });
      }
    }

    // ── 2. Run Centralized Campaign Rules Layer ─────────────────────────────
    // Convert plan structure to plain state for rule execution
    const stateRepresentation: any = {
      customerId: cleanCid,
      campaignName: plan.coreConfig.campaignName,
      objective: plan.coreConfig.objective,
      campaignType: plan.campaignType,
      status: plan.coreConfig.status,
      startDate: plan.coreConfig.startDate,
      endDate: plan.coreConfig.endDate,
      euPolitical: plan.coreConfig.euPolitical,
      budgetType: plan.budgetConfig.budgetType,
      dailyBudget: plan.budgetConfig.amount,
      totalBudget: plan.budgetConfig.budgetType === "TOTAL" ? plan.budgetConfig.amount : undefined,
      budget: plan.budgetConfig.amount,
      currencyCode: plan.budgetConfig.currencyCode,
      biddingStrategy: plan.budgetConfig.biddingStrategy,
      targetCpa: (plan.budgetConfig as any).targetCpa,
      targetRoas: (plan.budgetConfig as any).targetRoas,
      maxCpcLimit: (plan.budgetConfig as any).maxCpcLimit,
      locations: plan.targeting.locations,
      languages: plan.targeting.languages,
      businessName: plan.businessContext.businessName,
      website: plan.businessContext.websiteUrl,
      finalUrl: plan.businessContext.websiteUrl,
      headlines: (plan.assets as any)?.headlines,
      longHeadlines: (plan.assets as any)?.longHeadlines,
      descriptions: (plan.assets as any)?.descriptions,
      images: (plan.assets as any)?.marketingImages,
      logos: (plan.assets as any)?.logos,
      videos: (plan.assets as any)?.youtubeVideos,
      carouselCards: (plan.assets as any)?.carouselCards,
      adFormat: (plan as any).coreConfig?.adFormat,
      keywords: (plan as any).keywordsConfig?.positiveKeywords,
      merchantCenterId: (plan as any).retailConfig?.merchantCenterId,
      salesCountry: (plan as any).retailConfig?.salesCountry,
      feedLabel: (plan as any).retailConfig?.feedLabel,
      appId: (plan as any).appConfig?.appId,
      platform: (plan as any).appConfig?.platform,
      appStore: (plan as any).appConfig?.appStore
    };

    const commonErrors = CommonCampaignRules.validate(stateRepresentation, { orgId, customerId: cleanCid });
    for (const err of commonErrors) {
      issues.push({
        severity: err.severity === "BLOCKING" ? "CRITICAL" : "WARNING",
        field: err.field,
        code: err.code,
        message: err.message
      });
    }

    let typeErrors: StructuredCampaignError[] = [];
    switch (plan.campaignType) {
      case "SEARCH":
        typeErrors = SearchCampaignRules.validate(stateRepresentation);
        break;
      case "PERFORMANCE_MAX":
        typeErrors = PerformanceMaxCampaignRules.validate(stateRepresentation);
        break;
      case "DISPLAY":
        typeErrors = DisplayCampaignRules.validate(stateRepresentation);
        break;
      case "DEMAND_GEN":
        typeErrors = DemandGenCampaignRules.validate(stateRepresentation);
        break;
      case "SHOPPING":
        typeErrors = ShoppingCampaignRules.validate(stateRepresentation);
        break;
      case "APP":
        typeErrors = AppCampaignRules.validate(stateRepresentation);
        break;
      default:
        issues.push({
          severity: "CRITICAL",
          field: "campaignType",
          code: "UNSUPPORTED_CAMPAIGN_TYPE",
          message: `Campaign type "${(plan as any).campaignType}" is not supported.`
        });
        break;
    }

    for (const err of typeErrors) {
      issues.push({
        severity: err.severity === "BLOCKING" ? "CRITICAL" : "WARNING",
        field: err.field,
        code: err.code,
        message: err.message
      });
    }

    // ── 3. Account Readiness & Infrastructure Preflight ─────────────────────
    let googleAdsConnected = false;
    let billingActive = false;
    let conversionTrackingActive = false;
    let merchantCenterLinked: boolean | undefined = undefined;

    if (orgId && cleanCid && ownershipVerified) {
      try {
        // A. Google Ads Connection Readiness
        const config = await prisma.googleBusinessConfig.findFirst({
          where: { organizationId: orgId }
        });
        if (config?.googleRefreshToken) {
          googleAdsConnected = true;
        } else {
          issues.push({
            severity: "CRITICAL",
            field: "googleRefreshToken",
            code: "GOOGLE_ADS_NOT_CONNECTED",
            message: "Google Ads account is not connected for this organization. Please connect Google account first."
          });
        }

        // B. Billing Status Readiness Check
        try {
          const billing = await GoogleAdsBillingService.getBillingOverview(orgId, cleanCid);
          if (billing.billingStatus === "ACTIVE" || billing.billingStatus === "APPROVED" || billing.activeBillingSetup?.status === "APPROVED") {
            billingActive = true;
          } else {
            issues.push({
              severity: "WARNING",
              field: "billingStatus",
              code: "BILLING_SETUP_INCOMPLETE",
              message: `Account billing status is "${billing.billingStatus}". Ads may not serve until payment information is verified in Google Ads.`
            });
          }
        } catch {
          issues.push({
            severity: "WARNING",
            field: "billingStatus",
            code: "BILLING_CHECK_UNAVAILABLE",
            message: "Could not verify live billing status with Google Ads API. Please ensure payment setup is active."
          });
        }

        // C. Conversion Tracking Check
        const profile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);
        const goals = Array.isArray(profile?.conversionGoals) ? profile.conversionGoals : [];
        if (goals.length > 0 || profile?.googleTagId) {
          conversionTrackingActive = true;
        } else {
          const bStrat = (plan.budgetConfig.biddingStrategy || "").toLowerCase();
          if (bStrat.includes("conversion") || bStrat.includes("cpa") || bStrat.includes("roas")) {
            issues.push({
              severity: "WARNING",
              field: "conversionGoals",
              code: "NO_ACTIVE_CONVERSION_GOALS",
              message: "No active conversion goals or Google Tag found for this account. Conversion-based bidding may underperform until tracking is installed."
            });
          }
        }

        // D. Merchant Center Linkage Check for Shopping
        if (plan.campaignType === "SHOPPING") {
          if (profile?.hasMerchantAccount && profile?.merchantCenterId) {
            merchantCenterLinked = true;
          } else {
            issues.push({
              severity: "WARNING",
              field: "merchantCenterId",
              code: "MERCHANT_CENTER_UNLINKED",
              message: "Please ensure your Merchant Center account is linked and approved in your Google Ads account."
            });
          }
        }
      } catch (infraErr: any) {
        console.warn("[CampaignPlanValidator] Readiness check warning:", infraErr.message);
      }
    }

    const hasCritical = issues.some(i => i.severity === "CRITICAL");

    return {
      passed: !hasCritical,
      ownershipVerified,
      googleAdsConnected,
      billingActive,
      conversionTrackingActive,
      merchantCenterLinked,
      issues
    };
  }
}
