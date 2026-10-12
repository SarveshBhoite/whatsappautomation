import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface PlacementCriterionItem {
  resourceName: string;
  criterionId: string;
  url: string;
  negative: boolean;      // true = Excluded Placement
  status?: string;
  isMutable: boolean;
}

export interface TopicCriterionItem {
  resourceName: string;
  criterionId: string;
  topicConstant: string;  // e.g. "topicConstants/8"
  topicId: string;        // e.g. "8"
  path: string[];         // e.g. ["Games"]
  displayName: string;    // e.g. "Games"
  negative: boolean;      // true = Excluded Topic
  status?: string;
  isMutable: boolean;
}

export interface TopicConstantItem {
  id: string;
  resourceName: string;
  path: string[];
  displayName: string;
}

export interface CampaignContentTargetingResponse {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportNotes: {
    placementSupported: boolean;
    placementExclusionSupported: boolean;
    topicSupported: boolean;
    topicExclusionSupported: boolean;
    limitationMessage?: string;
    unsupportedDimensions?: string[];
  };
  placements: {
    activeCriteria: PlacementCriterionItem[];
    canExclude: boolean;
  };
  topics: {
    activeCriteria: TopicCriterionItem[];
    popularTopics: TopicConstantItem[];
    canExclude: boolean;
  };
}

export interface AddPlacementCriterionInput {
  campaignId: string;
  url: string;
  negative?: boolean; // Default true for campaign level
}

export interface AddTopicCriterionInput {
  campaignId: string;
  topicConstantOrId: string; // "topicConstants/8" or "8"
  negative?: boolean; // Default true for campaign level
}

