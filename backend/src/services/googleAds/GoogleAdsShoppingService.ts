import axios from "axios";
import prisma from "../../utils/prisma";
import { getGoogleAccessToken } from "../gmbSyncService";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface ProductDiagnosticsFilters {
  status?: string;
  severity?: string;
  country?: string;
  destination?: string;
  merchantId?: string;
  limit?: number;
  pageToken?: string;
}

export interface ListingGroupFilters {
  campaignId?: string;
  adGroupId?: string;
  assetGroupId?: string;
}

export class GoogleAdsShoppingService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";
  private static readonly MC_BASE = "https://shoppingcontent.googleapis.com/content/v2.1";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. MERCHANT CENTER ACCOUNT RESOLUTION (Customer-scoped)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Resolves the Merchant Center Account ID connected to the selected customerId / organizationId.
   * Priority:
   * 1. Campaign shopping_setting.merchant_id for the customer
   * 2. CustomerBusinessProfile for the customer
   * 3. Google Shopping Content API authinfo discovery
   */
  public static async resolveMerchantId(
    organizationId: string,
    customerId: string,
    preferredMerchantId?: string
  ): Promise<{ merchantId: string | null; merchantName?: string; accessToken: string }> {
    const config = await (prisma as any).googleBusinessConfig.findFirst({
      where: { organizationId, isDefault: true }
    }) || await (prisma as any).googleBusinessConfig.findFirst({
      where: { organizationId }
    });

    if (!config?.googleRefreshToken) {
      throw new Error("Google account not connected for this organization.");
    }

    const clientId = process.env.GOOGLE_CLIENT_ID || "";
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET || "";
    const accessToken = await getGoogleAccessToken(clientId, clientSecret, config.googleRefreshToken);

    if (preferredMerchantId && preferredMerchantId.trim()) {
      return { merchantId: preferredMerchantId.trim(), accessToken };
    }

    const cleanCid = customerId.replace(/-/g, "").trim();

    // 1. Check CustomerBusinessProfile
    try {
      const profile = await (prisma as any).googleAdsCustomerProfile.findUnique({
        where: {
          organizationId_customerId: {
            organizationId,
            customerId: cleanCid
          }
        }
      });
      if (profile?.merchantCenterId) {
        return {
          merchantId: String(profile.merchantCenterId),
          merchantName: profile.merchantDetails?.name || undefined,
          accessToken
        };
      }
    } catch {
      // Continue
    }

    // 2. Check live Google Ads campaigns for shopping_setting.merchant_id
    try {
      const { headers } = await this.getAdsHeaders(organizationId, cleanCid);
      const campRes = await axios.post(
        `${this.ADS_BASE}/customers/${cleanCid}/googleAds:search`,
        {
          query: `
            SELECT campaign.shopping_setting.merchant_id, campaign.name
            FROM campaign
            WHERE campaign.advertising_channel_type IN ('SHOPPING', 'PERFORMANCE_MAX')
              AND campaign.shopping_setting.merchant_id IS NOT NULL
            LIMIT 1
          `
        },
        { headers }
      );
      const mId = campRes.data?.results?.[0]?.campaign?.shoppingSetting?.merchantId;
      if (mId) {
        return { merchantId: String(mId), accessToken };
      }
    } catch {
      // Continue
    }

    // 3. Fallback: discover from Content API authinfo
    try {
      const authRes = await axios.get(`${this.MC_BASE}/accounts/authinfo`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const ids = authRes.data?.accountIdentifiers || [];
      if (ids.length > 0) {
        const first = ids[0].merchantId || ids[0].aggregatorId;
        if (first) {
          return { merchantId: String(first), accessToken };
        }
      }
    } catch {
      // Fallback
    }

    return { merchantId: null, accessToken };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. PRODUCT DIAGNOSTICS & ISSUES (READ-ONLY)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retrieves Product Diagnostics / Product Issues from Google Merchant Center Content API.
   * Strictly READ-ONLY.
   */
  public static async listProductDiagnostics(
    organizationId: string,
    customerId: string,
    filters: ProductDiagnosticsFilters = {}
  ) {
    const { merchantId, accessToken } = await this.resolveMerchantId(
      organizationId,
      customerId,
      filters.merchantId
    );

    if (!merchantId) {
      return {
        success: true,
        merchantId: null,
        connected: false,
        items: [],
        total: 0,
        summary: {
          totalProducts: 0,
          approved: 0,
          disapproved: 0,
          expiring: 0,
          pending: 0
        },
        notice: "No Google Merchant Center account is linked to this Google Ads customer. Link a Merchant Center account in Settings or Profile to inspect product diagnostics."
      };
    }

    const limit = filters.limit ? Math.min(filters.limit, 100) : 50;

    try {
      const url = `${this.MC_BASE}/${merchantId}/productstatuses?maxResults=${limit}${
        filters.pageToken ? `&pageToken=${encodeURIComponent(filters.pageToken)}` : ""
      }`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      const resources = res.data?.resources || [];
      const nextPageToken = res.data?.nextPageToken || null;

      let approvedCount = 0;
      let disapprovedCount = 0;
      let expiringCount = 0;
      let pendingCount = 0;

      const items: any[] = [];

      for (const p of resources) {
        const productId = p.productId || "";
        const title = p.title || productId || "—";
        const link = p.link || "";

        // Destination statuses
        const destStatuses = p.destinationStatuses || [];
        let isDisapproved = false;
        let isApproved = false;
        let isPending = false;

        const destinations = destStatuses.map((d: any) => {
          if (d.status === "disapproved") isDisapproved = true;
          if (d.status === "approved") isApproved = true;
          if (d.status === "pending") isPending = true;
          return {
            destination: d.destination || "Shopping",
            status: d.status || "—",
            approvedCountries: d.approvedCountries || [],
            pendingCountries: d.pendingCountries || [],
            disapprovedCountries: d.disapprovedCountries || []
          };
        });

        // Overall status
        let overallStatus = "PENDING";
        if (isDisapproved) {
          overallStatus = "DISAPPROVED";
          disapprovedCount++;
        } else if (isApproved) {
          overallStatus = "APPROVED";
          approvedCount++;
        } else if (isPending) {
          overallStatus = "PENDING";
          pendingCount++;
        }

        // Item level issues
        const rawIssues = p.itemLevelIssues || [];
        const issues = rawIssues.map((iss: any) => ({
          code: iss.code || "UNKNOWN",
          severity: iss.servability === "disapproved" ? "DISAPPROVED" : (iss.servability || iss.severity || "WARNING").toUpperCase(),
          resolution: iss.resolution || "merchant_action",
          attributeName: iss.attributeName || "—",
          description: iss.description || iss.detail || "Issue detected by Google Merchant Center",
          detail: iss.detail || iss.description || "—",
          documentation: iss.documentation || "",
          applicableCountries: iss.applicableCountries || []
        }));

        items.push({
          productId,
          title,
          link,
          status: overallStatus,
          destinations,
          issues,
          issueCount: issues.length,
          lastUpdateDate: p.lastUpdateDate || "—",
          creationDate: p.creationDate || "—",
          merchantId
        });
      }

      // Apply client filters if requested
      let filteredItems = items;
      if (filters.status && filters.status !== "ALL") {
        filteredItems = filteredItems.filter(i => i.status.toUpperCase() === filters.status?.toUpperCase());
      }
      if (filters.severity && filters.severity !== "ALL") {
        filteredItems = filteredItems.filter(i =>
          i.issues.some((iss: any) => iss.severity?.toUpperCase() === filters.severity?.toUpperCase())
        );
      }
      if (filters.country) {
        const c = filters.country.toUpperCase();
        filteredItems = filteredItems.filter(i =>
          i.destinations.some((d: any) =>
            d.approvedCountries.includes(c) ||
            d.pendingCountries.includes(c) ||
            d.disapprovedCountries.includes(c)
          )
        );
      }
      if (filters.destination && filters.destination !== "ALL") {
        filteredItems = filteredItems.filter(i =>
          i.destinations.some((d: any) => d.destination.toUpperCase() === filters.destination?.toUpperCase())
        );
      }

      return {
        success: true,
        merchantId,
        connected: true,
        items: filteredItems,
        total: filteredItems.length,
        summary: {
          totalProducts: items.length,
          approved: approvedCount,
          disapproved: disapprovedCount,
          expiring: expiringCount,
          pending: pendingCount
        },
        nextPageToken
      };
    } catch (err: any) {
      console.error("[GoogleAdsShoppingService.listProductDiagnostics] error:", err?.response?.data || err.message);
      const errMsg = err?.response?.data?.error?.message || err.message;
      return {
        success: true,
        merchantId,
        connected: true,
        items: [],
        total: 0,
        summary: { totalProducts: 0, approved: 0, disapproved: 0, expiring: 0, pending: 0 },
        notice: `Google Merchant Center API returned: ${errMsg}. Ensure Content API for Shopping is enabled and the linked Google account has Merchant Center access.`
      };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. LISTING GROUPS HIERARCHY (Shopping & PMax)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Retrieves Listing Groups / Product Partition trees from:
   * 1. Standard Shopping: ad_group_criterion (WHERE ad_group_criterion.type = 'LISTING_GROUP')
   * 2. Performance Max Retail: asset_group_listing_group_filter
   */
  public static async listListingGroups(
    organizationId: string,
    customerId: string,
    filters: ListingGroupFilters = {}
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // 1. Fetch Standard Shopping Listing Groups (ad_group_criterion)
    let standardWhere = "WHERE ad_group_criterion.type = 'LISTING_GROUP'";
    if (filters.campaignId) {
      const cleanCampId = filters.campaignId.replace(/[^0-9]/g, "");
      if (cleanCampId) standardWhere += ` AND campaign.id = ${cleanCampId}`;
    }
    if (filters.adGroupId) {
      const cleanAdGroupId = filters.adGroupId.replace(/[^0-9]/g, "");
      if (cleanAdGroupId) standardWhere += ` AND ad_group.id = ${cleanAdGroupId}`;
    }

    const standardGaql = `
      SELECT
        ad_group_criterion.resource_name,
        ad_group_criterion.criterion_id,
        ad_group_criterion.status,
        ad_group_criterion.listing_group.type,
        ad_group_criterion.listing_group.parent_ad_group_criterion,
        ad_group_criterion.listing_group.case_value.product_brand.value,
        ad_group_criterion.listing_group.case_value.product_item_id.value,
        ad_group_criterion.listing_group.case_value.product_type.value,
        ad_group_criterion.listing_group.case_value.product_type.level,
        ad_group_criterion.listing_group.case_value.product_custom_attribute.value,
        ad_group_criterion.listing_group.case_value.product_custom_attribute.index,
        ad_group_criterion.cpc_bid_micros,
        ad_group_criterion.negative,
        campaign.id,
        campaign.name,
        ad_group.id,
        ad_group.name
      FROM ad_group_criterion
      ${standardWhere}
      LIMIT 200
    `;

    // 2. Fetch PMax Listing Group Filters (asset_group_listing_group_filter)
    const pmaxGaql = `
      SELECT
        asset_group_listing_group_filter.resource_name,
        asset_group_listing_group_filter.id,
        asset_group_listing_group_filter.asset_group,
        asset_group_listing_group_filter.type,
        asset_group_listing_group_filter.parent_listing_group_filter,
        asset_group_listing_group_filter.case_value.product_brand.value,
        asset_group_listing_group_filter.case_value.product_item_id.value,
        asset_group_listing_group_filter.case_value.product_type.value,
        asset_group_listing_group_filter.case_value.product_type.level,
        asset_group_listing_group_filter.case_value.product_custom_attribute.value,
        asset_group_listing_group_filter.case_value.product_custom_attribute.index
      FROM asset_group_listing_group_filter
      LIMIT 200
    `;

    const nodes: any[] = [];

    // Query Standard Shopping Listing Groups
    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: standardGaql },
        { headers }
      );
      const rows = res.data?.results || [];
      for (const r of rows) {
        const crit = r.adGroupCriterion || {};
        const lg = crit.listingGroup || {};
        const cv = lg.caseValue || {};

        let dimension = "All Products";
        let value = "All Products";

        if (cv.productBrand?.value) {
          dimension = "Brand";
          value = cv.productBrand.value;
        } else if (cv.productItemId?.value) {
          dimension = "Item ID";
          value = cv.productItemId.value;
        } else if (cv.productType?.value) {
          dimension = `Product Type (L${cv.productType.level || 1})`;
          value = cv.productType.value;
        } else if (cv.productCustomAttribute?.value) {
          dimension = `Custom Label ${cv.productCustomAttribute.index || 0}`;
          value = cv.productCustomAttribute.value;
        }

        nodes.push({
          id: String(crit.criterionId || crit.resourceName),
          resourceName: crit.resourceName,
          campaignType: "SHOPPING",
          campaignId: String(r.campaign?.id || ""),
          campaignName: r.campaign?.name || "Shopping Campaign",
          groupScopeId: String(r.adGroup?.id || ""),
          groupScopeName: r.adGroup?.name || "Ad Group",
          scopeType: "AD_GROUP",
          type: lg.type || "UNIT", // SUBDIVISION or UNIT
          isSubdivision: lg.type === "SUBDIVISION",
          isExcluded: Boolean(crit.negative),
          status: crit.status || "ENABLED",
          parentId: lg.parentAdGroupCriterion ? String(lg.parentAdGroupCriterion).split("/").pop() : null,
          parentResourceName: lg.parentAdGroupCriterion || null,
          dimension,
          value,
          cpcBidMicros: crit.cpcBidMicros ? Number(crit.cpcBidMicros) : null
        });
      }
    } catch (e: any) {
      console.warn("[GoogleAdsShoppingService] Standard listing group query notice:", e.response?.data?.error?.message || e.message);
    }

    // Query PMax Listing Group Filters
    try {
      const pmaxRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: pmaxGaql },
        { headers }
      );
      const pmaxRows = pmaxRes.data?.results || [];
      for (const r of pmaxRows) {
        const filter = r.assetGroupListingGroupFilter || {};
        const cv = filter.caseValue || {};

        let dimension = "All Products";
        let value = "All Products";

        if (cv.productBrand?.value) {
          dimension = "Brand";
          value = cv.productBrand.value;
        } else if (cv.productItemId?.value) {
          dimension = "Item ID";
          value = cv.productItemId.value;
        } else if (cv.productType?.value) {
          dimension = `Product Type (L${cv.productType.level || 1})`;
          value = cv.productType.value;
        } else if (cv.productCustomAttribute?.value) {
          dimension = `Custom Label ${cv.productCustomAttribute.index || 0}`;
          value = cv.productCustomAttribute.value;
        }

        nodes.push({
          id: String(filter.id || filter.resourceName),
          resourceName: filter.resourceName,
          campaignType: "PERFORMANCE_MAX",
          campaignId: "",
          campaignName: "Performance Max Campaign",
          groupScopeId: String(filter.assetGroup || "").split("/").pop() || "",
          groupScopeName: `Asset Group ${String(filter.assetGroup || "").split("/").pop()}`,
          scopeType: "ASSET_GROUP",
          type: filter.type || "UNIT_INCLUDED",
          isSubdivision: filter.type === "SUBDIVISION",
          isExcluded: filter.type === "UNIT_EXCLUDED",
          status: "ENABLED",
          parentId: filter.parentListingGroupFilter ? String(filter.parentListingGroupFilter).split("/").pop() : null,
          parentResourceName: filter.parentListingGroupFilter || null,
          dimension,
          value,
          cpcBidMicros: null
        });
      }
    } catch (e: any) {
      console.warn("[GoogleAdsShoppingService] PMax listing group filter query notice:", e.response?.data?.error?.message || e.message);
    }

    // Build hierarchy tree
    const rootNodes: any[] = [];
    const nodeMap = new Map<string, any>();

    nodes.forEach(n => {
      nodeMap.set(n.resourceName || n.id, { ...n, children: [] });
    });

    nodeMap.forEach(n => {
      if (n.parentResourceName && nodeMap.has(n.parentResourceName)) {
        nodeMap.get(n.parentResourceName).children.push(n);
      } else {
        rootNodes.push(n);
      }
    });

    return {
      success: true,
      nodes,
      hierarchy: rootNodes,
      total: nodes.length
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. LISTING GROUP MUTATIONS (CREATE SUBDIVISION/UNIT & REMOVE)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Adds or excludes a product partition in a standard Shopping Ad Group.
   */
  public static async mutateShoppingListingGroup(
    organizationId: string,
    customerId: string,
    operation: "create" | "remove",
    params: {
      adGroupId?: string;
      parentCriterionResourceName?: string;
      criterionResourceName?: string;
      type?: "SUBDIVISION" | "UNIT";
      isExcluded?: boolean;
      cpcBidMicros?: number;
      dimension?: "BRAND" | "ITEM_ID" | "PRODUCT_TYPE";
      value?: string;
    }
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (operation === "remove") {
      if (!params.criterionResourceName) {
        throw new Error("criterionResourceName is required to remove a listing group.");
      }
      const mutatePayload = {
        operations: [
          {
            remove: params.criterionResourceName
          }
        ]
      };
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`,
        mutatePayload,
        { headers }
      );
      return {
        success: true,
        results: res.data?.results || []
      };
    }

    if (operation === "create") {
      if (!params.adGroupId) {
        throw new Error("adGroupId is required to create a listing group.");
      }

      const cleanAdGroupId = params.adGroupId.replace(/[^0-9]/g, "");
      const adGroupResource = `customers/${cid}/adGroups/${cleanAdGroupId}`;

      const listingGroupObj: any = {
        type: params.type || "UNIT"
      };

      if (params.parentCriterionResourceName) {
        listingGroupObj.parentAdGroupCriterion = params.parentCriterionResourceName;
      }

      if (params.dimension && params.value) {
        listingGroupObj.caseValue = {};
        if (params.dimension === "BRAND") {
          listingGroupObj.caseValue.productBrand = { value: params.value };
        } else if (params.dimension === "ITEM_ID") {
          listingGroupObj.caseValue.productItemId = { value: params.value };
        } else if (params.dimension === "PRODUCT_TYPE") {
          listingGroupObj.caseValue.productType = { level: "LEVEL1", value: params.value };
        }
      }

      const criterionCreate: any = {
        adGroup: adGroupResource,
        status: "ENABLED",
        negative: Boolean(params.isExcluded),
        listingGroup: listingGroupObj
      };

      if (params.cpcBidMicros && !params.isExcluded) {
        criterionCreate.cpcBidMicros = params.cpcBidMicros;
      }

      const mutatePayload = {
        operations: [
          {
            create: criterionCreate
          }
        ]
      };

      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`,
        mutatePayload,
        { headers }
      );

      return {
        success: true,
        results: res.data?.results || []
      };
    }

    throw new Error(`Unsupported operation: ${operation}`);
  }
}
