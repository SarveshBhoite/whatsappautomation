import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface AssetPolicyFilterOptions {
  campaignId?: string;
  assetType?: string;
  policyStatus?: string; // "ALL" | "APPROVED" | "DISAPPROVED" | "AREA_OF_INTEREST_ONLY" | "APPROVED_LIMITED" | "UNDER_REVIEW"
  page?: number;
  limit?: number;
}

export interface NormalizedAssetPolicyRecord {
  assetResourceName: string;
  assetId: string;
  assetType: string;
  assetName: string;
  policyApprovalStatus: string;
  policyReviewStatus: string;
  policyTopics: Array<{
    topic?: string;
    type?: string;
    evidences?: any[];
    constraints?: any[];
  }>;
  primaryPolicyTopic?: string;
  primarySeverity?: string;
  disapprovalReasons: string[];
  findings: string[];
  campaignResourceName?: string;
  campaignId?: string;
  campaignName?: string;
  adGroupResourceName?: string;
  adGroupId?: string;
  adGroupName?: string;
  associationLevel: "CAMPAIGN" | "AD_GROUP" | "CUSTOMER" | "ASSET_GROUP" | "GLOBAL";
  fieldType?: string;
  associationStatus?: string;
  // Content details if available
  textContent?: string;
  mediaDetails?: {
    fileSize?: number;
    mimeType?: string;
    youtubeVideoId?: string;
    youtubeVideoTitle?: string;
    callPhoneNumber?: string;
    sitelinkText?: string;
    sitelinkFinalUrls?: string[];
    appId?: string;
    appStore?: string;
  };
}

export interface ListAssetPolicyResponse {
  success: boolean;
  total: number;
  page: number;
  limit: number;
  summary: {
    totalAssets: number;
    approvedCount: number;
    disapprovedCount: number;
    limitedCount: number;
    underReviewCount: number;
    otherCount: number;
  };
  filtersAvailable: {
    assetTypes: string[];
    campaigns: Array<{ id: string; name: string }>;
    policyStatuses: string[];
  };
  records: NormalizedAssetPolicyRecord[];
}

