import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface AssetGroupListItem {
  resourceName: string;
  id: string;
  name: string;
  status: "ENABLED" | "PAUSED" | "REMOVED" | string;
  campaignResourceName: string;
  campaignId: string;
  campaignName: string;
  finalUrls: string[];
  finalMobileUrls: string[];
  path1?: string;
  path2?: string;
  adStrength?: string;
  assetCount?: number;
}

export interface AssetGroupAssetItem {
  resourceName: string;
  assetGroup: string;
  asset: string;
  assetId: string;
  fieldType: string;
  status: string;
  assetName?: string;
  assetType?: string;
  text?: string;
  imageUrl?: string;
  youtubeVideoId?: string;
  youtubeVideoTitle?: string;
}

export interface AssetGroupSignalItem {
  resourceName: string;
  assetGroup: string;
  audienceResourceName?: string;
  searchTheme?: string;
}

export interface AssetGroupDetail {
  assetGroup: AssetGroupListItem;
  assets: AssetGroupAssetItem[];
  assetsByFieldType: Record<string, AssetGroupAssetItem[]>;
  signals: AssetGroupSignalItem[];
  requirements: {
    headlinesCount: number;
    minHeadlinesMet: boolean; // min 3
    longHeadlinesCount: number;
    minLongHeadlinesMet: boolean; // min 1
    descriptionsCount: number;
    minDescriptionsMet: boolean; // min 2
    marketingImagesCount: number;
    minMarketingImagesMet: boolean; // min 1 landscape
    squareMarketingImagesCount: number;
    minSquareMarketingImagesMet: boolean; // min 1 square
    logosCount: number;
    minLogosMet: boolean; // min 1 logo
    businessNameMet: boolean; // min 1
    allMinimumsMet: boolean;
  };
}

export interface CreateAssetGroupInput {
  campaignId?: string;
  campaignResourceName?: string;
  name: string;
  finalUrls: string[];
  finalMobileUrls?: string[];
  path1?: string;
  path2?: string;
  status?: "ENABLED" | "PAUSED";
}

export interface UpdateAssetGroupInput {
  name?: string;
  status?: "ENABLED" | "PAUSED" | "REMOVED";
  finalUrls?: string[];
  finalMobileUrls?: string[];
  path1?: string;
  path2?: string;
}