export class GoogleAdsContentTargetingService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // Curated popular top-level topic constants for convenient selection
  public static readonly POPULAR_TOPICS: TopicConstantItem[] = [
    { id: "3", resourceName: "topicConstants/3", path: ["Arts & Entertainment"], displayName: "Arts & Entertainment" },
    { id: "5", resourceName: "topicConstants/5", path: ["Computers & Electronics"], displayName: "Computers & Electronics" },
    { id: "7", resourceName: "topicConstants/7", path: ["Finance"], displayName: "Finance" },
    { id: "8", resourceName: "topicConstants/8", path: ["Games"], displayName: "Games" },
    { id: "11", resourceName: "topicConstants/11", path: ["Home & Garden"], displayName: "Home & Garden" },
    { id: "12", resourceName: "topicConstants/12", path: ["Business & Industrial"], displayName: "Business & Industrial" },
    { id: "13", resourceName: "topicConstants/13", path: ["Internet & Telecom"], displayName: "Internet & Telecom" },
    { id: "14", resourceName: "topicConstants/14", path: ["People & Society"], displayName: "People & Society" },
    { id: "16", resourceName: "topicConstants/16", path: ["News"], displayName: "News" },
    { id: "18", resourceName: "topicConstants/18", path: ["Shopping & Retailers"], displayName: "Shopping & Retailers" },
    { id: "29", resourceName: "topicConstants/29", path: ["Real Estate"], displayName: "Real Estate" },
    { id: "44", resourceName: "topicConstants/44", path: ["Beauty & Fitness"], displayName: "Beauty & Fitness" },
    { id: "45", resourceName: "topicConstants/45", path: ["Health"], displayName: "Health" },
    { id: "66", resourceName: "topicConstants/66", path: ["Pets & Animals"], displayName: "Pets & Animals" },
    { id: "67", resourceName: "topicConstants/67", path: ["Travel & Transportation"], displayName: "Travel & Transportation" }
  ];

  /**
   * Reads customer-scoped Placement and Topic criteria for a campaign.
   */
  public static async getCampaignContentTargeting(
    organizationId: string,
    customerId: string,
    campaignIdOrResource: string
  ): Promise<CampaignContentTargetingResponse> {
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
    const isDisplay = campaignType === "DISPLAY";
    const isSearch = campaignType === "SEARCH";

    // Official Google Ads API v24 Content Targeting Rules:
    // - PMax campaigns: traditional campaign criteria (placement/topic) are rejected. PMax optimizes placements automatically via Google AI; placement exclusions can only be managed account-wide or via specific brand lists.
    // - Search campaigns:
    //   - Placement: Exclusions (`negative: true`) are officially supported on campaign_criterion. Positive inclusion at campaign level is not permitted (FIELD_INCOMPATIBLE_WITH_NEGATIVE_TARGETING).
    //   - Topic: Campaign-level topic criteria are not permitted for Search (OPERATION_NOT_PERMITTED_FOR_CONTEXT).
    // - Display / Video campaigns:
    //   - Placement: Campaign-level exclusions (`negative: true`) are supported.
    //   - Topic: Campaign-level exclusions (`negative: true`) are supported. Positive inclusions are configured at Ad Group level.
    let limitationMessage: string | undefined;
    const unsupportedDimensions: string[] = [];

    if (isPMax) {
      limitationMessage =
        "Performance Max campaigns automate cross-network ad placement using Google AI. Campaign-level placement and topic criteria are not supported; use Asset Group Audience Signals instead.";
      unsupportedDimensions.push("PLACEMENT", "TOPIC");
    } else if (isSearch) {
      unsupportedDimensions.push("TOPIC");
      limitationMessage =
        "For Search campaigns, Google Ads API v24 supports Campaign Placement Exclusions to prevent ads appearing on specific sites or apps. Topic criteria are restricted from Search campaigns (must use Display campaigns or Ad Group level targeting).";
    } else if (isDisplay) {
      limitationMessage =
        "For Display campaigns, Google Ads API v24 supports Campaign Placement Exclusions and Topic Exclusions. Positive placements and topics are configured at the Ad Group level.";
    }

    const supportNotes = {
      placementSupported: !isPMax,
      placementExclusionSupported: !isPMax,
      topicSupported: isDisplay,
      topicExclusionSupported: isDisplay,
      limitationMessage,
      unsupportedDimensions
    };

    // 2. Fetch PLACEMENT and TOPIC criteria for this campaign
    const critQuery = `
      SELECT
        campaign_criterion.resource_name,
        campaign_criterion.criterion_id,
        campaign_criterion.type,
        campaign_criterion.negative,
        campaign_criterion.status,
        campaign_criterion.placement.url,
        campaign_criterion.topic.topic_constant,
        campaign_criterion.topic.path
      FROM campaign_criterion
      WHERE campaign.id = ${campaignId}
        AND campaign_criterion.type IN ('PLACEMENT', 'TOPIC')
      LIMIT 200
    `;

    const critRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: critQuery },
      { headers }
    );

    const activePlacements: PlacementCriterionItem[] = [];
    const activeTopics: TopicCriterionItem[] = [];

    const rows = critRes.data?.results || [];
    for (const r of rows) {
      const cc = r.campaignCriterion;
      if (!cc) continue;

      const criterionId = String(cc.criterionId || "");
      const resourceName = cc.resourceName;
      const negative = Boolean(cc.negative);
      const isMutable = !isPMax;

      if (cc.type === "PLACEMENT" && cc.placement?.url) {
        activePlacements.push({
          resourceName,
          criterionId,
          url: cc.placement.url,
          negative,
          status: cc.status,
          isMutable
        });
      } else if (cc.type === "TOPIC" && cc.topic) {
        const topicConstant = cc.topic.topicConstant || "";
        const topicId = topicConstant.replace("topicConstants/", "");
        const path: string[] = (cc.topic.path || []).filter(Boolean);
        const displayName = path.length > 0 ? path[path.length - 1] : `Topic #${topicId}`;

        activeTopics.push({
          resourceName,
          criterionId,
          topicConstant,
          topicId,
          path,
          displayName,
          negative,
          status: cc.status,
          isMutable
        });
      }
    }

    return {
      campaignId,
      campaignName,
      campaignType,
      isPMax,
      supportNotes,
      placements: {
        activeCriteria: activePlacements,
        canExclude: !isPMax
      },
      topics: {
        activeCriteria: activeTopics,
        popularTopics: this.POPULAR_TOPICS,
        canExclude: isDisplay
      }
    };
  }

  /**
   * Adds an officially supported campaign-level placement exclusion criterion.
   */
  public static async addPlacementCriterion(
    organizationId: string,
    customerId: string,
    input: AddPlacementCriterionInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanCampaignId = input.campaignId.includes("/")
      ? input.campaignId.split("/").pop()!
      : input.campaignId;

    let cleanUrl = input.url.trim().toLowerCase();
    // Strip http:// or https:// if provided
    cleanUrl = cleanUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "");

    if (!cleanUrl) {
      throw new Error("Placement URL cannot be empty.");
    }

    const campaignResource = `customers/${cid}/campaigns/${cleanCampaignId}`;

    const createPayload: any = {
      campaign: campaignResource,
      negative: input.negative !== undefined ? input.negative : true,
      placement: {
        url: cleanUrl
      }
    };

    const response = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [{ create: createPayload }]
      },
      { headers }
    );

    const createdResource = response.data?.results?.[0]?.resourceName;
    return {
      success: true,
      resourceName: createdResource,
      url: cleanUrl,
      negative: createPayload.negative
    };
  }

  /**
   * Adds an officially supported campaign-level topic exclusion criterion.
   */
  public static async addTopicCriterion(
    organizationId: string,
    customerId: string,
    input: AddTopicCriterionInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanCampaignId = input.campaignId.includes("/")
      ? input.campaignId.split("/").pop()!
      : input.campaignId;

    let topicConstant = input.topicConstantOrId.trim();
    if (!topicConstant.startsWith("topicConstants/")) {
      topicConstant = `topicConstants/${topicConstant}`;
    }

    const campaignResource = `customers/${cid}/campaigns/${cleanCampaignId}`;

    const createPayload: any = {
      campaign: campaignResource,
      negative: input.negative !== undefined ? input.negative : true,
      topic: {
        topicConstant
      }
    };

    const response = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [{ create: createPayload }]
      },
      { headers }
    );

    const createdResource = response.data?.results?.[0]?.resourceName;
    return {
      success: true,
      resourceName: createdResource,
      topicConstant,
      negative: createPayload.negative
    };
  }

  /**
   * Removes an existing placement or topic campaign criterion via campaignCriteria:mutate.
   */
  public static async removeContentCriterion(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!resourceName || !resourceName.includes("campaignCriteria/")) {
      throw new Error(`Invalid campaign criterion resource name: '${resourceName}'`);
    }

    const response = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [{ remove: resourceName }]
      },
      { headers }
    );

    return {
      success: true,
      removedResourceName: response.data?.results?.[0]?.resourceName || resourceName
    };
  }
}
