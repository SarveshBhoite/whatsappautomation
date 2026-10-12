import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface ConversionActionAttributionItem {
  id: string;
  name: string;
  type: string;
  category: string;
  status: string;
  origin: string;
  countingType: string;
  clickThroughLookbackWindowDays: number;
  viewThroughLookbackWindowDays: number;
  attributionModel: string; // e.g. GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN, GOOGLE_ADS_LAST_CLICK
  dataDrivenModelStatus: string; // e.g. AVAILABLE, NEVER_GENERATED, ELIGIBLE
}

export interface CampaignAttributionMetricItem {
  campaignId: string;
  campaignName: string;
  conversionActionName: string;
  conversions: number;
  conversionsValue: number;
  allConversions: number;
  allConversionsValue: number;
}

export interface ConversionAttributionOverview {
  customer: {
    id: string;
    descriptiveName?: string;
    currencyCode: string;
  };
  summary: {
    totalActions: number;
    dataDrivenActionsCount: number;
    lastClickActionsCount: number;
    otherModelActionsCount: number;
  };
  attributionModelCatalog: {
    model: string;
    label: string;
    description: string;
    isRecommended: boolean;
  }[];
  conversionActions: ConversionActionAttributionItem[];
  campaignPerformance: CampaignAttributionMetricItem[];
}

export class GoogleAdsAttributionService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Fetches customer conversion actions with official attribution models,
   * lookback windows, data-driven status, and campaign performance breakdown.
   */
  public static async getAttributionOverview(
    organizationId: string,
    customerId: string,
    dateRange: string = "LAST_30_DAYS"
  ): Promise<ConversionAttributionOverview> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cleanCid);

    // 1. Fetch customer info & currency
    const customerRes = await axios.post(
      `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
      {
        query: `
          SELECT
            customer.id,
            customer.descriptive_name,
            customer.currency_code
          FROM customer
          LIMIT 1
        `
      },
      { headers }
    );
    const customer = customerRes.data?.results?.[0]?.customer;
    const currencyCode = customer?.currencyCode || "INR";

    // 2. Fetch conversion actions with official attribution_model_settings
    const actionsRes = await axios.post(
      `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
      {
        query: `
          SELECT
            conversion_action.id,
            conversion_action.name,
            conversion_action.type,
            conversion_action.status,
            conversion_action.category,
            conversion_action.origin,
            conversion_action.counting_type,
            conversion_action.click_through_lookback_window_days,
            conversion_action.view_through_lookback_window_days,
            conversion_action.attribution_model_settings.attribution_model,
            conversion_action.attribution_model_settings.data_driven_model_status
          FROM conversion_action
          WHERE conversion_action.status != 'REMOVED'
          ORDER BY conversion_action.name ASC
        `
      },
      { headers }
    );

    const conversionActions: ConversionActionAttributionItem[] = (actionsRes.data?.results || []).map(
      (r: any) => {
        const a = r.conversionAction;
        return {
          id: String(a.id),
          name: a.name || `Action ${a.id}`,
          type: a.type || "UNKNOWN",
          category: a.category || "DEFAULT",
          status: a.status || "ENABLED",
          origin: a.origin || "WEBSITE",
          countingType: a.countingType || "ONE_PER_CLICK",
          clickThroughLookbackWindowDays: Number(a.clickThroughLookbackWindowDays || 30),
          viewThroughLookbackWindowDays: Number(a.viewThroughLookbackWindowDays || 1),
          attributionModel: a.attributionModelSettings?.attributionModel || "GOOGLE_ADS_LAST_CLICK",
          dataDrivenModelStatus: a.attributionModelSettings?.dataDrivenModelStatus || "NEVER_GENERATED"
        };
      }
    );

    // 3. Compute attribution summary
    let ddaCount = 0;
    let lastClickCount = 0;
    let otherCount = 0;
    for (const a of conversionActions) {
      if (a.attributionModel.includes("DATA_DRIVEN")) {
        ddaCount++;
      } else if (a.attributionModel.includes("LAST_CLICK")) {
        lastClickCount++;
      } else {
        otherCount++;
      }
    }

    // 4. Fetch campaign conversion breakdown segmented by conversion_action_name
    let campaignPerformance: CampaignAttributionMetricItem[] = [];
    try {
      const allowedDateRanges = ["TODAY", "YESTERDAY", "LAST_7_DAYS", "LAST_30_DAYS", "LAST_90_DAYS", "THIS_MONTH", "LAST_MONTH"];
      const resolvedDateRange = allowedDateRanges.includes(dateRange.toUpperCase())
        ? dateRange.toUpperCase()
        : "LAST_30_DAYS";

      const campRes = await axios.post(
        `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
        {
          query: `
            SELECT
              campaign.id,
              campaign.name,
              segments.conversion_action_name,
              metrics.conversions,
              metrics.conversions_value,
              metrics.all_conversions,
              metrics.all_conversions_value
            FROM campaign
            WHERE segments.date DURING ${resolvedDateRange}
          `
        },
        { headers }
      );

      campaignPerformance = (campRes.data?.results || []).map((row: any) => ({
        campaignId: String(row.campaign?.id),
        campaignName: row.campaign?.name || `Campaign ${row.campaign?.id}`,
        conversionActionName: row.segments?.conversionActionName || "Unknown Action",
        conversions: Number(row.metrics?.conversions || 0),
        conversionsValue: Number(row.metrics?.conversionsValue || 0),
        allConversions: Number(row.metrics?.allConversions || 0),
        allConversionsValue: Number(row.metrics?.allConversionsValue || 0)
      }));
    } catch {
      campaignPerformance = [];
    }

    return {
      customer: {
        id: cleanCid,
        descriptiveName: customer?.descriptiveName,
        currencyCode
      },
      summary: {
        totalActions: conversionActions.length,
        dataDrivenActionsCount: ddaCount,
        lastClickActionsCount: lastClickCount,
        otherModelActionsCount: otherCount
      },
      attributionModelCatalog: [
        {
          model: "GOOGLE_SEARCH_ATTRIBUTION_DATA_DRIVEN",
          label: "Data-Driven Attribution (DDA)",
          description:
            "Distributes credit for the conversion based on how people search for your business and interact with your ads. It uses account data to determine which ads, keywords, and campaigns have the greatest impact.",
          isRecommended: true
        },
        {
          model: "GOOGLE_ADS_LAST_CLICK",
          label: "Last Click Attribution",
          description:
            "Gives all credit for the conversion to the final ad interaction and corresponding keyword that was clicked immediately prior to the conversion.",
          isRecommended: false
        }
      ],
      conversionActions,
      campaignPerformance
    };
  }
}