export class GoogleAdsAssetPolicyService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Lists asset policy issues and review status for a specific Google Ads customer account.
   * Strictly READ-ONLY. Validates customer isolation and maps official v24 policy summaries.
   */
  public static async listAssetPolicyIssues(
    organizationId: string,
    customerId: string,
    filters: AssetPolicyFilterOptions = {}
  ): Promise<ListAssetPolicyResponse> {
    const cid = customerId.replace(/-/g, "").trim();
    if (!cid) {
      throw new Error("Valid customerId is required.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const assetMap = new Map<string, NormalizedAssetPolicyRecord>();

    // ── 1. Query Campaign Assets ──
    try {
      let campAssetGaql = `
        SELECT
          campaign_asset.campaign,
          campaign_asset.asset,
          campaign_asset.field_type,
          campaign_asset.status,
          campaign.id,
          campaign.name,
          asset.id,
          asset.name,
          asset.type,
          asset.resource_name,
          asset.text_asset.text,
          asset.image_asset.file_size,
          asset.image_asset.mime_type,
          asset.youtube_video_asset.youtube_video_id,
          asset.youtube_video_asset.youtube_video_title,
          asset.sitelink_asset.link_text,
          asset.call_asset.phone_number,
          asset.policy_summary.approval_status,
          asset.policy_summary.review_status,
          asset.policy_summary.policy_topic_entries
        FROM campaign_asset
      `;

      if (filters.campaignId) {
        const cleanCampId = filters.campaignId.replace(/[^0-9]/g, "");
        if (cleanCampId) {
          campAssetGaql += ` WHERE campaign.id = ${cleanCampId}`;
        }
      }

      campAssetGaql += ` LIMIT 500`;

      const campRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: campAssetGaql },
        { headers }
      );

      const campRows = campRes.data?.results || [];
      for (const row of campRows) {
        const a = row.asset;
        const ca = row.campaignAsset;
        const camp = row.campaign;
        if (!a?.id) continue;

        const record = this.normalizeAssetRow({
          asset: a,
          associationLevel: "CAMPAIGN",
          fieldType: ca?.fieldType,
          associationStatus: ca?.status,
          campaignId: camp?.id,
          campaignName: camp?.name,
          campaignResourceName: ca?.campaign
        });

        // Use composite key so multiple associations can be documented or merged
        const key = `${a.id}_${camp?.id || "camp"}`;
        assetMap.set(key, record);
      }
    } catch (campErr: any) {
      console.warn("[AssetPolicyService] campaign_asset query warning:", campErr?.response?.data || campErr.message);
    }

    // ── 2. Query Ad Group Assets ──
    try {
      let adGroupAssetGaql = `
        SELECT
          ad_group_asset.ad_group,
          ad_group_asset.asset,
          ad_group_asset.field_type,
          ad_group_asset.status,
          ad_group.id,
          ad_group.name,
          campaign.id,
          campaign.name,
          asset.id,
          asset.name,
          asset.type,
          asset.resource_name,
          asset.text_asset.text,
          asset.image_asset.file_size,
          asset.image_asset.mime_type,
          asset.youtube_video_asset.youtube_video_id,
          asset.youtube_video_asset.youtube_video_title,
          asset.sitelink_asset.link_text,
          asset.call_asset.phone_number,
          asset.policy_summary.approval_status,
          asset.policy_summary.review_status,
          asset.policy_summary.policy_topic_entries
        FROM ad_group_asset
      `;

      if (filters.campaignId) {
        const cleanCampId = filters.campaignId.replace(/[^0-9]/g, "");
        if (cleanCampId) {
          adGroupAssetGaql += ` WHERE campaign.id = ${cleanCampId}`;
        }
      }

      adGroupAssetGaql += ` LIMIT 500`;

      const agRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: adGroupAssetGaql },
        { headers }
      );

      const agRows = agRes.data?.results || [];
      for (const row of agRows) {
        const a = row.asset;
        const aga = row.adGroupAsset;
        const ag = row.adGroup;
        const camp = row.campaign;
        if (!a?.id) continue;

        const record = this.normalizeAssetRow({
          asset: a,
          associationLevel: "AD_GROUP",
          fieldType: aga?.fieldType,
          associationStatus: aga?.status,
          campaignId: camp?.id,
          campaignName: camp?.name,
          campaignResourceName: camp?.id ? `customers/${cid}/campaigns/${camp.id}` : undefined,
          adGroupId: ag?.id,
          adGroupName: ag?.name,
          adGroupResourceName: aga?.adGroup
        });

        const key = `${a.id}_${ag?.id || "ag"}`;
        assetMap.set(key, record);
      }
    } catch (agErr: any) {
      console.warn("[AssetPolicyService] ad_group_asset query warning:", agErr?.response?.data || agErr.message);
    }

    // ── 3. Query Customer (Account-level) Assets ──
    try {
      const custAssetGaql = `
        SELECT
          customer_asset.asset,
          customer_asset.field_type,
          customer_asset.status,
          asset.id,
          asset.name,
          asset.type,
          asset.resource_name,
          asset.text_asset.text,
          asset.image_asset.file_size,
          asset.image_asset.mime_type,
          asset.youtube_video_asset.youtube_video_id,
          asset.youtube_video_asset.youtube_video_title,
          asset.sitelink_asset.link_text,
          asset.call_asset.phone_number,
          asset.policy_summary.approval_status,
          asset.policy_summary.review_status,
          asset.policy_summary.policy_topic_entries
        FROM customer_asset
        LIMIT 500
      `;

      const custRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: custAssetGaql },
        { headers }
      );

      const custRows = custRes.data?.results || [];
      for (const row of custRows) {
        const a = row.asset;
        const ca = row.customerAsset;
        if (!a?.id) continue;

        const record = this.normalizeAssetRow({
          asset: a,
          associationLevel: "CUSTOMER",
          fieldType: ca?.fieldType,
          associationStatus: ca?.status
        });

        const key = `${a.id}_customer`;
        assetMap.set(key, record);
      }
    } catch (custErr: any) {
      console.warn("[AssetPolicyService] customer_asset query warning:", custErr?.response?.data || custErr.message);
    }

    // ── 4. Query Direct Assets with Policy Issues or Reviews (Global Asset Library) ──
    // This catches standalone image/logo/video/sitelink assets that may have been created or disapproved
    try {
      const directAssetGaql = `
        SELECT
          asset.resource_name,
          asset.id,
          asset.name,
          asset.type,
          asset.text_asset.text,
          asset.image_asset.file_size,
          asset.image_asset.mime_type,
          asset.youtube_video_asset.youtube_video_id,
          asset.youtube_video_asset.youtube_video_title,
          asset.sitelink_asset.link_text,
          asset.call_asset.phone_number,
          asset.policy_summary.approval_status,
          asset.policy_summary.review_status,
          asset.policy_summary.policy_topic_entries
        FROM asset
        WHERE asset.policy_summary.approval_status != 'APPROVED'
        LIMIT 500
      `;

      const directRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: directAssetGaql },
        { headers }
      );

      const directRows = directRes.data?.results || [];
      for (const row of directRows) {
        const a = row.asset;
        if (!a?.id) continue;

        // Check if any record for this asset already exists in assetMap
        const existingKey = Array.from(assetMap.keys()).find(k => k.startsWith(`${a.id}_`));
        if (existingKey) {
          const existing = assetMap.get(existingKey)!;
          // Enrich policy topics if missing
          if ((!existing.policyTopics || existing.policyTopics.length === 0) && a.policySummary?.policyTopicEntries?.length) {
            existing.policyTopics = a.policySummary.policyTopicEntries;
            existing.disapprovalReasons = a.policySummary.policyTopicEntries.map((e: any) => e.topic).filter(Boolean);
            existing.findings = a.policySummary.policyTopicEntries.map((e: any) => `${e.topic || 'POLICY'}: ${e.type || 'FLAG'}`);
            existing.primaryPolicyTopic = a.policySummary.policyTopicEntries[0]?.topic;
            existing.primarySeverity = a.policySummary.policyTopicEntries[0]?.type;
          }
          if (!existing.policyApprovalStatus || existing.policyApprovalStatus === "UNKNOWN") {
            existing.policyApprovalStatus = a.policySummary?.approvalStatus || "UNKNOWN";
          }
          if (!existing.policyReviewStatus || existing.policyReviewStatus === "UNKNOWN") {
            existing.policyReviewStatus = a.policySummary?.reviewStatus || "UNKNOWN";
          }
        } else {
          const record = this.normalizeAssetRow({
            asset: a,
            associationLevel: "GLOBAL"
          });
          assetMap.set(`${a.id}_global`, record);
        }
      }
    } catch (directErr: any) {
      console.warn("[AssetPolicyService] direct asset query warning:", directErr?.response?.data || directErr.message);
    }

    // Convert map to array
    let allRecords = Array.from(assetMap.values());

    // Extract dynamic filters available before applying requested filters
    const availableTypes = Array.from(new Set(allRecords.map(r => r.assetType).filter(Boolean))).sort();
    const availableStatuses = Array.from(new Set(allRecords.map(r => r.policyApprovalStatus).filter(Boolean))).sort();
    const campMap = new Map<string, string>();
    for (const r of allRecords) {
      if (r.campaignId && r.campaignName) {
        campMap.set(r.campaignId, r.campaignName);
      }
    }
    const availableCampaigns = Array.from(campMap.entries()).map(([id, name]) => ({ id, name }));

    // Calculate Account Summary Stats (across all discovered assets for customer)
    const approvedCount = allRecords.filter(r => r.policyApprovalStatus === "APPROVED").length;
    const disapprovedCount = allRecords.filter(r => r.policyApprovalStatus === "DISAPPROVED").length;
    const limitedCount = allRecords.filter(r => r.policyApprovalStatus === "AREA_OF_INTEREST_ONLY" || r.policyApprovalStatus === "APPROVED_LIMITED").length;
    const underReviewCount = allRecords.filter(r => r.policyApprovalStatus === "UNDER_REVIEW" || r.policyReviewStatus === "REVIEW_IN_PROGRESS" || r.policyReviewStatus === "ELIGIBLE_MAY_SERVE").length;
    const otherCount = allRecords.length - (approvedCount + disapprovedCount + limitedCount + underReviewCount);

    // Apply Filters
    if (filters.campaignId) {
      const cId = filters.campaignId.trim();
      allRecords = allRecords.filter(r => r.campaignId === cId);
    }

    if (filters.assetType && filters.assetType !== "ALL") {
      const typeUpper = filters.assetType.toUpperCase();
      allRecords = allRecords.filter(r => r.assetType.toUpperCase() === typeUpper);
    }

    if (filters.policyStatus && filters.policyStatus !== "ALL") {
      const statusUpper = filters.policyStatus.toUpperCase();
      allRecords = allRecords.filter(r => r.policyApprovalStatus.toUpperCase() === statusUpper);
    }

    // Pagination
    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.max(Math.min(Number(filters.limit) || 50, 200), 10);
    const startIndex = (page - 1) * limit;
    const paginatedRecords = allRecords.slice(startIndex, startIndex + limit);

    return {
      success: true,
      total: allRecords.length,
      page,
      limit,
      summary: {
        totalAssets: allRecords.length,
        approvedCount,
        disapprovedCount,
        limitedCount,
        underReviewCount,
        otherCount: Math.max(otherCount, 0)
      },
      filtersAvailable: {
        assetTypes: availableTypes,
        campaigns: availableCampaigns,
        policyStatuses: availableStatuses
      },
      records: paginatedRecords
    };
  }

  /**
   * Helper to normalize raw GAQL row into CRM standard format
   */
  private static normalizeAssetRow(params: {
    asset: any;
    associationLevel: "CAMPAIGN" | "AD_GROUP" | "CUSTOMER" | "ASSET_GROUP" | "GLOBAL";
    fieldType?: string;
    associationStatus?: string;
    campaignId?: string;
    campaignName?: string;
    campaignResourceName?: string;
    adGroupId?: string;
    adGroupName?: string;
    adGroupResourceName?: string;
  }): NormalizedAssetPolicyRecord {
    const a = params.asset;
    const policy = a.policySummary || {};
    const topicEntries: any[] = policy.policyTopicEntries || [];

    const approvalStatus = policy.approvalStatus || (topicEntries.length > 0 ? "DISAPPROVED" : "APPROVED");
    const reviewStatus = policy.reviewStatus || "REVIEWED";

    const disapprovalReasons: string[] = [];
    const findings: string[] = [];

    for (const entry of topicEntries) {
      if (entry.topic) {
        disapprovalReasons.push(entry.topic);
        const typeStr = entry.type ? ` (${entry.type})` : "";
        findings.push(`${entry.topic.replace(/_/g, " ")}${typeStr}`);
      }
    }

    const primaryPolicyTopic = topicEntries[0]?.topic || undefined;
    const primarySeverity = topicEntries[0]?.type || undefined;

    // Determine readable label/name
    let assetName = a.name || "";
    let textContent = a.textAsset?.text || "";

    if (!assetName) {
      if (a.sitelinkAsset?.linkText) {
        assetName = a.sitelinkAsset.linkText;
      } else if (a.callAsset?.phoneNumber) {
        assetName = `Call: ${a.callAsset.phoneNumber}`;
      } else if (a.appAsset?.appId) {
        assetName = `App (${a.appAsset.appId})`;
      } else if (a.youtubeVideoAsset?.youtubeVideoTitle) {
        assetName = a.youtubeVideoAsset.youtubeVideoTitle;
      } else if (a.youtubeVideoAsset?.youtubeVideoId) {
        assetName = `YouTube Video: ${a.youtubeVideoAsset.youtubeVideoId}`;
      } else if (textContent) {
        assetName = textContent.slice(0, 40);
      } else {
        assetName = `${a.type || "Asset"} #${a.id}`;
      }
    }

    return {
      assetResourceName: a.resourceName || `customers/${a.id}/assets/${a.id}`,
      assetId: String(a.id),
      assetType: a.type || "UNKNOWN",
      assetName,
      policyApprovalStatus: approvalStatus,
      policyReviewStatus: reviewStatus,
      policyTopics: topicEntries,
      primaryPolicyTopic,
      primarySeverity,
      disapprovalReasons: Array.from(new Set(disapprovalReasons)),
      findings: Array.from(new Set(findings)),
      campaignResourceName: params.campaignResourceName,
      campaignId: params.campaignId ? String(params.campaignId) : undefined,
      campaignName: params.campaignName,
      adGroupResourceName: params.adGroupResourceName,
      adGroupId: params.adGroupId ? String(params.adGroupId) : undefined,
      adGroupName: params.adGroupName,
      associationLevel: params.associationLevel,
      fieldType: params.fieldType,
      associationStatus: params.associationStatus,
      textContent: textContent || undefined,
      mediaDetails: {
        fileSize: a.imageAsset?.fileSize ? Number(a.imageAsset.fileSize) : undefined,
        mimeType: a.imageAsset?.mimeType || undefined,
        youtubeVideoId: a.youtubeVideoAsset?.youtubeVideoId || undefined,
        youtubeVideoTitle: a.youtubeVideoAsset?.youtubeVideoTitle || undefined,
        callPhoneNumber: a.callAsset?.phoneNumber || undefined,
        sitelinkText: a.sitelinkAsset?.linkText || undefined,
        sitelinkFinalUrls: a.sitelinkAsset?.finalUrls || undefined,
        appId: a.appAsset?.appId || undefined,
        appStore: a.appAsset?.appStore || undefined
      }
    };
  }
}