export class GoogleAdsAssetGroupService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Helper to ensure the target campaign is actually a PERFORMANCE_MAX campaign.
   */
  private static async validateCampaignIsPMax(
    headers: Record<string, string>,
    customerId: string,
    campaignIdentifier: string
  ): Promise<{ campaignId: string; campaignResourceName: string; campaignName: string }> {
    const isResource = campaignIdentifier.startsWith("customers/");
    const cidNum = campaignIdentifier.replace(/\D/g, "");
    
    const query = `
      SELECT campaign.id, campaign.name, campaign.advertising_channel_type, campaign.resource_name
      FROM campaign
      WHERE ${isResource ? `campaign.resource_name = '${campaignIdentifier}'` : `campaign.id = ${cidNum}`}
      LIMIT 1
    `;

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${customerId}/googleAds:search`,
      { query },
      { headers }
    );

    const row = res.data.results?.[0]?.campaign;
    if (!row) {
      throw new Error(`Campaign '${campaignIdentifier}' was not found in customer account ${customerId}.`);
    }

    if (row.advertisingChannelType !== "PERFORMANCE_MAX") {
      throw new Error(
        `Campaign '${row.name || campaignIdentifier}' is of type ${row.advertisingChannelType}. ` +
        `Asset Groups are exclusively supported for PERFORMANCE_MAX campaigns.`
      );
    }

    return {
      campaignId: String(row.id),
      campaignResourceName: row.resourceName,
      campaignName: row.name || `Campaign #${row.id}`
    };
  }

  /**
   * List Asset Groups for a customer, optionally filtered by a specific PMax campaign.
   */
  public static async listAssetGroups(
    organizationId: string,
    customerId: string,
    campaignIdOrResource?: string
  ): Promise<{ assetGroups: AssetGroupListItem[]; campaignInfo?: any }> {
    const { headers, customerId: cid } = await this.getAdsHeaders(organizationId, customerId);

    let whereClauses: string[] = ["campaign.advertising_channel_type = 'PERFORMANCE_MAX'"];

    if (campaignIdOrResource) {
      if (campaignIdOrResource.startsWith("customers/")) {
        whereClauses.push(`asset_group.campaign = '${campaignIdOrResource}'`);
      } else {
        const cleanId = campaignIdOrResource.replace(/\D/g, "");
        if (cleanId) whereClauses.push(`campaign.id = ${cleanId}`);
      }
    }

    const query = `
      SELECT 
        asset_group.id,
        asset_group.name,
        asset_group.status,
        asset_group.campaign,
        asset_group.final_urls,
        asset_group.final_mobile_urls,
        asset_group.path1,
        asset_group.path2,
        asset_group.ad_strength,
        asset_group.resource_name,
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type
      FROM asset_group
      WHERE ${whereClauses.join(" AND ")}
      ORDER BY asset_group.id DESC
      LIMIT 100
    `;

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query },
      { headers }
    );

    const assetGroups: AssetGroupListItem[] = (res.data.results || []).map((row: any) => {
      const ag = row.assetGroup || {};
      const c = row.campaign || {};
      return {
        resourceName: ag.resourceName,
        id: String(ag.id || ""),
        name: ag.name || `Asset Group ${ag.id}`,
        status: ag.status || "UNKNOWN",
        campaignResourceName: ag.campaign || c.resourceName,
        campaignId: String(c.id || ""),
        campaignName: c.name || `Campaign #${c.id}`,
        finalUrls: ag.finalUrls || [],
        finalMobileUrls: ag.finalMobileUrls || [],
        path1: ag.path1 || "",
        path2: ag.path2 || "",
        adStrength: ag.adStrength || "NOT_SPECIFIED"
      };
    });

    return { assetGroups };
  }

  /**
   * Get detailed view of an Asset Group:
   * Returns metadata, associated assets grouped by fieldType, and signals.
   */
  public static async getAssetGroupDetail(
    organizationId: string,
    customerId: string,
    assetGroupResourceName: string
  ): Promise<AssetGroupDetail> {
    const { headers, customerId: cid } = await this.getAdsHeaders(organizationId, customerId);

    // 1. Fetch Asset Group metadata
    const agQuery = `
      SELECT 
        asset_group.id,
        asset_group.name,
        asset_group.status,
        asset_group.campaign,
        asset_group.final_urls,
        asset_group.final_mobile_urls,
        asset_group.path1,
        asset_group.path2,
        asset_group.ad_strength,
        asset_group.resource_name,
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type
      FROM asset_group
      WHERE asset_group.resource_name = '${assetGroupResourceName}'
      LIMIT 1
    `;

    const agRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: agQuery },
      { headers }
    );

    const agRow = agRes.data.results?.[0];
    if (!agRow) {
      throw new Error(`Asset Group '${assetGroupResourceName}' was not found in customer account ${cid}.`);
    }

    const agData = agRow.assetGroup;
    const cData = agRow.campaign;

    // 2. Fetch associated assets
    const assetsQuery = `
      SELECT 
        asset_group_asset.resource_name,
        asset_group_asset.asset_group,
        asset_group_asset.asset,
        asset_group_asset.field_type,
        asset_group_asset.status,
        asset.id,
        asset.name,
        asset.type,
        asset.text_asset.text,
        asset.image_asset.full_size.url,
        asset.youtube_video_asset.youtube_video_id,
        asset.youtube_video_asset.youtube_video_title
      FROM asset_group_asset
      WHERE asset_group_asset.asset_group = '${assetGroupResourceName}'
      LIMIT 200
    `;

    const assetsRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: assetsQuery },
      { headers }
    );

    const assets: AssetGroupAssetItem[] = (assetsRes.data.results || []).map((row: any) => {
      const aga = row.assetGroupAsset || {};
      const a = row.asset || {};
      return {
        resourceName: aga.resourceName,
        assetGroup: aga.assetGroup,
        asset: aga.asset,
        assetId: String(a.id || ""),
        fieldType: aga.fieldType,
        status: aga.status,
        assetName: a.name || "",
        assetType: a.type || "",
        text: a.textAsset?.text,
        imageUrl: a.imageAsset?.fullSize?.url,
        youtubeVideoId: a.youtubeVideoAsset?.youtubeVideoId,
        youtubeVideoTitle: a.youtubeVideoAsset?.youtubeVideoTitle
      };
    });

    // Group assets by fieldType
    const assetsByFieldType: Record<string, AssetGroupAssetItem[]> = {};
    for (const item of assets) {
      if (!assetsByFieldType[item.fieldType]) {
        assetsByFieldType[item.fieldType] = [];
      }
      assetsByFieldType[item.fieldType].push(item);
    }

    // 3. Fetch signals (audience & search themes)
    const signals: AssetGroupSignalItem[] = [];
    try {
      const sigQuery = `
        SELECT 
          asset_group_signal.resource_name,
          asset_group_signal.asset_group,
          asset_group_signal.audience.audience,
          asset_group_signal.search_theme.text
        FROM asset_group_signal
        WHERE asset_group_signal.asset_group = '${assetGroupResourceName}'
        LIMIT 50
      `;

      const sigRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: sigQuery },
        { headers }
      );

      for (const row of sigRes.data.results || []) {
        const sig = row.assetGroupSignal || {};
        signals.push({
          resourceName: sig.resourceName,
          assetGroup: sig.assetGroup,
          audienceResourceName: sig.audience?.audience,
          searchTheme: sig.searchTheme?.text
        });
      }
    } catch (sigErr: any) {
      console.warn("[GoogleAdsAssetGroupService] Notice querying signals:", sigErr.message);
    }

    // 4. Calculate PMax minimum asset requirements
    const headlinesCount = (assetsByFieldType["HEADLINE"] || []).length;
    const longHeadlinesCount = (assetsByFieldType["LONG_HEADLINE"] || []).length;
    const descriptionsCount = (assetsByFieldType["DESCRIPTION"] || []).length;
    const marketingImagesCount = (assetsByFieldType["MARKETING_IMAGE"] || []).length;
    const squareMarketingImagesCount = (assetsByFieldType["SQUARE_MARKETING_IMAGE"] || []).length;
    const logosCount = (assetsByFieldType["LOGO"] || []).length;
    const businessNameMet = (assetsByFieldType["BUSINESS_NAME"] || []).length >= 1;

    const minHeadlinesMet = headlinesCount >= 3;
    const minLongHeadlinesMet = longHeadlinesCount >= 1;
    const minDescriptionsMet = descriptionsCount >= 2;
    const minMarketingImagesMet = marketingImagesCount >= 1;
    const minSquareMarketingImagesMet = squareMarketingImagesCount >= 1;
    const minLogosMet = logosCount >= 1;

    const allMinimumsMet =
      minHeadlinesMet &&
      minLongHeadlinesMet &&
      minDescriptionsMet &&
      minMarketingImagesMet &&
      minSquareMarketingImagesMet &&
      minLogosMet &&
      businessNameMet;

    return {
      assetGroup: {
        resourceName: agData.resourceName,
        id: String(agData.id || ""),
        name: agData.name || `Asset Group ${agData.id}`,
        status: agData.status || "UNKNOWN",
        campaignResourceName: agData.campaign || cData.resourceName,
        campaignId: String(cData.id || ""),
        campaignName: cData.name || `Campaign #${cData.id}`,
        finalUrls: agData.finalUrls || [],
        finalMobileUrls: agData.finalMobileUrls || [],
        path1: agData.path1 || "",
        path2: agData.path2 || "",
        adStrength: agData.adStrength || "NOT_SPECIFIED",
        assetCount: assets.length
      },
      assets,
      assetsByFieldType,
      signals,
      requirements: {
        headlinesCount,
        minHeadlinesMet,
        longHeadlinesCount,
        minLongHeadlinesMet,
        descriptionsCount,
        minDescriptionsMet,
        marketingImagesCount,
        minMarketingImagesMet,
        squareMarketingImagesCount,
        minSquareMarketingImagesMet,
        logosCount,
        minLogosMet,
        businessNameMet,
        allMinimumsMet
      }
    };
  }

  /**
   * Create a new Asset Group in a Performance Max campaign.
   */
  public static async createAssetGroup(
    organizationId: string,
    customerId: string,
    input: CreateAssetGroupInput
  ): Promise<{ resourceName: string }> {
    const { headers, customerId: cid } = await this.getAdsHeaders(organizationId, customerId);

    const campaignIdOrResource = input.campaignResourceName || input.campaignId;
    if (!campaignIdOrResource) {
      throw new Error("campaignId or campaignResourceName is required to create an Asset Group.");
    }

    // Verify target campaign is indeed PERFORMANCE_MAX
    const pmaxCamp = await this.validateCampaignIsPMax(headers, cid, campaignIdOrResource);

    if (!input.name || !input.name.trim()) {
      throw new Error("Asset Group name is required.");
    }

    if (!input.finalUrls || !input.finalUrls.length || !input.finalUrls[0]) {
      throw new Error("At least one valid final URL is required for an Asset Group.");
    }

    const payload: any = {
      campaign: pmaxCamp.campaignResourceName,
      name: input.name.trim(),
      finalUrls: input.finalUrls.map(u => u.trim()).filter(Boolean),
      status: input.status || "PAUSED"
    };

    if (input.finalMobileUrls && input.finalMobileUrls.length > 0) {
      payload.finalMobileUrls = input.finalMobileUrls.map(u => u.trim()).filter(Boolean);
    }

    if (input.path1) payload.path1 = input.path1.trim();
    if (input.path2) payload.path2 = input.path2.trim();

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assetGroups:mutate`,
      {
        operations: [{ create: payload }]
      },
      { headers }
    );

    const resourceName = res.data.results?.[0]?.resourceName;
    if (!resourceName) {
      throw new Error("Failed to create Asset Group on Google Ads.");
    }

    return { resourceName };
  }

  /**
   * Update Asset Group name, status, finalUrls, or display paths.
   */
  public static async updateAssetGroup(
    organizationId: string,
    customerId: string,
    assetGroupResourceName: string,
    updates: UpdateAssetGroupInput
  ): Promise<{ resourceName: string }> {
    const { headers, customerId: cid } = await this.getAdsHeaders(organizationId, customerId);

    const updateMask: string[] = [];
    const assetGroupPayload: any = {
      resourceName: assetGroupResourceName
    };

    if (updates.name !== undefined) {
      assetGroupPayload.name = updates.name.trim();
      updateMask.push("name");
    }

    if (updates.status !== undefined) {
      assetGroupPayload.status = updates.status;
      updateMask.push("status");
    }

    if (updates.finalUrls !== undefined) {
      assetGroupPayload.finalUrls = updates.finalUrls.map(u => u.trim()).filter(Boolean);
      updateMask.push("final_urls");
    }

    if (updates.finalMobileUrls !== undefined) {
      assetGroupPayload.finalMobileUrls = updates.finalMobileUrls.map(u => u.trim()).filter(Boolean);
      updateMask.push("final_mobile_urls");
    }

    if (updates.path1 !== undefined) {
      assetGroupPayload.path1 = updates.path1.trim();
      updateMask.push("path1");
    }

    if (updates.path2 !== undefined) {
      assetGroupPayload.path2 = updates.path2.trim();
      updateMask.push("path2");
    }

    if (updateMask.length === 0) {
      throw new Error("No fields provided to update for Asset Group.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assetGroups:mutate`,
      {
        operations: [
          {
            update: assetGroupPayload,
            updateMask: updateMask.join(",")
          }
        ]
      },
      { headers }
    );

    const resourceName = res.data.results?.[0]?.resourceName || assetGroupResourceName;
    return { resourceName };
  }

  /**
   * Associate an existing Google Ads Asset with an Asset Group.
   */
  public static async associateAsset(
    organizationId: string,
    customerId: string,
    assetGroupResourceName: string,
    assetResourceName: string,
    fieldType: string
  ): Promise<{ resourceName: string }> {
    const { headers, customerId: cid } = await this.getAdsHeaders(organizationId, customerId);

    if (!assetGroupResourceName || !assetResourceName || !fieldType) {
      throw new Error("assetGroupResourceName, assetResourceName, and fieldType are all required.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assetGroupAssets:mutate`,
      {
        operations: [
          {
            create: {
              assetGroup: assetGroupResourceName,
              asset: assetResourceName,
              fieldType: fieldType.toUpperCase()
            }
          }
        ]
      },
      { headers }
    );

    const resourceName = res.data.results?.[0]?.resourceName;
    return { resourceName };
  }

  /**
   * Remove an asset association from an Asset Group using asset_group_asset resource name.
   */
  public static async removeAssetAssociation(
    organizationId: string,
    customerId: string,
    assetGroupAssetResourceName: string
  ): Promise<{ resourceName: string }> {
    const { headers, customerId: cid } = await this.getAdsHeaders(organizationId, customerId);

    if (!assetGroupAssetResourceName) {
      throw new Error("assetGroupAssetResourceName is required to remove association.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/assetGroupAssets:mutate`,
      {
        operations: [
          {
            remove: assetGroupAssetResourceName
          }
        ]
      },
      { headers }
    );

    const resourceName = res.data.results?.[0]?.resourceName || assetGroupAssetResourceName;
    return { resourceName };
  }

  /**
   * List existing account assets (text, images, videos) to associate without duplicate creation.
   */
  public static async listAccountAssets(
    organizationId: string,
    customerId: string,
    typeFilter?: string
  ): Promise<any[]> {
    const { headers, customerId: cid } = await this.getAdsHeaders(organizationId, customerId);

    let whereClause = "";
    if (typeFilter) {
      whereClause = `WHERE asset.type = '${typeFilter.toUpperCase()}'`;
    }

    const query = `
      SELECT
        asset.id,
        asset.name,
        asset.type,
        asset.resource_name,
        asset.text_asset.text,
        asset.image_asset.full_size.url,
        asset.youtube_video_asset.youtube_video_id,
        asset.youtube_video_asset.youtube_video_title
      FROM asset
      ${whereClause}
      ORDER BY asset.id DESC
      LIMIT 150
    `;

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query },
      { headers }
    );

    return (res.data.results || []).map((row: any) => {
      const a = row.asset || {};
      return {
        resourceName: a.resourceName,
        id: String(a.id || ""),
        name: a.name || "",
        type: a.type || "",
        text: a.textAsset?.text,
        imageUrl: a.imageAsset?.fullSize?.url,
        youtubeVideoId: a.youtubeVideoAsset?.youtubeVideoId,
        youtubeVideoTitle: a.youtubeVideoAsset?.youtubeVideoTitle
      };
    });
  }
}
