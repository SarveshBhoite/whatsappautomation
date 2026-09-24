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
  limit?: number;
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
      const records = Array.from(pageMap.values()).map((p: any) => {
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
}

