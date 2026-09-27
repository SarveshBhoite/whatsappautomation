import { GoogleAdsKeywordPlannerService } from "../GoogleAdsKeywordPlannerService";
import { GoogleAdsKeywordTargetingService } from "../GoogleAdsKeywordTargetingService";
import { GoogleAdsReportingService } from "../GoogleAdsReportingService";
import { GoogleAdsSharedSetService } from "../GoogleAdsSharedSetService";
import { validateCustomerOwnership } from "../../../utils/customerOwnership";
import { KeywordIntelligenceItem, SharedNegativeSetSummary } from "../shared/CampaignPlan";
import axios from "axios";
import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";

export interface KeywordIntelligenceResult {
  campaignType: string;
  supportsKeywords: boolean;
  message?: string;
  currencyCode: string;
  keywordIntelligence: KeywordIntelligenceItem[];
  availableSharedNegativeLists: SharedNegativeSetSummary[];
  existingAccountKeywordsSummary: {
    totalActiveKeywords: number;
    duplicateKeywordsFound: number;
  };
  searchTermsAnalyzed: number;
  plannerStatus: "SUCCESS" | "UNAVAILABLE" | "SKIPPED";
}

export interface GatherKeywordIntelligenceOptions {
  queryKeywords?: string[];
  url?: string;
  businessName?: string;
  productsServices?: string[];
  locations?: string[];
  language?: string;
}

