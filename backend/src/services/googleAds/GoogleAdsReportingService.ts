import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface AuctionInsightsFilters {
  dateRange?: string; // e.g. "LAST_30_DAYS", "LAST_7_DAYS", "TODAY", "YESTERDAY"
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string;   // "YYYY-MM-DD"
  campaignId?: string;
  adGroupId?: string;
  limit?: number;
}

export interface LandingPageFilters {
  dateRange?: string; // e.g. "LAST_30_DAYS", "LAST_7_DAYS", "TODAY", "YESTERDAY"
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  url?: string;
  limit?: number;
}

export interface LandingPageItem {
  url: string;
  campaigns: Array<{ id: string; name: string }>;
  clicks: number;
  impressions: number;
  ctr: string;
  cost: string;
  currencyCode: string;
  avgCpc: string;
  conversions: number;
  conversionValue: number;
  conversionRate: string;
}

export interface SearchTermsFilters {
  dateRange?: string; // e.g. "LAST_30_DAYS", "LAST_7_DAYS", "TODAY", "YESTERDAY"
  startDate?: string;
  endDate?: string;
  campaignId?: string;
  adGroupId?: string;
  searchTerm?: string;
  limit?: number;
}

export interface SearchTermItem {
  searchTerm: string;
  status: string; // ADDED, EXCLUDED, ADDED_EXCLUDED, NONE
  resourceName: string;
  campaignId: string;
  campaignName: string;
  campaignType: string;
  supportsKeywords: boolean;
  adGroupId?: string;
  adGroupName?: string;
  searchTermMatchType?: string;
  keywordText?: string;
  keywordMatchType?: string;
  impressions: number;
  clicks: number;
  ctr: string;
  cost: string;
  avgCpc: string;
  conversions: number;
  conversionValue: number;
  currencyCode: string;
}

