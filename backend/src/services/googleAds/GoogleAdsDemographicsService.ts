import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export type DemographicDimensionType = "AGE_RANGE" | "GENDER" | "INCOME_RANGE" | "PARENTAL_STATUS";

export interface DemographicCriterionItem {
  resourceName: string;
  criterionId: string;
  dimension: DemographicDimensionType;
  typeValue: string;        // e.g. "AGE_RANGE_18_24", "MALE", "INCOME_RANGE_0_50", "PARENT"
  displayName: string;      // e.g. "18 - 24 years", "Male", "Top 10%", "Parent"
  negative: boolean;        // true = Excluded
  status?: string;
  isMutable: boolean;
}

export interface CampaignDemographicsResponse {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportNotes: {
    ageSupported: boolean;
    genderSupported: boolean;
    incomeSupported: boolean;
    parentalSupported: boolean;
    limitationMessage?: string;
    unsupportedDimensions?: string[];
  };
  dimensions: {
    ageRanges: {
      dimension: "AGE_RANGE";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
    genders: {
      dimension: "GENDER";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
    incomeRanges: {
      dimension: "INCOME_RANGE";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
    parentalStatuses: {
      dimension: "PARENTAL_STATUS";
      availableValues: Array<{ type: string; label: string }>;
      activeCriteria: DemographicCriterionItem[];
    };
  };
}

export interface AddDemographicCriterionInput {
  campaignId: string;
  dimension: DemographicDimensionType;
  typeValue: string;
  negative?: boolean; // Default true for campaign level
}

export class GoogleAdsDemographicsService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // Official Google Ads API v24 standard demographic catalog
  public static readonly AGE_RANGES = [
    { type: "AGE_RANGE_18_24", label: "18 – 24 years" },
    { type: "AGE_RANGE_25_34", label: "25 – 34 years" },
    { type: "AGE_RANGE_35_44", label: "35 – 44 years" },
    { type: "AGE_RANGE_45_54", label: "45 – 54 years" },
    { type: "AGE_RANGE_55_64", label: "55 – 64 years" },
    { type: "AGE_RANGE_65_UP", label: "65+ years" },
    { type: "AGE_RANGE_UNDETERMINED", label: "Unknown Age" }
  ];

  public static readonly GENDERS = [
    { type: "MALE", label: "Male" },
    { type: "FEMALE", label: "Female" },
    { type: "UNDETERMINED", label: "Unknown Gender" }
  ];

  public static readonly INCOME_RANGES = [
    { type: "INCOME_RANGE_0_50", label: "Lower 50%" },
    { type: "INCOME_RANGE_51_60", label: "Top 41% – 50%" },
    { type: "INCOME_RANGE_61_70", label: "Top 31% – 40%" },
    { type: "INCOME_RANGE_71_80", label: "Top 21% – 30%" },
    { type: "INCOME_RANGE_81_90", label: "Top 11% – 20%" },
    { type: "INCOME_RANGE_91_100", label: "Top 10%" },
    { type: "INCOME_RANGE_UNDETERMINED", label: "Unknown Income" }
  ];

  public static readonly PARENTAL_STATUSES = [
    { type: "PARENT", label: "Parent" },
    { type: "NOT_A_PARENT", label: "Not a parent" },
    { type: "UNDETERMINED", label: "Unknown Parental Status" }
  ];

  /**
   * Helper to format human-readable label
   */
  private static formatLabel(dimension: DemographicDimensionType, typeValue: string): string {
    switch (dimension) {
      case "AGE_RANGE": {
        const found = this.AGE_RANGES.find(a => a.type === typeValue);
        return found ? found.label : typeValue.replace("AGE_RANGE_", "").replace(/_/g, " ");
      }
      case "GENDER": {
        const found = this.GENDERS.find(g => g.type === typeValue);
        return found ? found.label : typeValue;
      }
      case "INCOME_RANGE": {
        const found = this.INCOME_RANGES.find(i => i.type === typeValue);
        return found ? found.label : typeValue.replace("INCOME_RANGE_", "Income ");
      }
      case "PARENTAL_STATUS": {
        const found = this.PARENTAL_STATUSES.find(p => p.type === typeValue);
        return found ? found.label : typeValue.replace(/_/g, " ");
      }
      default:
        return typeValue;
    }
  }

  /**
   * Reads customer-scoped demographic targeting criteria for a campaign.
   */
  public static async getCampaignDemographics(
    organizationId: string,
    customerId: string,
    campaignIdOrResource: string
  ): Promise<CampaignDemographicsResponse> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanCampaignId = campaignIdOrResource.includes("/")
      ? campaignIdOrResource.split("/").pop()!
      : campaignIdOrResource;

    // 1. Fetch Campaign Metadata (channel type, name, status)
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

    // Official Google Ads API v24 Demographics Rules & Context:
    // - PMax campaigns: traditional demographic criteria cannot be added or mutated (fails with OPERATION_NOT_PERMITTED_FOR_CONTEXT or removed resource). PMax uses Audience Signals.
    // - Search / standard campaigns:
    //   - Age Range: Campaign-level negative criteria (exclusions) are supported via campaign_criterion. Positive inclusion at campaign level is not permitted (FIELD_INCOMPATIBLE_WITH_NEGATIVE_TARGETING).
    //   - Gender: Campaign-level negative criteria (exclusions) are supported via campaign_criterion.
    //   - Income Range: Campaign-level negative criteria (exclusions) are supported via campaign_criterion.
    //   - Parental Status: Not permitted at the campaign level for Search (OPERATION_NOT_PERMITTED_FOR_CONTEXT). It is an ad-group level dimension.
    let limitationMessage: string | undefined;
    const unsupportedDimensions: string[] = [];

    if (isPMax) {
      limitationMessage =
        "Performance Max campaigns automate channel and demographic allocation via AI. Standard campaign-level demographic criteria are not supported; use Asset Group Audience Signals instead.";
      unsupportedDimensions.push("AGE_RANGE", "GENDER", "INCOME_RANGE", "PARENTAL_STATUS");
    } else {
      unsupportedDimensions.push("PARENTAL_STATUS");
      limitationMessage =
        "Google Ads API v24 supports Campaign-level Demographic Exclusions for Age Range, Gender, and Household Income. Positive inclusions or Parental Status criteria must be managed at Ad Group level or via audience signals.";
    }

    const supportNotes = {
      ageSupported: !isPMax,
      genderSupported: !isPMax,
      incomeSupported: !isPMax,
      parentalSupported: false, // Campaign level not permitted for Search
      limitationMessage,
      unsupportedDimensions
    };

    // 2. Fetch demographic criteria for this campaign
    const critQuery = `
      SELECT
        campaign_criterion.resource_name,
        campaign_criterion.criterion_id,
        campaign_criterion.type,
        campaign_criterion.negative,
        campaign_criterion.bid_modifier,
        campaign_criterion.status,
        campaign_criterion.age_range.type,
        campaign_criterion.gender.type,
        campaign_criterion.income_range.type,
        campaign_criterion.parental_status.type
      FROM campaign_criterion
      WHERE campaign.id = ${campaignId}
        AND campaign_criterion.type IN ('AGE_RANGE', 'GENDER', 'INCOME_RANGE', 'PARENTAL_STATUS')
      LIMIT 200
    `;

    const critRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: critQuery },
      { headers }
    );

