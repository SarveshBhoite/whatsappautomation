import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface ForecastMetrics {
  clicks?: number;
  cost?: number; // In standard currency units (e.g. INR)
  averageCpc?: number; // In standard currency units
  conversions?: number;
  averageCpa?: number; // In standard currency units
}

export interface CampaignCurrentMetrics {
  dailyBudget: number; // In standard currency units
  biddingStrategyType: string;
  advertisingChannelType: string;
  status: string;
  keywordCount: number;
}

export interface PerformancePlannerForecastResult {
  success: boolean;
  campaignId: string;
  campaignName: string;
  currencyCode: string;
  forecastPeriod: {
    startDate: string;
    endDate: string;
  };
  current: CampaignCurrentMetrics;
  forecast: ForecastMetrics;
  rawGoogleAdsForecastMetrics: {
    clicks?: number;
    costMicros?: string;
    averageCpcMicros?: string;
    conversions?: number;
    averageCpaMicros?: string;
  };
  targetingUsed: {
    languages: string[];
    geoTargets: string[];
    keywordsCount: number;
  };
  notice?: string;
}

export class GoogleAdsPerformancePlannerService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Generates campaign performance forecast metrics using official Google Ads API v24
   * `KeywordPlanIdeaService:generateKeywordForecastMetrics`.
   */
  public static async generateCampaignForecast(
    organizationId: string,
    customerId: string,
    params: {
      campaignId: string;
      startDate: string;
      endDate: string;
      customDailyBudget?: number;
    }
  ): Promise<PerformancePlannerForecastResult> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    if (!cleanCid) throw new Error("customerId is required.");

    const { campaignId, startDate, endDate, customDailyBudget } = params;
    if (!campaignId) throw new Error("campaignId is required.");
    if (!startDate || !endDate) throw new Error("Both startDate and endDate are required.");

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new Error("Dates must be in valid YYYY-MM-DD format.");
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new Error("startDate must be strictly before endDate.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cleanCid);

    // 1. Fetch dynamic currency
    let currencyCode = "INR";
    try {
      const custRes = await axios.post(
        `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
        { query: "SELECT customer.currency_code FROM customer LIMIT 1" },
        { headers }
      );
      currencyCode = custRes.data?.results?.[0]?.customer?.currencyCode || "INR";
    } catch {
      // Keep default INR
    }

    // 2. Fetch existing campaign details from Google Ads
    const campQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.target_cpa.target_cpa_micros,
        campaign_budget.amount_micros
      FROM campaign
      WHERE campaign.id = ${campaignId}
      LIMIT 1
    `;

    const campRes = await axios.post(
      `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
      { query: campQuery },
      { headers }
    );

    const campRow = campRes.data?.results?.[0];
    if (!campRow) {
      throw new Error(`Campaign with ID '${campaignId}' not found in this Google Ads account.`);
    }

    const campaignData = campRow.campaign;
    const budgetData = campRow.campaignBudget;

    const currentDailyBudget = budgetData?.amountMicros
      ? Number((Number(budgetData.amountMicros) / 1_000_000).toFixed(2))
      : 0;

    // 3. Fetch existing criteria (geo and language)
    const critQuery = `
      SELECT
        campaign_criterion.type,
        campaign_criterion.location.geo_target_constant,
        campaign_criterion.language.language_constant
      FROM campaign_criterion
      WHERE campaign.id = ${campaignId}
        AND campaign_criterion.negative = FALSE
        AND campaign_criterion.type IN ('LOCATION', 'LANGUAGE')
      LIMIT 20
    `;

    const critRes = await axios.post(
      `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
      { query: critQuery },
      { headers }
    );

    const geoTargets: string[] = [];
    const languages: string[] = [];

    for (const r of critRes.data?.results || []) {
      if (r.campaignCriterion?.location?.geoTargetConstant) {
        geoTargets.push(r.campaignCriterion.location.geoTargetConstant);
      }
      if (r.campaignCriterion?.language?.languageConstant) {
        languages.push(r.campaignCriterion.language.languageConstant);
      }
    }

    if (geoTargets.length === 0) geoTargets.push("geoTargetConstants/2356"); // Default India
    if (languages.length === 0) languages.push("languageConstants/1000"); // Default English

    // 4. Fetch keywords from ad groups in this campaign
    const kwQuery = `
      SELECT
        ad_group_criterion.keyword.text,
        ad_group_criterion.keyword.match_type
      FROM ad_group_criterion
      WHERE campaign.id = ${campaignId}
        AND ad_group_criterion.type = 'KEYWORD'
        AND ad_group_criterion.negative = FALSE
        AND ad_group_criterion.status = 'ENABLED'
      LIMIT 100
    `;

    const kwRes = await axios.post(
      `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
      { query: kwQuery },
      { headers }
    );

    let keywords = (kwRes.data?.results || []).map((r: any) => ({
      text: r.adGroupCriterion.keyword.text,
      matchType: r.adGroupCriterion.keyword.matchType || "BROAD"
    }));

    // If campaign currently has no enabled search keywords, use campaign name keywords as seed
    let notice: string | undefined;
    if (keywords.length === 0) {
      keywords = [
        { text: campaignData.name.toLowerCase(), matchType: "BROAD" }
      ];
      notice = "No enabled keywords were found for this campaign. Baseline forecast generated using campaign context.";
    }

    // 5. Construct Bidding Strategy for CampaignToForecast
    // In v24, manualCpcBiddingStrategy, maximizeClicksBiddingStrategy, or maximizeConversionsBiddingStrategy
    const biddingType = campaignData.biddingStrategyType || "MANUAL_CPC";
    let biddingStrategy: any;

    if (biddingType.includes("CONVERSION") || biddingType === "TARGET_CPA") {
      const targetCpaMicros = campaignData.targetCpa?.targetCpaMicros || "50000000"; // 50 units
      biddingStrategy = {
        maximizeConversionsBiddingStrategy: {
          targetCpaMicros: String(targetCpaMicros)
        }
      };
    } else if (biddingType.includes("SPEND") || biddingType.includes("CLICK")) {
      biddingStrategy = {
        maximizeClicksBiddingStrategy: {
          dailyTargetSpendMicros: String(Math.round((customDailyBudget || currentDailyBudget || 100) * 1_000_000))
        }
      };
    } else {
      biddingStrategy = {
        manualCpcBiddingStrategy: {
          maxCpcBidMicros: "10000000" // 10 currency units
        }
      };
    }

    // 6. Execute generateKeywordForecastMetrics on Google Ads API v24
    const forecastPayload = {
      customerId: cleanCid,
      currencyCode,
      forecastPeriod: {
        startDate,
        endDate
      },
      campaign: {
        biddingStrategy,
        geoTargetConstants: geoTargets,
        languageConstants: languages,
        adGroups: [
          {
            keywords
          }
        ]
      }
    };

    try {
      const forecastEndpoint = `${this.ADS_BASE}/customers/${cleanCid}:generateKeywordForecastMetrics`;
      const forecastRes = await axios.post(forecastEndpoint, forecastPayload, { headers });

      const rawMetrics = forecastRes.data?.campaignForecastMetrics || {};

      const clicks = rawMetrics.clicks !== undefined ? Math.round(rawMetrics.clicks) : undefined;
      const costMicros = rawMetrics.costMicros ? Number(rawMetrics.costMicros) : undefined;
      const cost = costMicros !== undefined ? Number((costMicros / 1_000_000).toFixed(2)) : undefined;

      const avgCpcMicros = rawMetrics.averageCpcMicros ? Number(rawMetrics.averageCpcMicros) : undefined;
      const averageCpc = avgCpcMicros !== undefined ? Number((avgCpcMicros / 1_000_000).toFixed(2)) : undefined;

      const conversions = rawMetrics.conversions !== undefined ? Number(rawMetrics.conversions.toFixed(1)) : undefined;
      const avgCpaMicros = rawMetrics.averageCpaMicros ? Number(rawMetrics.averageCpaMicros) : undefined;
      const averageCpa = avgCpaMicros !== undefined ? Number((avgCpaMicros / 1_000_000).toFixed(2)) : undefined;

      return {
        success: true,
        campaignId,
        campaignName: campaignData.name,
        currencyCode,
        forecastPeriod: {
          startDate,
          endDate
        },
        current: {
          dailyBudget: currentDailyBudget,
          biddingStrategyType: campaignData.biddingStrategyType || "UNKNOWN",
          advertisingChannelType: campaignData.advertisingChannelType || "SEARCH",
          status: campaignData.status || "ENABLED",
          keywordCount: keywords.length
        },
        forecast: {
          clicks,
          cost,
          averageCpc,
          conversions,
          averageCpa
        },
        rawGoogleAdsForecastMetrics: rawMetrics,
        targetingUsed: {
          languages,
          geoTargets,
          keywordsCount: keywords.length
        },
        notice
      };
    } catch (err: any) {
      const gError = err.response?.data?.error;
      const detailMessage = gError?.details?.[0]?.errors?.[0]?.message || gError?.message || err.message;
      console.error("[GoogleAdsPerformancePlannerService] Forecast error:", JSON.stringify(err.response?.data || err.message, null, 2));
      throw new Error(`Google Ads Performance Planner forecast error: ${detailMessage}`);
    }
  }
}