export class GoogleAdsReportingService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. AUCTION INSIGHTS REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retrieves Auction Insights data from Google Ads API v24.
   * Handles METRIC_ACCESS_DENIED cleanly when developer token level does not have Auction Insights access.
   */
  public static async listAuctionInsights(
    organizationId: string,
    customerId: string,
    filters: AuctionInsightsFilters = {}
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const limit = filters.limit ? Math.min(filters.limit, 200) : 100;

    let dateClause = "segments.date DURING LAST_30_DAYS";
    if (filters.startDate && filters.endDate) {
      dateClause = `segments.date BETWEEN '${filters.startDate}' AND '${filters.endDate}'`;
    } else if (filters.dateRange) {
      dateClause = `segments.date DURING ${filters.dateRange}`;
    }

    let whereClause = `WHERE ${dateClause}`;
    if (filters.campaignId) {
      const cleanCampId = filters.campaignId.replace(/[^0-9]/g, "");
      if (cleanCampId) {
        whereClause += ` AND campaign.id = ${cleanCampId}`;
      }
    }

    const gaql = `
      SELECT
        segments.auction_insight_domain,
        metrics.auction_insight_search_impression_share,
        metrics.auction_insight_search_outranking_share,
        metrics.auction_insight_search_overlap_rate,
        metrics.auction_insight_search_position_above_rate,
        metrics.auction_insight_search_top_impression_percentage,
        metrics.auction_insight_search_absolute_top_impression_percentage,
        campaign.id,
        campaign.name
      FROM campaign
      ${whereClause}
      LIMIT ${limit}
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rows = res.data?.results || [];

      // Map and aggregate
      const domainMap = new Map<string, any>();

      for (const row of rows) {
        const domain = row.segments?.auctionInsightDomain;
        if (!domain) continue;

        const m = row.metrics || {};
        const camp = row.campaign || {};

        if (!domainMap.has(domain)) {
          domainMap.set(domain, {
            domain,
            campaignId: String(camp.id || ""),
            campaignName: camp.name || "",
            impressionShare: m.auctionInsightSearchImpressionShare !== undefined ? (Number(m.auctionInsightSearchImpressionShare) * 100).toFixed(2) + "%" : "—",
            overlapRate: m.auctionInsightSearchOverlapRate !== undefined ? (Number(m.auctionInsightSearchOverlapRate) * 100).toFixed(2) + "%" : "—",
            positionAboveRate: m.auctionInsightSearchPositionAboveRate !== undefined ? (Number(m.auctionInsightSearchPositionAboveRate) * 100).toFixed(2) + "%" : "—",
            topOfPageRate: m.auctionInsightSearchTopImpressionPercentage !== undefined ? (Number(m.auctionInsightSearchTopImpressionPercentage) * 100).toFixed(2) + "%" : "—",
            absTopOfPageRate: m.auctionInsightSearchAbsoluteTopImpressionPercentage !== undefined ? (Number(m.auctionInsightSearchAbsoluteTopImpressionPercentage) * 100).toFixed(2) + "%" : "—",
            outrankingShare: m.auctionInsightSearchOutrankingShare !== undefined ? (Number(m.auctionInsightSearchOutrankingShare) * 100).toFixed(2) + "%" : "—"
          });
        }
      }

      return {
        success: true,
        items: Array.from(domainMap.values()),
        total: domainMap.size
      };
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message;
      const errorCode = err?.response?.data?.error?.details?.[0]?.errors?.[0]?.errorCode?.authorizationError;

      if (errorCode === "METRIC_ACCESS_DENIED" || msg.includes("METRIC_ACCESS_DENIED") || msg.includes("does not have permission")) {
        return {
          success: true,
          items: [],
          total: 0,
          notice: "Auction Insights metric queries require Standard Access on the Google Ads Developer Token. When Basic or Test developer access is active, Google Ads restricts auction insight competitive metric streaming.",
          accessRestricted: true
        };
      }

      console.error("[GoogleAdsReportingService.listAuctionInsights] error:", err?.response?.data || err.message);
      throw new Error(`Google Ads Auction Insights error: ${msg}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. LANDING PAGE PERFORMANCE REPORT
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retrieves Landing Page Performance data from Google Ads API v24 (landing_page_view).
   */
  public static async listLandingPagePerformance(
    organizationId: string,
    customerId: string,
    filters: LandingPageFilters = {}
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const limit = filters.limit ? Math.min(filters.limit, 200) : 100;

    let dateClause = "segments.date DURING LAST_30_DAYS";
    if (filters.startDate && filters.endDate) {
      dateClause = `segments.date BETWEEN '${filters.startDate}' AND '${filters.endDate}'`;
    } else if (filters.dateRange) {
      dateClause = `segments.date DURING ${filters.dateRange}`;
    }

    let whereClause = `WHERE ${dateClause}`;
    if (filters.campaignId) {
      const cleanCampId = filters.campaignId.replace(/[^0-9]/g, "");
      if (cleanCampId) {
        whereClause += ` AND campaign.id = ${cleanCampId}`;
      }
    }

    // Also get customer currency
    let currencyCode = "INR";
    try {
      const custRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: "SELECT customer.currency_code FROM customer LIMIT 1" },
        { headers }
      );
      currencyCode = custRes.data?.results?.[0]?.customer?.currencyCode || "INR";
    } catch (e) {
      // Fallback
    }

    const gaql = `
      SELECT
        landing_page_view.unexpanded_final_url,
        campaign.id,
        campaign.name,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.conversions,
        metrics.conversions_value
      FROM landing_page_view
      ${whereClause}
      ORDER BY metrics.clicks DESC
      LIMIT ${limit}
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rows = res.data?.results || [];

      // Aggregate by landing page URL
      const pageMap = new Map<string, any>();

      for (const row of rows) {
        const url = row.landingPageView?.unexpandedFinalUrl;
        if (!url) continue;

        const m = row.metrics || {};
        const camp = row.campaign || {};

        const clicks = Number(m.clicks || 0);
        const impressions = Number(m.impressions || 0);
        const costMicros = Number(m.costMicros || 0);
        const conversions = Number(m.conversions || 0);
        const conversionValue = Number(m.conversionsValue || 0);

        if (!pageMap.has(url)) {
          pageMap.set(url, {
            url,
            campaigns: camp.name ? [{ id: String(camp.id), name: camp.name }] : [],
            clicks,
            impressions,
            costMicros,
            conversions,
            conversionValue,
            currencyCode
          });
        } else {
          const entry = pageMap.get(url);
          entry.clicks += clicks;
          entry.impressions += impressions;
          entry.costMicros += costMicros;
          entry.conversions += conversions;
          entry.conversionValue += conversionValue;
          if (camp.name && !entry.campaigns.some((c: any) => c.id === String(camp.id))) {
            entry.campaigns.push({ id: String(camp.id), name: camp.name });
          }
        }
      }

      // Format records
      let records = Array.from(pageMap.values()).map((p: any) => {
        const cost = p.costMicros / 1_000_000;
        const ctr = p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0;
        const avgCpc = p.clicks > 0 ? cost / p.clicks : 0;
        const convRate = p.clicks > 0 ? (p.conversions / p.clicks) * 100 : 0;

        return {
          url: p.url,
          campaigns: p.campaigns,
          clicks: p.clicks,
          impressions: p.impressions,
          ctr: `${ctr.toFixed(2)}%`,
          cost: cost.toFixed(2),
          currencyCode: p.currencyCode,
          avgCpc: avgCpc.toFixed(2),
          conversions: Number(p.conversions.toFixed(1)),
          conversionValue: Number(p.conversionValue.toFixed(2)),
          conversionRate: `${convRate.toFixed(2)}%`
        };
      });

      if (filters.url && filters.url.trim()) {
        const search = filters.url.toLowerCase().trim();
        records = records.filter(r => r.url.toLowerCase().includes(search));
      }

      return {
        success: true,
        currencyCode,
        items: records,
        total: records.length
      };
    } catch (err: any) {
      console.error("[GoogleAdsReportingService.listLandingPagePerformance] error:", err?.response?.data || err.message);
      throw new Error(`Google Ads Landing Page reporting error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SEARCH TERMS MANAGEMENT REPORT (search_term_view)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retrieves live Search Terms Performance from Google Ads API v24 (search_term_view).
   * Includes keyword info, match types, status (ADDED, EXCLUDED, NONE), and core performance metrics.
   */
  public static async listSearchTerms(
    organizationId: string,
    customerId: string,
    filters: SearchTermsFilters = {}
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const limit = filters.limit ? Math.min(filters.limit, 500) : 200;

    let dateClause = "segments.date DURING LAST_30_DAYS";
    if (filters.startDate && filters.endDate) {
      dateClause = `segments.date BETWEEN '${filters.startDate}' AND '${filters.endDate}'`;
    } else if (filters.dateRange) {
      dateClause = `segments.date DURING ${filters.dateRange}`;
    }

    let whereConditions = [dateClause];

    if (filters.campaignId) {
      const cleanCampId = filters.campaignId.replace(/[^0-9]/g, "");
      if (cleanCampId) {
        whereConditions.push(`campaign.id = ${cleanCampId}`);
      }
    }

    if (filters.adGroupId) {
      const cleanAgId = filters.adGroupId.replace(/[^0-9]/g, "");
      if (cleanAgId) {
        whereConditions.push(`ad_group.id = ${cleanAgId}`);
      }
    }

    const whereClause = `WHERE ${whereConditions.join(" AND ")}`;

    // Currency query
    let currencyCode = "INR";
    try {
      const custRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: "SELECT customer.currency_code FROM customer LIMIT 1" },
        { headers }
      );
      currencyCode = custRes.data?.results?.[0]?.customer?.currencyCode || "INR";
    } catch (e) {
      // Fallback
    }

    const gaql = `
      SELECT
        search_term_view.search_term,
        search_term_view.status,
        search_term_view.resource_name,
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type,
        ad_group.id,
        ad_group.name,
        segments.search_term_match_type,
        segments.keyword.info.text,
        segments.keyword.info.match_type,
        metrics.impressions,
        metrics.clicks,
        metrics.ctr,
        metrics.cost_micros,
        metrics.average_cpc,
        metrics.conversions,
        metrics.conversions_value
      FROM search_term_view
      ${whereClause}
      ORDER BY metrics.impressions DESC
      LIMIT ${limit}
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rows = res.data?.results || [];

      const items: SearchTermItem[] = rows.map((r: any) => {
        const st = r.searchTermView || {};
        const camp = r.campaign || {};
        const ag = r.adGroup || {};
        const seg = r.segments || {};
        const m = r.metrics || {};

        const impressions = Number(m.impressions || 0);
        const clicks = Number(m.clicks || 0);
        const costMicros = Number(m.costMicros || 0);
        const cost = (costMicros / 1_000_000).toFixed(2);
        const ctr = m.ctr !== undefined ? (Number(m.ctr) * 100).toFixed(2) + "%" : (impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + "%" : "0.00%");
        const avgCpc = m.averageCpc ? (Number(m.averageCpc) / 1_000_000).toFixed(2) : (clicks > 0 ? (Number(cost) / clicks).toFixed(2) : "0.00");
        const conversions = Number(Number(m.conversions || 0).toFixed(1));
        const conversionValue = Number(Number(m.conversionsValue || 0).toFixed(2));

        const channelType = String(camp.advertisingChannelType || "");
        const supportsKeywords = channelType === "SEARCH" || channelType === "DISPLAY";

        return {
          searchTerm: st.searchTerm || "",
          status: st.status || "NONE",
          resourceName: st.resourceName || "",
          campaignId: String(camp.id || ""),
          campaignName: camp.name || "",
          campaignType: channelType,
          supportsKeywords,
          adGroupId: ag.id ? String(ag.id) : undefined,
          adGroupName: ag.name || undefined,
          searchTermMatchType: seg.searchTermMatchType || undefined,
          keywordText: seg.keyword?.info?.text || undefined,
          keywordMatchType: seg.keyword?.info?.matchType || undefined,
          impressions,
          clicks,
          ctr,
          cost,
          avgCpc,
          conversions,
          conversionValue,
          currencyCode
        };
      });

      return {
        success: true,
        currencyCode,
        items,
        total: items.length
      };
    } catch (err: any) {
      console.error("[GoogleAdsReportingService.listSearchTerms] error:", err?.response?.data || err.message);
      throw new Error(`Google Ads Search Terms reporting error: ${err?.response?.data?.error?.message || err.message}`);
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. CUSTOM REPORT EDITOR (DYNAMIC ALLOWLIST-BASED GAQL BUILDER)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Safe Allowlist of Report Resources, Dimensions, and Metrics.
   * Prevents arbitrary GAQL injection while providing flexible reporting across
   * campaign, ad_group, keyword_view, search_term_view, and landing_page_view.
   */
  public static readonly ALLOWED_RESOURCES: Record<
    string,
    {
      label: string;
      gaqlFrom: string;
      allowedDimensions: Record<string, { label: string; gaqlField: string; jsonPath: string[] }>;
      allowedMetrics: Record<string, { label: string; gaqlField: string; jsonPath: string[]; type: "number" | "currency" | "percent" | "micros" }>;
      defaultDimensions: string[];
      defaultMetrics: string[];
      supportsCampaignFilter: boolean;
      campaignFilterField: string;
    }
  > = {
    campaign: {
      label: "Campaign Performance",
      gaqlFrom: "campaign",
      allowedDimensions: {
        campaign_id: { label: "Campaign ID", gaqlField: "campaign.id", jsonPath: ["campaign", "id"] },
        campaign_name: { label: "Campaign Name", gaqlField: "campaign.name", jsonPath: ["campaign", "name"] },
        campaign_status: { label: "Status", gaqlField: "campaign.status", jsonPath: ["campaign", "status"] },
        advertising_channel_type: { label: "Channel Type", gaqlField: "campaign.advertising_channel_type", jsonPath: ["campaign", "advertisingChannelType"] },
        bidding_strategy_type: { label: "Bidding Strategy", gaqlField: "campaign.bidding_strategy_type", jsonPath: ["campaign", "biddingStrategyType"] }
      },
      allowedMetrics: {
        impressions: { label: "Impressions", gaqlField: "metrics.impressions", jsonPath: ["metrics", "impressions"], type: "number" },
        clicks: { label: "Clicks", gaqlField: "metrics.clicks", jsonPath: ["metrics", "clicks"], type: "number" },
        ctr: { label: "CTR", gaqlField: "metrics.ctr", jsonPath: ["metrics", "ctr"], type: "percent" },
        cost: { label: "Cost", gaqlField: "metrics.cost_micros", jsonPath: ["metrics", "costMicros"], type: "micros" },
        average_cpc: { label: "Avg. CPC", gaqlField: "metrics.average_cpc", jsonPath: ["metrics", "averageCpc"], type: "micros" },
        conversions: { label: "Conversions", gaqlField: "metrics.conversions", jsonPath: ["metrics", "conversions"], type: "number" },
        conversions_value: { label: "Conv. Value", gaqlField: "metrics.conversions_value", jsonPath: ["metrics", "conversionsValue"], type: "currency" }
      },
      defaultDimensions: ["campaign_name", "campaign_status", "advertising_channel_type"],
      defaultMetrics: ["impressions", "clicks", "ctr", "cost", "average_cpc", "conversions"],
      supportsCampaignFilter: true,
      campaignFilterField: "campaign.id"
    },
    ad_group: {
      label: "Ad Group Performance",
      gaqlFrom: "ad_group",
      allowedDimensions: {
        ad_group_id: { label: "Ad Group ID", gaqlField: "ad_group.id", jsonPath: ["adGroup", "id"] },
        ad_group_name: { label: "Ad Group Name", gaqlField: "ad_group.name", jsonPath: ["adGroup", "name"] },
        ad_group_status: { label: "Status", gaqlField: "ad_group.status", jsonPath: ["adGroup", "status"] },
        ad_group_type: { label: "Ad Group Type", gaqlField: "ad_group.type", jsonPath: ["adGroup", "type"] },
        campaign_id: { label: "Campaign ID", gaqlField: "campaign.id", jsonPath: ["campaign", "id"] },
        campaign_name: { label: "Campaign Name", gaqlField: "campaign.name", jsonPath: ["campaign", "name"] }
      },
      allowedMetrics: {
        impressions: { label: "Impressions", gaqlField: "metrics.impressions", jsonPath: ["metrics", "impressions"], type: "number" },
        clicks: { label: "Clicks", gaqlField: "metrics.clicks", jsonPath: ["metrics", "clicks"], type: "number" },
        ctr: { label: "CTR", gaqlField: "metrics.ctr", jsonPath: ["metrics", "ctr"], type: "percent" },
        cost: { label: "Cost", gaqlField: "metrics.cost_micros", jsonPath: ["metrics", "costMicros"], type: "micros" },
        average_cpc: { label: "Avg. CPC", gaqlField: "metrics.average_cpc", jsonPath: ["metrics", "averageCpc"], type: "micros" },
        conversions: { label: "Conversions", gaqlField: "metrics.conversions", jsonPath: ["metrics", "conversions"], type: "number" },
        conversions_value: { label: "Conv. Value", gaqlField: "metrics.conversions_value", jsonPath: ["metrics", "conversionsValue"], type: "currency" }
      },
      defaultDimensions: ["campaign_name", "ad_group_name", "ad_group_status"],
      defaultMetrics: ["impressions", "clicks", "ctr", "cost", "average_cpc", "conversions"],
      supportsCampaignFilter: true,
      campaignFilterField: "campaign.id"
    },
    keyword_view: {
      label: "Keyword Performance",
      gaqlFrom: "keyword_view",
      allowedDimensions: {
        keyword_text: { label: "Keyword", gaqlField: "ad_group_criterion.keyword.text", jsonPath: ["adGroupCriterion", "keyword", "text"] },
        match_type: { label: "Match Type", gaqlField: "ad_group_criterion.keyword.match_type", jsonPath: ["adGroupCriterion", "keyword", "matchType"] },
        criterion_status: { label: "Status", gaqlField: "ad_group_criterion.status", jsonPath: ["adGroupCriterion", "status"] },
        campaign_id: { label: "Campaign ID", gaqlField: "campaign.id", jsonPath: ["campaign", "id"] },
        campaign_name: { label: "Campaign Name", gaqlField: "campaign.name", jsonPath: ["campaign", "name"] },
        ad_group_name: { label: "Ad Group Name", gaqlField: "ad_group.name", jsonPath: ["adGroup", "name"] }
      },
      allowedMetrics: {
        impressions: { label: "Impressions", gaqlField: "metrics.impressions", jsonPath: ["metrics", "impressions"], type: "number" },
        clicks: { label: "Clicks", gaqlField: "metrics.clicks", jsonPath: ["metrics", "clicks"], type: "number" },
        ctr: { label: "CTR", gaqlField: "metrics.ctr", jsonPath: ["metrics", "ctr"], type: "percent" },
        cost: { label: "Cost", gaqlField: "metrics.cost_micros", jsonPath: ["metrics", "costMicros"], type: "micros" },
        average_cpc: { label: "Avg. CPC", gaqlField: "metrics.average_cpc", jsonPath: ["metrics", "averageCpc"], type: "micros" },
        conversions: { label: "Conversions", gaqlField: "metrics.conversions", jsonPath: ["metrics", "conversions"], type: "number" },
        conversions_value: { label: "Conv. Value", gaqlField: "metrics.conversions_value", jsonPath: ["metrics", "conversionsValue"], type: "currency" }
      },
      defaultDimensions: ["keyword_text", "match_type", "campaign_name", "criterion_status"],
      defaultMetrics: ["impressions", "clicks", "ctr", "cost", "average_cpc", "conversions"],
      supportsCampaignFilter: true,
      campaignFilterField: "campaign.id"
    },
    search_term_view: {
      label: "Search Term Performance",
      gaqlFrom: "search_term_view",
      allowedDimensions: {
        search_term: { label: "Search Term", gaqlField: "search_term_view.search_term", jsonPath: ["searchTermView", "searchTerm"] },
        search_term_status: { label: "Status", gaqlField: "search_term_view.status", jsonPath: ["searchTermView", "status"] },
        campaign_id: { label: "Campaign ID", gaqlField: "campaign.id", jsonPath: ["campaign", "id"] },
        campaign_name: { label: "Campaign Name", gaqlField: "campaign.name", jsonPath: ["campaign", "name"] },
        ad_group_name: { label: "Ad Group Name", gaqlField: "ad_group.name", jsonPath: ["adGroup", "name"] }
      },
      allowedMetrics: {
        impressions: { label: "Impressions", gaqlField: "metrics.impressions", jsonPath: ["metrics", "impressions"], type: "number" },
        clicks: { label: "Clicks", gaqlField: "metrics.clicks", jsonPath: ["metrics", "clicks"], type: "number" },
        ctr: { label: "CTR", gaqlField: "metrics.ctr", jsonPath: ["metrics", "ctr"], type: "percent" },
        cost: { label: "Cost", gaqlField: "metrics.cost_micros", jsonPath: ["metrics", "costMicros"], type: "micros" },
        average_cpc: { label: "Avg. CPC", gaqlField: "metrics.average_cpc", jsonPath: ["metrics", "averageCpc"], type: "micros" },
        conversions: { label: "Conversions", gaqlField: "metrics.conversions", jsonPath: ["metrics", "conversions"], type: "number" },
        conversions_value: { label: "Conv. Value", gaqlField: "metrics.conversions_value", jsonPath: ["metrics", "conversionsValue"], type: "currency" }
      },
      defaultDimensions: ["search_term", "search_term_status", "campaign_name"],
      defaultMetrics: ["impressions", "clicks", "ctr", "cost", "average_cpc", "conversions"],
      supportsCampaignFilter: true,
      campaignFilterField: "campaign.id"
    },
    landing_page_view: {
      label: "Landing Page Performance",
      gaqlFrom: "landing_page_view",
      allowedDimensions: {
        landing_page_url: { label: "Landing Page URL", gaqlField: "landing_page_view.unexpanded_final_url", jsonPath: ["landingPageView", "unexpandedFinalUrl"] },
        campaign_id: { label: "Campaign ID", gaqlField: "campaign.id", jsonPath: ["campaign", "id"] },
        campaign_name: { label: "Campaign Name", gaqlField: "campaign.name", jsonPath: ["campaign", "name"] }
      },
      allowedMetrics: {
        impressions: { label: "Impressions", gaqlField: "metrics.impressions", jsonPath: ["metrics", "impressions"], type: "number" },
        clicks: { label: "Clicks", gaqlField: "metrics.clicks", jsonPath: ["metrics", "clicks"], type: "number" },
        ctr: { label: "CTR", gaqlField: "metrics.ctr", jsonPath: ["metrics", "ctr"], type: "percent" },
        cost: { label: "Cost", gaqlField: "metrics.cost_micros", jsonPath: ["metrics", "costMicros"], type: "micros" },
        average_cpc: { label: "Avg. CPC", gaqlField: "metrics.average_cpc", jsonPath: ["metrics", "averageCpc"], type: "micros" },
        conversions: { label: "Conversions", gaqlField: "metrics.conversions", jsonPath: ["metrics", "conversions"], type: "number" },
        conversions_value: { label: "Conv. Value", gaqlField: "metrics.conversions_value", jsonPath: ["metrics", "conversionsValue"], type: "currency" }
      },
      defaultDimensions: ["landing_page_url", "campaign_name"],
      defaultMetrics: ["impressions", "clicks", "ctr", "cost", "average_cpc", "conversions"],
      supportsCampaignFilter: true,
      campaignFilterField: "campaign.id"
    }
  };

  /**
   * Returns metadata and available schema for Custom Report Editor.
   */
  public static getCustomReportMetadata() {
    const resources = Object.entries(this.ALLOWED_RESOURCES).map(([key, res]) => ({
      key,
      label: res.label,
      dimensions: Object.entries(res.allowedDimensions).map(([dKey, dVal]) => ({
        key: dKey,
        label: dVal.label
      })),
      metrics: Object.entries(res.allowedMetrics).map(([mKey, mVal]) => ({
        key: mKey,
        label: mVal.label,
        type: mVal.type
      })),
      defaultDimensions: res.defaultDimensions,
      defaultMetrics: res.defaultMetrics,
      supportsCampaignFilter: res.supportsCampaignFilter
    }));

    return { success: true, resources };
  }

  /**
   * Helper to retrieve value safely from deeply nested JSON object.
   */
  private static extractPath(obj: any, path: string[]): any {
    let curr = obj;
    for (const seg of path) {
      if (!curr || typeof curr !== "object") return undefined;
      curr = curr[seg];
    }
    return curr;
  }

  /**
   * Builds and executes a custom Google Ads report against API v24 using validated allowlists.
   */
  public static async generateCustomReport(
    organizationId: string,
    customerId: string,
    params: {
      resource: string;
      dimensions?: string[];
      metrics?: string[];
      campaignId?: string;
      dateRange?: string;
      startDate?: string;
      endDate?: string;
      searchQuery?: string;
      limit?: number;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const resourceKey = (params.resource || "campaign").trim().toLowerCase();

    const resourceConfig = this.ALLOWED_RESOURCES[resourceKey];
    if (!resourceConfig) {
      const validResources = Object.keys(this.ALLOWED_RESOURCES).join(", ");
      throw new Error(`Unsupported report resource '${params.resource}'. Supported resources: ${validResources}`);
    }

    // Validate Dimensions
    const requestedDims = (params.dimensions && params.dimensions.length > 0)
      ? params.dimensions
      : resourceConfig.defaultDimensions;

    for (const d of requestedDims) {
      if (!resourceConfig.allowedDimensions[d]) {
        throw new Error(
          `Invalid dimension '${d}' for resource '${resourceKey}'. Allowed: ${Object.keys(resourceConfig.allowedDimensions).join(", ")}`
        );
      }
    }

    // Validate Metrics
    const requestedMetrics = (params.metrics && params.metrics.length > 0)
      ? params.metrics
      : resourceConfig.defaultMetrics;

    for (const m of requestedMetrics) {
      if (!resourceConfig.allowedMetrics[m]) {
        throw new Error(
          `Invalid metric '${m}' for resource '${resourceKey}'. Allowed: ${Object.keys(resourceConfig.allowedMetrics).join(", ")}`
        );
      }
    }

    // Select Fields
    const selectFields: string[] = [];
    const columns: Array<{ key: string; label: string; type: "dimension" | "metric"; format?: string }> = [];

    // Add Dimensions
    for (const d of requestedDims) {
      const dim = resourceConfig.allowedDimensions[d];
      if (!selectFields.includes(dim.gaqlField)) {
        selectFields.push(dim.gaqlField);
      }
      columns.push({
        key: d,
        label: dim.label,
        type: "dimension"
      });
    }

    // Add Metrics
    for (const m of requestedMetrics) {
      const met = resourceConfig.allowedMetrics[m];
      if (!selectFields.includes(met.gaqlField)) {
        selectFields.push(met.gaqlField);
      }
      columns.push({
        key: m,
        label: met.label,
        type: "metric",
        format: met.type
      });
    }

    // Build Date Clause
    let dateClause = "segments.date DURING LAST_30_DAYS";
    if (params.startDate && params.endDate) {
      dateClause = `segments.date BETWEEN '${params.startDate}' AND '${params.endDate}'`;
    } else if (params.dateRange) {
      dateClause = `segments.date DURING ${params.dateRange}`;
    }

    // Build Where Clause
    const whereParts: string[] = [dateClause];

    if (params.campaignId && resourceConfig.supportsCampaignFilter) {
      const cleanCampId = params.campaignId.replace(/[^0-9]/g, "");
      if (cleanCampId) {
        whereParts.push(`${resourceConfig.campaignFilterField} = ${cleanCampId}`);
      }
    }

    // For campaign & ad_group, filter out REMOVED to keep reports actionable
    if (resourceKey === "campaign") {
      whereParts.push("campaign.status != 'REMOVED'");
    } else if (resourceKey === "ad_group") {
      whereParts.push("ad_group.status != 'REMOVED'");
    }

    const whereClause = `WHERE ${whereParts.join(" AND ")}`;
    const limit = params.limit ? Math.min(params.limit, 500) : 100;

    // Order by primary metric if requested, default to clicks/impressions
    let orderClause = "";
    if (requestedMetrics.includes("clicks")) {
      orderClause = "ORDER BY metrics.clicks DESC";
    } else if (requestedMetrics.includes("impressions")) {
      orderClause = "ORDER BY metrics.impressions DESC";
    }

    const gaql = `
      SELECT
        ${selectFields.join(",\n        ")}
      FROM ${resourceConfig.gaqlFrom}
      ${whereClause}
      ${orderClause}
      LIMIT ${limit}
    `;

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // Resolve Customer Currency dynamically
    let currencyCode = "INR";
    try {
      const custRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: "SELECT customer.currency_code FROM customer LIMIT 1" },
        { headers }
      );
      currencyCode = custRes.data?.results?.[0]?.customer?.currencyCode || "INR";
    } catch {
      // Fallback
    }

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: gaql },
        { headers }
      );

      const rawRows = res.data?.results || [];

      // Map rows to dynamic columns
      let rows: Array<Record<string, any>> = rawRows.map((r: any) => {
        const rowData: Record<string, any> = {};

        for (const d of requestedDims) {
          const dim = resourceConfig.allowedDimensions[d];
          const val = this.extractPath(r, dim.jsonPath);
          rowData[d] = val !== undefined && val !== null ? String(val) : "—";
        }

        for (const m of requestedMetrics) {
          const met = resourceConfig.allowedMetrics[m];
          const rawVal = this.extractPath(r, met.jsonPath);
          const num = Number(rawVal || 0);

          if (met.type === "micros") {
            rowData[m] = (num / 1_000_000).toFixed(2);
          } else if (met.type === "percent") {
            rowData[m] = `${(num * 100).toFixed(2)}%`;
          } else if (met.type === "currency") {
            rowData[m] = num.toFixed(2);
          } else {
            rowData[m] = num;
          }
        }

        return rowData;
      });

      // Client search query filter
      if (params.searchQuery && params.searchQuery.trim()) {
        const q = params.searchQuery.toLowerCase().trim();
        rows = rows.filter(row =>
          requestedDims.some(d => String(row[d] || "").toLowerCase().includes(q))
        );
      }

      return {
        success: true,
        resource: resourceKey,
        resourceLabel: resourceConfig.label,
        currencyCode,
        columns,
        rows,
        total: rows.length,
        appliedFilters: {
          resource: resourceKey,
          dimensions: requestedDims,
          metrics: requestedMetrics,
          campaignId: params.campaignId || null,
          dateRange: params.dateRange || (params.startDate && params.endDate ? "CUSTOM" : "LAST_30_DAYS"),
          startDate: params.startDate || null,
          endDate: params.endDate || null,
          limit
        }
      };
    } catch (err: any) {
      console.error("[GoogleAdsReportingService.generateCustomReport] error:", err?.response?.data || err.message);
      const msg = err?.response?.data?.error?.message || err.message;
      throw new Error(`Google Ads Custom Report error: ${msg}`);
    }
  }
}

