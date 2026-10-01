import { CampaignPlan, PreflightIssue, CampaignPlanPreflightChecks } from "./CampaignPlan";
import { GoogleAdsCampaignValidator } from "./GoogleAdsCampaignValidator";
import { validateCustomerOwnership } from "../../../utils/customerOwnership";
import { GoogleAdsBillingService } from "../GoogleAdsBillingService";
import { GoogleAdsService } from "../../googleAdsService";
import { YouTubeService } from "../../youtubeService";
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

    // ── 1. General & Ownership Validation ──────────────────────────────────
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
    if (orgId && cleanCid) {
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

    // ── 2. Campaign Core Config Validation ─────────────────────────────────
    if (!plan.coreConfig.campaignName?.trim()) {
      issues.push({
        severity: "CRITICAL",
        field: "campaignName",
        code: "MISSING_CAMPAIGN_NAME",
        message: "Campaign name is required."
      });
    }

    if (!plan.coreConfig.campaignType) {
      issues.push({
        severity: "CRITICAL",
        field: "campaignType",
        code: "MISSING_CAMPAIGN_TYPE",
        message: "Campaign type (e.g. SEARCH, PERFORMANCE_MAX, DISPLAY) is required."
      });
    }

    if (!plan.coreConfig.objective) {
      issues.push({
        severity: "CRITICAL",
        field: "objective",
        code: "MISSING_OBJECTIVE",
        message: "Campaign objective (e.g. SALES, LEADS, WEBSITE_TRAFFIC) is required."
      });
    }

    // ── 3. Budget & Bidding Validation ─────────────────────────────────────
    if (plan.budgetConfig.amount <= 0) {
      issues.push({
        severity: "CRITICAL",
        field: "amount",
        code: "INVALID_BUDGET",
        message: "A valid positive budget greater than 0 is required."
      });
    }

    if (plan.budgetConfig.budgetType === "TOTAL" && !plan.coreConfig.endDate) {
      issues.push({
        severity: "CRITICAL",
        field: "endDate",
        code: "MISSING_END_DATE_FOR_TOTAL_BUDGET",
        message: "End date is required when using Campaign Total Budget."
      });
    }

    const bStrat = (plan.budgetConfig.biddingStrategy || "").toLowerCase();
    if ((bStrat.includes("cpa") || bStrat === "target cpa") && (!plan.budgetConfig.targetCpa || plan.budgetConfig.targetCpa <= 0)) {
      issues.push({
        severity: "CRITICAL",
        field: "targetCpa",
        code: "INVALID_TARGET_CPA",
        message: "A valid positive Target CPA is required when Target CPA bidding is selected."
      });
    }
    if ((bStrat.includes("roas") || bStrat === "target roas") && (!plan.budgetConfig.targetRoas || plan.budgetConfig.targetRoas <= 0)) {
      issues.push({
        severity: "CRITICAL",
        field: "targetRoas",
        code: "INVALID_TARGET_ROAS",
        message: "A valid positive Target ROAS percentage is required when Target ROAS bidding is selected."
      });
    }

    // ── 4. Targeting Validation ────────────────────────────────────────────
    if (!plan.targeting.locations || plan.targeting.locations.length === 0) {
      issues.push({
        severity: "CRITICAL",
        field: "locations",
        code: "MISSING_LOCATIONS",
        message: "At least one targeted location (e.g. 'India') is required."
      });
    }
    if (!plan.targeting.languages || plan.targeting.languages.length === 0) {
      issues.push({
        severity: "CRITICAL",
        field: "languages",
        code: "MISSING_LANGUAGES",
        message: "At least one target language (e.g. 'English') is required."
      });
    }

    // ── 5. Campaign-Type-Specific Asset Requirements ───────────────────────
    const type = plan.coreConfig.campaignType;
    const url = plan.businessContext.websiteUrl;

    if (type !== "APP") {
      if (!url || (!url.startsWith("http://") && !url.startsWith("https://"))) {
        issues.push({
          severity: "CRITICAL",
          field: "websiteUrl",
          code: "INVALID_WEBSITE_URL",
          message: "A valid landing page URL starting with http:// or https:// is required."
        });
      }
    }

    if (type === "SEARCH") {
      if (plan.assets.headlines.length < 3) {
        issues.push({
          severity: "CRITICAL",
          field: "headlines",
          code: "INSUFFICIENT_SEARCH_HEADLINES",
          message: `Search campaigns require at least 3 unique headlines (currently have ${plan.assets.headlines.length}).`
        });
      }
      if (plan.assets.descriptions.length < 2) {
        issues.push({
          severity: "CRITICAL",
          field: "descriptions",
          code: "INSUFFICIENT_SEARCH_DESCRIPTIONS",
          message: `Search campaigns require at least 2 unique descriptions (currently have ${plan.assets.descriptions.length}).`
        });
      }
      if (plan.keywordsConfig.positiveKeywords.length < 1) {
        issues.push({
          severity: "CRITICAL",
          field: "positiveKeywords",
          code: "MISSING_SEARCH_KEYWORDS",
          message: "At least 1 targeted search keyword is required for Search campaigns."
        });
      }
    }

    if (type === "PERFORMANCE_MAX") {
      if (plan.assets.headlines.length < 3) {
        issues.push({
          severity: "CRITICAL",
          field: "headlines",
          code: "INSUFFICIENT_PMAX_HEADLINES",
          message: `Performance Max requires at least 3 headlines (currently have ${plan.assets.headlines.length}).`
        });
      }
      if (!plan.assets.longHeadlines || plan.assets.longHeadlines.length < 1) {
        issues.push({
          severity: "CRITICAL",
          field: "longHeadlines",
          code: "MISSING_PMAX_LONG_HEADLINE",
          message: "Performance Max requires at least 1 long headline (up to 90 characters)."
        });
      }
      if (plan.assets.descriptions.length < 2) {
        issues.push({
          severity: "CRITICAL",
          field: "descriptions",
          code: "INSUFFICIENT_PMAX_DESCRIPTIONS",
          message: `Performance Max requires at least 2 descriptions (currently have ${plan.assets.descriptions.length}).`
        });
      }
      if (!plan.businessContext.businessName?.trim()) {
        issues.push({
          severity: "CRITICAL",
          field: "businessName",
          code: "MISSING_BUSINESS_NAME",
          message: "Business name is required for Performance Max (max 25 characters)."
        });
      } else if (plan.businessContext.businessName.length > 25) {
        issues.push({
          severity: "CRITICAL",
          field: "businessName",
          code: "BUSINESS_NAME_TOO_LONG",
          message: "Business name must be 25 characters or fewer for Performance Max."
        });
      }

      // Check Images: Landscape 1.91:1, Square 1:1, Logo 1:1
      const images = plan.assets.marketingImages || [];
      const logos = plan.assets.logos || [];

      const hasLandscape = images.some(im => {
        const ar = im.aspectRatio || "";
        const ft = im.fieldType || "";
        const nm = (im.name || "").toLowerCase();
        return ar === "1.91:1" || ft === "MARKETING_IMAGE" || nm.includes("landscape") || nm.includes("1.91");
      });
      const hasSquare = images.some(im => {
        const ar = im.aspectRatio || "";
        const ft = im.fieldType || "";
        const nm = (im.name || "").toLowerCase();
        return ar === "1:1" || ft === "SQUARE_MARKETING_IMAGE" || nm.includes("square") || nm.includes("1x1") || nm.includes("1:1");
      });
      const hasLogo = logos.length > 0 || images.some(im => im.fieldType === "LOGO");

      if (!hasLandscape) {
        issues.push({
          severity: "CRITICAL",
          field: "marketingImages",
          code: "MISSING_PMAX_LANDSCAPE_IMAGE",
          message: "Performance Max requires at least 1 landscape marketing image (1.91:1 ratio, min 600×314 px)."
        });
      }
      if (!hasSquare) {
        issues.push({
          severity: "CRITICAL",
          field: "marketingImages",
          code: "MISSING_PMAX_SQUARE_IMAGE",
          message: "Performance Max requires at least 1 square marketing image (1:1 ratio, min 300×300 px)."
        });
      }
      if (!hasLogo) {
        issues.push({
          severity: "CRITICAL",
          field: "logos",
          code: "MISSING_PMAX_LOGO",
          message: "Performance Max requires at least 1 square brand logo (1:1 ratio, min 128×128 px)."
        });
      }
    }

    if (type === "SHOPPING") {
      const mcId = plan.retailConfig?.merchantCenterId;
      if (!mcId || !mcId.trim()) {
        issues.push({
          severity: "CRITICAL",
          field: "merchantCenterId",
          code: "MISSING_MERCHANT_CENTER_ID",
          message: "Google Merchant Center Account ID is required before a Shopping campaign can be published."
        });
      } else if (!/^\d+$/.test(mcId.trim())) {
        issues.push({
          severity: "CRITICAL",
          field: "merchantCenterId",
          code: "INVALID_MERCHANT_CENTER_ID",
          message: "Merchant Center ID must be numeric."
        });
      }
    }

    if (type === "APP") {
      const appId = plan.appConfig?.appId?.trim();
      if (!appId) {
        issues.push({
          severity: "CRITICAL",
          field: "appId",
          code: "MISSING_APP_ID",
          message: "Mobile App package name (Android) or numerical App Store ID (iOS) is required."
        });
      }
      if (!plan.budgetConfig.targetCpa || plan.budgetConfig.targetCpa <= 0) {
        issues.push({
          severity: "CRITICAL",
          field: "targetCpa",
          code: "MISSING_APP_TARGET_CPA",
          message: "A positive Target CPA is required for App promotion campaigns."
        });
      }
    }

    if (type === "VIDEO") {
      if (orgId) {
        try {
          const ytStatus = await YouTubeService.getOrganizationConnectionStatus(orgId);
          if (!ytStatus.isConnected) {
            issues.push({
              severity: "CRITICAL",
              field: "youtubeConnection",
              code: "YOUTUBE_NOT_AUTHENTICATED",
              message: "YouTube connection is required for Video campaigns. Connect your YouTube channel to continue."
            });
          }
        } catch (ytErr: any) {
          issues.push({
            severity: "CRITICAL",
            field: "youtubeConnection",
            code: "YOUTUBE_STATUS_CHECK_FAILED",
            message: "YouTube connection is required for Video campaigns. Connect your YouTube channel to continue."
          });
        }
      }

      const videos = plan.assets.youtubeVideos || [];
      if (videos.length < 1) {
        issues.push({
          severity: "CRITICAL",
          field: "youtubeVideos",
          code: "MISSING_YOUTUBE_VIDEO",
          message: "At least 1 YouTube video URL/asset is required for Video ads."
        });
      }
    }

    if (type === "DEMAND_GEN") {
      const isVideoFormat = (plan.coreConfig.adFormat || "").toUpperCase() === "VIDEO";
      if (isVideoFormat) {
        if (orgId) {
          try {
            const ytStatus = await YouTubeService.getOrganizationConnectionStatus(orgId);
            if (!ytStatus.isConnected) {
              issues.push({
                severity: "CRITICAL",
                field: "youtubeConnection",
                code: "YOUTUBE_NOT_AUTHENTICATED",
                message: "YouTube connection is required for Video Demand Gen campaigns. Connect your YouTube channel to continue."
              });
            }
          } catch (ytErr: any) {
            issues.push({
              severity: "CRITICAL",
              field: "youtubeConnection",
              code: "YOUTUBE_STATUS_CHECK_FAILED",
              message: "YouTube connection is required for Video Demand Gen campaigns. Connect your YouTube channel to continue."
            });
          }
        }

        const videos = plan.assets.youtubeVideos || [];
        if (videos.length < 1) {
          issues.push({
            severity: "CRITICAL",
            field: "youtubeVideos",
            code: "MISSING_DEMAND_GEN_VIDEO",
            message: "At least 1 YouTube video URL/asset is required for Demand Gen Video ads."
          });
        }
      }
    }

    // ── 6. Account Readiness & Infrastructure Preflight ─────────────────────
    let googleAdsConnected = false;
    let billingActive = false;
    let conversionTrackingActive = false;
    let merchantCenterLinked = undefined;

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

        // B. Billing Status Readiness Check (Deterministic via existing Billing service)
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
        } catch (bErr: any) {
          // Non-blocking warning if billing query fails
          issues.push({
            severity: "WARNING",
            field: "billingStatus",
            code: "BILLING_CHECK_UNAVAILABLE",
            message: "Could not verify live billing status with Google Ads API. Please ensure payment setup is active."
          });
        }

        // C. Conversion Tracking Check from Customer Profile / Conversion Goals
        const profile = await CustomerBusinessProfileService.getProfile(orgId, cleanCid);

        const goals = Array.isArray(profile?.conversionGoals) ? profile.conversionGoals : [];
        if (goals.length > 0 || profile?.googleTagId) {
          conversionTrackingActive = true;
        } else {
          // If bidding strategy is conversion-focused, warn user
          if (bStrat.includes("conversion") || bStrat.includes("cpa") || bStrat.includes("roas")) {
            issues.push({
              severity: "WARNING",
              field: "conversionGoals",
              code: "NO_ACTIVE_CONVERSION_GOALS",
              message: "No active conversion goals or Google Tag found for this account. Conversion-based bidding may underperform until tracking is installed."
            });
          }
        }

        // D. Merchant Center Linkage Check for Shopping / PMax with Retail
        if (type === "SHOPPING" || plan.retailConfig?.merchantCenterId) {
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
