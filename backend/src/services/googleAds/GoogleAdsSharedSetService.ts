import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export type KeywordMatchType = "EXACT" | "PHRASE" | "BROAD";

export interface SharedSetItem {
  id: string;
  resourceName: string;
  name: string;
  type: string;
  status: string;
  memberCount: number;
  referenceCount: number;
}

export interface SharedCriterionItem {
  criterionId: string;
  resourceName: string;
  sharedSet: string;
  type: string;
  text: string;
  matchType: KeywordMatchType;
}

export interface CampaignSharedSetItem {
  resourceName: string;
  campaignId: string;
  campaignName: string;
  campaignResourceName: string;
  sharedSetResourceName: string;
  status: string;
}

export class GoogleAdsSharedSetService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * List all NEGATIVE_KEYWORDS shared sets for the given customer.
   */
  public static async listSharedNegativeLists(
    organizationId: string,
    customerId: string
  ): Promise<SharedSetItem[]> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const query = `
      SELECT
        shared_set.id,
        shared_set.resource_name,
        shared_set.name,
        shared_set.type,
        shared_set.status,
        shared_set.member_count,
        shared_set.reference_count
      FROM shared_set
      WHERE shared_set.type = 'NEGATIVE_KEYWORDS'
        AND shared_set.status != 'REMOVED'
      ORDER BY shared_set.name ASC
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:searchStream`,
        { query },
        { headers }
      );

      const batches = res.data;
      const lists: SharedSetItem[] = [];

      if (Array.isArray(batches)) {
        for (const batch of batches) {
          const results = batch.results || [];
          for (const row of results) {
            const ss = row.sharedSet || {};
            lists.push({
              id: String(ss.id || ""),
              resourceName: ss.resourceName || `customers/${cid}/sharedSets/${ss.id}`,
              name: ss.name || `Shared Set #${ss.id}`,
              type: ss.type || "NEGATIVE_KEYWORDS",
              status: ss.status || "ENABLED",
              memberCount: Number(ss.memberCount || 0),
              referenceCount: Number(ss.referenceCount || 0)
            });
          }
        }
      }

      return lists;
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] listSharedNegativeLists error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * Get a single shared negative list by its ID or resource name.
   */
  public static async getSharedNegativeList(
    organizationId: string,
    customerId: string,
    sharedSetIdOrResource: string
  ): Promise<SharedSetItem> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const setId = sharedSetIdOrResource.includes("/")
      ? sharedSetIdOrResource.split("/").pop()!
      : sharedSetIdOrResource;

    const query = `
      SELECT
        shared_set.id,
        shared_set.resource_name,
        shared_set.name,
        shared_set.type,
        shared_set.status,
        shared_set.member_count,
        shared_set.reference_count
      FROM shared_set
      WHERE shared_set.id = ${setId}
        AND shared_set.type = 'NEGATIVE_KEYWORDS'
      LIMIT 1
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:searchStream`,
        { query },
        { headers }
      );

      const batches = res.data;
      let found: SharedSetItem | null = null;

      if (Array.isArray(batches)) {
        for (const batch of batches) {
          const results = batch.results || [];
          if (results.length > 0) {
            const ss = results[0].sharedSet || {};
            found = {
              id: String(ss.id || setId),
              resourceName: ss.resourceName || `customers/${cid}/sharedSets/${setId}`,
              name: ss.name || `Shared Set #${setId}`,
              type: ss.type || "NEGATIVE_KEYWORDS",
              status: ss.status || "ENABLED",
              memberCount: Number(ss.memberCount || 0),
              referenceCount: Number(ss.referenceCount || 0)
            };
            break;
          }
        }
      }

      if (!found) {
        throw new Error(`Shared negative keyword list '${setId}' not found.`);
      }

      return found;
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] getSharedNegativeList error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * Create a new NEGATIVE_KEYWORDS shared set.
   */
  public static async createSharedNegativeList(
    organizationId: string,
    customerId: string,
    name: string
  ): Promise<{ success: boolean; resourceName: string; id: string; name: string }> {
    const cid = customerId.replace(/-/g, "").trim();
    const cleanName = (name || "").trim();

    if (!cleanName) {
      throw new Error("Shared negative keyword list name is required.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const payload = {
      operations: [
        {
          create: {
            name: cleanName,
            type: "NEGATIVE_KEYWORDS"
          }
        }
      ]
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/sharedSets:mutate`,
        payload,
        { headers }
      );

      const createdResource = res.data?.results?.[0]?.resourceName;
      const id = createdResource ? createdResource.split("/").pop()! : "";

      return {
        success: true,
        resourceName: createdResource,
        id,
        name: cleanName
      };
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] createSharedNegativeList error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * Delete / remove a shared set.
   */
  public static async removeSharedNegativeList(
    organizationId: string,
    customerId: string,
    sharedSetIdOrResource: string
  ): Promise<{ success: boolean; removedResourceName: string }> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const resourceName = sharedSetIdOrResource.includes("/")
      ? sharedSetIdOrResource
      : `customers/${cid}/sharedSets/${sharedSetIdOrResource}`;

    const payload = {
      operations: [
        {
          remove: resourceName
        }
      ]
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/sharedSets:mutate`,
        payload,
        { headers }
      );

      return {
        success: true,
        removedResourceName: res.data?.results?.[0]?.resourceName || resourceName
      };
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] removeSharedNegativeList error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * List all negative keywords in a specific shared set.
   */
  public static async listSharedKeywords(
    organizationId: string,
    customerId: string,
    sharedSetIdOrResource: string
  ): Promise<SharedCriterionItem[]> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const setId = sharedSetIdOrResource.includes("/")
      ? sharedSetIdOrResource.split("/").pop()!
      : sharedSetIdOrResource;

    const query = `
      SELECT
        shared_criterion.criterion_id,
        shared_criterion.resource_name,
        shared_criterion.shared_set,
        shared_criterion.type,
        shared_criterion.keyword.text,
        shared_criterion.keyword.match_type
      FROM shared_criterion
      WHERE shared_criterion.shared_set = 'customers/${cid}/sharedSets/${setId}'
      ORDER BY shared_criterion.keyword.text ASC
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:searchStream`,
        { query },
        { headers }
      );

      const batches = res.data;
      const keywords: SharedCriterionItem[] = [];

      if (Array.isArray(batches)) {
        for (const batch of batches) {
          const results = batch.results || [];
          for (const row of results) {
            const sc = row.sharedCriterion || {};
            keywords.push({
              criterionId: String(sc.criterionId || ""),
              resourceName: sc.resourceName || "",
              sharedSet: sc.sharedSet || `customers/${cid}/sharedSets/${setId}`,
              type: sc.type || "KEYWORD",
              text: sc.keyword?.text || "",
              matchType: (sc.keyword?.matchType as KeywordMatchType) || "BROAD"
            });
          }
        }
      }

      return keywords;
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] listSharedKeywords error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * Add a negative keyword to a shared set.
   */
  public static async addKeywordToSharedList(
    organizationId: string,
    customerId: string,
    sharedSetIdOrResource: string,
    keyword: { text: string; matchType: KeywordMatchType }
  ): Promise<{ success: boolean; resourceName: string; text: string; matchType: KeywordMatchType }> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanText = (keyword.text || "").trim();
    if (!cleanText) {
      throw new Error("Keyword text is required.");
    }

    const validMatchTypes: KeywordMatchType[] = ["EXACT", "PHRASE", "BROAD"];
    const matchType = (keyword.matchType || "BROAD").toUpperCase() as KeywordMatchType;
    if (!validMatchTypes.includes(matchType)) {
      throw new Error(`Invalid match type '${keyword.matchType}'. Supported: EXACT, PHRASE, BROAD.`);
    }

    const setId = sharedSetIdOrResource.includes("/")
      ? sharedSetIdOrResource.split("/").pop()!
      : sharedSetIdOrResource;
    const sharedSetResource = `customers/${cid}/sharedSets/${setId}`;

    const payload = {
      operations: [
        {
          create: {
            sharedSet: sharedSetResource,
            keyword: {
              text: cleanText,
              matchType
            }
          }
        }
      ]
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/sharedCriteria:mutate`,
        payload,
        { headers }
      );

      const createdResource = res.data?.results?.[0]?.resourceName;

      return {
        success: true,
        resourceName: createdResource,
        text: cleanText,
        matchType
      };
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] addKeywordToSharedList error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * Remove a negative keyword from a shared set.
   */
  public static async removeKeywordFromSharedList(
    organizationId: string,
    customerId: string,
    criterionResourceOrId: string,
    sharedSetId?: string
  ): Promise<{ success: boolean; removedResourceName: string }> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    let resourceName = criterionResourceOrId;
    if (!resourceName.includes("sharedCriteria/")) {
      const cleanSetId = (sharedSetId || "").includes("/")
        ? sharedSetId!.split("/").pop()!
        : sharedSetId;
      if (!cleanSetId) {
        throw new Error("sharedSetId is required when providing a bare criterionId.");
      }
      resourceName = `customers/${cid}/sharedCriteria/${cleanSetId}~${criterionResourceOrId}`;
    }

    const payload = {
      operations: [
        {
          remove: resourceName
        }
      ]
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/sharedCriteria:mutate`,
        payload,
        { headers }
      );

      return {
        success: true,
        removedResourceName: res.data?.results?.[0]?.resourceName || resourceName
      };
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] removeKeywordFromSharedList error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * List all campaigns attached to a shared set.
   */
  public static async listCampaignsForSharedList(
    organizationId: string,
    customerId: string,
    sharedSetIdOrResource: string
  ): Promise<CampaignSharedSetItem[]> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const setId = sharedSetIdOrResource.includes("/")
      ? sharedSetIdOrResource.split("/").pop()!
      : sharedSetIdOrResource;
    const targetSetResource = `customers/${cid}/sharedSets/${setId}`;

    const query = `
      SELECT
        campaign_shared_set.resource_name,
        campaign_shared_set.campaign,
        campaign_shared_set.shared_set,
        campaign_shared_set.status,
        campaign.id,
        campaign.name
      FROM campaign_shared_set
      WHERE campaign_shared_set.shared_set = '${targetSetResource}'
        AND campaign_shared_set.status != 'REMOVED'
      ORDER BY campaign.name ASC
    `;

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:searchStream`,
        { query },
        { headers }
      );

      const batches = res.data;
      const attachments: CampaignSharedSetItem[] = [];

      if (Array.isArray(batches)) {
        for (const batch of batches) {
          const results = batch.results || [];
          for (const row of results) {
            const css = row.campaignSharedSet || {};
            const camp = row.campaign || {};
            attachments.push({
              resourceName: css.resourceName || "",
              campaignId: String(camp.id || (css.campaign ? css.campaign.split("/").pop()! : "")),
              campaignName: camp.name || `Campaign #${camp.id}`,
              campaignResourceName: css.campaign || `customers/${cid}/campaigns/${camp.id}`,
              sharedSetResourceName: css.sharedSet || targetSetResource,
              status: css.status || "ENABLED"
            });
          }
        }
      }

      return attachments;
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] listCampaignsForSharedList error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * Attach a shared negative keyword list to a campaign.
   */
  public static async attachListToCampaign(
    organizationId: string,
    customerId: string,
    sharedSetIdOrResource: string,
    campaignIdOrResource: string
  ): Promise<{ success: boolean; resourceName: string }> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const setId = sharedSetIdOrResource.includes("/")
      ? sharedSetIdOrResource.split("/").pop()!
      : sharedSetIdOrResource;
    const campaignId = campaignIdOrResource.includes("/")
      ? campaignIdOrResource.split("/").pop()!
      : campaignIdOrResource;

    const payload = {
      operations: [
        {
          create: {
            campaign: `customers/${cid}/campaigns/${campaignId}`,
            sharedSet: `customers/${cid}/sharedSets/${setId}`
          }
        }
      ]
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/campaignSharedSets:mutate`,
        payload,
        { headers }
      );

      return {
        success: true,
        resourceName: res.data?.results?.[0]?.resourceName
      };
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] attachListToCampaign error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }

  /**
   * Detach a shared negative keyword list from a campaign.
   */
  public static async detachListFromCampaign(
    organizationId: string,
    customerId: string,
    sharedSetIdOrResource: string,
    campaignIdOrResource: string
  ): Promise<{ success: boolean; removedResourceName: string }> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const setId = sharedSetIdOrResource.includes("/")
      ? sharedSetIdOrResource.split("/").pop()!
      : sharedSetIdOrResource;
    const campaignId = campaignIdOrResource.includes("/")
      ? campaignIdOrResource.split("/").pop()!
      : campaignIdOrResource;

    const resourceName = `customers/${cid}/campaignSharedSets/${campaignId}~${setId}`;

    const payload = {
      operations: [
        {
          remove: resourceName
        }
      ]
    };

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/campaignSharedSets:mutate`,
        payload,
        { headers }
      );

      return {
        success: true,
        removedResourceName: res.data?.results?.[0]?.resourceName || resourceName
      };
    } catch (err: any) {
      console.error("[GoogleAdsSharedSetService] detachListFromCampaign error:", err?.response?.data || err.message);
      throw new Error(this.formatGoogleAdsError(err));
    }
  }
}