export class GoogleAdsKeywordIntelligenceService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Reads all existing keywords across all campaigns for a customer to detect
   * duplicates, match types, and existing campaign references.
   */
  public static async getCustomerAccountKeywords(
    organizationId: string,
    customerId: string
  ): Promise<KeywordIntelligenceItem[]> {
    const cid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(organizationId, cid);
    if (!isOwned) {
      throw new Error("Access denied. Customer ID does not belong to this organization.");
    }

    try {
      const { headers } = await GoogleAdsBaseService.getAdsHeaders(organizationId, cid);
      const query = `
        SELECT
          ad_group_criterion.resource_name,
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.negative,
          campaign.id,
          campaign.name
        FROM ad_group_criterion
        WHERE ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.status != 'REMOVED'
        ORDER BY ad_group_criterion.status ASC
        LIMIT 100
      `;

      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query },
        { headers }
      );

      const items: KeywordIntelligenceItem[] = [];
      for (const row of res.data?.results || []) {
        const c = row.adGroupCriterion;
        if (!c?.keyword?.text) continue;

        items.push({
          keyword: c.keyword.text,
          matchType: (c.keyword.matchType as any) || "BROAD",
          source: "EXISTING_ACCOUNT",
          existingCampaignName: row.campaign?.name || `Campaign #${row.campaign?.id}`,
          existingStatus: c.status || "ENABLED",
          isNegative: Boolean(c.negative),
          approved: false
        });
      }

      return items;
    } catch (err: any) {
      console.warn("[GoogleAdsKeywordIntelligenceService] Could not fetch existing account keywords:", err.message);
      return [];
    }
  }

  /**
   * Reads search terms performance to surface high-converting or relevant historical queries.
   */
  public static async getHistoricalSearchTermCandidates(
    organizationId: string,
    customerId: string
  ): Promise<KeywordIntelligenceItem[]> {
    const cid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(organizationId, cid);
    if (!isOwned) {
      throw new Error("Access denied. Customer ID does not belong to this organization.");
    }

    try {
      const searchTermsResult = await GoogleAdsReportingService.listSearchTerms(organizationId, cid, {
        limit: 25
      });

      const items: KeywordIntelligenceItem[] = [];
      const rows = searchTermsResult.searchTerms || [];

      for (const row of rows) {
        if (!row.searchTerm || row.searchTerm.length < 2) continue;
        items.push({
          keyword: row.searchTerm,
          matchType: (row.matchType as any) || "BROAD",
          source: "SEARCH_TERM",
          searchVolume: row.metrics?.impressions ? Number(row.metrics.impressions) : undefined,
          lowTopOfPageBid: row.metrics?.avgCpc ? Number(row.metrics.avgCpc) : undefined,
          existingCampaignName: row.campaignName || undefined,
          isNegative: row.status === "EXCLUDED",
          approved: false
        });
      }

      return items;
    } catch (err: any) {
      console.warn("[GoogleAdsKeywordIntelligenceService] listSearchTerms warning:", err.message);
      return [];
    }
  }

  /**
   * Retrieves shared negative keyword lists for the account.
   */
  public static async getSharedNegativeLists(
    organizationId: string,
    customerId: string
  ): Promise<SharedNegativeSetSummary[]> {
    const cid = customerId.replace(/-/g, "").trim();
    const isOwned = await validateCustomerOwnership(organizationId, cid);
    if (!isOwned) {
      throw new Error("Access denied. Customer ID does not belong to this organization.");
    }

    try {
      const lists = await GoogleAdsSharedSetService.listSharedNegativeLists(organizationId, cid);
      return lists.map(l => ({
        id: l.id,
        name: l.name,
        memberCount: l.memberCount,
        referenceCount: l.referenceCount,
        resourceName: l.resourceName,
        isAttachedToCampaign: false
      }));
    } catch (err: any) {
      console.warn("[GoogleAdsKeywordIntelligenceService] listSharedNegativeLists warning:", err.message);
      return [];
    }
  }

  /**
   * Orchestrates complete keyword intelligence for AI Guided campaign flow.
   * Respects Campaign Type Guardrails: only executes full keyword generation for SEARCH campaigns.
   */
  public static async gatherIntelligence(
    organizationId: string,
    customerId: string,
    campaignType: string,
    options: GatherKeywordIntelligenceOptions = {}
  ): Promise<KeywordIntelligenceResult> {
    const cleanCid = customerId ? customerId.replace(/-/g, "").trim() : "";
    const cleanType = (campaignType || "SEARCH").toUpperCase();

    // Guardrail: Customer Ownership must be validated before anything
    if (organizationId && cleanCid) {
      const isOwned = await validateCustomerOwnership(organizationId, cleanCid);
      if (!isOwned) {
        throw new Error("Access denied. Customer ID does not belong to this organization.");
      }
    }

    // Guardrail: Non-search campaign types do NOT use traditional search keyword targeting
    const nonSearchTypes = ["PERFORMANCE_MAX", "VIDEO", "DISPLAY", "DEMAND_GEN", "APP", "SHOPPING"];
    if (nonSearchTypes.includes(cleanType)) {
      // Shared negative lists may still be inspected
      let sharedLists: SharedNegativeSetSummary[] = [];
      if (organizationId && cleanCid) {
        sharedLists = await this.getSharedNegativeLists(organizationId, cleanCid);
      }

      return {
        campaignType: cleanType,
        supportsKeywords: false,
        message: "Search keyword targeting is not used for this campaign type.",
        currencyCode: "INR",
        keywordIntelligence: [],
        availableSharedNegativeLists: sharedLists,
        existingAccountKeywordsSummary: {
          totalActiveKeywords: 0,
          duplicateKeywordsFound: 0
        },
        searchTermsAnalyzed: 0,
        plannerStatus: "SKIPPED"
      };
    }

    // ── SEARCH Campaign Processing ───────────────────────────────────────────
    let currencyCode = "INR";
    if (organizationId && cleanCid) {
      currencyCode = await GoogleAdsKeywordPlannerService.getCustomerCurrency(organizationId, cleanCid);
    }

    // 1. Gather Existing Account Keywords (to detect exact/phrase/broad duplicates)
    let existingAccountKeywords: KeywordIntelligenceItem[] = [];
    if (organizationId && cleanCid) {
      existingAccountKeywords = await this.getCustomerAccountKeywords(organizationId, cleanCid);
    }

    const existingTexts = new Set(existingAccountKeywords.map(k => k.keyword.toLowerCase().trim()));

    // 2. Gather Shared Negative Lists
    let sharedNegativeLists: SharedNegativeSetSummary[] = [];
    if (organizationId && cleanCid) {
      sharedNegativeLists = await this.getSharedNegativeLists(organizationId, cleanCid);
    }

    // 3. Gather Historical Search Terms
    let searchTermCandidates: KeywordIntelligenceItem[] = [];
    if (organizationId && cleanCid) {
      searchTermCandidates = await this.getHistoricalSearchTermCandidates(organizationId, cleanCid);
    }

    // 4. Generate Real Google Ads Keyword Planner Ideas
    const keywordItems: KeywordIntelligenceItem[] = [];
    let plannerStatus: "SUCCESS" | "UNAVAILABLE" | "SKIPPED" = "SKIPPED";

    // Extract seed keywords from query keywords or products/services
    const seedKeywords = Array.from(
      new Set(
        [
          ...(options.queryKeywords || []),
          ...(options.productsServices || [])
        ]
          .map(k => (typeof k === "string" ? k.trim() : ""))
          .filter(k => k.length > 1)
      )
    ).slice(0, 10);

    const targetUrl = options.url && options.url.startsWith("http") ? options.url : undefined;

    if (organizationId && cleanCid && (seedKeywords.length > 0 || targetUrl)) {
      try {
        const plannerRes = await GoogleAdsKeywordPlannerService.generateKeywordIdeas(
          organizationId,
          cleanCid,
          {
            keywords: seedKeywords.length > 0 ? seedKeywords : undefined,
            url: targetUrl
          }
        );

        if (plannerRes.success && Array.isArray(plannerRes.results)) {
          plannerStatus = "SUCCESS";
          for (const idea of plannerRes.results.slice(0, 20)) {
            const cleanText = idea.text?.trim();
            if (!cleanText) continue;

            const isDuplicate = existingTexts.has(cleanText.toLowerCase());

            keywordItems.push({
              keyword: cleanText,
              matchType: "BROAD",
              source: "KEYWORD_PLANNER",
              searchVolume: idea.avgMonthlySearches,
              competition: idea.competition,
              competitionIndex: idea.competitionIndex,
              lowTopOfPageBid: idea.lowTopOfPageBid,
              highTopOfPageBid: idea.highTopOfPageBid,
              monthlyTrend: (idea.monthlySearchVolumes || []).map(m => ({
                month: m.month,
                year: m.year,
                searches: m.monthlySearches
              })),
              existingStatus: isDuplicate ? "ALREADY_IN_ACCOUNT" : undefined,
              approved: false
            });
          }
        }
      } catch (plannerErr: any) {
        console.warn("[GoogleAdsKeywordIntelligenceService] Keyword Planner data unavailable:", plannerErr.message);
        plannerStatus = "UNAVAILABLE";
      }
    }

    // Merge Existing Keywords into intelligence if not already represented
    for (const ek of existingAccountKeywords.slice(0, 10)) {
      if (!keywordItems.some(ki => ki.keyword.toLowerCase() === ek.keyword.toLowerCase())) {
        keywordItems.push(ek);
      }
    }

    // Merge top Search Terms into intelligence
    for (const st of searchTermCandidates.slice(0, 5)) {
      if (!keywordItems.some(ki => ki.keyword.toLowerCase() === st.keyword.toLowerCase())) {
        keywordItems.push(st);
      }
    }

    const duplicatesFound = keywordItems.filter(k => existingTexts.has(k.keyword.toLowerCase())).length;

    return {
      campaignType: "SEARCH",
      supportsKeywords: true,
      currencyCode,
      keywordIntelligence: keywordItems,
      availableSharedNegativeLists: sharedNegativeLists,
      existingAccountKeywordsSummary: {
        totalActiveKeywords: existingAccountKeywords.length,
        duplicateKeywordsFound: duplicatesFound
      },
      searchTermsAnalyzed: searchTermCandidates.length,
      plannerStatus
    };
  }
}
