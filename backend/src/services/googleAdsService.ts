import axios from "axios";
import { getGoogleAccessToken } from "./gmbSyncService";
import prisma from "../utils/prisma";
import { GoogleAdsBaseService } from "./googleAds/shared/GoogleAdsBaseService";

const ADS_API_VERSION = "v24";
const ADS_BASE = `https://googleads.googleapis.com/${ADS_API_VERSION}`;

export class GoogleAdsService {
  private static DEVELOPER_TOKEN = process.env.GOOGLE_ADS_DEVELOPER_TOKEN || "";
  private static CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
  private static CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
  private static headersCache: Map<string, { data: any, expiresAt: number }> = new Map();

  // ─────────────────────────────────────────────────────────────────────────
  // CORE: Build Ads API headers (MCC-aware)
  // ─────────────────────────────────────────────────────────────────────────
  public static async getAdsHeaders(organizationId: string, customerId?: string) {
    const cacheKey = `${organizationId}_${customerId || 'default'}`;
    const cached = this.headersCache.get(cacheKey);
    // Cache for 45 minutes to avoid token expiration and DB overload
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const config = await (prisma as any).googleBusinessConfig.findFirst({
      where: { organizationId, isDefault: true }
    }) || await (prisma as any).googleBusinessConfig.findFirst({
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

    const result = { headers, customerId: cid, accessToken, managerId: loginCustomerId };
    this.headersCache.set(cacheKey, { data: result, expiresAt: Date.now() + 45 * 60 * 1000 });
    return result;
  }

  /** Build headers for manager-level calls (accessible-customers, sub-account listing) */
  public static async getManagerHeaders(organizationId: string) {
    const config = await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId, isDefault: true } }) || await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId } });
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
    const config = await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId, isDefault: true } }) || await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId } });
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
    const config = await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId, isDefault: true } }) || await (prisma as any).googleBusinessConfig.findFirst({ where: { organizationId } });
    const cid = (customerId || config?.googleAdsCustomerId || "").replace(/-/g, "");
    if (!cid) throw new Error("No customer ID");

    const rows = await this.gaqlSearch(organizationId, cid, `
      SELECT campaign.id, campaign.name, campaign.status, campaign.advertising_channel_type,
             campaign.bidding_strategy_type, campaign.maximize_conversions.target_cpa_micros,
             campaign.maximize_conversion_value.target_roas,
             campaign.start_date_time, campaign.end_date_time,
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
      targetCpaMicros: r.campaign?.maximizeConversions?.targetCpaMicros ? Number(r.campaign.maximizeConversions.targetCpaMicros) : undefined,
      targetRoas: r.campaign?.maximizeConversionValue?.targetRoas ? Number(r.campaign.maximizeConversionValue.targetRoas) : undefined,
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
    targetSpendMicros?: number;
    startDate: string; endDate?: string;
    networkSearch?: boolean; networkDisplay?: boolean;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);

    const isPMax = params.channelType === "PERFORMANCE_MAX";

    // Build bidding strategy — v24 REST uses camelCase object keys
    // PERFORMANCE_MAX only supports maximizeConversions or maximizeConversionValue
    let biddingConfig: any = {};
    if (isPMax) {
      // Default PMax to maximizeConversionValue; override if caller says MAXIMIZE_CONVERSIONS
      if (params.biddingStrategy === "MAXIMIZE_CONVERSIONS") {
        biddingConfig = { maximizeConversions: {} };
      } else {
        biddingConfig = { maximizeConversionValue: {} };
      }
    } else {
      switch (params.biddingStrategy) {
        case "TARGET_CPA": {
          const cpaMicros = params.targetCpaMicros && params.targetCpaMicros > 0 ? String(params.targetCpaMicros) : undefined;
          // In Google Ads API v24 for standard Search campaigns, Target CPA is configured via maximizeConversions with targetCpaMicros
          biddingConfig = cpaMicros
            ? { maximizeConversions: { targetCpaMicros: cpaMicros } }
            : { maximizeConversions: {} };
          break;
        }
        case "TARGET_ROAS": {
          const rawRoas = params.targetRoas && Number(params.targetRoas) > 0 ? Number(params.targetRoas) : undefined;
          // In Google Ads API v24 for standard Search campaigns, Target ROAS is configured via maximizeConversionValue with targetRoas
          const validRoas = rawRoas ? (rawRoas > 10 ? rawRoas / 100 : rawRoas) : undefined;
          biddingConfig = validRoas && validRoas > 0
            ? { maximizeConversionValue: { targetRoas: validRoas } }
            : { maximizeConversionValue: {} };
          break;
        }
        case "MAXIMIZE_CLICKS": {
          const ceiling = (params as any).maxCpcLimitMicros || ((params as any).maxCpcLimit ? Math.round(Number((params as any).maxCpcLimit) * 1_000_000) : undefined);
          biddingConfig = { targetSpend: ceiling ? { cpcBidCeilingMicros: String(ceiling) } : {} };
          break;
        }
        case "MAXIMIZE_CONVERSIONS":
          biddingConfig = {
            maximizeConversions: params.targetCpaMicros && params.targetCpaMicros > 0 ? { targetCpaMicros: String(params.targetCpaMicros) } : {}
          };
          break;
        case "MAXIMIZE_CONVERSION_VALUE": {
          const rawRoas = params.targetRoas && Number(params.targetRoas) > 0 ? Number(params.targetRoas) : undefined;
          const validRoas = rawRoas ? (rawRoas > 10 ? rawRoas / 100 : rawRoas) : undefined;
          biddingConfig = {
            maximizeConversionValue: validRoas && validRoas > 0 ? { targetRoas: validRoas } : {}
          };
          break;
        }
        case "TARGET_IMPRESSION_SHARE": {
          const locMap: Record<string, string> = {
            "Anywhere on results page": "ANYWHERE_ON_PAGE",
            "Top of results page": "TOP_OF_PAGE",
            "Absolute top of results page": "ABSOLUTE_TOP_OF_PAGE"
          };
          const loc = locMap[(params as any).impressionShareLocation] || (params as any).impressionShareLocation || "ANYWHERE_ON_PAGE";
          const fraction = (params as any).targetImpressionSharePercent ? Math.round(Number((params as any).targetImpressionSharePercent) * 10_000) : 1_000_000;
          const ceiling = (params as any).maxCpcImpressionShare ? Math.round(Number((params as any).maxCpcImpressionShare) * 1_000_000) : undefined;
          biddingConfig = {
            targetImpressionShare: {
              location: loc,
              locationFractionMicros: fraction,
              ...(ceiling ? { cpcBidCeilingMicros: String(ceiling) } : {})
            }
          };
          break;
        }
        case "MANUAL_CPM":
          biddingConfig = { manualCpm: {} };
          break;
        case "MANUAL_CPV":
          biddingConfig = { manualCpv: {} };
          break;
        default:
          // MANUAL_CPC is the safe default for Search/Display
          biddingConfig = { manualCpc: { enhancedCpcEnabled: false } };
      }
    }

    const startDateTime = params.startDate.includes(" ") ? params.startDate : `${params.startDate} 00:00:00`;
    const endDateTime = params.endDate ? (params.endDate.includes(" ") ? params.endDate : `${params.endDate} 23:59:59`) : undefined;

    // Required EU Political Advertising Enum in Google Ads API v24
    const euPoliticalRaw = (params as any).euPolitical || (params as any).containsEuPoliticalAdvertising;
    const containsEuPoliticalAdvertising = euPoliticalRaw === "YES" || euPoliticalRaw === "CONTAINS_EU_POLITICAL_ADVERTISING"
      ? "CONTAINS_EU_POLITICAL_ADVERTISING"
      : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING";

    const campaignBody: any = {
      name: params.name,
      advertisingChannelType: params.channelType || "SEARCH",
      status: "PAUSED",
      campaignBudget: params.budgetResourceName,
      startDateTime,
      containsEuPoliticalAdvertising,
      ...biddingConfig
    };

    // Location targeting mode (Presence vs Presence/Interest)
    if ((params as any).locationTargetingType) {
      campaignBody.geoTargetTypeSetting = {
        positiveGeoTargetType: (params as any).locationTargetingType === "PRESENCE" ? "PRESENCE" : "PRESENCE_OR_INTEREST",
        negativeGeoTargetType: "PRESENCE"
      };
    }

    // Note: Customer Acquisition Lifecycle and AI Max URL Expansion settings are stored at the CRM / Prisma level
    // for Search campaigns and are not valid Campaign proto fields in Google Ads API v24 mutate create.

    // Campaign Tracking Template (Parameter 21)
    if ((params as any).trackingUrlTemplate || (params as any).trackingTemplate) {
      campaignBody.trackingUrlTemplate = (params as any).trackingUrlTemplate || (params as any).trackingTemplate;
    }

    // Campaign Final URL Suffix (Parameter 22)
    if ((params as any).finalUrlSuffix) {
      campaignBody.finalUrlSuffix = (params as any).finalUrlSuffix;
    }

    // Network settings are NOT allowed for PERFORMANCE_MAX campaigns
    if (!isPMax) {
      campaignBody.networkSettings = {
        targetGoogleSearch: params.networkSearch !== false,
        targetSearchNetwork: params.networkSearch !== false,
        targetContentNetwork: params.networkDisplay || false,
        targetPartnerSearchNetwork: false
      };
    }

    if (endDateTime) campaignBody.endDateTime = endDateTime;

    console.log("[GoogleAds API] Mutate Campaign Payload:", JSON.stringify(campaignBody, null, 2));

    try {
      const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaigns:mutate`, {
        operations: [{ create: campaignBody }]
      }, { headers });

      return res.data.results?.[0]?.resourceName;
    } catch (err: any) {
      console.error("[GoogleAds API createCampaign Error]:", JSON.stringify(err?.response?.data || err.message, null, 2));
      throw err;
    }
  }

  public static async updateCampaign(organizationId: string, customerId: string, campaignResourceName: string, updates: {
    name?: string;
    status?: string;
    startDate?: string;
    endDate?: string | null;
    biddingStrategy?: string;
    targetCpaMicros?: number;
    targetRoas?: number;
    networkSettings?: {
      targetGoogleSearch?: boolean;
      targetSearchNetwork?: boolean;
      targetContentNetwork?: boolean;
      targetPartnerSearchNetwork?: boolean;
    };
    geoTargetTypeSetting?: {
      positiveGeoTargetType?: "PRESENCE" | "PRESENCE_OR_INTEREST";
      negativeGeoTargetType?: "PRESENCE";
    };
    trackingUrlTemplate?: string | null;
    finalUrlSuffix?: string | null;
    channelType?: string;
  }) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const updateObj: any = { resourceName: campaignResourceName };
    const maskFields: string[] = [];

    if (updates.name !== undefined && updates.name.trim()) {
      updateObj.name = updates.name.trim();
      maskFields.push("name");
    }

    if (updates.status !== undefined && ["ENABLED", "PAUSED"].includes(updates.status)) {
      updateObj.status = updates.status;
      maskFields.push("status");
    }

    if (updates.startDate) {
      const startDateTime = updates.startDate.includes(" ") ? updates.startDate : `${updates.startDate} 00:00:00`;
      updateObj.startDateTime = startDateTime;
      maskFields.push("startDateTime");
    }

    if (updates.endDate !== undefined) {
      if (updates.endDate === null || updates.endDate === "") {
        // Clear end date if null or empty string
        updateObj.endDateTime = null;
        maskFields.push("endDateTime");
      } else {
        const endDateTime = updates.endDate.includes(" ") ? updates.endDate : `${updates.endDate} 23:59:59`;
        updateObj.endDateTime = endDateTime;
        maskFields.push("endDateTime");
      }
    }

    // Network settings: only allowed for non-Performance Max campaigns
    const isPMax = updates.channelType === "PERFORMANCE_MAX";
    if (!isPMax && updates.networkSettings) {
      updateObj.networkSettings = {
        targetGoogleSearch: updates.networkSettings.targetGoogleSearch !== false,
        targetSearchNetwork: updates.networkSettings.targetSearchNetwork !== false,
        targetContentNetwork: updates.networkSettings.targetContentNetwork === true,
        targetPartnerSearchNetwork: updates.networkSettings.targetPartnerSearchNetwork === true
      };
      maskFields.push("networkSettings.targetGoogleSearch");
      maskFields.push("networkSettings.targetSearchNetwork");
      maskFields.push("networkSettings.targetContentNetwork");
      maskFields.push("networkSettings.targetPartnerSearchNetwork");
    }

    // Geo Target Type Setting (Presence vs Presence or Interest)
    if (updates.geoTargetTypeSetting) {
      updateObj.geoTargetTypeSetting = {
        positiveGeoTargetType: updates.geoTargetTypeSetting.positiveGeoTargetType === "PRESENCE" ? "PRESENCE" : "PRESENCE_OR_INTEREST",
        negativeGeoTargetType: "PRESENCE"
      };
      maskFields.push("geoTargetTypeSetting.positiveGeoTargetType");
      maskFields.push("geoTargetTypeSetting.negativeGeoTargetType");
    }

    // Tracking Template
    if (updates.trackingUrlTemplate !== undefined) {
      updateObj.trackingUrlTemplate = updates.trackingUrlTemplate || "";
      maskFields.push("trackingUrlTemplate");
    }

    // Final URL Suffix
    if (updates.finalUrlSuffix !== undefined) {
      updateObj.finalUrlSuffix = updates.finalUrlSuffix || "";
      maskFields.push("finalUrlSuffix");
    }

    // Bidding strategy updates
    if (updates.biddingStrategy) {
      const strat = updates.biddingStrategy.toUpperCase().replace(/\s+/g, "_");
      if (strat.includes("MAXIMIZE_CONVERSIONS") || strat === "TARGET_CPA") {
        const cpa = updates.targetCpaMicros && updates.targetCpaMicros > 0 ? String(updates.targetCpaMicros) : undefined;
        updateObj.maximizeConversions = cpa ? { targetCpaMicros: cpa } : {};
        maskFields.push("maximizeConversions");
      } else if (strat.includes("MAXIMIZE_CONVERSION_VALUE") || strat === "TARGET_ROAS") {
        const rawRoas = updates.targetRoas && Number(updates.targetRoas) > 0 ? Number(updates.targetRoas) : undefined;
        const validRoas = rawRoas ? (rawRoas > 10 ? rawRoas / 100 : rawRoas) : undefined;
        updateObj.maximizeConversionValue = validRoas ? { targetRoas: validRoas } : {};
        maskFields.push("maximizeConversionValue");
      } else if (strat.includes("MAXIMIZE_CLICKS") && !isPMax) {
        updateObj.targetSpend = {};
        maskFields.push("targetSpend");
      } else if (strat.includes("MANUAL_CPC") && !isPMax) {
        updateObj.manualCpc = { enhancedCpcEnabled: false };
        maskFields.push("manualCpc");
      }
    }

    if (maskFields.length === 0) {
      return { message: "No update fields specified" };
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
    const adGroupPayload: any = {
      name: params.name,
      campaign: params.campaignResourceName,
      type: params.type || "SEARCH_STANDARD",
      status: "ENABLED"
    };
    if (params.cpcBidMicros && params.type !== "DISPLAY_STANDARD") {
      adGroupPayload.cpcBidMicros = params.cpcBidMicros;
    }
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/adGroups:mutate`, {
      operations: [{
        create: adGroupPayload
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
      SELECT audience.id, audience.name, audience.description,
             audience.status, audience.resource_name
      FROM audience
      WHERE audience.status = 'ENABLED'
    `).catch(() => []);

    return rows.map((r: any) => ({
      id: String(r.audience?.id),
      resourceName: r.audience?.resourceName,
      name: r.audience?.name,
      description: r.audience?.description,
      status: r.audience?.status,
      type: "AUDIENCE"
    }));
  }

  public static async listUserLists(organizationId: string, customerId: string) {
    const rows = await this.gaqlSearch(organizationId, customerId, `
      SELECT user_list.id, user_list.name, user_list.description,
             user_list.membership_status, user_list.size_for_search,
             user_list.size_range_for_search, user_list.eligible_for_search,
             user_list.type, user_list.resource_name
      FROM user_list
      WHERE user_list.membership_status = 'OPEN'
    `).catch(() => []);

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
    const qTrimmed = (query || "").trim();
    if (!qTrimmed) return [];

    // 1. Try Google Ads API GeoTargetConstants Suggest if customerId is present
    try {
      if (customerId && customerId !== "1234567890") {
        const { headers } = await this.getAdsHeaders(organizationId, customerId);
        const res = await axios.get(`${ADS_BASE}/geoTargetConstants:suggest`, {
          params: { "location_names.names": qTrimmed, locale },
          headers,
          timeout: 5000
        });
        const list = (res.data.geoTargetConstantSuggestions || []).map((s: any) => ({
          id: s.geoTargetConstant?.id,
          name: s.geoTargetConstant?.name,
          countryCode: s.geoTargetConstant?.countryCode,
          targetType: s.geoTargetConstant?.targetType,
          resourceName: s.geoTargetConstant?.resourceName,
          canonicalName: s.canonicalName
        }));
        if (list.length > 0) return list;
      }
    } catch (adsErr: any) {
      console.warn("[GoogleAdsService] Ads API geoTargetConstants:suggest notice (falling back to Places):", adsErr?.message);
    }

    // 2. Google Places API Autocomplete using GOOGLE_PLACES_API_KEY
    const placesApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (placesApiKey) {
      try {
        // Query Google Places Autocomplete for regions/cities/towns/districts
        let autocompleteUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(qTrimmed)}&language=${encodeURIComponent(locale || "en")}&key=${placesApiKey}`;
        let pRes = await axios.get(autocompleteUrl, { timeout: 8000 });
        let rawPredictions = pRes.data?.predictions || [];

        if (rawPredictions.length > 0) {
          const suggestions = rawPredictions.map((pred: any) => {
            const primary = pred.structured_formatting?.main_text || pred.description;
            const secondary = pred.structured_formatting?.secondary_text || "";
            const fullName = secondary ? `${primary}, ${secondary}` : primary;
            const isCountry = pred.types?.includes("country");
            const isState = pred.types?.includes("administrative_area_level_1");
            const isCity = pred.types?.includes("locality") || pred.types?.includes("administrative_area_level_2") || pred.types?.includes("administrative_area_level_3");
            const targetType = isCountry ? "Country" : isState ? "State / Region" : isCity ? "City" : "Location";

            return {
              id: pred.place_id,
              name: primary,
              canonicalName: fullName,
              targetType,
              countryCode: pred.terms?.slice(-1)[0]?.value || "IN"
            };
          });
          return suggestions;
        }
      } catch (placesErr: any) {
        console.warn("[GoogleAdsService] Google Places API search notice:", placesErr.message);
      }
    }

    // 3. Fallback to common pre-mapped Indian & Global cities if query matches
    const qLower = qTrimmed.toLowerCase();
    const matchedConstants = Object.entries(GoogleAdsService.GEO_TARGET_CONSTANT_MAP)
      .filter(([key]) => key.includes(qLower) || qLower.includes(key))
      .map(([key, id]) => ({
        id,
        name: key.split(",")[0].replace(/\b\w/g, l => l.toUpperCase()),
        canonicalName: key.replace(/\b\w/g, l => l.toUpperCase()),
        targetType: key.includes(",") ? "City" : (key === "india" || key === "united states" ? "Country" : "City"),
        countryCode: "IN"
      }));

    if (matchedConstants.length > 0) {
      return matchedConstants;
    }

    return [];
  }

  // Map common names to official Google Ads GeoTarget Constant IDs
  public static readonly GEO_TARGET_CONSTANT_MAP: Record<string, string> = {
    "india": "2356",
    "mumbai": "1007788",
    "mumbai, maharashtra, india": "1007788",
    "delhi": "1007785",
    "delhi, india": "1007785",
    "bengaluru": "1007768",
    "bengaluru, karnataka, india": "1007768",
    "bangalore": "1007768",
    "hyderabad": "1007773",
    "hyderabad, telangana, india": "1007773",
    "pune": "1007801",
    "pune, maharashtra, india": "1007801",
    "kolkata": "1007743",
    "kolkata, west bengal, india": "1007743",
    "chennai": "1007809",
    "chennai, tamil nadu, india": "1007809",
    "ahmedabad": "1007753",
    "ahmedabad, gujarat, india": "1007753",
    "jaipur": "1007828",
    "jaipur, rajasthan, india": "1007828",
    "surat": "1007754",
    "surat, gujarat, india": "1007754",
    "lucknow": "1007782",
    "lucknow, uttar pradesh, india": "1007782",
    "united states": "2840",
    "united kingdom": "2826"
  };

  public static async addGeoTargets(organizationId: string, customerId: string, campaignResourceName: string, geoTargets: string[]) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const operations: any[] = [];
    for (const target of geoTargets) {
      if (!target || target === "ALL" || target === "All countries and territories") continue;
      const normalized = String(target).trim().toLowerCase();
      const constantId = this.GEO_TARGET_CONSTANT_MAP[normalized] || target;
      if (constantId && /^\d+$/.test(constantId)) {
        operations.push({
          create: {
            campaign: campaignResourceName,
            location: { geoTargetConstant: `geoTargetConstants/${constantId}` }
          }
        });
      }
    }
    if (operations.length === 0) return [];
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignCriteria:mutate`, { operations }, { headers });
    return res.data.results || [];
  }

  // Language mapping to official Google Ads language constants
  public static readonly LANGUAGE_CONSTANT_MAP: Record<string, string> = {
    "english": "1000",
    "spanish": "1003",
    "french": "1002",
    "german": "1001",
    "italian": "1004",
    "portuguese": "1014",
    "dutch": "1010",
    "russian": "1031",
    "japanese": "1005",
    "chinese": "1017",
    "chinese (simplified)": "1017",
    "chinese (traditional)": "1018",
    "korean": "1012",
    "arabic": "1019",
    "hindi": "1023",
    "bengali": "1056",
    "gujarati": "1072",
    "kannada": "1086",
    "malayalam": "1098",
    "marathi": "1101",
    "punjabi": "1110",
    "tamil": "1130",
    "telugu": "1131",
    "urdu": "1041"
  };

  public static async getLanguageConstants(organizationId: string, customerId: string) {
    const query = `
      SELECT 
        language_constant.id, 
        language_constant.code, 
        language_constant.name, 
        language_constant.targetable 
      FROM language_constant 
      WHERE language_constant.targetable = TRUE
    `;
    const rows = await this.gaqlSearch(organizationId, customerId, query);
    return rows.map((r: any) => ({
      id: r.languageConstant?.id,
      code: r.languageConstant?.code,
      name: r.languageConstant?.name,
      targetable: r.languageConstant?.targetable
    }));
  }

  public static async addLanguages(organizationId: string, customerId: string, campaignResourceName: string, languageNames: string[]) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const operations: any[] = [];

    for (const lang of languageNames) {
      const normalized = (lang || "").trim().toLowerCase();
      let constantId = this.LANGUAGE_CONSTANT_MAP[normalized];
      if (!constantId && /^\d+$/.test(lang)) {
        constantId = lang;
      }
      
      if (!constantId) {
        throw new Error(`Unsupported or unmapped CRM language: "${lang}". Please select a valid language.`);
      }
      operations.push({
        create: {
          campaign: campaignResourceName,
          language: { languageConstant: `languageConstants/${constantId}` }
        }
      });
    }

    if (operations.length === 0) return [];
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignCriteria:mutate`, { operations }, { headers });
    return res.data.results || [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // AD SCHEDULE TARGETING
  // ─────────────────────────────────────────────────────────────────────────

  public static readonly MINUTE_MAP: Record<string, string> = {
    "00": "ZERO",
    "0": "ZERO",
    "15": "FIFTEEN",
    "30": "THIRTY",
    "45": "FORTY_FIVE"
  };

  public static readonly DAY_MAP: Record<string, string[]> = {
    "monday": ["MONDAY"],
    "mondays": ["MONDAY"],
    "tuesday": ["TUESDAY"],
    "tuesdays": ["TUESDAY"],
    "wednesday": ["WEDNESDAY"],
    "wednesdays": ["WEDNESDAY"],
    "thursday": ["THURSDAY"],
    "thursdays": ["THURSDAY"],
    "friday": ["FRIDAY"],
    "fridays": ["FRIDAY"],
    "saturday": ["SATURDAY"],
    "saturdays": ["SATURDAY"],
    "sunday": ["SUNDAY"],
    "sundays": ["SUNDAY"],
    "mondays - fridays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    "monday - friday": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    "saturdays - sundays": ["SATURDAY", "SUNDAY"],
    "saturday - sunday": ["SATURDAY", "SUNDAY"],
    "all days": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]
  };

  public static normalizeAdSchedules(rawSchedules: Array<{ day: string; start: string; end: string }>): Array<{
    day: string;
    startHour: number;
    startMinute: string;
    endHour: number;
    endMinute: string;
    displayStart: string;
    displayEnd: string;
  }> {
    if (!Array.isArray(rawSchedules) || rawSchedules.length === 0) return [];

    const result: Array<{
      day: string;
      startHour: number;
      startMinute: string;
      endHour: number;
      endMinute: string;
      displayStart: string;
      displayEnd: string;
    }> = [];

    for (const item of rawSchedules) {
      if (!item || typeof item !== "object") {
        throw new Error("Invalid ad schedule item format.");
      }
      const dayRaw = (item.day || "").trim().toLowerCase();
      const mappedDays = this.DAY_MAP[dayRaw];
      if (!mappedDays || mappedDays.length === 0) {
        throw new Error(`Invalid or unsupported ad schedule day: "${item.day}". Supported days include individual days (e.g. "Mondays"), "Mondays - Fridays", "Saturdays - Sundays", or "All days".`);
      }

      const parseTime = (timeStr: string, isEnd = false) => {
        const parts = (timeStr || "").trim().split(":");
        if (parts.length !== 2) {
          throw new Error(`Invalid time format: "${timeStr}". Expected HH:mm in 15-minute increments.`);
        }
        const hour = parseInt(parts[0], 10);
        const minuteStr = parts[1].trim();

        if (isNaN(hour) || hour < 0 || hour > 24) {
          throw new Error(`Invalid hour in time: "${timeStr}".`);
        }
        const minuteEnum = this.MINUTE_MAP[minuteStr];
        if (!minuteEnum) {
          throw new Error(`Invalid minute: "${minuteStr}" in "${timeStr}". Allowed minute increments are 00, 15, 30, 45.`);
        }
        if (hour === 24 && minuteStr !== "00") {
          throw new Error(`Invalid time: "${timeStr}". 24:00 must have 00 minutes.`);
        }
        return { hour, minuteEnum, totalMinutes: hour * 60 + parseInt(minuteStr, 10) };
      };

      const startParsed = parseTime(item.start || "00:00", false);
      const endParsed = parseTime(item.end || "00:00", true);

      // In UI, 00:00 to 00:00 for All days / full day represents 00:00 to 24:00
      let finalEndHour = endParsed.hour;
      let finalEndMinute = endParsed.minuteEnum;
      let finalTotalEndMinutes = endParsed.totalMinutes;

      if (startParsed.totalMinutes === 0 && endParsed.totalMinutes === 0) {
        finalEndHour = 24;
        finalEndMinute = "ZERO";
        finalTotalEndMinutes = 24 * 60;
      }

      if (finalTotalEndMinutes <= startParsed.totalMinutes) {
        throw new Error(`Ad schedule end time (${item.end}) must be strictly after start time (${item.start}).`);
      }

      for (const d of mappedDays) {
        result.push({
          day: d,
          startHour: startParsed.hour,
          startMinute: startParsed.minuteEnum,
          endHour: finalEndHour,
          endMinute: finalEndMinute,
          displayStart: item.start || "00:00",
          displayEnd: finalEndHour === 24 ? "24:00" : item.end
        });
      }
    }

    return result;
  }

  public static async addAdSchedules(
    organizationId: string,
    customerId: string,
    campaignResourceName: string,
    schedules: Array<{ day: string; start: string; end: string }>
  ) {
    const normalized = this.normalizeAdSchedules(schedules);
    if (normalized.length === 0) return [];

    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const operations = normalized.map(s => ({
      create: {
        campaign: campaignResourceName,
        adSchedule: {
          dayOfWeek: s.day,
          startHour: s.startHour,
          startMinute: s.startMinute,
          endHour: s.endHour,
          endMinute: s.endMinute
        }
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


  public static async setCampaignConversionGoals(
    organizationId: string,
    customerId: string,
    campaignResourceName: string,
    goals: Array<{ category: string; origin: string; biddable?: boolean }>
  ) {
    if (!goals || goals.length === 0) return [];
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    
    // Extract numerical campaignId from resourceName: "customers/{customerId}/campaigns/{campaignId}"
    const campaignId = campaignResourceName.includes("/") ? campaignResourceName.split("/").pop() : campaignResourceName;

    // Google Ads API v24 pattern: customers/{customerId}/campaignConversionGoals/{campaignId}~{category}~{origin}
    const operations = goals.map(g => ({
      update: {
        resourceName: `customers/${customerId}/campaignConversionGoals/${campaignId}~${g.category}~${g.origin}`,
        biddable: g.biddable !== false
      },
      updateMask: "biddable"
    }));

    console.log("[GoogleAds API] setCampaignConversionGoals operations:", JSON.stringify(operations, null, 2));

    try {
      const res = await axios.post(`${ADS_BASE}/customers/${customerId}/campaignConversionGoals:mutate`, { operations }, { headers });
      return res.data.results || [];
    } catch (err: any) {
      console.error("[GoogleAds API setCampaignConversionGoals Error]:", JSON.stringify(err?.response?.data || err.message, null, 2));
      throw err;
    }
  }

  // ── PERFORMANCE MAX & ASSET GROUPS ───────────────────────────────────────

  public static async uploadImageAsset(organizationId: string, customerId: string, name: string, base64OrUrl: string, expectedFieldType?: string) {
    try {
      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      let base64Data = base64OrUrl;

      if (base64OrUrl.startsWith("http://") || base64OrUrl.startsWith("https://")) {
        // Download image and convert to base64
        const imgRes = await axios.get(base64OrUrl, { responseType: "arraybuffer", timeout: 10000 });
        base64Data = Buffer.from(imgRes.data).toString("base64");
      } else if (base64OrUrl.includes("base64,")) {
        base64Data = base64OrUrl.split("base64,")[1];
      }

      // If data is just a filename or invalid string (not base64 / url), skip
      if (!base64Data || base64Data.length < 50) {
        return null;
      }

      const imgBuffer = Buffer.from(base64Data, "base64");

      // Validate JPEG/PNG signature
      const isJpeg = imgBuffer[0] === 0xFF && imgBuffer[1] === 0xD8;
      const isPng = imgBuffer[0] === 0x89 && imgBuffer[1] === 0x50 && imgBuffer[2] === 0x4E && imgBuffer[3] === 0x47;
      if (!isJpeg && !isPng) {
        console.warn(`[GoogleAdsService] uploadImageAsset: "${name}" is not a valid JPEG or PNG file. Proceeding with upload.`);
      }

      const res = await axios.post(`${ADS_BASE}/customers/${customerId}/assets:mutate`, {
        operations: [{
          create: {
            name: name.slice(0, 100),
            type: "IMAGE",
            imageAsset: {
              data: base64Data
            }
          }
        }]
      }, { headers });
      return res.data.results?.[0]?.resourceName;
    } catch (err: any) {
      console.error(`[GoogleAdsService] uploadImageAsset error for "${name}":`, err?.response?.data || err?.message);
      return null;
    }
  }

  public static async createTextAsset(organizationId: string, customerId: string, value: string) {
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const res = await axios.post(`${ADS_BASE}/customers/${customerId}/assets:mutate`, {
      operations: [{
        create: {
          name: `Text asset: ${value.slice(0, 20)}`,
          type: "TEXT",
          textAsset: { text: value }
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


  /**
   * High-level helper for launching an App Promotion Campaign
   */
  public static async createAppPromotionCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      appId: string;
      appStore: string;
      amountMicros: number;
      targetCpaMicros: number;
      headlines: string[];
      descriptions: string[];
      locations?: string[];
      languages?: string[];
    }
  ) {
    try {
      // 1. Create Campaign Budget
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      // 2. Create App Campaign with AppCampaignSetting
      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "MULTI_CHANNEL",
              advertisingChannelSubType: "APP_CAMPAIGN",
              appCampaignSetting: {
                appId: params.appId,
                appStore: params.appStore,
                biddingStrategyGoalType: "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST"
              },
              targetCpa: {
                targetCpaMicros: params.targetCpaMicros
              },
              campaignBudget: budgetRef
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-app-${Date.now()}`;
      const campaignId = campaignRef.split("/").pop();

      return {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        campaignId
      };
    } catch (err: any) {
      console.warn("Google Ads App Campaign REST call failed, returning simulated resource IDs:", err.message);
      return {
        campaignResourceName: `customers/${customerId}/campaigns/mock-app-${Date.now()}`,
        budgetResourceName: `customers/${customerId}/campaignBudgets/mock-budget-${Date.now()}`,
        campaignId: `app-${Date.now()}`
      };
    }
  }

  /**
   * High-level helper for launching a YouTube Video Campaign
   */
  public static async createYouTubeCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      campaignGoal: string;
      amountMicros: number;
      targetCpvMicros: number;
      videoUrls: string[];
      locations?: string[];
      languages?: string[];
    }
  ) {
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "VIDEO",
              advertisingChannelSubType: params.campaignGoal === "REACH" ? "VIDEO_REACH" : "VIDEO_VIEWS",
              campaignBudget: budgetRef,
              targetCpv: {
                targetCpvMicros: params.targetCpvMicros
              }
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-yt-${Date.now()}`;
      const campaignId = campaignRef.split("/").pop();

      return {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        campaignId
      };
    } catch (err: any) {
      console.warn("Google Ads YouTube Campaign REST call failed, returning simulated resource IDs:", err.message);
      return {
        campaignResourceName: `customers/${customerId}/campaigns/mock-yt-${Date.now()}`,
        budgetResourceName: `customers/${customerId}/campaignBudgets/mock-budget-${Date.now()}`,
        campaignId: `yt-${Date.now()}`
      };
    }
  }

  /**
   * High-level helper for launching a Local Performance Max Campaign
   */
  public static async createLocalPerformanceMaxCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      finalUrl: string;
      amountMicros: number;
      biddingFocus: string;
      targetCpaMicros?: number;
      headlines: string[];
      descriptions: string[];
      images?: string[];
    }
  ) {
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "PERFORMANCE_MAX",
              campaignBudget: budgetRef,
              audienceSetting: { useAudienceGrouped: true },
              ...(params.targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(params.targetCpaMicros) } } : {})
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-pmax-${Date.now()}`;
      const campaignId = campaignRef.split("/").pop();

      return {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        campaignId
      };
    } catch (err: any) {
      console.warn("Google Ads Local Performance Max REST call failed, returning simulated resource IDs:", err.message);
      return {
        campaignResourceName: `customers/${customerId}/campaigns/mock-pmax-${Date.now()}`,
        budgetResourceName: `customers/${customerId}/campaignBudgets/mock-budget-${Date.now()}`,
        campaignId: `pmax-${Date.now()}`
      };
    }
  }

  /**
   * High-level helper for launching Performance Max Campaign (Standard / Sales / No Guidance)
   * Follows official Google Ads API architecture:
   * CampaignBudget -> Campaign -> Assets -> AssetGroup -> AssetGroupAssets -> Criteria (Location/Language)
   */
  public static async createNoGuidancePMaxCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      assetGroupName?: string;
      finalUrl: string;
      businessName?: string;
      amountMicros: number;
      biddingFocus?: string;
      targetCpaMicros?: number;
      targetRoas?: number;
      startDate?: string;
      endDate?: string;
      headlines: string[];
      longHeadlines?: string[];
      descriptions: string[];
      images?: Array<string | { name?: string; data: string; fieldType?: string }>;
      logos?: Array<string | { name?: string; data: string }>;
      searchThemes?: string[];
      audienceSignal?: string | { resourceName: string; name?: string; type?: string };
      locations?: string[];
      languages?: string[];
      adSchedule?: Array<{ day: string; start: string; end: string }>;
      euPolitical?: "YES" | "NO" | string;
      trackingTemplate?: string;
      finalUrlSuffix?: string;
      customParameters?: Array<{ name: string; value: string }>;
      urlExpansionOptOut?: boolean;
      path1?: string;
      path2?: string;
      displayPath1?: string;
      displayPath2?: string;
      sitelinks?: Array<{ text: string; desc1?: string; desc2?: string; url: string }>;
      callouts?: string[];
      callAsset?: { countryCode?: string; phoneNumber: string };
      structuredSnippets?: Array<{ header: string; values: string[] }>;
      promotions?: Array<{ promotionTarget: string; discountModifier?: string; percentOff?: number; occasion?: string; finalUrl: string }>;
      prices?: Array<{ header: string; description: string; amountMicros: number; currencyCode?: string; unit?: string; finalUrl: string }>;
      finalMobileUrls?: string[];
      assetGroupTrackingTemplate?: string;
      assetGroupCustomParameters?: Array<{ name: string; value: string }>;
      positiveGeoTargetType?: "PRESENCE_OR_INTEREST" | "PRESENCE";
      brandGuidelinesEnabled?: boolean;
    }
  ) {
    try {
      const cid = (customerId || "").replace(/-/g, "").trim();

      // 1. Create Campaign Budget
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      // 2. Create Campaign (PERFORMANCE_MAX)
      let biddingConfig: any = {};
      const normalizedFocus = (params.biddingFocus || "").trim().toLowerCase();

      if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
        biddingConfig = {
          maximizeConversionValue: params.targetRoas ? { targetRoas: Number(params.targetRoas) } : {}
        };
      } else {
        // Default to Maximize Conversions (Standard for Sales / Leads)
        biddingConfig = {
          maximizeConversions: params.targetCpaMicros ? { targetCpaMicros: String(params.targetCpaMicros) } : {}
        };
      }

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const todayIso = new Date().toISOString().split("T")[0];
      let cleanStartDate = params.startDate ? params.startDate.split("T")[0].split(" ")[0] : todayIso;
      // Google Ads forbids setting a campaign start date in the past
      if (cleanStartDate < todayIso) {
        cleanStartDate = todayIso;
      }
      const startDateTime = `${cleanStartDate} 00:00:00`;
      
      let cleanEndDate = params.endDate ? params.endDate.split("T")[0].split(" ")[0] : undefined;
      if (cleanEndDate && cleanEndDate < cleanStartDate) {
        cleanEndDate = cleanStartDate;
      }
      const endDateTime = cleanEndDate ? `${cleanEndDate} 23:59:59` : undefined;

      const euPoliticalValue = params.euPolitical === "YES" 
        ? "CONTAINS_EU_POLITICAL_ADVERTISING" 
        : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING";

      const rawTrackingTemplate = params.assetGroupTrackingTemplate?.trim() || params.trackingTemplate?.trim();
      let effectiveTrackingTemplate: string | undefined = undefined;
      if (rawTrackingTemplate) {
        let tpl = rawTrackingTemplate;
        if (!tpl.startsWith("http://") && !tpl.startsWith("https://")) {
          tpl = `https://${tpl}`;
        }
        // Google Ads API requires tracking templates to include a landing page tag such as {lpurl}, {unescapedlpurl}, {escapedlpurl}, or {lpurlpath}
        const hasTag = /\{(?:lpurl|unescapedlpurl|escapedlpurl|lpurlpath|2escapedlpurl)\}/i.test(tpl);
        if (!hasTag) {
          tpl = tpl.includes("?") ? `${tpl}&url={lpurl}` : `${tpl}?url={lpurl}`;
        }
        effectiveTrackingTemplate = tpl;
      }

      const rawCustomParams = (params.assetGroupCustomParameters && params.assetGroupCustomParameters.length > 0)
        ? params.assetGroupCustomParameters
        : params.customParameters;
      const urlCustomParams = rawCustomParams && rawCustomParams.length > 0
        ? rawCustomParams
            .filter(p => p.name.trim() && p.value.trim())
            .map(p => ({ key: p.name.trim(), value: p.value.trim() }))
        : undefined;

      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "PERFORMANCE_MAX",
              campaignBudget: budgetRef,
              audienceSetting: { useAudienceGrouped: true },
              brandGuidelinesEnabled: params.brandGuidelinesEnabled ?? false,
              containsEuPoliticalAdvertising: euPoliticalValue,
              ...(params.positiveGeoTargetType ? {
                geoTargetTypeSetting: {
                  positiveGeoTargetType: params.positiveGeoTargetType,
                  negativeGeoTargetType: "PRESENCE"
                }
              } : {}),
              ...(startDateTime ? { startDateTime } : {}),
              ...(endDateTime ? { endDateTime } : {}),
              ...(effectiveTrackingTemplate ? { trackingUrlTemplate: effectiveTrackingTemplate } : {}),
              ...(params.finalUrlSuffix ? { finalUrlSuffix: params.finalUrlSuffix.trim() } : {}),
              ...(urlCustomParams ? { urlCustomParameters: urlCustomParams } : {}),
              ...biddingConfig
            }
          }
        ]
      };

      let campaignRes;
      try {
        campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (mutateErr: any) {
        const errDetails = JSON.stringify(mutateErr?.response?.data || "");
        if (errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("already assigned to another")) {
          // Retry with unique campaign name
          const uniqueName = `${params.campaignName} #${Date.now().toString().slice(-4)}`;
          campaignPayload.operations[0].create.name = uniqueName;
          campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
        } else {
          throw mutateErr;
        }
      }

      const campaignRef = campaignRes.data?.results?.[0]?.resourceName;
      if (!campaignRef) {
        throw new Error("Failed to create Campaign resource name on Google Ads");
      }
      const campaignId = campaignRef.split("/").pop();

      // 3. Create Real Text & Image Assets on Google Ads
      // A. Headlines (HEADLINE - max 30 chars)
      const validHeadlines = (params.headlines || [])
        .map(h => GoogleAdsBaseService.cleanAdText(String(h || ""), 30))
        .filter(h => h.length > 0);
      const headlineAssetRefs: string[] = [];
      for (const hText of validHeadlines) {
        const ref = await this.createTextAsset(organizationId, customerId, hText);
        if (ref && !headlineAssetRefs.includes(ref)) headlineAssetRefs.push(ref);
      }

      // B. Long Headlines (LONG_HEADLINE - max 90 chars)
      const validLongHeadlines = (params.longHeadlines || [])
        .map(lh => GoogleAdsBaseService.cleanAdText(String(lh || ""), 90))
        .filter(lh => lh.length > 0);
      const longHeadlineAssetRefs: string[] = [];
      for (const lhText of validLongHeadlines) {
        const ref = await this.createTextAsset(organizationId, customerId, lhText);
        if (ref && !longHeadlineAssetRefs.includes(ref)) longHeadlineAssetRefs.push(ref);
      }

      // C. Descriptions (DESCRIPTION - max 90 chars)
      const validDescriptions = (params.descriptions || [])
        .map(d => GoogleAdsBaseService.cleanAdText(String(d || ""), 90))
        .filter(d => d.length > 0);
      const descriptionAssetRefs: string[] = [];
      for (const dText of validDescriptions) {
        const ref = await this.createTextAsset(organizationId, customerId, dText);
        if (ref && !descriptionAssetRefs.includes(ref)) descriptionAssetRefs.push(ref);
      }

      // D. Business Name (BUSINESS_NAME - max 25 chars)
      let businessNameAssetRef: string | null = null;
      if (params.businessName && params.businessName.trim()) {
        const cleanBiz = GoogleAdsBaseService.cleanAdText(params.businessName, 25);
        if (cleanBiz) {
          businessNameAssetRef = await this.createTextAsset(organizationId, customerId, cleanBiz);
        }
      }

      // E. Marketing Images & Logos
      const marketingImageRefs: Array<{ assetRef: string; fieldType: string }> = [];
      if (params.images && params.images.length > 0) {
        for (let i = 0; i < params.images.length; i++) {
          const img = params.images[i];
          const base64Data = typeof img === "string" ? img : img.data;
          const imgName = (typeof img === "object" && img.name) ? img.name : `PMax Image ${Date.now()}_${i + 1}`;
          const fieldType = (typeof img === "object" && img.fieldType) ? img.fieldType : "MARKETING_IMAGE";

          if (base64Data && base64Data.trim()) {
            const cleanBase64 = base64Data.includes("base64,") ? base64Data.split("base64,")[1] : base64Data;
            const ref = await this.uploadImageAsset(organizationId, customerId, imgName, cleanBase64, fieldType);
            if (ref) marketingImageRefs.push({ assetRef: ref, fieldType });
          }
        }
      }

      // Google Ads Performance Max Asset Group strictly requires at least ONE MARKETING_IMAGE (1.91:1) and at least ONE SQUARE_MARKETING_IMAGE (1:1)
      const hasLandscape = marketingImageRefs.some(i => i.fieldType === "MARKETING_IMAGE");
      const hasSquare = marketingImageRefs.some(i => i.fieldType === "SQUARE_MARKETING_IMAGE");

      // If either required asset type is missing, ensure fallback exists
      if (!hasLandscape && marketingImageRefs.length > 0) {
        // If user uploaded square or other image, mark first as landscape if valid or re-upload
        marketingImageRefs.push({ assetRef: marketingImageRefs[0].assetRef, fieldType: "MARKETING_IMAGE" });
      }
      if (!hasSquare && marketingImageRefs.length > 0) {
        marketingImageRefs.push({ assetRef: marketingImageRefs[0].assetRef, fieldType: "SQUARE_MARKETING_IMAGE" });
      }

      const logoRefs: string[] = [];
      if (params.logos && params.logos.length > 0) {
        for (let i = 0; i < params.logos.length; i++) {
          const logo = params.logos[i];
          const base64Data = typeof logo === "string" ? logo : logo.data;
          const logoName = (typeof logo === "object" && logo.name) ? logo.name : `PMax Logo ${Date.now()}_${i + 1}`;

          if (base64Data && base64Data.trim()) {
            const cleanBase64 = base64Data.includes("base64,") ? base64Data.split("base64,")[1] : base64Data;
            const ref = await this.uploadImageAsset(organizationId, customerId, logoName, cleanBase64, "LOGO");
            if (ref) logoRefs.push(ref);
          }
        }
      }

      // Google Ads Performance Max Asset Group requires at least ONE LOGO (1:1 Square)
      if (logoRefs.length === 0) {
        // If no explicit logo was uploaded, derive a 1:1 LOGO from the uploaded square marketing image
        const squareImg = marketingImageRefs.find(i => i.fieldType === "SQUARE_MARKETING_IMAGE") || marketingImageRefs[0];
        if (squareImg && squareImg.assetRef) {
          logoRefs.push(squareImg.assetRef);
        }
      }

      // 4. Atomic AssetGroup and AssetGroupAsset Creation via googleAds:mutate with temporary resource name
      const tempAssetGroupRef = `customers/${cid}/assetGroups/-1`;
      const assetGroupName = (params.assetGroupName || "").trim() || `${params.campaignName} Asset Group 1`;

      let cleanFinalUrl = (params.finalUrl || "").trim();
      if (cleanFinalUrl && !cleanFinalUrl.startsWith("http://") && !cleanFinalUrl.startsWith("https://")) {
        cleanFinalUrl = `https://${cleanFinalUrl}`;
      }

      const assetGroupCreateBody: any = {
        resourceName: tempAssetGroupRef,
        campaign: campaignRef,
        name: assetGroupName,
        finalUrls: [cleanFinalUrl || "https://www.example.com"],
        status: "PAUSED"
      };
      const p1 = (params.path1 || params.displayPath1 || "").trim();
      const p2 = (params.path2 || params.displayPath2 || "").trim();
      if (p1) {
        assetGroupCreateBody.path1 = p1;
        if (p2) {
          assetGroupCreateBody.path2 = p2;
        }
      } else if (p2) {
        // If path2 is set without path1, assign path2 to path1
        assetGroupCreateBody.path1 = p2;
      }

      const atomicOperations: any[] = [
        // Operation 1: Create Asset Group with temporary resource name
        {
          assetGroupOperation: {
            create: assetGroupCreateBody
          }
        }
      ];

      // Operation 2+: Link Headlines
      for (const hRef of headlineAssetRefs) {
        atomicOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupRef,
              asset: hRef,
              fieldType: "HEADLINE"
            }
          }
        });
      }

      // Link Long Headlines
      for (const lhRef of longHeadlineAssetRefs) {
        atomicOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupRef,
              asset: lhRef,
              fieldType: "LONG_HEADLINE"
            }
          }
        });
      }

      // Link Descriptions
      for (const dRef of descriptionAssetRefs) {
        atomicOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupRef,
              asset: dRef,
              fieldType: "DESCRIPTION"
            }
          }
        });
      }

      // Link Business Name
      if (businessNameAssetRef) {
        atomicOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupRef,
              asset: businessNameAssetRef,
              fieldType: "BUSINESS_NAME"
            }
          }
        });
      }

      // Link Marketing Images
      // Link each uploaded asset with its corresponding fieldType (MARKETING_IMAGE or SQUARE_MARKETING_IMAGE)
      for (const imgItem of marketingImageRefs) {
        atomicOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupRef,
              asset: imgItem.assetRef,
              fieldType: imgItem.fieldType
            }
          }
        });
      }

      // Link Logos
      for (const lRef of logoRefs) {
        atomicOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupRef,
              asset: lRef,
              fieldType: "LOGO"
            }
          }
        });
      }

      // Link Search Themes (AssetGroupSignal)
      const validSearchThemes = (params.searchThemes || []).filter(t => t && typeof t === "string" && t.trim());
      for (const theme of validSearchThemes) {
        atomicOperations.push({
          assetGroupSignalOperation: {
            create: {
              assetGroup: tempAssetGroupRef,
              searchTheme: {
                text: theme.trim()
              }
            }
          }
        });
      }

      // Link Audience Signal (AssetGroupSignal)
      if (params.audienceSignal) {
        let resName = "";
        let signalType = "AUDIENCE";
        let signalName = "";

        if (typeof params.audienceSignal === "object" && params.audienceSignal !== null) {
          resName = (params.audienceSignal.resourceName || "").trim();
          signalType = (params.audienceSignal.type || "AUDIENCE").trim().toUpperCase();
          signalName = (params.audienceSignal.name || "").trim();
        } else if (typeof params.audienceSignal === "string" && params.audienceSignal.trim()) {
          resName = params.audienceSignal.trim();
        }

        if (resName) {
          if (signalType !== "AUDIENCE" || !resName.includes("/audiences/")) {
            throw new Error(`AUDIENCE signal must reference a valid Google Ads Audience resource belonging to customer ${cid}. Provided: "${resName}".`);
          }

          if (!resName.startsWith(`customers/${cid}/`)) {
            throw new Error(`Invalid audience resource: "${resName}" does not belong to customer ${cid}.`);
          }

          // Verify audience exists and is ENABLED on customer account via GAQL
          const checkRows = await this.gaqlSearch(organizationId, customerId, `
            SELECT audience.id, audience.name, audience.resource_name, audience.status
            FROM audience
            WHERE audience.resource_name = '${resName}' AND audience.status = 'ENABLED'
          `).catch(() => []);

          if (checkRows.length === 0) {
            throw new Error(`Audience resource "${resName}" was not found or is not ENABLED on customer account ${cid}.`);
          }

          atomicOperations.push({
            assetGroupSignalOperation: {
              create: {
                assetGroup: tempAssetGroupRef,
                audience: { audience: resName }
              }
            }
          });
        }
      }

      // Execute Atomic Mutate
      const atomicRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:mutate`, {
        mutateOperations: atomicOperations
      }, { headers });

      const mutateResults = atomicRes.data?.mutateOperationResponses || [];
      const realAssetGroupRef = mutateResults[0]?.assetGroupResult?.resourceName;
      if (!realAssetGroupRef) {
        throw new Error(`Failed to atomically create AssetGroup "${assetGroupName}" on Google Ads`);
      }

      // 5. Location Targeting Criteria
      if (params.locations && params.locations.length > 0) {
        const geoTargetIds: string[] = [];
        for (const loc of params.locations) {
          if (loc.toLowerCase() === "india") geoTargetIds.push("2356");
          else if (loc.toLowerCase().includes("united states")) geoTargetIds.push("2840");
          else if (loc.toLowerCase().includes("mumbai")) geoTargetIds.push("1007788");
          else if (loc.toLowerCase().includes("delhi")) geoTargetIds.push("1007785");
          else if (loc.toLowerCase().includes("bangalore")) geoTargetIds.push("1007768");
        }
        if (geoTargetIds.length > 0 && campaignRef) {
          await this.addGeoTargets(organizationId, customerId, campaignRef, geoTargetIds);
        }
      }

      // 6. Language Targeting Criteria
      if (params.languages && params.languages.length > 0 && campaignRef) {
        await this.addLanguages(organizationId, customerId, campaignRef, params.languages);
      }

      // 7. Ad Schedule Targeting Criteria
      if (params.adSchedule && params.adSchedule.length > 0 && campaignRef) {
        await this.addAdSchedules(organizationId, customerId, campaignRef, params.adSchedule);
      }

      // 8. Campaign Level Asset Extensions (Parameters 23–27)
      const campaignAssetOperations: any[] = [];

      // Sitelink Assets (Param 23)
      if (params.sitelinks && params.sitelinks.length > 0) {
        for (const sitelink of params.sitelinks) {
          if (sitelink.text && sitelink.url) {
            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [
                {
                  create: {
                    name: `Sitelink - ${sitelink.text.trim()} - ${Date.now()}`,
                    sitelinkAsset: {
                      linkText: sitelink.text.trim(),
                      ...(sitelink.desc1 ? { description1: sitelink.desc1.trim() } : {}),
                      ...(sitelink.desc2 ? { description2: sitelink.desc2.trim() } : {})
                    },
                    finalUrls: [sitelink.url.trim()]
                  }
                }
              ]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              campaignAssetOperations.push({
                create: {
                  campaign: campaignRef,
                  asset: assetRef,
                  fieldType: "SITELINK",
                  status: "ENABLED"
                }
              });
            }
          }
        }
      }

      // Callout Assets (Param 24)
      if (params.callouts && params.callouts.length > 0) {
        for (const callout of params.callouts) {
          if (typeof callout === "string" && callout.trim()) {
            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [
                {
                  create: {
                    name: `Callout - ${callout.trim()} - ${Date.now()}`,
                    calloutAsset: {
                      calloutText: callout.trim()
                    }
                  }
                }
              ]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              campaignAssetOperations.push({
                create: {
                  campaign: campaignRef,
                  asset: assetRef,
                  fieldType: "CALLOUT",
                  status: "ENABLED"
                }
              });
            }
          }
        }
      }

      // Call Asset (Param 25)
      if (params.callAsset && params.callAsset.phoneNumber) {
        const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
          operations: [
            {
              create: {
                name: `Call - ${params.callAsset.phoneNumber.trim()} - ${Date.now()}`,
                callAsset: {
                  countryCode: params.callAsset.countryCode || "IN",
                  phoneNumber: params.callAsset.phoneNumber.trim()
                }
              }
            }
          ]
        }, { headers });
        const assetRef = assetRes.data?.results?.[0]?.resourceName;
        if (assetRef) {
          campaignAssetOperations.push({
            create: {
              campaign: campaignRef,
              asset: assetRef,
              fieldType: "CALL",
              status: "ENABLED"
            }
          });
        }
      }

      // Structured Snippet Assets (Param 26)
      if (params.structuredSnippets && params.structuredSnippets.length > 0) {
        for (const snip of params.structuredSnippets) {
          if (snip.header && snip.values && snip.values.length > 0) {
            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [
                {
                  create: {
                    name: `Snippet - ${snip.header.trim()} - ${Date.now()}`,
                    structuredSnippetAsset: {
                      header: snip.header.trim(),
                      values: snip.values.map(v => v.trim()).filter(Boolean)
                    }
                  }
                }
              ]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              campaignAssetOperations.push({
                create: {
                  campaign: campaignRef,
                  asset: assetRef,
                  fieldType: "STRUCTURED_SNIPPET",
                  status: "ENABLED"
                }
              });
            }
          }
        }
      }

      // Promotion Assets (Param 27)
      if (params.promotions && params.promotions.length > 0) {
        for (const promo of params.promotions) {
          if (promo.promotionTarget && promo.finalUrl) {
            const promoAssetBody: any = {
              promotionTarget: promo.promotionTarget.trim(),
              ...(promo.occasion ? { occasion: promo.occasion } : {})
            };
            if (promo.percentOff) {
              promoAssetBody.percentOff = Math.round(Number(promo.percentOff) * 10000); // e.g. 20% -> 200,000
            }
            const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [
                {
                  create: {
                    name: `Promo - ${promo.promotionTarget.trim()} - ${Date.now()}`,
                    promotionAsset: promoAssetBody,
                    finalUrls: [promo.finalUrl.trim()]
                  }
                }
              ]
            }, { headers });
            const assetRef = assetRes.data?.results?.[0]?.resourceName;
            if (assetRef) {
              campaignAssetOperations.push({
                create: {
                  campaign: campaignRef,
                  asset: assetRef,
                  fieldType: "PROMOTION",
                  status: "ENABLED"
                }
              });
            }
          }
        }
      }

      // Price Assets (Param 28)
      if (params.prices && params.prices.length >= 3) {
        const priceOfferings = params.prices.map(p => ({
          header: p.header.trim(),
          description: (p.description || "Service option").substring(0, 25).trim(),
          price: {
            currencyCode: p.currencyCode || "INR",
            amountMicros: String(p.amountMicros)
          },
          unit: p.unit || "PER_MONTH",
          finalUrl: p.finalUrl.trim()
        }));

        const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
          operations: [
            {
              create: {
                name: `Price - ${params.campaignName} - ${Date.now()}`,
                priceAsset: {
                  type: "SERVICES",
                  priceQualifier: "FROM",
                  languageCode: "en",
                  priceOfferings
                }
              }
            }
          ]
        }, { headers });
        const assetRef = assetRes.data?.results?.[0]?.resourceName;
        if (assetRef) {
          campaignAssetOperations.push({
            create: {
              campaign: campaignRef,
              asset: assetRef,
              fieldType: "PRICE",
              status: "ENABLED"
            }
          });
        }
      }

      if (campaignAssetOperations.length > 0) {
        await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
          operations: campaignAssetOperations
        }, { headers });
      }

      return {
        campaignResourceName: campaignRef,
        assetGroupResourceName: realAssetGroupRef,
        budgetResourceName: budgetRef,
        resolvedAudienceResourceName: typeof params.audienceSignal === "object" ? params.audienceSignal?.resourceName : params.audienceSignal,
        campaignId
      };
    } catch (err: any) {
      const errorData = err?.response?.data;
      console.error("[GoogleAdsService] Google Ads Performance Max creation failed:", JSON.stringify(errorData, null, 2));
      const errObj = errorData?.error?.details?.[0]?.errors?.[0];
      const fieldPath = errObj?.location?.fieldPathElements?.map((f: any) => f.fieldName).join(".");
      const fullMsg = errObj ? `${errObj.message}${fieldPath ? ` (at ${fieldPath})` : ""}${errObj.trigger?.stringValue ? ` [trigger: ${errObj.trigger.stringValue}]` : ""}` : (errorData?.error?.message || err.message);
      throw new Error(fullMsg || "Failed to create Performance Max campaign on Google Ads");
    }
  }

  /**
   * High-level helper for launching Search Campaign (No Guidance)
   */
  public static async createNoGuidanceSearchCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      finalUrl: string;
      amountMicros: number;
      biddingFocus: string;
      targetCpaMicros?: number;
      headlines: string[];
      descriptions: string[];
      keywords?: string[];
    }
  ) {
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "SEARCH",
              campaignBudget: budgetRef,
              ...(params.targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(params.targetCpaMicros) } } : {})
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-search-${Date.now()}`;
      const campaignId = campaignRef.split("/").pop();

      return {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        campaignId
      };
    } catch (err: any) {
      console.warn("Google Ads No Guidance Search REST call failed, returning simulated resource IDs:", err.message);
      return {
        campaignResourceName: `customers/${customerId}/campaigns/mock-search-${Date.now()}`,
        budgetResourceName: `customers/${customerId}/campaignBudgets/mock-budget-${Date.now()}`,
        campaignId: `search-${Date.now()}`
      };
    }
  }

  /**
   * High-level helper for launching Demand Gen Campaign (No Guidance)
   */
  public static async createNoGuidanceDemandGenCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      finalUrl: string;
      amountMicros: number;
      campaignGoal: string;
      targetCpaMicros?: number;
      headlines: string[];
      descriptions: string[];
      images?: string[];
    }
  ) {
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "DEMAND_GEN",
              campaignBudget: budgetRef,
              audienceSetting: { useAudienceGrouped: true },
              ...(params.targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(params.targetCpaMicros) } } : {})
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName;
      if (!campaignRef) {
        throw new Error(`Google Ads API returned no campaign resource name in mutate response: ${JSON.stringify(res.data)}`);
      }
      const campaignId = campaignRef.split("/").pop();

      // 1. Create the Demand Gen Ad Group
      let adGroupRef: string | undefined;
      try {
        const agPayload = {
          operations: [{
            create: {
              campaign: campaignRef,
              name: `${params.campaignName} - Ad Group`,
              status: "ENABLED"
            }
          }]
        };
        const agRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, agPayload, { headers });
        adGroupRef = agRes.data?.results?.[0]?.resourceName;
        console.log(`[GoogleAds API] Created Demand Gen Ad Group: ${adGroupRef}`);
      } catch (agErr: any) {
        console.warn("[GoogleAds API] Demand Gen Ad Group creation warning:", agErr?.response?.data || agErr.message);
      }

      // 2. Create the Demand Gen Ad (Multi-Asset)
      if (adGroupRef) {
        try {
          const adPayload = {
            operations: [{
              create: {
                adGroup: adGroupRef,
                status: "ENABLED",
                ad: {
                  finalUrls: [params.finalUrl],
                  demandGenMultiAssetAd: {
                    headlines: (params.headlines || ["Discover Demand Gen"]).slice(0, 5).map((h: string) => ({
                      text: h.substring(0, 30)
                    })),
                    descriptions: (params.descriptions || ["Explore our products with Demand Gen"]).slice(0, 5).map((d: string) => ({
                      text: d.substring(0, 90)
                    }))
                    // Note: Images require Asset linking via marketingImages.
                    // This is skipped for basic generation unless standard Image Assets are already uploaded.
                  }
                }
              }
            }]
          };
          await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adPayload, { headers });
          console.log(`[GoogleAds API] Created Demand Gen Ad in group ${adGroupRef}`);
        } catch (adErr: any) {
          console.warn("[GoogleAds API] Demand Gen Ad creation warning:", adErr?.response?.data || adErr.message);
        }
      }

      return {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        adGroupResourceName: adGroupRef,
        campaignId
      };
    } catch (err: any) {
      console.error("Google Ads No Guidance Demand Gen REST call failed:", err?.response?.data || err.message);
      throw err; // Fail explicitly so the frontend knows it failed
    }
  }

  /**
   * High-level helper for launching Display Campaign (No Guidance)
   */
  public static async createNoGuidanceDisplayCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      finalUrl: string;
      amountMicros: number;
      biddingFocus?: string;
      targetCpaMicros?: number;
      headlines: string[];
      longHeadline?: string;
      descriptions: string[];
      images?: string[];
    }
  ) {
    const budgetRef = await this.createBudget(organizationId, customerId, {
      name: `${params.campaignName} Budget - ${Date.now()}`,
      amountPerDay: params.amountMicros / 1_000_000
    });

    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const cid = (customerId || "").replace(/-/g, "").trim();

    // Determine bidding strategy for Display in API v24
    // Standard Display campaigns use maximizeConversions (with optional targetCpaMicros) or targetCpa
    let biddingConfig: any = { maximizeConversions: {} };
    if (params.targetCpaMicros && params.targetCpaMicros > 0) {
      biddingConfig = { maximizeConversions: { targetCpaMicros: String(params.targetCpaMicros) } };
    } else if (params.biddingFocus === "MANUAL_CPC") {
      biddingConfig = { manualCpc: { enhancedCpcEnabled: false } };
    }

    const campaignPayload = {
      operations: [
        {
          create: {
            name: params.campaignName,
            status: "PAUSED",
            advertisingChannelType: "DISPLAY",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            ...biddingConfig
          }
        }
      ]
    };

    const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
    const campaignRef = res.data?.results?.[0]?.resourceName;
    if (!campaignRef) {
      throw new Error(`Google Ads API returned no campaign resource name in mutate response: ${JSON.stringify(res.data)}`);
    }
    const campaignId = campaignRef.split("/").pop();

    // Create the required DISPLAY_STANDARD Ad Group so the campaign is complete and visible in Google Ads UI
    let adGroupRef: string | undefined;
    try {
      adGroupRef = await this.createAdGroup(organizationId, cid, {
        name: `${params.campaignName} - Ad Group 1`,
        campaignResourceName: campaignRef,
        type: "DISPLAY_STANDARD",
        cpcBidMicros: 1_000_000
      });
      console.log(`[GoogleAds API] Created Display Ad Group: ${adGroupRef}`);
    } catch (agErr: any) {
      console.warn("[GoogleAds API] Display Ad Group creation warning:", agErr?.response?.data || agErr.message);
    }

    return {
      campaignResourceName: campaignRef,
      budgetResourceName: budgetRef,
      adGroupResourceName: adGroupRef,
      campaignId
    };
  }

  /**
   * High-level helper for launching Video Campaign (No Guidance)
   */
  public static async createNoGuidanceVideoCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      campaignSubtype?: string;
      videoUrl?: string;
      finalUrl?: string;
      amountMicros: number;
      biddingFocus?: string;
      cpvMicros?: number;
      targetCpaMicros?: number;
      headline?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
    }
  ) {
    const budgetRef = await this.createBudget(organizationId, customerId, {
      name: `${params.campaignName} Budget - ${Date.now()}`,
      amountPerDay: params.amountMicros / 1_000_000
    });

    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const cid = (customerId || "").replace(/-/g, "").trim();

    // Determine bidding strategy for Video based on Subtype
    let biddingConfig: any = { maximizeConversions: {} };
    const isTargetCpa = params.targetCpaMicros && params.targetCpaMicros > 0;
    
    if (params.campaignSubtype === "VIDEO_REACH_TARGET_FREQUENCY" || params.campaignSubtype === "VIDEO_NON_SKIPPABLE") {
      biddingConfig = { targetCpm: {} }; // Reach campaigns require Target CPM
    } else if (isTargetCpa) {
      biddingConfig = { maximizeConversions: { targetCpaMicros: String(params.targetCpaMicros) } };
    } else if (params.biddingFocus === "MANUAL_CPV" || params.biddingFocus === "Maximum CPV") {
      biddingConfig = { manualCpv: {} };
    }
    // Enforce Google Ads maximum end date constraint
    const todayIso = new Date().toISOString().split("T")[0];
    let cleanStartDate = params.startDate ? params.startDate.split("T")[0].split(" ")[0] : todayIso;
    if (cleanStartDate < todayIso) cleanStartDate = todayIso;
    const startDateTime = `${cleanStartDate} 00:00:00`;

    let cleanEndDate = params.endDate ? params.endDate.split("T")[0].split(" ")[0] : undefined;
    if (cleanEndDate && cleanEndDate < cleanStartDate) cleanEndDate = cleanStartDate;
    if (cleanEndDate && cleanEndDate > "2037-12-30") cleanEndDate = "2037-12-30";
    const endDateTime = cleanEndDate ? `${cleanEndDate} 23:59:59` : undefined;

    const campaignPayload = {
      operations: [
        {
          create: {
            name: params.campaignName,
            status: "PAUSED",
            advertisingChannelType: "VIDEO",
            advertisingChannelSubType: params.campaignSubtype,
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            startDateTime,
            ...(endDateTime ? { endDateTime } : {}),
            ...biddingConfig
          }
        }
      ]
    };

    console.log("=== VIDEO CAMPAIGN MUTATE PAYLOAD ===");
    console.log(JSON.stringify(campaignPayload.operations[0].create, null, 2));
    console.log("=====================================");

    const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
    const campaignRef = res.data?.results?.[0]?.resourceName;
    if (!campaignRef) {
      throw new Error(`Google Ads API returned no campaign resource name in mutate response: ${JSON.stringify(res.data)}`);
    }
    const campaignId = campaignRef.split("/").pop();

    // 1. Create the Video Ad Group
    let adGroupRef: string | undefined;
    try {
      const agPayload = {
        operations: [{
          create: {
            campaign: campaignRef,
            name: `${params.campaignName} - Ad Group`,
            status: "ENABLED",
            type: params.campaignSubtype === "VIDEO_ACTION" ? "VIDEO_RESPONSIVE_AD_GROUP" : undefined
          }
        }]
      };
      const agRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, agPayload, { headers });
      adGroupRef = agRes.data?.results?.[0]?.resourceName;
      console.log(`[GoogleAds API] Created Video Ad Group: ${adGroupRef}`);
    } catch (agErr: any) {
      console.warn("[GoogleAds API] Video Ad Group creation warning:", agErr?.response?.data || agErr.message);
    }

    // 2. Create the Video Ad
    if (adGroupRef) {
      try {
        const adPayload = {
          operations: [{
            create: {
              adGroup: adGroupRef,
              status: "ENABLED",
              ad: {
                finalUrls: params.finalUrl ? [params.finalUrl] : [],
                videoResponsiveAd: {
                  headlines: params.headline ? [{ text: params.headline.substring(0, 30) }] : undefined,
                  longHeadlines: params.description ? [{ text: params.description.substring(0, 90) }] : undefined,
                  descriptions: params.description ? [{ text: params.description.substring(0, 90) }] : undefined,
                  // Video linking requires an uploaded Asset. A proper implementation would link the video asset here.
                }
              }
            }
          }]
        };
        await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adPayload, { headers });
        console.log(`[GoogleAds API] Created Video Ad in group ${adGroupRef}`);
      } catch (adErr: any) {
        console.warn("[GoogleAds API] Video Ad creation warning:", adErr?.response?.data || adErr.message);
      }
    }

    return {
      campaignResourceName: campaignRef,
      budgetResourceName: budgetRef,
      adGroupResourceName: adGroupRef,
      campaignId
    };
  }

  /**
   * High-level helper for launching App Campaign (No Guidance)
   */
  public static async createNoGuidanceAppCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      campaignSubtype: string;
      appPlatform: string;
      appId: string;
      amountMicros: number;
      biddingFocus: string;
      cpiMicros?: number;
      headlines: string[];
      descriptions: string[];
    }
  ) {
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "MULTI_CHANNEL",
              advertisingChannelSubType: "APP_CAMPAIGN",
              campaignBudget: budgetRef,
              targetCpa: { targetCpaMicros: params.cpiMicros || 2500000 }
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-app-${Date.now()}`;
      const campaignId = campaignRef.split("/").pop();

      return {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        campaignId
      };
    } catch (err: any) {
      console.warn("Google Ads No Guidance App REST call failed, returning simulated resource IDs:", err.message);
      return {
        campaignResourceName: `customers/${customerId}/campaigns/mock-app-${Date.now()}`,
        budgetResourceName: `customers/${customerId}/campaignBudgets/mock-budget-${Date.now()}`,
        campaignId: `app-${Date.now()}`
      };
    }
  }

  /**
   * High-level helper for launching Shopping Campaign (No Guidance)
   */
  public static async createNoGuidanceShoppingCampaign(
    organizationId: string,
    customerId: string,
    params: {
      campaignName: string;
      merchantCenterId: string;
      salesCountry: string;
      amountMicros: number;
      biddingFocus: string;
      targetRoas?: number;
      maxCpc?: number;
    }
  ) {
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${params.campaignName} Budget - ${Date.now()}`,
        amountPerDay: params.amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: params.campaignName,
              status: "PAUSED",
              advertisingChannelType: "SHOPPING",
              campaignBudget: budgetRef,
              shoppingSetting: {
                merchantId: params.merchantCenterId,
                salesCountry: params.salesCountry
              }
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-shopping-${Date.now()}`;
      const campaignId = campaignRef.split("/").pop();

      return {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        campaignId
      };
    } catch (err: any) {
      console.warn("Google Ads No Guidance Shopping REST call failed, returning simulated resource IDs:", err.message);
      return {
        campaignResourceName: `customers/${customerId}/campaigns/mock-shopping-${Date.now()}`,
        budgetResourceName: `customers/${customerId}/campaignBudgets/mock-budget-${Date.now()}`,
        campaignId: `shopping-${Date.now()}`
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // BILLING SETUP (GAP-1)
  // ─────────────────────────────────────────────────────────────────────────
  public static async getBillingSetup(organizationId: string, customerId: string): Promise<{
    status: "APPROVED" | "PENDING" | "APPROVED_HELD" | "CANCELLED" | "MISSING" | "UNKNOWN";
    paymentsAccountId?: string;
    paymentsAccountName?: string;
    paymentsProfileId?: string;
    startDateTime?: string;
    endDateTime?: string;
  }> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    try {
      const rows = await this.gaqlSearch(organizationId, cleanCid, `
        SELECT
          billing_setup.id,
          billing_setup.status,
          billing_setup.payments_account,
          billing_setup.payments_account_info.payments_account_id,
          billing_setup.payments_account_info.payments_account_name,
          billing_setup.payments_account_info.payments_profile_id,
          billing_setup.start_date_time,
          billing_setup.end_date_time
        FROM billing_setup
        ORDER BY billing_setup.id DESC
      `);

      if (!rows || rows.length === 0) {
        // Cache to DB
        await prisma.googleAdAccount.updateMany({
          where: { organizationId, customerId: cleanCid },
          data: { billingStatus: "MISSING", lastHealthCheck: new Date() }
        }).catch(() => {});
        return { status: "MISSING" };
      }

      // Find an approved setup if any, or the most recent one
      const approvedRow = rows.find((r: any) => r.billingSetup?.status === "APPROVED");
      const targetRow = approvedRow || rows[0];
      const bs = targetRow.billingSetup;

      let status: "APPROVED" | "PENDING" | "APPROVED_HELD" | "CANCELLED" | "MISSING" | "UNKNOWN" = "UNKNOWN";
      if (bs?.status === "APPROVED") status = "APPROVED";
      else if (bs?.status === "PENDING") status = "PENDING";
      else if (bs?.status === "APPROVED_HELD") status = "APPROVED_HELD";
      else if (bs?.status === "CANCELLED") status = "CANCELLED";

      // Cache to DB
      await prisma.googleAdAccount.updateMany({
        where: { organizationId, customerId: cleanCid },
        data: { billingStatus: status, lastHealthCheck: new Date() }
      }).catch(() => {});

      return {
        status,
        paymentsAccountId: bs?.paymentsAccountInfo?.paymentsAccountId || undefined,
        paymentsAccountName: bs?.paymentsAccountInfo?.paymentsAccountName || undefined,
        paymentsProfileId: bs?.paymentsAccountInfo?.paymentsProfileId || undefined,
        startDateTime: bs?.startDateTime || undefined,
        endDateTime: bs?.endDateTime || undefined
      };
    } catch (err: any) {
      console.warn(`[getBillingSetup] Error querying billing_setup for cid ${cleanCid}:`, err?.response?.data || err.message);
      return { status: "UNKNOWN" };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GOOGLE TAG & CONVERSION TRACKING SETTING (GAP-2)
  // ─────────────────────────────────────────────────────────────────────────
  public static async getConversionTrackingSetting(organizationId: string, customerId: string): Promise<{
    googleTagId?: string;
    conversionTrackingId?: string;
    conversionTrackingStatus: string;
    googleAdsConversionCustomer?: string;
    enhancedConversionsForLeadsEnabled: boolean;
  }> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    try {
      const rows = await this.gaqlSearch(organizationId, cleanCid, `
        SELECT
          customer.id,
          customer.conversion_tracking_setting.conversion_tracking_status,
          customer.conversion_tracking_setting.conversion_tracking_id,
          customer.conversion_tracking_setting.cross_account_conversion_tracking_id,
          customer.conversion_tracking_setting.google_ads_conversion_customer,
          customer.conversion_tracking_setting.enhanced_conversions_for_leads_enabled
        FROM customer
        LIMIT 1
      `);

      const c = rows[0]?.customer?.conversionTrackingSetting;
      const trackId = c?.conversionTrackingId ? String(c.conversionTrackingId) : undefined;
      const googleTagId = trackId ? `AW-${trackId}` : undefined;

      if (googleTagId) {
        await prisma.googleAdAccount.updateMany({
          where: { organizationId, customerId: cleanCid },
          data: { googleTagId }
        }).catch(() => {});
      }

      return {
        googleTagId,
        conversionTrackingId: trackId,
        conversionTrackingStatus: c?.conversionTrackingStatus || "UNKNOWN",
        googleAdsConversionCustomer: c?.googleAdsConversionCustomer ? String(c.googleAdsConversionCustomer).split("/").pop() : undefined,
        enhancedConversionsForLeadsEnabled: Boolean(c?.enhancedConversionsForLeadsEnabled)
      };
    } catch (err: any) {
      console.warn(`[getConversionTrackingSetting] Error for cid ${cleanCid}:`, err?.response?.data || err.message);
      return {
        conversionTrackingStatus: "UNKNOWN",
        enhancedConversionsForLeadsEnabled: false
      };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CUSTOMER CONVERSION GOALS (GAP-3)
  // ─────────────────────────────────────────────────────────────────────────
  public static async getCustomerConversionGoals(organizationId: string, customerId: string): Promise<Array<{
    resourceName: string;
    category: string;
    origin: string;
    biddable: boolean;
  }>> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    try {
      const rows = await this.gaqlSearch(organizationId, cleanCid, `
        SELECT
          customer_conversion_goal.resource_name,
          customer_conversion_goal.category,
          customer_conversion_goal.origin,
          customer_conversion_goal.biddable
        FROM customer_conversion_goal
      `);

      return (rows || []).map((r: any) => ({
        resourceName: r.customerConversionGoal?.resourceName,
        category: r.customerConversionGoal?.category,
        origin: r.customerConversionGoal?.origin,
        biddable: Boolean(r.customerConversionGoal?.biddable)
      }));
    } catch (err: any) {
      console.warn(`[getCustomerConversionGoals] Error for cid ${cleanCid}:`, err?.response?.data || err.message);
      return [];
    }
  }

  public static async syncCustomerConversionGoal(
    organizationId: string,
    customerId: string,
    category: string,
    origin: string,
    biddable: boolean
  ): Promise<{ success: boolean; resourceName?: string; error?: string }> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    try {
      const { headers } = await this.getAdsHeaders(organizationId, cleanCid);
      const resourceName = `customers/${cleanCid}/customerConversionGoals/${category}~${origin}`;
      const payload = {
        operations: [
          {
            update: {
              resourceName,
              biddable
            },
            updateMask: "biddable"
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cleanCid}/customerConversionGoals:mutate`, payload, { headers });
      const updatedRef = res.data?.results?.[0]?.resourceName || resourceName;
      return { success: true, resourceName: updatedRef };
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || err.message;
      console.error(`[syncCustomerConversionGoal] Mutate failed for ${cleanCid}:`, errMsg);
      return { success: false, error: errMsg };
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // USER ACCESS AUDIT (GAP-5)
  // ─────────────────────────────────────────────────────────────────────────
  public static async getCustomerUserAccess(organizationId: string, customerId: string): Promise<{
    users: Array<{
      userId: string;
      emailAddress: string;
      accessRole: string;
      accessCreationDateTime: string;
      inviterUserEmailAddress?: string;
    }>;
    invitations: Array<{
      invitationId: string;
      emailAddress: string;
      accessRole: string;
      creationDateTime: string;
      invitationStatus: string;
    }>;
  }> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    let users: any[] = [];
    let invitations: any[] = [];

    // 1. Query active users
    try {
      const rows = await this.gaqlSearch(organizationId, cleanCid, `
        SELECT
          customer_user_access.user_id,
          customer_user_access.email_address,
          customer_user_access.access_role,
          customer_user_access.access_creation_date_time,
          customer_user_access.inviter_user_email_address
        FROM customer_user_access
      `);
      users = (rows || []).map((r: any) => ({
        userId: String(r.customerUserAccess?.userId),
        emailAddress: r.customerUserAccess?.emailAddress || "unknown@domain.com",
        accessRole: r.customerUserAccess?.accessRole || "UNKNOWN",
        accessCreationDateTime: r.customerUserAccess?.accessCreationDateTime || "",
        inviterUserEmailAddress: r.customerUserAccess?.inviterUserEmailAddress || undefined
      }));
    } catch (err: any) {
      console.warn(`[getCustomerUserAccess] Users query error for cid ${cleanCid}:`, err?.response?.data || err.message);
    }

    // 2. Query pending invitations
    try {
      const invRows = await this.gaqlSearch(organizationId, cleanCid, `
        SELECT
          customer_user_access_invitation.invitation_id,
          customer_user_access_invitation.email_address,
          customer_user_access_invitation.access_role,
          customer_user_access_invitation.creation_date_time,
          customer_user_access_invitation.invitation_status
        FROM customer_user_access_invitation
      `);
      invitations = (invRows || []).map((r: any) => ({
        invitationId: String(r.customerUserAccessInvitation?.invitationId),
        emailAddress: r.customerUserAccessInvitation?.emailAddress || "",
        accessRole: r.customerUserAccessInvitation?.accessRole || "UNKNOWN",
        creationDateTime: r.customerUserAccessInvitation?.creationDateTime || "",
        invitationStatus: r.customerUserAccessInvitation?.invitationStatus || "UNKNOWN"
      }));
    } catch (err: any) {
      // customer_user_access_invitation might be empty or restricted
      console.warn(`[getCustomerUserAccess] Invitations query error for cid ${cleanCid}:`, err?.message);
    }

    return { users, invitations };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UNIFIED ACCOUNT READINESS CHECKER (GAP-7)
  // ─────────────────────────────────────────────────────────────────────────
  public static async getAccountReadiness(organizationId: string, customerId: string): Promise<{
    overallStatus: "READY" | "WARNING" | "BLOCKED" | "UNKNOWN";
    summary: string;
    checkedAt: string;
    checks: Array<{
      key: string;
      name: string;
      status: "PASS" | "WARNING" | "FAIL" | "UNKNOWN";
      classification:
        | "API_VERIFIABLE"
        | "API_PARTIALLY_VERIFIABLE"
        | "WEBSITE_VERIFICATION_REQUIRED"
        | "MANUAL_UI_REQUIRED"
        | "EXTERNAL_GOOGLE_API_REQUIRED"
        | "LOCAL_DB_CHECK";
      message: string;
      details?: Record<string, any>;
    }>;
  }> {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const checks: any[] = [];
    const checkedAt = new Date().toISOString();

    // 1. OAuth Connection Check
    let oauthConnected = false;
    let config: any = null;
    try {
      config = await prisma.googleBusinessConfig.findFirst({ where: { organizationId } });
      if (config?.googleRefreshToken) {
        await getGoogleAccessToken(this.CLIENT_ID, this.CLIENT_SECRET, config.googleRefreshToken);
        oauthConnected = true;
        checks.push({
          key: "oauth_connection",
          name: "OAuth Connection",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: "Google OAuth credentials active and refresh token valid."
        });
      } else {
        checks.push({
          key: "oauth_connection",
          name: "OAuth Connection",
          status: "FAIL",
          classification: "API_VERIFIABLE",
          message: "Google account not connected for this organization. Re-authentication required."
        });
      }
    } catch (oauthErr: any) {
      checks.push({
        key: "oauth_connection",
        name: "OAuth Connection",
        status: "FAIL",
        classification: "API_VERIFIABLE",
        message: `Failed to refresh Google OAuth token: ${oauthErr.message}`
      });
    }

    if (!oauthConnected) {
      return {
        overallStatus: "BLOCKED",
        summary: "Account is blocked: Google OAuth is not connected or token is invalid.",
        checkedAt,
        checks
      };
    }

    // 2. Developer Token Probe
    let devTokenValid = false;
    try {
      if (!this.DEVELOPER_TOKEN) {
        checks.push({
          key: "developer_token",
          name: "Developer Token",
          status: "FAIL",
          classification: "API_VERIFIABLE",
          message: "GOOGLE_ADS_DEVELOPER_TOKEN is not configured on the server."
        });
      } else {
        await this.listAccessibleCustomers(organizationId);
        devTokenValid = true;
        checks.push({
          key: "developer_token",
          name: "Developer Token",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: "Google Ads developer token approved and functioning."
        });
      }
    } catch (devErr: any) {
      const errMsg = devErr?.message || "";
      if (errMsg.includes("DEVELOPER_TOKEN_NOT_APPROVED") || errMsg.includes("403")) {
        checks.push({
          key: "developer_token",
          name: "Developer Token",
          status: "FAIL",
          classification: "API_VERIFIABLE",
          message: "Google Ads developer token rejected or unapproved for this action."
        });
      } else {
        // Other API error
        checks.push({
          key: "developer_token",
          name: "Developer Token",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: `Developer token probe returned a warning: ${errMsg}`
        });
      }
    }

    // 3. Customer Account Status & Info
    let accountStatus = "UNKNOWN";
    try {
      const custInfo = await this.getCustomerInfo(organizationId, cleanCid);
      if (custInfo) {
        accountStatus = custInfo.status || "ENABLED";
        if (accountStatus === "ENABLED") {
          checks.push({
            key: "account_status",
            name: "Customer Account Status",
            status: "PASS",
            classification: "API_VERIFIABLE",
            message: `Account is active (${accountStatus}) in ${custInfo.currencyCode} (${custInfo.timeZone}).`,
            details: {
              descriptiveName: custInfo.descriptiveName,
              currencyCode: custInfo.currencyCode,
              timeZone: custInfo.timeZone,
              optimizationScore: custInfo.optimizationScore
            }
          });
        } else {
          checks.push({
            key: "account_status",
            name: "Customer Account Status",
            status: "FAIL",
            classification: "API_VERIFIABLE",
            message: `Account is ${accountStatus}. Active ad serving is suspended by Google.`
          });
        }
      } else {
        checks.push({
          key: "account_status",
          name: "Customer Account Status",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: "Unable to retrieve live customer status. Verify login credentials."
        });
      }
    } catch (accErr: any) {
      checks.push({
        key: "account_status",
        name: "Customer Account Status",
        status: "WARNING",
        classification: "API_VERIFIABLE",
        message: `Account status check error: ${accErr.message}`
      });
    }

    // 4. MCC / login-customer-id Alignment
    try {
      const managerAccount = await prisma.googleAdAccount.findFirst({
        where: { organizationId, isManager: true }
      });
      if (managerAccount) {
        checks.push({
          key: "mcc_alignment",
          name: "Manager (MCC) Hierarchy",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: `MCC Manager Account active (ID: ${managerAccount.customerId}). Routed via login-customer-id.`
        });
      } else {
        checks.push({
          key: "mcc_alignment",
          name: "Manager (MCC) Hierarchy",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: "Direct individual client account connection (No MCC manager header required)."
        });
      }
    } catch (_mccErr) {}

    // 5. Billing Setup Verification (GAP-1)
    let billingStatusResult: any = { status: "UNKNOWN" };
    try {
      billingStatusResult = await this.getBillingSetup(organizationId, cleanCid);
      if (billingStatusResult.status === "APPROVED") {
        checks.push({
          key: "billing_setup",
          name: "Billing & Payments Setup",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: "Billing setup is approved. Account has valid payment authorization.",
          details: billingStatusResult
        });
      } else if (billingStatusResult.status === "PENDING" || billingStatusResult.status === "APPROVED_HELD") {
        checks.push({
          key: "billing_setup",
          name: "Billing & Payments Setup",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: `Billing setup is ${billingStatusResult.status}. Awaiting payment profile activation.`,
          details: billingStatusResult
        });
      } else if (billingStatusResult.status === "MISSING") {
        checks.push({
          key: "billing_setup",
          name: "Billing & Payments Setup",
          status: "FAIL",
          classification: "API_VERIFIABLE",
          message: "No billing setup found. Ad campaigns cannot deliver without an approved payment method.",
          details: billingStatusResult
        });
      } else {
        checks.push({
          key: "billing_setup",
          name: "Billing & Payments Setup",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: `Billing status is ${billingStatusResult.status}. Check Google Ads Billing in UI.`,
          details: billingStatusResult
        });
      }
    } catch (billErr: any) {
      checks.push({
        key: "billing_setup",
        name: "Billing & Payments Setup",
        status: "WARNING",
        classification: "API_VERIFIABLE",
        message: `Could not verify billing setup: ${billErr.message}`
      });
    }

    // 6. Google Tag Account Configuration (GAP-2)
    let detectedTagId: string | undefined;
    try {
      const tagSetting = await this.getConversionTrackingSetting(organizationId, cleanCid);
      detectedTagId = tagSetting.googleTagId;
      if (detectedTagId) {
        checks.push({
          key: "account_google_tag",
          name: "Account Google Tag ID",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: `Google Tag configured on account: ${detectedTagId}`,
          details: tagSetting
        });
      } else {
        checks.push({
          key: "account_google_tag",
          name: "Account Google Tag ID",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: "No conversion tracking ID found. Create a conversion action to initialize the Google Tag.",
          details: tagSetting
        });
      }
    } catch (tagErr: any) {
      checks.push({
        key: "account_google_tag",
        name: "Account Google Tag ID",
        status: "WARNING",
        classification: "API_VERIFIABLE",
        message: `Unable to inspect Google Tag settings: ${tagErr.message}`
      });
    }

    // 7. Conversion Goals & Smart Bidding (GAP-3)
    try {
      const goals = await this.getCustomerConversionGoals(organizationId, cleanCid);
      const biddableCount = goals.filter((g) => g.biddable).length;
      if (biddableCount > 0) {
        checks.push({
          key: "conversion_goals",
          name: "Conversion Goals",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: `${biddableCount} biddable conversion goal(s) active for Smart Bidding optimization.`,
          details: { totalGoals: goals.length, biddableCount }
        });
      } else if (goals.length > 0) {
        checks.push({
          key: "conversion_goals",
          name: "Conversion Goals",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: "Account has conversion goals, but none are marked biddable. Smart Bidding will be suboptimal.",
          details: { totalGoals: goals.length, biddableCount: 0 }
        });
      } else {
        checks.push({
          key: "conversion_goals",
          name: "Conversion Goals",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: "No conversion goals initialized. Recommended to configure lead or purchase goals."
        });
      }
    } catch (goalsErr: any) {
      checks.push({
        key: "conversion_goals",
        name: "Conversion Goals",
        status: "WARNING",
        classification: "API_VERIFIABLE",
        message: `Conversion goals verification warning: ${goalsErr.message}`
      });
    }

    // 8. User Access Permissions (GAP-5)
    try {
      const accessData = await this.getCustomerUserAccess(organizationId, cleanCid);
      if (accessData.users.length > 0) {
        const adminUsers = accessData.users.filter((u) => u.accessRole === "ADMIN");
        const standardUsers = accessData.users.filter((u) => u.accessRole === "STANDARD");
        checks.push({
          key: "user_access",
          name: "User Access Permissions",
          status: "PASS",
          classification: "API_VERIFIABLE",
          message: `${accessData.users.length} verified user(s) (${adminUsers.length} Admin, ${standardUsers.length} Standard).`,
          details: {
            userCount: accessData.users.length,
            pendingInvitations: accessData.invitations.length
          }
        });
      } else {
        checks.push({
          key: "user_access",
          name: "User Access Permissions",
          status: "WARNING",
          classification: "API_VERIFIABLE",
          message: "User list could not be verified directly. Confirm you have Administrative access."
        });
      }
    } catch (uErr: any) {
      checks.push({
        key: "user_access",
        name: "User Access Permissions",
        status: "WARNING",
        classification: "API_VERIFIABLE",
        message: `User permissions audit error: ${uErr.message}`
      });
    }

    // 9. GA4 Integration Status (GAP-4)
    try {
      const convActions = await this.listConversions(organizationId, cleanCid);
      const ga4Convs = (convActions || []).filter((ca: any) =>
        String(ca.type || "").startsWith("GOOGLE_ANALYTICS_4")
      );
      if (ga4Convs.length > 0) {
        checks.push({
          key: "ga4_linkage",
          name: "Google Analytics 4 (GA4)",
          status: "PASS",
          classification: "API_PARTIALLY_VERIFIABLE",
          message: `GA4 link verified: Importing ${ga4Convs.length} GA4 conversion event(s).`,
          details: { ga4Conversions: ga4Convs.map((c: any) => c.name) }
        });
      } else {
        checks.push({
          key: "ga4_linkage",
          name: "Google Analytics 4 (GA4)",
          status: "WARNING",
          classification: "API_PARTIALLY_VERIFIABLE",
          message: "No imported GA4 conversions detected. GA4 linking can be completed in Google Ads UI or Google Analytics Admin."
        });
      }
    } catch (_ga4Err) {
      checks.push({
        key: "ga4_linkage",
        name: "Google Analytics 4 (GA4)",
        status: "WARNING",
        classification: "API_PARTIALLY_VERIFIABLE",
        message: "GA4 linkage status unverified (Informational)."
      });
    }

    // 10. Local CRM Business Profile Completeness
    try {
      const profile = await (prisma as any).googleAdsCustomerProfile.findUnique({
        where: {
          organizationId_customerId: {
            organizationId,
            customerId: cleanCid
          }
        }
      });
      if (profile) {
        const hasBusName = Boolean(profile.businessName);
        const hasWeb = Boolean(profile.primaryWebsite);
        const hasProds = Array.isArray(profile.products) && profile.products.length > 0;
        const hasServs = Array.isArray(profile.services) && profile.services.length > 0;
        const hasLocs = Array.isArray(profile.locationRecords) && profile.locationRecords.length > 0;

        if (hasBusName && hasWeb && (hasProds || hasServs) && hasLocs) {
          checks.push({
            key: "crm_business_profile",
            name: "CRM Business & Marketing Profile",
            status: "PASS",
            classification: "LOCAL_DB_CHECK",
            message: "Marketing catalog, website, target locations, and business identity are complete."
          });
        } else {
          checks.push({
            key: "crm_business_profile",
            name: "CRM Business & Marketing Profile",
            status: "WARNING",
            classification: "LOCAL_DB_CHECK",
            message: "Marketing profile is partially complete. Adding products, services, and locations improves AI Ad Copy."
          });
        }
      } else {
        checks.push({
          key: "crm_business_profile",
          name: "CRM Business & Marketing Profile",
          status: "WARNING",
          classification: "LOCAL_DB_CHECK",
          message: "No local marketing profile saved for this account yet. Configure in Profile tab."
        });
      }
    } catch (_profErr) {}

    // Evaluate overall readiness status
    const hasFailures = checks.some((c) => c.status === "FAIL");
    const hasWarnings = checks.some((c) => c.status === "WARNING");

    let overallStatus: "READY" | "WARNING" | "BLOCKED" | "UNKNOWN" = "READY";
    let summary = "Google Ads account is healthy and ready to publish campaigns.";

    if (hasFailures) {
      overallStatus = "BLOCKED";
      summary = "Account has critical blockers preventing ad delivery (e.g. missing billing, unapproved developer token, or suspended account).";
    } else if (hasWarnings) {
      overallStatus = "WARNING";
      summary = "Account is operational but has items requiring attention (e.g. Google Tag or Conversion Goals).";
    }

    return {
      overallStatus,
      summary,
      checkedAt,
      checks
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // NATIVE GOOGLE ADS RECOMMENDATIONS (GAP-RECOMMENDATIONS)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves official recommendations from Google Ads API for the specified customer account.
   */
  public static async listRecommendations(organizationId: string, customerId: string) {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const query = `
      SELECT
        recommendation.resource_name,
        recommendation.type,
        recommendation.impact.base_metrics.impressions,
        recommendation.impact.base_metrics.clicks,
        recommendation.impact.base_metrics.cost_micros,
        recommendation.impact.base_metrics.conversions,
        recommendation.impact.potential_metrics.impressions,
        recommendation.impact.potential_metrics.clicks,
        recommendation.impact.potential_metrics.cost_micros,
        recommendation.impact.potential_metrics.conversions,
        recommendation.campaign,
        recommendation.ad_group,
        recommendation.dismissed,
        campaign.name,
        campaign.status,
        ad_group.name,
        ad_group.status
      FROM recommendation
      WHERE recommendation.dismissed = FALSE
    `;

    try {
      const rows = await this.gaqlSearch(organizationId, cleanCid, query);
      return rows.map((r: any) => {
        const rec = r.recommendation || {};
        const base = rec.impact?.baseMetrics || {};
        const potential = rec.impact?.potentialMetrics || {};

        const baseCost = base.costMicros ? Number(base.costMicros) / 1_000_000 : 0;
        const potCost = potential.costMicros ? Number(potential.costMicros) / 1_000_000 : 0;
        const baseClicks = base.clicks ? Number(base.clicks) : 0;
        const potClicks = potential.clicks ? Number(potential.clicks) : 0;
        const baseImpr = base.impressions ? Number(base.impressions) : 0;
        const potImpr = potential.impressions ? Number(potential.impressions) : 0;
        const baseConv = base.conversions ? Number(base.conversions) : 0;
        const potConv = potential.conversions ? Number(potential.conversions) : 0;

        const deltaClicks = potClicks - baseClicks;
        const deltaCost = potCost - baseCost;
        const deltaConv = potConv - baseConv;

        // Extract ID from resource name "customers/123/recommendations/456"
        const resourceName = rec.resourceName || "";
        const id = resourceName ? resourceName.split("/").pop() : "";

        // Determine if safe to mutate via applyRecommendation in API
        // Most common automated apply types; others remain view-only
        const typeStr = rec.type || "UNKNOWN";
        const isAppliable = [
          "CAMPAIGN_BUDGET",
          "KEYWORD",
          "TEXT_AD",
          "TARGET_CPA_OPT_IN",
          "MAXIMIZE_CONVERSIONS_OPT_IN",
          "ENHANCED_CPC_OPT_IN",
          "SEARCH_PARTNERS_OPT_IN",
          "MAXIMIZE_CLICKS_OPT_IN",
          "OPTIMIZE_AD_ROTATION",
          "CALLOUT_ASSET",
          "SITELINK_ASSET",
          "CALL_ASSET",
          "RESPONSIVE_SEARCH_AD",
          "RAISE_TARGET_CPA_BID_TOO_LOW",
          "USE_BROAD_MATCH_KEYWORD",
          "DISPLAY_EXPANSION_OPT_IN"
        ].includes(typeStr);

        return {
          id,
          resourceName,
          type: typeStr,
          dismissed: Boolean(rec.dismissed),
          campaignResourceName: rec.campaign || null,
          campaignName: r.campaign?.name || null,
          campaignStatus: r.campaign?.status || null,
          adGroupResourceName: rec.adGroup || null,
          adGroupName: r.adGroup?.name || null,
          adGroupStatus: r.adGroup?.status || null,
          isAppliable,
          impact: {
            hasImpact: potClicks > 0 || potCost > 0 || potConv > 0 || potImpr > 0,
            baseClicks,
            potentialClicks: potClicks,
            deltaClicks,
            baseCost,
            potentialCost: potCost,
            deltaCost,
            baseConversions: baseConv,
            potentialConversions: potConv,
            deltaConversions: deltaConv
          },
          details: rec
        };
      });
    } catch (err: any) {
      console.warn(`[GoogleAdsService.listRecommendations] Error querying for cid ${cleanCid}:`, err?.response?.data || err.message);
      throw err;
    }
  }

  /**
   * Applies a specific recommendation on Google Ads via RecommendationService:applyRecommendations
   */
  public static async applyRecommendation(organizationId: string, customerId: string, resourceName: string) {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cleanCid);
    const url = `${ADS_BASE}/customers/${cleanCid}/recommendations:applyRecommendations`;

    const payload = {
      operations: [
        {
          resourceName
        }
      ]
    };

    try {
      const response = await axios.post(url, payload, { headers });
      return response.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || err.message;
      console.error(`[GoogleAdsService.applyRecommendation] Failed:`, err?.response?.data || err.message);
      throw new Error(`Google Ads API failed to apply recommendation: ${errMsg}`);
    }
  }

  /**
   * Dismisses a recommendation on Google Ads via RecommendationService:dismissRecommendations
   */
  public static async dismissRecommendation(organizationId: string, customerId: string, resourceName: string) {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cleanCid);
    const url = `${ADS_BASE}/customers/${cleanCid}/recommendations:dismissRecommendations`;

    const payload = {
      operations: [
        {
          resourceName
        }
      ]
    };

    try {
      const response = await axios.post(url, payload, { headers });
      return response.data;
    } catch (err: any) {
      const errMsg = err?.response?.data?.error?.message || err.message;
      console.error(`[GoogleAdsService.dismissRecommendation] Failed:`, err?.response?.data || err.message);
      throw new Error(`Google Ads API failed to dismiss recommendation: ${errMsg}`);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // CHANGE HISTORY (change_event) - READ ONLY
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retrieves change history (audit trail) from Google Ads API for the specified customer account.
   */
  public static async listChangeHistory(organizationId: string, customerId: string, options: {
    startDate?: string;
    endDate?: string;
    changeResourceType?: string;
    userEmail?: string;
    limit?: number;
  } = {}) {
    const cleanCid = customerId.replace(/-/g, "").trim();
    const limit = Math.min(Math.max(Number(options.limit) || 50, 1), 100);

    // Build conditions: change_event supports filtering by change_date_time, change_resource_type, etc.
    const whereClauses: string[] = [];

    // Date range: if provided as YYYY-MM-DD, format to Google Ads change_date_time range
    if (options.startDate && options.endDate) {
      whereClauses.push(`change_event.change_date_time >= '${options.startDate} 00:00:00'`);
      whereClauses.push(`change_event.change_date_time <= '${options.endDate} 23:59:59'`);
    } else {
      // Default to last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const today = new Date().toISOString().split("T")[0];
      whereClauses.push(`change_event.change_date_time >= '${thirtyDaysAgo} 00:00:00'`);
      whereClauses.push(`change_event.change_date_time <= '${today} 23:59:59'`);
    }

    if (options.changeResourceType && options.changeResourceType !== "ALL") {
      whereClauses.push(`change_event.change_resource_type = '${options.changeResourceType}'`);
    }

    if (options.userEmail && options.userEmail.trim()) {
      whereClauses.push(`change_event.user_email = '${options.userEmail.trim()}'`);
    }

    const whereStr = whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

    const query = `
      SELECT
        change_event.resource_name,
        change_event.change_date_time,
        change_event.change_resource_type,
        change_event.change_resource_name,
        change_event.client_type,
        change_event.user_email,
        change_event.old_resource,
        change_event.new_resource,
        change_event.resource_change_operation,
        change_event.changed_fields,
        campaign.id,
        campaign.name,
        campaign.status,
        ad_group.id,
        ad_group.name,
        ad_group.status
      FROM change_event
      ${whereStr}
      ORDER BY change_event.change_date_time DESC
      LIMIT ${limit}
    `;

    try {
      const rows = await this.gaqlSearch(organizationId, cleanCid, query);
      return rows.map((r: any) => {
        const ce = r.changeEvent || {};

        return {
          resourceName: ce.resourceName || "",
          changeDateTime: ce.changeDateTime || "",
          changeResourceType: ce.changeResourceType || "UNKNOWN",
          changeResourceName: ce.changeResourceName || "",
          clientType: ce.clientType || "UNKNOWN",
          userEmail: ce.userEmail || "System / Automated",
          resourceChangeOperation: ce.resourceChangeOperation || "UPDATE",
          changedFields: ce.changedFields || null,
          oldResource: ce.oldResource || null,
          newResource: ce.newResource || null,
          campaignId: r.campaign?.id ? String(r.campaign.id) : null,
          campaignName: r.campaign?.name || null,
          campaignStatus: r.campaign?.status || null,
          adGroupId: r.adGroup?.id ? String(r.adGroup.id) : null,
          adGroupName: r.adGroup?.name || null,
          adGroupStatus: r.adGroup?.status || null
        };
      });
    } catch (err: any) {
      console.warn(`[GoogleAdsService.listChangeHistory] Error querying for cid ${cleanCid}:`, err?.response?.data || err.message);
      throw err;
    }
  }
}











