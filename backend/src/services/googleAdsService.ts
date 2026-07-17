import axios from "axios";
import { getGoogleAccessToken } from "./gmbSyncService";
import prisma from "../utils/prisma";

const ADS_API_VERSION = "v24";
const ADS_BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

export class GoogleAdsService {
  private static DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  private static CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  private static CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";

  // ─────────────────────────────────────────────────────────────────────────
  // CORE: Build Ads API headers (MCC-aware)
  // ─────────────────────────────────────────────────────────────────────────
  public static async getAdsHeaders(organizationId: string, customerId?: string) {
    const config = await prisma.googleBusinessConfig.findUnique({
      where: { organizationId }
    });

    if (!config?.googleRefreshToken) {
      throw new Error("Google account not connected for this organization.");
    }

    const accessToken = await getGoogleAccessToken(
      this.CLIENT_ID,
      this.CLIENT_SECRET,
      config.googleRefreshToken
    );

    const cid = (customerId || config.googleAdsCustomerId || "").replace(/-/g, "").trim();
    if (!cid) throw new Error("Google Ads Customer ID not configured. Please select an account.");

    // ── MCC Logic ──────────────────────────────────────────────────────────
    // Find the manager (MCC) account saved in DB for this org.
    // When querying a sub/client account, we MUST send login-customer-id = managerAccountId.
    // The Google Ads API requires this when using a manager developer token.
    let loginCustomerId: string | undefined;

    const managerAccount = await prisma.googleAdAccount.findFirst({
      where: { organizationId, isManager: true }
    });

    if (managerAccount) {
      const managerId = managerAccount.customerId.replace(/-/g, "");
      // Always add login-customer-id when we have a manager account
      // (even if querying the manager itself — Google allows it)
      loginCustomerId = managerId;
    } else if (config.googleAdsCustomerId) {
      // Fallback: if no manager in DB yet, use saved customer ID as login header
      const savedId = config.googleAdsCustomerId.replace(/-/g, "");
      if (savedId !== cid) loginCustomerId = savedId;
    }

    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": this.DEVELOPER_TOKEN,
      "Content-Type": "application/json",
      ...(loginCustomerId ? { "login-customer-id": loginCustomerId } : {})
    };

