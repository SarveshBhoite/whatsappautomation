import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export type KeywordMatchType = "EXACT" | "PHRASE" | "BROAD";

export interface KeywordCriterionItem {
  id: string;
  resourceName: string;
  text: string;
  matchType: KeywordMatchType;
  status: string; // ENABLED | PAUSED | REMOVED
  isNegative: boolean;
  scope: "AD_GROUP" | "CAMPAIGN";
  cpcBidMicros?: number;
  qualityScore?: number;
  campaignId: string;
  campaignName: string;
  adGroupId?: string;
  adGroupName?: string;
}

export interface AdGroupOptionItem {
  id: string;
  name: string;
  resourceName: string;
  status: string;
  campaignId: string;
}

export interface CampaignKeywordsResponse {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportsKeywords: boolean;
  limitationMessage?: string;
  adGroups: AdGroupOptionItem[];
  keywords: KeywordCriterionItem[];
}

export interface AddKeywordInput {
  campaignId: string;
  adGroupId?: string;
  adGroupResourceName?: string;
  text: string;
  matchType: KeywordMatchType;
  isNegative?: boolean;
  scope: "AD_GROUP" | "CAMPAIGN";
  cpcBid?: number; // In currency units e.g. 15 (INR) -> micros
}

export class GoogleAdsKeywordTargetingService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Retrieves all keywords (positive and negative) for a campaign and its ad groups.
   */
  public static async getCampaignKeywords(
    organizationId: string,
    customerId: string,
    campaignIdOrResource: string,
    adGroupIdFilter?: string
  ): Promise<CampaignKeywordsResponse> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanCampaignId = campaignIdOrResource.includes("/")
      ? campaignIdOrResource.split("/").pop()!
      : campaignIdOrResource;

    // 1. Fetch Campaign Metadata
    const campQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type
      FROM campaign
      WHERE campaign.id = ${cleanCampaignId}
      LIMIT 1
    `;

    const campRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: campQuery },
      { headers }
    );

    const campRow = campRes.data?.results?.[0]?.campaign;
    if (!campRow) {
      throw new Error(`Campaign '${campaignIdOrResource}' not found in Google Ads account ${cid}.`);
    }

    const campaignId = String(campRow.id);
    const campaignName = campRow.name || `Campaign #${campaignId}`;
    const campaignType = campRow.advertisingChannelType || "UNKNOWN";
    const isPMax = campaignType === "PERFORMANCE_MAX";
    const supportsKeywords = campaignType === "SEARCH" || campaignType === "DISPLAY";

    let limitationMessage: string | undefined;
    if (isPMax) {
      limitationMessage =
        "Performance Max campaigns do not use traditional keyword targeting. Keyword themes and audience intents are defined exclusively in Asset Group Search Themes & Audience Signals.";
    }

    // 2. Fetch Ad Groups for this Campaign
    const adGroups: AdGroupOptionItem[] = [];
    if (!isPMax) {
      const agQuery = `
        SELECT
          ad_group.id,
          ad_group.name,
          ad_group.resource_name,
          ad_group.status
        FROM ad_group
        WHERE campaign.id = ${campaignId}
          AND ad_group.status != 'REMOVED'
        ORDER BY ad_group.name ASC
      `;

      try {
        const agRes = await axios.post(
          `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
          { query: agQuery },
          { headers }
        );

        for (const r of agRes.data?.results || []) {
          if (r.adGroup) {
            adGroups.push({
              id: String(r.adGroup.id),
              name: r.adGroup.name || `Ad Group #${r.adGroup.id}`,
              resourceName: r.adGroup.resourceName,
              status: r.adGroup.status || "ENABLED",
              campaignId
            });
          }
        }
      } catch (err: any) {
        console.warn("[GoogleAdsKeywordTargetingService] Ad groups query warning:", err.message);
      }
    }

    // 3. Fetch Ad Group Keywords
    const allKeywords: KeywordCriterionItem[] = [];

    if (!isPMax && supportsKeywords) {
      const agFilterClause = adGroupIdFilter ? `AND ad_group.id = ${adGroupIdFilter}` : "";

      const kwQuery = `
        SELECT
          ad_group_criterion.resource_name,
          ad_group_criterion.criterion_id,
          ad_group_criterion.keyword.text,
          ad_group_criterion.keyword.match_type,
          ad_group_criterion.status,
          ad_group_criterion.negative,
          ad_group_criterion.cpc_bid_micros,
          ad_group_criterion.quality_info.quality_score,
          ad_group.id,
          ad_group.name
        FROM ad_group_criterion
        WHERE campaign.id = ${campaignId}
          AND ad_group_criterion.type = 'KEYWORD'
          AND ad_group_criterion.status != 'REMOVED'
          ${agFilterClause}
        ORDER BY ad_group_criterion.status ASC
        LIMIT 500
      `;

      try {
        const kwRes = await axios.post(
          `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
          { query: kwQuery },
          { headers }
        );

        for (const r of kwRes.data?.results || []) {
          const c = r.adGroupCriterion;
          if (!c) continue;

          allKeywords.push({
            id: String(c.criterionId),
            resourceName: c.resourceName,
            text: c.keyword?.text || "",
            matchType: (c.keyword?.matchType as KeywordMatchType) || "BROAD",
            status: c.status || "ENABLED",
            isNegative: Boolean(c.negative),
            scope: "AD_GROUP",
            cpcBidMicros: c.cpcBidMicros ? Number(c.cpcBidMicros) : undefined,
            qualityScore: c.qualityInfo?.qualityScore ? Number(c.qualityInfo.qualityScore) : undefined,
            campaignId,
            campaignName,
            adGroupId: r.adGroup?.id ? String(r.adGroup.id) : undefined,
            adGroupName: r.adGroup?.name || undefined
          });
        }
      } catch (err: any) {
        console.warn("[GoogleAdsKeywordTargetingService] Ad group keyword query warning:", err.message);
      }

      // 4. Fetch Campaign-Level Negative Keywords (only when not filtering by specific ad group)
      if (!adGroupIdFilter) {
        const cKwQuery = `
          SELECT
            campaign_criterion.resource_name,
            campaign_criterion.criterion_id,
            campaign_criterion.keyword.text,
            campaign_criterion.keyword.match_type,
            campaign_criterion.status,
            campaign_criterion.negative
          FROM campaign_criterion
          WHERE campaign.id = ${campaignId}
            AND campaign_criterion.type = 'KEYWORD'
            AND campaign_criterion.status != 'REMOVED'
          LIMIT 100
        `;

        try {
          const cKwRes = await axios.post(
            `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
            { query: cKwQuery },
            { headers }
          );

          for (const r of cKwRes.data?.results || []) {
            const cc = r.campaignCriterion;
            if (!cc) continue;

            allKeywords.push({
              id: String(cc.criterionId),
              resourceName: cc.resourceName,
              text: cc.keyword?.text || "",
              matchType: (cc.keyword?.matchType as KeywordMatchType) || "BROAD",
              status: cc.status || "ENABLED",
              isNegative: true, // Campaign level keywords in Google Ads are always negative exclusions
              scope: "CAMPAIGN",
              campaignId,
              campaignName,
              adGroupId: undefined,
              adGroupName: "Campaign-Wide Negative"
            });
          }
        } catch (err: any) {
          console.warn("[GoogleAdsKeywordTargetingService] Campaign keyword query warning:", err.message);
        }
      }
    }

    return {
      campaignId,
      campaignName,
      campaignType,
      isPMax,
      supportsKeywords,
      limitationMessage,
      adGroups,
      keywords: allKeywords
    };
  }

  /**
   * Adds a keyword (positive or negative) to an Ad Group or Campaign.
   */
  public static async addKeyword(
    organizationId: string,
    customerId: string,
    input: AddKeywordInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const text = input.text.trim();
    if (!text) throw new Error("Keyword text cannot be empty.");

    const matchType = input.matchType?.toUpperCase() as KeywordMatchType;
    if (!["EXACT", "PHRASE", "BROAD"].includes(matchType)) {
      throw new Error(`Invalid match type '${input.matchType}'. Must be EXACT, PHRASE, or BROAD.`);
    }

    // 1. Campaign-Level Negative Keyword
    if (input.scope === "CAMPAIGN") {
      const cleanCampaignId = input.campaignId.includes("/")
        ? input.campaignId.split("/").pop()!
        : input.campaignId;

      const campaignResource = `customers/${cid}/campaigns/${cleanCampaignId}`;

      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
        {
          operations: [{
            create: {
              campaign: campaignResource,
              negative: true,
              keyword: {
                text,
                matchType
              }
            }
          }]
        },
        { headers }
      );

      return {
        success: true,
        resourceName: res.data?.results?.[0]?.resourceName,
        scope: "CAMPAIGN",
        text,
        matchType,
        isNegative: true
      };
    }

    // 2. Ad Group Keyword (Positive or Negative)
    let adGroupResource = input.adGroupResourceName;
    if (!adGroupResource && input.adGroupId) {
      const cleanAgId = input.adGroupId.includes("/")
        ? input.adGroupId.split("/").pop()!
        : input.adGroupId;
      adGroupResource = `customers/${cid}/adGroups/${cleanAgId}`;
    }

    if (!adGroupResource) {
      throw new Error("Ad group is required for ad-group-level keywords.");
    }

    const isNegative = Boolean(input.isNegative);
    const cpcBidMicros = input.cpcBid && input.cpcBid > 0 && !isNegative
      ? Math.round(Number(input.cpcBid) * 1_000_000)
      : undefined;

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`,
      {
        operations: [{
          create: {
            adGroup: adGroupResource,
            status: isNegative ? undefined : "ENABLED",
            negative: isNegative,
            keyword: {
              text,
              matchType
            },
            ...(cpcBidMicros ? { cpcBidMicros } : {})
          }
        }]
      },
      { headers }
    );

    return {
      success: true,
      resourceName: res.data?.results?.[0]?.resourceName,
      scope: "AD_GROUP",
      text,
      matchType,
      isNegative
    };
  }

  /**
   * Updates an existing keyword (e.g. status or cpcBid).
   */
  public static async updateKeyword(
    organizationId: string,
    customerId: string,
    resourceName: string,
    updates: { status?: "ENABLED" | "PAUSED"; cpcBid?: number }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!resourceName.includes("adGroupCriteria/")) {
      throw new Error("Status and bid updates are only applicable to ad group keywords.");
    }

    const updateObj: any = { resourceName };
    const maskFields: string[] = [];

    if (updates.status) {
      updateObj.status = updates.status;
      maskFields.push("status");
    }

    if (updates.cpcBid !== undefined && updates.cpcBid > 0) {
      updateObj.cpcBidMicros = Math.round(Number(updates.cpcBid) * 1_000_000);
      maskFields.push("cpc_bid_micros");
    }

    if (maskFields.length === 0) {
      throw new Error("No update fields provided.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`,
      {
        operations: [{ update: updateObj, updateMask: maskFields.join(",") }]
      },
      { headers }
    );

    return {
      success: true,
      resourceName: res.data?.results?.[0]?.resourceName || resourceName
    };
  }

  /**
   * Removes a keyword from either adGroupCriteria or campaignCriteria.
   */
  public static async removeKeyword(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const isCampaignCriterion = resourceName.includes("campaignCriteria/");
    const isAdGroupCriterion = resourceName.includes("adGroupCriteria/");

    if (!isCampaignCriterion && !isAdGroupCriterion) {
      throw new Error(`Invalid keyword criterion resource name: '${resourceName}'`);
    }

    const endpoint = isCampaignCriterion
      ? `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`
      : `${this.ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`;

    const res = await axios.post(
      endpoint,
      {
        operations: [{ remove: resourceName }]
      },
      { headers }
    );

    return {
      success: true,
      removedResourceName: res.data?.results?.[0]?.resourceName || resourceName
    };
  }
}