    const activeAges: DemographicCriterionItem[] = [];
    const activeGenders: DemographicCriterionItem[] = [];
    const activeIncomes: DemographicCriterionItem[] = [];
    const activeParents: DemographicCriterionItem[] = [];

    const rows = critRes.data?.results || [];
    for (const r of rows) {
      const cc = r.campaignCriterion;
      if (!cc) continue;

      const type = cc.type as DemographicDimensionType;
      const criterionId = String(cc.criterionId || "");
      const resourceName = cc.resourceName;
      const negative = Boolean(cc.negative);
      const isMutable = !isPMax;

      if (type === "AGE_RANGE" && cc.ageRange?.type) {
        activeAges.push({
          resourceName,
          criterionId,
          dimension: "AGE_RANGE",
          typeValue: cc.ageRange.type,
          displayName: this.formatLabel("AGE_RANGE", cc.ageRange.type),
          negative,
          status: cc.status,
          isMutable
        });
      } else if (type === "GENDER" && cc.gender?.type) {
        activeGenders.push({
          resourceName,
          criterionId,
          dimension: "GENDER",
          typeValue: cc.gender.type,
          displayName: this.formatLabel("GENDER", cc.gender.type),
          negative,
          status: cc.status,
          isMutable
        });
      } else if (type === "INCOME_RANGE" && cc.incomeRange?.type) {
        activeIncomes.push({
          resourceName,
          criterionId,
          dimension: "INCOME_RANGE",
          typeValue: cc.incomeRange.type,
          displayName: this.formatLabel("INCOME_RANGE", cc.incomeRange.type),
          negative,
          status: cc.status,
          isMutable
        });
      } else if (type === "PARENTAL_STATUS" && cc.parentalStatus?.type) {
        activeParents.push({
          resourceName,
          criterionId,
          dimension: "PARENTAL_STATUS",
          typeValue: cc.parentalStatus.type,
          displayName: this.formatLabel("PARENTAL_STATUS", cc.parentalStatus.type),
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
      dimensions: {
        ageRanges: {
          dimension: "AGE_RANGE",
          availableValues: this.AGE_RANGES,
          activeCriteria: activeAges
        },
        genders: {
          dimension: "GENDER",
          availableValues: this.GENDERS,
          activeCriteria: activeGenders
        },
        incomeRanges: {
          dimension: "INCOME_RANGE",
          availableValues: this.INCOME_RANGES,
          activeCriteria: activeIncomes
        },
        parentalStatuses: {
          dimension: "PARENTAL_STATUS",
          availableValues: this.PARENTAL_STATUSES,
          activeCriteria: activeParents
        }
      }
    };
  }

  /**
   * Adds an officially supported campaign-level demographic exclusion criterion.
   */
  public static async addDemographicCriterion(
    organizationId: string,
    customerId: string,
    input: AddDemographicCriterionInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanCampaignId = input.campaignId.includes("/")
      ? input.campaignId.split("/").pop()!
      : input.campaignId;

    if (input.dimension === "PARENTAL_STATUS") {
      throw new Error(
        "Parental status targeting is not supported at the Campaign level by Google Ads API v24 (must be configured at Ad Group level)."
      );
    }

    const campaignResource = `customers/${cid}/campaigns/${cleanCampaignId}`;

    const createPayload: any = {
      campaign: campaignResource,
      negative: input.negative !== undefined ? input.negative : true
    };

    switch (input.dimension) {
      case "AGE_RANGE":
        createPayload.ageRange = { type: input.typeValue };
        break;
      case "GENDER":
        createPayload.gender = { type: input.typeValue };
        break;
      case "INCOME_RANGE":
        createPayload.incomeRange = { type: input.typeValue };
        break;
      default:
        throw new Error(`Unsupported demographic dimension: ${input.dimension}`);
    }

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
      dimension: input.dimension,
      typeValue: input.typeValue
    };
  }

  /**
   * Removes an existing demographic campaign criterion via campaignCriteria:mutate.
   */
  public static async removeDemographicCriterion(
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