    return { headers, customerId: cid, accessToken, managerId: loginCustomerId };
  }

  /** Build headers for manager-level calls (accessible-customers, sub-account listing) */
  public static async getManagerHeaders(organizationId: string) {
    const config = await prisma.googleBusinessConfig.findUnique({ where: { organizationId } });
    if (!config?.googleRefreshToken) throw new Error("Google account not connected.");
    const accessToken = await getGoogleAccessToken(this.CLIENT_ID, this.CLIENT_SECRET, config.googleRefreshToken);
    return {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "developer-token": this.DEVELOPER_TOKEN,
        "Content-Type": "application/json"
      },
      accessToken
    };
  }

  // Helper for GAQL search
  public static async gaqlSearch(organizationId: string, customerId: string, query: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const url = `${ADS_BASE}/customers/${customerId}/googleAds:search`;
    const response = await axios.post(url, { query }, { headers });
    return response.data.results || [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACCOUNTS
  // ─────────────────────────────────────────────────────────────────────────

  /** List all accessible customer resource names for this OAuth token */
  public static async listAccessibleCustomers(organizationId: string) {
    const { headers } = await this.getManagerHeaders(organizationId);
    const url = `${ADS_BASE}/customers:listAccessibleCustomers`;
    console.log(`[GoogleAds] GET ${url}`);
    console.log(`[GoogleAds] Headers:`, JSON.stringify({ ...headers, Authorization: "Bearer <redacted>" }));
    try {
      const res = await axios.get(url, { headers });
      console.log(`[GoogleAds] listAccessibleCustomers OK — found ${(res.data.resourceNames || []).length} accounts`);
      return res.data.resourceNames || [];
    } catch (err: any) {
      const status = err?.response?.status;
      const body = JSON.stringify(err?.response?.data).slice(0, 500);
      console.error(`[GoogleAds] listAccessibleCustomers failed — HTTP ${status}:`, body);
      throw new Error(`Google Ads API error (${status}): ${body}`);
    }
  }

  /**
   * List all sub-accounts (client accounts) under a Manager (MCC) account.
   * Uses customer_client GAQL — the proper way to enumerate MCC children.
   */
  public static async listSubAccounts(organizationId: string, managerCustomerId: string) {
    const config = await prisma.googleBusinessConfig.findUnique({ where: { organizationId } });
    if (!config?.googleRefreshToken) throw new Error("Google account not connected.");
    const accessToken = await getGoogleAccessToken(this.CLIENT_ID, this.CLIENT_SECRET, config.googleRefreshToken);

    const managerId = managerCustomerId.replace(/-/g, "");
    const headers: Record<string, string> = {
      Authorization: `Bearer ${accessToken}`,
      "developer-token": this.DEVELOPER_TOKEN,
      "Content-Type": "application/json",
      "login-customer-id": managerId
    };

    const query = `
      SELECT
        customer_client.client_customer,
        customer_client.level,
        customer_client.manager,
        customer_client.descriptive_name,
        customer_client.currency_code,
        customer_client.time_zone,
        customer_client.id,
        customer_client.status
      FROM customer_client
      WHERE customer_client.level <= 1
        AND customer_client.status != 'CLOSED'
    `;

    const url = `${ADS_BASE}/customers/${managerId}/googleAds:search`;
    const res = await axios.post(url, { query }, { headers });
    const results = res.data.results || [];

    return results.map((r: any) => ({
      customerId: r.customerClient.id,
      clientCustomer: r.customerClient.clientCustomer,
      level: r.customerClient.level,
      isManager: r.customerClient.manager === true,
      name: r.customerClient.descriptiveName || `Account ${r.customerClient.id}`,
      currencyCode: r.customerClient.currencyCode,
      timeZone: r.customerClient.timeZone,
      status: r.customerClient.status
    }));
  }

  /** Get detailed info for a single customer account */
  public static async getCustomerInfo(organizationId: string, customerId: string) {
    try {
      const rows = await this.gaqlSearch(organizationId, customerId, `
        SELECT customer.id, customer.descriptive_name, customer.currency_code, customer.time_zone,
               customer.status, customer.manager, customer.optimization_score
        FROM customer LIMIT 1
      `);
      return rows[0]?.customer || null;
    } catch (err: any) {
      // If we can't query the customer directly (e.g. it's the manager account querying itself),
      // return basic info
      console.warn("getCustomerInfo fallback:", err.message);
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BUDGETS
  // ─────────────────────────────────────────────────────────────────────────

  public static async listBudgets(organizationId: string, customerId: string) {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT campaign_budget.id, campaign_budget.name, campaign_budget.amount_micros,
             campaign_budget.status, campaign_budget.delivery_method,
             campaign_budget.explicitly_shared, campaign_budget.reference_count
      FROM campaign_budget
      WHERE campaign_budget.status != 'REMOVED'
      ORDER BY campaign_budget.id DESC
    `);
    return rows.map((r: any) => ({
      id: r.campaignBudget.id,
      resourceName: r.campaignBudget.resourceName,
      name: r.campaignBudget.name,
      amountMicros: r.campaignBudget.amountMicros,
      amountMain: Number(r.campaignBudget.amountMicros) / 1_000_000,
      status: r.campaignBudget.status,
      deliveryMethod: r.campaignBudget.deliveryMethod,
      explicitlyShared: r.campaignBudget.explicitlyShared,
      referenceCount: r.campaignBudget.referenceCount
    }));
  }

  public static async createBudget(organizationId: string, customerId: string, params: {
    name: string; amountPerDay: number; deliveryMethod?: string; shared?: boolean;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const amountMicros = Math.round(params.amountPerDay * 1_000_000);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignBudgets:mutate`, {
      operations: [{
        create: {
          name: params.name || `Budget ₹${params.amountPerDay}/day (${Date.now()})`,
          amountMicros,
          deliveryMethod: params.deliveryMethod || "STANDARD",
          explicitlyShared: params.shared || false
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async updateBudget(organizationId: string, customerId: string, budgetResourceName: string, amountPerDay: number) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const amountMicros = Math.round(amountPerDay * 1_000_000);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignBudgets:mutate`, {
      operations: [{ update: { resourceName: budgetResourceName, amountMicros }, updateMask: "amountMicros" }]
    }, { headers });
    return res.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CAMPAIGNS
  // ─────────────────────────────────────────────────────────────────────────

  public static async getCampaignPerformance(organizationId: string, customerId?: string) {
    const config = await prisma.googleBusinessConfig.findUnique({ where: { organizationId } });
    const cid = (customerId || config?.googleAdsCustomerId || "").replace(/-/g, "");
    if (!cid) throw new Error("No customer ID");

    const rows = await this.gaqlSearch(organizationId, cid, `
      SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
             campaign.bidding_strategy_type, campaign.start_date_time, campaign.end_date_time,
             campaign_budget.amount_micros, campaign_budget.resource_name,
             metrics.impressions, metrics.clicks, metrics.cost_micros,
             metrics.ctr, metrics.conversions, metrics.average_cpc,
             metrics.all_conversions_value, metrics.search_impression_share
      FROM campaign
      WHERE campaign.status IN ('ENABLED', 'PAUSED')
      ORDER BY metrics.impressions DESC
    `);

    return rows.map((r: any) => ({
      id: String(r.campaign?.id),
      resourceName: r.campaign?.resourceName,
      name: r.campaign?.name,
      status: r.campaign?.status,
      channelType: r.campaign?.advertisingChannelType,
      biddingStrategy: r.campaign?.biddingStrategyType,
      startDate: r.campaign?.startDateTime,
      endDate: r.campaign?.endDateTime,
      budgetAmountMicros: r.campaignBudget?.amountMicros,
      budgetResourceName: r.campaignBudget?.resourceName,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      ctr: (Number(r.metrics?.ctr || 0) * 100).toFixed(2) + "%",
      conversions: Number(r.metrics?.conversions || 0),
      cost: (Number(r.metrics?.costMicros || 0) / 1_000_000).toFixed(2),
      avgCpc: (Number(r.metrics?.averageCpc || 0) / 1_000_000).toFixed(2),
      allConversionsValue: Number(r.metrics?.allConversionsValue || 0).toFixed(2),
      searchImprShare: r.metrics?.searchImpressionShare
    }));
  }

  public static async createCampaign(organizationId: string, customerId: string, params: {
    name: string; budgetResourceName: string; channelType: string;
    biddingStrategy: string; targetCpaMicros?: number; targetRoas?: number;
    startDate: string; endDate?: string;
    networkSearch?: boolean; networkDisplay?: boolean;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);

    // Build bidding strategy
    let biddingConfig: any = {};
    switch (params.biddingStrategy) {
      case "TARGET_CPA": biddingConfig = { targetCpa: { targetCpaMicros: params.targetCpaMicros } }; break;
      case "TARGET_ROAS": biddingConfig = { targetRoas: { targetRoas: params.targetRoas } }; break;
      case "MAXIMIZE_CLICKS": biddingConfig = { maximizeClicks: {} }; break;
      case "MAXIMIZE_CONVERSIONS": biddingConfig = { maximizeConversions: {} }; break;
      case "MAXIMIZE_CONVERSION_VALUE": biddingConfig = { maximizeConversionValue: {} }; break;
      default: biddingConfig = { manualCpc: { enhancedCpcEnabled: false } }; break;
    }

    const startDateTime = params.startDate.includes(" ") ? params.startDate : `${params.startDate} 00:00:00`;
    const endDateTime = params.endDate ? (params.endDate.includes(" ") ? params.endDate : `${params.endDate} 23:59:59`) : undefined;

    const campaignBody: any = {
      name: params.name,
      advertisingChannelType: params.channelType || "SEARCH",
      status: "PAUSED",
      campaignBudget: params.budgetResourceName,
      startDateTime,
      networkSettings: {
        targetGoogleSearch: params.networkSearch !== false,
        targetSearchNetwork: params.networkSearch !== false,
        targetContentNetwork: params.networkDisplay || false,
        targetPartnerSearchNetwork: false
      },
      ...biddingConfig
    };

    if (endDateTime) campaignBody.endDateTime = endDateTime;

    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaigns:mutate`, {
      operations: [{ create: campaignBody }]
    }, { headers });

    return res.data.results?.[0]?.resourceName;
  }

  public static async updateCampaign(organizationId: string, customerId: string, campaignResourceName: string, updates: {
    name?: string; status?: string; endDate?: string;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const updateObj: any = { resourceName: campaignResourceName };
    const maskFields: string[] = [];
    if (updates.name) { updateObj.name = updates.name; maskFields.push("name"); }
    if (updates.status) { updateObj.status = updates.status; maskFields.push("status"); }
    if (updates.endDate) {
      const endDateTime = updates.endDate.includes(" ") ? updates.endDate : `${updates.endDate} 23:59:59`;
      updateObj.endDateTime = endDateTime;
      maskFields.push("endDateTime");
    }

    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaigns:mutate`, {
      operations: [{ update: updateObj, updateMask: maskFields.join(",") }]
    }, { headers });
    return res.data;
  }

  public static async removeCampaign(organizationId: string, customerId: string, campaignResourceName: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaigns:mutate`, {
      operations: [{ remove: campaignResourceName }]
    }, { headers });
    return res.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AD GROUPS
  // ─────────────────────────────────────────────────────────────────────────

  public static async listAdGroups(organizationId: string, customerId: string, campaignId?: string) {
    const whereClause = campaignId
      ? `WHERE ad_group.campaign = 'customers/${customerId}/campaigns/${campaignId}' AND ad_group.status != 'REMOVED'`
      : `WHERE ad_group.status != 'REMOVED'`;

    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT ad_group.id, ad_group.name, ad_group.status, ad_group.type,
             ad_group.cpc_bid_micros, ad_group.campaign, ad_group.resource_name,
             metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
      FROM ad_group ${whereClause}
      ORDER BY metrics.impressions DESC
    `);

    return rows.map((r: any) => ({
      id: String(r.adGroup.id),
      resourceName: r.adGroup.resourceName,
      name: r.adGroup.name,
      status: r.adGroup.status,
      type: r.adGroup.type,
      cpcBidMicros: r.adGroup.cpcBidMicros,
      campaignResourceName: r.adGroup.campaign,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      cost: (Number(r.metrics?.costMicros || 0) / 1_000_000).toFixed(2),
      conversions: Number(r.metrics?.conversions || 0)
    }));
  }

  public static async createAdGroup(organizationId: string, customerId: string, params: {
    name: string; campaignResourceName: string; type?: string; cpcBidMicros?: number;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroups:mutate`, {
      operations: [{
        create: {
          name: params.name,
          campaign: params.campaignResourceName,
          type: params.type || "SEARCH_STANDARD",
          status: "ENABLED",
          cpcBidMicros: params.cpcBidMicros || 1_000_000 // default ₹1 CPC
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async updateAdGroup(organizationId: string, customerId: string, adGroupResourceName: string, updates: {
    name?: string; status?: string; cpcBidMicros?: number;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const updateObj: any = { resourceName: adGroupResourceName };
    const maskFields: string[] = [];
    if (updates.name) { updateObj.name = updates.name; maskFields.push("name"); }
    if (updates.status) { updateObj.status = updates.status; maskFields.push("status"); }
    if (updates.cpcBidMicros) { updateObj.cpcBidMicros = updates.cpcBidMicros; maskFields.push("cpc_bid_micros"); }

    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroups:mutate`, {
      operations: [{ update: updateObj, updateMask: maskFields.join(",") }]
    }, { headers });
    return res.data;
  }

  public static async removeAdGroup(organizationId: string, customerId: string, adGroupResourceName: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroups:mutate`, {
      operations: [{ remove: adGroupResourceName }]
    }, { headers });
    return res.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ADS
  // ─────────────────────────────────────────────────────────────────────────

  public static async listAds(organizationId: string, customerId: string, adGroupId?: string) {
    const whereClause = adGroupId
      ? `WHERE ad_group.id = ${adGroupId} AND ad_group_ad.status != 'REMOVED'`
      : `WHERE ad_group_ad.status != 'REMOVED'`;

    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT ad_group_ad.ad.id, ad_group_ad.ad.name, ad_group_ad.status,
             ad_group_ad.ad.type, ad_group_ad.ad.final_urls,
             ad_group_ad.ad.responsive_search_ad.headlines,
             ad_group_ad.ad.responsive_search_ad.descriptions,
             ad_group_ad.ad.responsive_search_ad.path1,
             ad_group_ad.ad.responsive_search_ad.path2,
             ad_group_ad.ad_strength, ad_group_ad.ad.resource_name,
             ad_group.id, ad_group.name,
             metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr, metrics.conversions
      FROM ad_group_ad ${whereClause}
    `);

    return rows.map((r: any) => ({
      id: String(r.adGroupAd?.ad?.id),
      resourceName: r.adGroupAd?.ad?.resourceName,
      status: r.adGroupAd?.status,
      adType: r.adGroupAd?.ad?.type,
      finalUrls: r.adGroupAd?.ad?.finalUrls || [],
      headlines: r.adGroupAd?.ad?.responsiveSearchAd?.headlines || [],
      descriptions: r.adGroupAd?.ad?.responsiveSearchAd?.descriptions || [],
      path1: r.adGroupAd?.ad?.responsiveSearchAd?.path1,
      path2: r.adGroupAd?.ad?.responsiveSearchAd?.path2,
      adStrength: r.adGroupAd?.adStrength,
      adGroupId: String(r.adGroup?.id),
      adGroupName: r.adGroup?.name,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      cost: (Number(r.metrics?.costMicros || 0) / 1_000_000).toFixed(2),
      ctr: (Number(r.metrics?.ctr || 0) * 100).toFixed(2) + "%",
      conversions: Number(r.metrics?.conversions || 0)
    }));
  }

  public static async createAd(organizationId: string, customerId: string, params: {
    adGroupResourceName: string; finalUrls: string[];
    headlines: Array<{ text: string; pinnedField?: string }>;
    descriptions: Array<{ text: string; pinnedField?: string }>;
    path1?: string; path2?: string;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroupAds:mutate`, {
      operations: [{
        create: {
          adGroup: params.adGroupResourceName,
          status: "ENABLED",
          ad: {
            finalUrls: params.finalUrls,
            responsiveSearchAd: {
              headlines: params.headlines.slice(0, 15).map(h => ({
                text: h.text.substring(0, 30),
                ...(h.pinnedField ? { pinnedField: h.pinnedField } : {})
              })),
              descriptions: params.descriptions.slice(0, 4).map(d => ({
                text: d.text.substring(0, 90),
                ...(d.pinnedField ? { pinnedField: d.pinnedField } : {})
              })),
              ...(params.path1 ? { path1: params.path1 } : {}),
              ...(params.path2 ? { path2: params.path2 } : {})
            }
          }
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async updateAd(organizationId: string, customerId: string, adResourceName: string, updates: {
    status?: string; finalUrls?: string[];
    headlines?: Array<{ text: string }>; descriptions?: Array<{ text: string }>;
    path1?: string; path2?: string;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const updateObj: any = { resourceName: adResourceName };
    const maskFields: string[] = [];
    if (updates.status) { updateObj.status = updates.status; maskFields.push("status"); }
    if (updates.finalUrls) { updateObj.ad = { finalUrls: updates.finalUrls }; maskFields.push("ad.final_urls"); }

    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroupAds:mutate`, {
      operations: [{ update: updateObj, updateMask: maskFields.join(",") }]
    }, { headers });
    return res.data;
  }

  public static async removeAd(organizationId: string, customerId: string, adResourceName: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroupAds:mutate`, {
      operations: [{ remove: adResourceName }]
    }, { headers });
    return res.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KEYWORDS
  // ─────────────────────────────────────────────────────────────────────────

  public static async listKeywords(organizationId: string, customerId: string, adGroupId?: string, includeNegatives = true) {
    const negativeWhere = includeNegatives ? "" : "AND ad_group_criterion.negative = false";
    const adGroupWhere = adGroupId ? `AND ad_group.id = ${adGroupId}` : "";
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT ad_group_criterion.criterion_id, ad_group_criterion.keyword.text,
             ad_group_criterion.keyword.match_type, ad_group_criterion.status,
             ad_group_criterion.negative, ad_group_criterion.cpc_bid_micros,
             ad_group_criterion.quality_info.quality_score,
             ad_group_criterion.resource_name,
             ad_group.id, ad_group.name,
             metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
      FROM ad_group_criterion
      WHERE ad_group_criterion.type = 'KEYWORD'
        AND ad_group_criterion.status != 'REMOVED'
        ${negativeWhere} ${adGroupWhere}
      ORDER BY metrics.impressions DESC
    `);

    return rows.map((r: any) => ({
      id: String(r.adGroupCriterion?.criterionId),
      resourceName: r.adGroupCriterion?.resourceName,
      text: r.adGroupCriterion?.keyword?.text,
      matchType: r.adGroupCriterion?.keyword?.matchType,
      status: r.adGroupCriterion?.status,
      isNegative: r.adGroupCriterion?.negative,
      cpcBidMicros: r.adGroupCriterion?.cpcBidMicros,
      qualityScore: r.adGroupCriterion?.qualityInfo?.qualityScore,
      adGroupId: String(r.adGroup?.id),
      adGroupName: r.adGroup?.name,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      cost: (Number(r.metrics?.costMicros || 0) / 1_000_000).toFixed(2),
      conversions: Number(r.metrics?.conversions || 0)
    }));
  }

  public static async addKeywords(organizationId: string, customerId: string, adGroupResourceName: string, keywords: Array<{
    text: string; matchType?: string; isNegative?: boolean; cpcBidMicros?: number;
  }>) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const operations = keywords.map(kw => ({
      create: {
        adGroup: adGroupResourceName,
        status: "ENABLED",
        negative: kw.isNegative || false,
        keyword: { text: kw.text, matchType: kw.matchType || "BROAD" },
        ...(kw.cpcBidMicros ? { cpcBidMicros: kw.cpcBidMicros } : {})
      }
    }));
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroupCriteria:mutate`, { operations }, { headers });
    return res.data.results || [];
  }

  public static async updateKeyword(organizationId: string, customerId: string, keywordResourceName: string, updates: {
    status?: string; cpcBidMicros?: number;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const updateObj: any = { resourceName: keywordResourceName };
    const maskFields: string[] = [];
    if (updates.status) { updateObj.status = updates.status; maskFields.push("status"); }
    if (updates.cpcBidMicros) { updateObj.cpcBidMicros = updates.cpcBidMicros; maskFields.push("cpc_bid_micros"); }

    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroupCriteria:mutate`, {
      operations: [{ update: updateObj, updateMask: maskFields.join(",") }]
    }, { headers });
    return res.data;
  }

  public static async removeKeyword(organizationId: string, customerId: string, keywordResourceName: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroupCriteria:mutate`, {
      operations: [{ remove: keywordResourceName }]
    }, { headers });
    return res.data;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EXTENSIONS / ASSETS
  // ─────────────────────────────────────────────────────────────────────────

  public static async listExtensions(organizationId: string, customerId: string) {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT campaign_asset.asset, campaign_asset.field_type, campaign_asset.status,
             campaign_asset.campaign,
             asset.id, asset.name, asset.type, asset.resource_name,
             asset.sitelink_asset.link_text, asset.sitelink_asset.description1, asset.sitelink_asset.description2,
             asset.sitelink_asset.final_urls,
             asset.callout_asset.callout_text,
             asset.call_asset.phone_number, asset.call_asset.country_code
      FROM campaign_asset
      WHERE campaign_asset.status != 'REMOVED'
    `);

    return rows.map((r: any) => ({
      assetId: String(r.asset?.id),
      assetResourceName: r.asset?.resourceName,
      assetName: r.asset?.name,
      assetType: r.asset?.type,
      fieldType: r.campaignAsset?.fieldType,
      status: r.campaignAsset?.status,
      campaignResourceName: r.campaignAsset?.campaign,
      sitelink: r.asset?.sitelinkAsset ? {
        linkText: r.asset.sitelinkAsset.linkText,
        description1: r.asset.sitelinkAsset.description1,
        description2: r.asset.sitelinkAsset.description2,
        finalUrls: r.asset.sitelinkAsset.finalUrls
      } : null,
      callout: r.asset?.calloutAsset?.calloutText || null,
      call: r.asset?.callAsset ? {
        phoneNumber: r.asset.callAsset.phoneNumber,
        countryCode: r.asset.callAsset.countryCode
      } : null
    }));
  }

  public static async createSitelinkExtension(organizationId: string, customerId: string, campaignResourceName: string, sitelinks: Array<{
    linkText: string; description1?: string; description2?: string; finalUrl: string;
  }>) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);

    // Step 1: Create asset
    const assetOperations = sitelinks.map(sl => ({
      create: {
        name: sl.linkText,
        sitelinkAsset: {
          linkText: sl.linkText,
          description1: sl.description1 || "",
          description2: sl.description2 || "",
          finalUrls: [sl.finalUrl]
        }
      }
    }));
    const assetRes = await axios.post(`${ADS_BASE}/customers/${customerId}/assets:mutate`, { operations: assetOperations }, { headers });
    const assetResourceNames = (assetRes.data.results || []).map((r: any) => r.resourceName);

    // Step 2: Attach to campaign
    const linkOperations = assetResourceNames.map((arn: string) => ({
      create: { campaign: campaignResourceName, asset: arn, fieldType: "SITELINK" }
    }));
    await axios.post(`${ADS_BASE}/customers/${customerId}/campaignAssets:mutate`, { operations: linkOperations }, { headers });
    return assetResourceNames;
  }

  public static async createCalloutExtension(organizationId: string, customerId: string, campaignResourceName: string, callouts: string[]) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const assetOperations = callouts.map(text => ({ create: { name: text, calloutAsset: { calloutText: text } } }));
    const assetRes = await axios.post(`${ADS_BASE}/customers/${customerId}/assets:mutate`, { operations: assetOperations }, { headers });
    const assetResourceNames = (assetRes.data.results || []).map((r: any) => r.resourceName);
    const linkOperations = assetResourceNames.map((arn: string) => ({
      create: { campaign: campaignResourceName, asset: arn, fieldType: "CALLOUT" }
    }));
    await axios.post(`${ADS_BASE}/customers/${customerId}/campaignAssets:mutate`, { operations: linkOperations }, { headers });
    return assetResourceNames;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CONVERSIONS
  // ─────────────────────────────────────────────────────────────────────────

  public static async listConversions(organizationId: string, customerId: string) {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT conversion_action.id, conversion_action.name, conversion_action.category,
             conversion_action.status, conversion_action.type,
             conversion_action.value_settings.default_value,
             conversion_action.counting_type,
             conversion_action.click_through_lookback_window_days,
             conversion_action.tag_snippets,
             metrics.conversions, metrics.conversions_value
      FROM conversion_action
      WHERE conversion_action.status != 'REMOVED'
    `);

    return rows.map((r: any) => ({
      id: String(r.conversionAction?.id),
      name: r.conversionAction?.name,
      category: r.conversionAction?.category,
      status: r.conversionAction?.status,
      type: r.conversionAction?.type,
      defaultValue: r.conversionAction?.valueSettings?.defaultValue,
      countingType: r.conversionAction?.countingType,
      lookbackWindow: r.conversionAction?.clickThroughLookbackWindowDays,
      tagSnippets: r.conversionAction?.tagSnippets || [],
      conversions: Number(r.metrics?.conversions || 0),
      conversionsValue: Number(r.metrics?.conversionsValue || 0)
    }));
  }

  public static async createConversion(organizationId: string, customerId: string, params: {
    name: string; category: string; value?: number; countingType?: string; lookbackDays?: number;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/conversionActions:mutate`, {
      operations: [{
        create: {
          name: params.name,
          category: params.category,
          type: "WEBPAGE",
          status: "ENABLED",
          countingType: params.countingType || "ONE_PER_CLICK",
          clickThroughLookbackWindowDays: params.lookbackDays || 30,
          valueSettings: { defaultValue: params.value || 0, alwaysUseDefaultValue: !params.value }
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AUDIENCES / REMARKETING
  // ─────────────────────────────────────────────────────────────────────────

  public static async listAudiences(organizationId: string, customerId: string) {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT user_list.id, user_list.name, user_list.description,
             user_list.membership_status, user_list.size_for_search,
             user_list.size_range_for_search, user_list.eligible_for_search,
             user_list.type, user_list.resource_name
      FROM user_list
      WHERE user_list.membership_status = 'OPEN'
    `);

    return rows.map((r: any) => ({
      id: String(r.userList?.id),
      resourceName: r.userList?.resourceName,
      name: r.userList?.name,
      description: r.userList?.description,
      membershipStatus: r.userList?.membershipStatus,
      sizeForSearch: r.userList?.sizeForSearch,
      sizeRange: r.userList?.sizeRangeForSearch,
      eligibleForSearch: r.userList?.eligibleForSearch,
      type: r.userList?.type
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GEO TARGETS
  // ─────────────────────────────────────────────────────────────────────────

  public static async searchGeoTargets(organizationId: string, customerId: string, query: string, locale = "en") {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.get(`${ADS_BASE}/geoTargetConstants:suggest`, {
      params: { "location_names.names": query, locale },
      headers
    });
    return (res.data.geoTargetConstantSuggestions || []).map((s: any) => ({
      id: s.geoTargetConstant?.id,
      name: s.geoTargetConstant?.name,
      countryCode: s.geoTargetConstant?.countryCode,
      targetType: s.geoTargetConstant?.targetType,
      resourceName: s.geoTargetConstant?.resourceName,
      canonicalName: s.canonicalName
    }));
  }

  public static async addGeoTargets(organizationId: string, customerId: string, campaignResourceName: string, geoTargetIds: string[]) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const operations = geoTargetIds.map(id => ({
      create: {
        campaign: campaignResourceName,
        location: { geoTargetConstant: `geoTargetConstants/${id}` }
      }
    }));
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignCriteria:mutate`, { operations }, { headers });
    return res.data.results || [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERFORMANCE REPORTS
  // ─────────────────────────────────────────────────────────────────────────

  public static async getAccountOverview(organizationId: string, customerId: string, dateRange: string = "LAST_30_DAYS") {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT metrics.impressions, metrics.clicks, metrics.cost_micros,
             metrics.ctr, metrics.conversions, metrics.average_cpc,
             metrics.all_conversions_value, metrics.cost_per_conversion
      FROM customer
      WHERE segments.date DURING ${dateRange}
    `);

    const m = rows[0]?.metrics || {};
    return {
      impressions: Number(m.impressions || 0),
      clicks: Number(m.clicks || 0),
      cost: (Number(m.costMicros || 0) / 1_000_000).toFixed(2),
      ctr: (Number(m.ctr || 0) * 100).toFixed(2) + "%",
      conversions: Number(m.conversions || 0),
      avgCpc: (Number(m.averageCpc || 0) / 1_000_000).toFixed(2),
      allConversionsValue: Number(m.allConversionsValue || 0).toFixed(2),
      costPerConversion: (Number(m.costPerConversion || 0) / 1_000_000).toFixed(2)
    };
  }

  public static async getPerformanceByDate(organizationId: string, customerId: string, dateRange: string = "LAST_30_DAYS", groupBy = "DATE") {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT segments.date, metrics.impressions, metrics.clicks, metrics.cost_micros,
             metrics.ctr, metrics.conversions
      FROM customer
      WHERE segments.date DURING ${dateRange}
      ORDER BY segments.date ASC
    `);

    return rows.map((r: any) => ({
      date: r.segments?.date,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      cost: (Number(r.metrics?.costMicros || 0) / 1_000_000).toFixed(2),
      ctr: (Number(r.metrics?.ctr || 0) * 100).toFixed(2),
      conversions: Number(r.metrics?.conversions || 0)
    }));
  }

  public static async getSearchTermsReport(organizationId: string, customerId: string, dateRange = "LAST_30_DAYS") {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT search_term_view.search_term, search_term_view.status,
             metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions, metrics.ctr,
             campaign.name, ad_group.name
      FROM search_term_view
      WHERE segments.date DURING ${dateRange}
      ORDER BY metrics.impressions DESC
      LIMIT 200
    `);

    return rows.map((r: any) => ({
      searchTerm: r.searchTermView?.searchTerm,
      status: r.searchTermView?.status,
      campaignName: r.campaign?.name,
      adGroupName: r.adGroup?.name,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      cost: (Number(r.metrics?.costMicros || 0) / 1_000_000).toFixed(2),
      ctr: (Number(r.metrics?.ctr || 0) * 100).toFixed(2) + "%",
      conversions: Number(r.metrics?.conversions || 0)
    }));
  }

  public static async getAdPerformanceReport(organizationId: string, customerId: string, dateRange = "LAST_30_DAYS") {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT ad_group_ad.ad.id, ad_group_ad.ad.type, ad_group_ad.status,
             ad_group_ad.ad_strength, campaign.name, ad_group.name,
             metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.ctr, metrics.conversions
      FROM ad_group_ad
      WHERE ad_group_ad.status != 'REMOVED' AND segments.date DURING ${dateRange}
      ORDER BY metrics.impressions DESC
      LIMIT 100
    `);

    return rows.map((r: any) => ({
      adId: String(r.adGroupAd?.ad?.id),
      adType: r.adGroupAd?.ad?.type,
      status: r.adGroupAd?.status,
      adStrength: r.adGroupAd?.adStrength,
      campaignName: r.campaign?.name,
      adGroupName: r.adGroup?.name,
      impressions: Number(r.metrics?.impressions || 0),
      clicks: Number(r.metrics?.clicks || 0),
      cost: (Number(r.metrics?.costMicros || 0) / 1_000_000).toFixed(2),
      ctr: (Number(r.metrics?.ctr || 0) * 100).toFixed(2) + "%",
      conversions: Number(r.metrics?.conversions || 0)
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FULL CAMPAIGN LAUNCH (orchestrates all steps)
  // ─────────────────────────────────────────────────────────────────────────

  public static async launchLocalSearchCampaign(params: {
    organizationId: string; customerId: string;
    campaignName: string; budget: number;
    channelType?: string; biddingStrategy?: string;
    targetCpa?: number; targetRoas?: number;
    startDate: string; endDate?: string;
    finalUrl: string; headlines: string[]; descriptions: string[]; keywords: string[];
    geoTargetIds?: string[]; networkDisplay?: boolean;
  }) {
    const { organizationId, customerId } = params;

    // 1. Create Budget
    const budgetRef = await this.createBudget(organizationId, customerId, {
      name: `${params.campaignName} Budget`,
      amountPerDay: params.budget
    });

    // 2. Create Campaign
    const campaignRef = await this.createCampaign(organizationId, customerId, {
      name: params.campaignName,
      budgetResourceName: budgetRef,
      channelType: params.channelType || "SEARCH",
      biddingStrategy: params.biddingStrategy || "MANUAL_CPC",
      targetCpaMicros: params.targetCpa ? Math.round(params.targetCpa * 1_000_000) : undefined,
      targetRoas: params.targetRoas,
      startDate: params.startDate,
      endDate: params.endDate,
      networkDisplay: params.networkDisplay || false
    });

    // 3. Create Ad Group
    const adGroupRef = await this.createAdGroup(organizationId, customerId, {
      name: `${params.campaignName} - Ad Group 1`,
      campaignResourceName: campaignRef
    });

    // 4. Create RSA
    await this.createAd(organizationId, customerId, {
      adGroupResourceName: adGroupRef,
      finalUrls: [params.finalUrl],
      headlines: params.headlines.slice(0, 15).map(h => ({ text: h.substring(0, 30) })),
      descriptions: params.descriptions.slice(0, 4).map(d => ({ text: d.substring(0, 90) }))
    });

    // 5. Add Keywords
    if (params.keywords.length > 0) {
      await this.addKeywords(organizationId, customerId, adGroupRef, params.keywords.map(kw => ({ text: kw })));
    }

    // 6. Geo targets (optional)
    if (params.geoTargetIds && params.geoTargetIds.length > 0) {
      await this.addGeoTargets(organizationId, customerId, campaignRef, params.geoTargetIds);
    }

    return {
      campaignResourceName: campaignRef,
      adGroupResourceName: adGroupRef,
      budgetResourceName: budgetRef,
      campaignId: campaignRef.split("/").pop()
    };
  }

  // ── PERFORMANCE MAX & ASSET GROUPS ───────────────────────────────────────

  public static async uploadImageAsset(organizationId: string, customerId: string, name: string, base64Data: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/assets:mutate`, {
      operations: [{
        create: {
          name,
          type: "IMAGE",
          imageAsset: {
            data: base64Data
          }
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async createTextAsset(organizationId: string, customerId: string, value: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/assets:mutate`, {
      operations: [{
        create: {
          name: `Text asset: ${value.slice(0, 15)}`,
          type: "TEXT",
          textAsset: { value }
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async createAssetGroup(organizationId: string, customerId: string, params: {
    campaignResourceName: string; name: string; finalUrls: string[]; path1?: string; path2?: string;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/assetGroups:mutate`, {
      operations: [{
        create: {
          campaign: params.campaignResourceName,
          name: params.name,
          finalUrls: params.finalUrls,
          status: "PAUSED",
          path1: params.path1 || "",
          path2: params.path2 || ""
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async linkAssetToAssetGroup(organizationId: string, customerId: string, params: {
    assetGroupResourceName: string; assetResourceName: string; fieldType: string;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/assetGroupAssets:mutate`, {
      operations: [{
        create: {
          assetGroup: params.assetGroupResourceName,
          asset: params.assetResourceName,
          fieldType: params.fieldType
        }
      }]
    }, { headers });
    return res.data.results?.[0]?.resourceName;
  }

  public static async launchPerformanceMaxCampaign(params: {
    organizationId: string; customerId: string;
    campaignName: string; budget: number;
    biddingStrategy?: string; targetCpa?: number; targetRoas?: number;
    startDate: string; endDate?: string;
    finalUrl: string; headlines: string[]; descriptions: string[];
    images?: Array<{ name: string; base64: string }>;
  }) {
    const { organizationId, customerId } = params;

    // 1. Create Budget
    const budgetRef = await this.createBudget(organizationId, customerId, {
      name: `${params.campaignName} PMax Budget`,
      amountPerDay: params.budget
    });

    // 2. Create Campaign
    const campaignRef = await this.createCampaign(organizationId, customerId, {
      name: params.campaignName,
      budgetResourceName: budgetRef,
      channelType: "PERFORMANCE_MAX",
      biddingStrategy: params.biddingStrategy || "MAXIMIZE_CONVERSIONS",
      targetCpaMicros: params.targetCpa ? Math.round(params.targetCpa * 1_000_000) : undefined,
      targetRoas: params.targetRoas,
      startDate: params.startDate,
      endDate: params.endDate
    });

    // 3. Create Asset Group
    const assetGroupRef = await this.createAssetGroup(organizationId, customerId, {
      campaignResourceName: campaignRef,
      name: `${params.campaignName} Asset Group 1`,
      finalUrls: [params.finalUrl]
    });

    // 4. Create Headlines and link them
    for (const text of params.headlines.slice(0, 5)) {
      const assetRef = await this.createTextAsset(organizationId, customerId, text);
      await this.linkAssetToAssetGroup(organizationId, customerId, {
        assetGroupResourceName: assetGroupRef,
        assetResourceName: assetRef,
        fieldType: "HEADLINE"
      });
    }

    // 5. Create Descriptions and link them
    for (const text of params.descriptions.slice(0, 4)) {
      const assetRef = await this.createTextAsset(organizationId, customerId, text);
      await this.linkAssetToAssetGroup(organizationId, customerId, {
        assetGroupResourceName: assetGroupRef,
        assetResourceName: assetRef,
        fieldType: "DESCRIPTION"
      });
    }

    // 6. Handle custom images if uploaded
    if (params.images && params.images.length > 0) {
      for (const img of params.images) {
        const assetRef = await this.uploadImageAsset(organizationId, customerId, img.name, img.base64);
        await this.linkAssetToAssetGroup(organizationId, customerId, {
          assetGroupResourceName: assetGroupRef,
          assetResourceName: assetRef,
          fieldType: "MARKETING_IMAGE"
        });
      }
    }

    return {
      campaignResourceName: campaignRef,
      assetGroupResourceName: assetGroupRef,
      budgetResourceName: budgetRef,
      campaignId: campaignRef.split("/").pop()
    };
  }
}
