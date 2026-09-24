import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export interface CreatePortfolioStrategyInput {
  name: string;
  type: "TARGET_CPA" | "TARGET_ROAS" | "MAXIMIZE_CONVERSIONS" | "MAXIMIZE_CONVERSION_VALUE" | "TARGET_SPEND";
  targetCpa?: number; // e.g. 500 (INR) -> target_cpa_micros
  targetRoas?: number; // e.g. 3.5 -> target_roas (double in Google Ads)
  cpcBidCeiling?: number; // Optional max bid limit in currency
  currencyCode?: string;
}

export interface UpdatePortfolioStrategyInput {
  name?: string;
  targetCpa?: number;
  targetRoas?: number;
}

export interface CreateDataExclusionInput {
  name: string;
  description?: string;
  startDateTime: string; // "YYYY-MM-DD HH:MM:SS"
  endDateTime: string;   // "YYYY-MM-DD HH:MM:SS"
  campaignIds?: string[];
  devices?: Array<"MOBILE" | "DESKTOP" | "TABLET" | "CONNECTED_TV">;
  scope?: "GLOBAL" | "CAMPAIGN";
}

export interface UpdateDataExclusionInput {
  name?: string;
  description?: string;
  startDateTime?: string;
  endDateTime?: string;
  campaignIds?: string[];
  devices?: Array<"MOBILE" | "DESKTOP" | "TABLET" | "CONNECTED_TV">;
}

export interface BidAdjustmentItem {
  resourceName: string;
  criterionId: string;
  dimension: "DEVICE" | "LOCATION" | "AD_SCHEDULE" | "AUDIENCE" | string;
  targetName: string;
  targetDetails?: any;
  bidModifier: number; // e.g. 1.2 (+20%), 0.8 (-20%), 0.0 (-100% opt out)
  bidModifierPercent: number; // e.g. +20, -20, -100
  isMutable: boolean;
  status?: string;
}

export interface CampaignBidAdjustmentsResponse {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  biddingStrategyType: string;
  isPMax: boolean;
  isSmartBidding: boolean;
  supportNotes: {
    deviceSupported: boolean;
    locationSupported: boolean;
    scheduleSupported: boolean;
    audienceSupported: boolean;
    limitationMessage?: string;
  };
  adjustments: {
    devices: BidAdjustmentItem[];
    locations: BidAdjustmentItem[];
    schedules: BidAdjustmentItem[];
    audiences: BidAdjustmentItem[];
  };
}

export interface UpdateBidAdjustmentInput {
  resourceName: string;
  bidModifier: number; // e.g. 1.2 or bid modifier percentage e.g. 20 (meaning +20%)
}

export interface AddLocationAdjustmentInput {
  campaignId: string;
  geoTargetConstantId: string; // e.g. "1007788" for Pune
  bidModifier?: number; // e.g. 1.15 (+15%)
}

export interface AddScheduleAdjustmentInput {
  campaignId: string;
  dayOfWeek: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
  startHour: number;
  startMinute: "ZERO" | "FIFTEEN" | "THIRTY" | "FORTY_FIVE";
  endHour: number;
  endMinute: "ZERO" | "FIFTEEN" | "THIRTY" | "FORTY_FIVE";
  bidModifier?: number;
}

export class GoogleAdsBiddingService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. PORTFOLIO BID STRATEGIES (bidding_strategy)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists portfolio/shared bidding strategies for the customer account,
   * including associated campaign names and counts.
   */
  public static async listPortfolioStrategies(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // 1. Query bidding_strategy
    const stratQuery = `
      SELECT
        bidding_strategy.id,
        bidding_strategy.name,
        bidding_strategy.type,
        bidding_strategy.status,
        bidding_strategy.campaign_count,
        bidding_strategy.target_cpa.target_cpa_micros,
        bidding_strategy.target_cpa.cpc_bid_ceiling_micros,
        bidding_strategy.target_cpa.cpc_bid_floor_micros,
        bidding_strategy.target_roas.target_roas,
        bidding_strategy.target_roas.cpc_bid_ceiling_micros,
        bidding_strategy.target_roas.cpc_bid_floor_micros,
        bidding_strategy.maximize_conversions.target_cpa_micros,
        bidding_strategy.maximize_conversion_value.target_roas,
        bidding_strategy.target_spend.target_spend_micros,
        bidding_strategy.target_spend.cpc_bid_ceiling_micros,
        bidding_strategy.resource_name
      FROM bidding_strategy
      LIMIT 100
    `;

    const stratRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: stratQuery },
      { headers }
    );
    const stratRows = stratRes.data?.results || [];

    // 2. Query campaigns referencing bidding strategies
    const campQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.bidding_strategy,
        campaign.bidding_strategy_type
      FROM campaign
      WHERE campaign.status != 'REMOVED'
        AND campaign.bidding_strategy != ''
      LIMIT 200
    `;

    const campMap = new Map<string, Array<{ id: string; name: string; status: string }>>();
    try {
      const campRes = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
        { query: campQuery },
        { headers }
      );
      for (const row of campRes.data?.results || []) {
        const stratRef = row.campaign?.biddingStrategy;
        if (!stratRef) continue;
        const list = campMap.get(stratRef) || [];
        list.push({
          id: String(row.campaign?.id || ""),
          name: row.campaign?.name || "",
          status: row.campaign?.status || "ENABLED"
        });
        campMap.set(stratRef, list);
      }
    } catch (e: any) {
      console.warn("[GoogleAdsBiddingService] Could not fetch campaign links for strategies:", e?.message);
    }

    return stratRows.map((r: any) => {
      const bs = r.biddingStrategy;
      const resName = bs?.resourceName || `customers/${cid}/biddingStrategies/${bs?.id}`;

      let targetDisplay = "—";
      let targetCpa: number | null = null;
      let targetRoas: number | null = null;

      if (bs?.targetCpa?.targetCpaMicros) {
        targetCpa = Number(bs.targetCpa.targetCpaMicros) / 1_000_000;
        targetDisplay = `Target CPA: ${targetCpa.toLocaleString()}`;
      } else if (bs?.maximizeConversions?.targetCpaMicros) {
        targetCpa = Number(bs.maximizeConversions.targetCpaMicros) / 1_000_000;
        targetDisplay = `Target CPA: ${targetCpa.toLocaleString()}`;
      } else if (bs?.targetRoas?.targetRoas) {
        targetRoas = Number(bs.targetRoas.targetRoas) * 100;
        targetDisplay = `Target ROAS: ${targetRoas.toFixed(0)}%`;
      } else if (bs?.maximizeConversionValue?.targetRoas) {
        targetRoas = Number(bs.maximizeConversionValue.targetRoas) * 100;
        targetDisplay = `Target ROAS: ${targetRoas.toFixed(0)}%`;
      } else if (bs?.type === "MAXIMIZE_CONVERSIONS") {
        targetDisplay = "Maximize conversions (automatic)";
      } else if (bs?.type === "MAXIMIZE_CONVERSION_VALUE") {
        targetDisplay = "Maximize conversion value (automatic)";
      } else if (bs?.type === "TARGET_SPEND") {
        targetDisplay = "Maximize clicks";
      }

      const assignedCampaigns = campMap.get(resName) || [];

      return {
        id: String(bs?.id || ""),
        resourceName: resName,
        name: bs?.name || "",
        type: bs?.type || "UNKNOWN",
        status: bs?.status || "ENABLED",
        campaignCount: Number(bs?.campaignCount || assignedCampaigns.length || 0),
        targetDisplay,
        targetCpa,
        targetRoas,
        campaigns: assignedCampaigns
      };
    });
  }

  /**
   * Creates a new Portfolio Bidding Strategy in Google Ads.
   */
  public static async createPortfolioStrategy(
    organizationId: string,
    customerId: string,
    input: CreatePortfolioStrategyInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.name || !input.name.trim()) {
      throw new Error("Portfolio bidding strategy name is required.");
    }
    if (!input.type) {
      throw new Error("Strategy type is required.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const stratPayload: any = {
      name: input.name.trim(),
      type: input.type
    };

    if (input.type === "TARGET_CPA") {
      if (!input.targetCpa || Number(input.targetCpa) <= 0) {
        throw new Error("Target CPA is required and must be greater than 0 for TARGET_CPA strategy.");
      }
      const cpaMicros = String(Math.round(Number(input.targetCpa) * 1_000_000));
      stratPayload.targetCpa = {
        targetCpaMicros: cpaMicros
      };
      if (input.cpcBidCeiling && Number(input.cpcBidCeiling) > 0) {
        stratPayload.targetCpa.cpcBidCeilingMicros = String(Math.round(Number(input.cpcBidCeiling) * 1_000_000));
      }
    } else if (input.type === "TARGET_ROAS") {
      if (!input.targetRoas || Number(input.targetRoas) <= 0) {
        throw new Error("Target ROAS is required and must be greater than 0 (e.g., 3.5 for 350%).");
      }
      stratPayload.targetRoas = {
        targetRoas: Number(input.targetRoas)
      };
      if (input.cpcBidCeiling && Number(input.cpcBidCeiling) > 0) {
        stratPayload.targetRoas.cpcBidCeilingMicros = String(Math.round(Number(input.cpcBidCeiling) * 1_000_000));
      }
    } else if (input.type === "MAXIMIZE_CONVERSIONS") {
      stratPayload.maximizeConversions = {};
      if (input.targetCpa && Number(input.targetCpa) > 0) {
        stratPayload.maximizeConversions.targetCpaMicros = String(Math.round(Number(input.targetCpa) * 1_000_000));
      }
    } else if (input.type === "MAXIMIZE_CONVERSION_VALUE") {
      stratPayload.maximizeConversionValue = {};
      if (input.targetRoas && Number(input.targetRoas) > 0) {
        stratPayload.maximizeConversionValue.targetRoas = Number(input.targetRoas);
      }
    } else if (input.type === "TARGET_SPEND") {
      stratPayload.targetSpend = {};
      if (input.cpcBidCeiling && Number(input.cpcBidCeiling) > 0) {
        stratPayload.targetSpend.cpcBidCeilingMicros = String(Math.round(Number(input.cpcBidCeiling) * 1_000_000));
      }
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/biddingStrategies:mutate`,
      {
        operations: [
          {
            create: stratPayload
          }
        ]
      },
      { headers }
    );

    const resourceName = res.data?.results?.[0]?.resourceName;
    return {
      resourceName,
      name: input.name.trim(),
      type: input.type
    };
  }

  /**
   * Updates an existing Portfolio Bidding Strategy using Google Ads update masks.
   */
  public static async updatePortfolioStrategy(
    organizationId: string,
    customerId: string,
    resourceName: string,
    input: UpdatePortfolioStrategyInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const updateMasks: string[] = [];
    const stratPayload: any = { resourceName };

    if (input.name && input.name.trim()) {
      stratPayload.name = input.name.trim();
      updateMasks.push("name");
    }

    if (input.targetCpa && Number(input.targetCpa) > 0) {
      const cpaMicros = String(Math.round(Number(input.targetCpa) * 1_000_000));
      stratPayload.targetCpa = { targetCpaMicros: cpaMicros };
      updateMasks.push("target_cpa.target_cpa_micros");
    }

    if (input.targetRoas && Number(input.targetRoas) > 0) {
      stratPayload.targetRoas = { targetRoas: Number(input.targetRoas) };
      updateMasks.push("target_roas.target_roas");
    }

    if (updateMasks.length === 0) {
      throw new Error("No fields provided for strategy update.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/biddingStrategies:mutate`,
      {
        operations: [
          {
            update: stratPayload,
            updateMask: updateMasks.join(",")
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName };
  }

  /**
   * Removes / deletes a portfolio bidding strategy.
   * Google Ads rejects removal if campaigns are still attached.
   */
  public static async removePortfolioStrategy(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    try {
      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/biddingStrategies:mutate`,
        {
          operations: [
            {
              remove: resourceName
            }
          ]
        },
        { headers }
      );
      return res.data?.results?.[0] || { resourceName };
    } catch (err: any) {
      const msg = err?.response?.data?.error?.message || err.message;
      if (msg.includes("STRATEGY_HAS_CAMPAIGNS") || msg.includes("CANNOT_ATTACH_OR_REMOVE")) {
        throw new Error(
          "Cannot delete portfolio strategy: Campaigns are currently linked to this strategy. Reassign or remove the strategy from all campaigns before deleting."
        );
      }
      throw new Error(`Google Ads error removing bidding strategy: ${msg}`);
    }
  }

  /**
   * Assigns a portfolio bidding strategy to a campaign.
   */
  public static async assignStrategyToCampaign(
    organizationId: string,
    customerId: string,
    campaignResourceName: string,
    biddingStrategyResourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaigns:mutate`,
      {
        operations: [
          {
            update: {
              resourceName: campaignResourceName,
              biddingStrategy: biddingStrategyResourceName
            },
            updateMask: "bidding_strategy"
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BIDDING DATA EXCLUSIONS (bidding_data_exclusion)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Lists Bidding Data Exclusions for the customer account.
   */
  public static async listDataExclusions(organizationId: string, customerId: string) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const query = `
      SELECT
        bidding_data_exclusion.data_exclusion_id,
        bidding_data_exclusion.name,
        bidding_data_exclusion.description,
        bidding_data_exclusion.start_date_time,
        bidding_data_exclusion.end_date_time,
        bidding_data_exclusion.scope,
        bidding_data_exclusion.campaigns,
        bidding_data_exclusion.devices,
        bidding_data_exclusion.status,
        bidding_data_exclusion.resource_name
      FROM bidding_data_exclusion
      LIMIT 100
    `;

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query },
      { headers }
    );
    const rows = res.data?.results || [];

    return rows.map((r: any) => {
      const de = r.biddingDataExclusion;
      return {
        id: String(de?.dataExclusionId || ""),
        resourceName: de?.resourceName || "",
        name: de?.name || "",
        description: de?.description || "",
        startDateTime: de?.startDateTime || "",
        endDateTime: de?.endDateTime || "",
        scope: de?.scope || "GLOBAL",
        campaigns: de?.campaigns || [],
        devices: de?.devices || [],
        status: de?.status || "ENABLED"
      };
    });
  }

  /**
   * Creates a Bidding Data Exclusion in Google Ads.
   */
  public static async createDataExclusion(
    organizationId: string,
    customerId: string,
    input: CreateDataExclusionInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    if (!input.name || !input.name.trim()) {
      throw new Error("Data exclusion name is required.");
    }
    if (!input.startDateTime || !input.endDateTime) {
      throw new Error("Start date/time and end date/time are required.");
    }

    // Validate that start < end
    const startMs = new Date(input.startDateTime.replace(" ", "T")).getTime();
    const endMs = new Date(input.endDateTime.replace(" ", "T")).getTime();
    if (isNaN(startMs) || isNaN(endMs) || startMs >= endMs) {
      throw new Error("Start date/time must be strictly earlier than end date/time.");
    }

    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // Format dates as YYYY-MM-DD HH:MM:SS
    const formatAdsDate = (dt: string) => {
      const d = new Date(dt.includes("T") ? dt : dt.replace(" ", "T"));
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    const exclusionPayload: any = {
      name: input.name.trim(),
      description: input.description?.trim() || "Bidding data exclusion created via Jisnu CRM",
      startDateTime: formatAdsDate(input.startDateTime),
      endDateTime: formatAdsDate(input.endDateTime),
      scope: input.scope || (input.campaignIds && input.campaignIds.length > 0 ? "CAMPAIGN" : "GLOBAL")
    };

    if (exclusionPayload.scope === "CAMPAIGN" && input.campaignIds && input.campaignIds.length > 0) {
      exclusionPayload.campaigns = input.campaignIds.map(c =>
        c.startsWith("customers/") ? c : `customers/${cid}/campaigns/${c}`
      );
    }

    if (input.devices && input.devices.length > 0) {
      exclusionPayload.devices = input.devices;
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/biddingDataExclusions:mutate`,
      {
        operations: [
          {
            create: exclusionPayload
          }
        ]
      },
      { headers }
    );

    const resourceName = res.data?.results?.[0]?.resourceName;
    return {
      resourceName,
      name: input.name.trim()
    };
  }

  /**
   * Updates an existing Bidding Data Exclusion.
   */
  public static async updateDataExclusion(
    organizationId: string,
    customerId: string,
    resourceName: string,
    input: UpdateDataExclusionInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const updateMasks: string[] = [];
    const payload: any = { resourceName };

    if (input.name) {
      payload.name = input.name.trim();
      updateMasks.push("name");
    }

    if (input.description !== undefined) {
      payload.description = input.description.trim();
      updateMasks.push("description");
    }

    const formatAdsDate = (dt: string) => {
      const d = new Date(dt.includes("T") ? dt : dt.replace(" ", "T"));
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    };

    if (input.startDateTime) {
      payload.startDateTime = formatAdsDate(input.startDateTime);
      updateMasks.push("start_date_time");
    }

    if (input.endDateTime) {
      payload.endDateTime = formatAdsDate(input.endDateTime);
      updateMasks.push("end_date_time");
    }

    if (input.campaignIds) {
      payload.campaigns = input.campaignIds.map(c =>
        c.startsWith("customers/") ? c : `customers/${cid}/campaigns/${c}`
      );
      updateMasks.push("campaigns");
    }

    if (input.devices) {
      payload.devices = input.devices;
      updateMasks.push("devices");
    }

    if (updateMasks.length === 0) {
      throw new Error("No fields provided for data exclusion update.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/biddingDataExclusions:mutate`,
      {
        operations: [
          {
            update: payload,
            updateMask: updateMasks.join(",")
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName };
  }

  /**
   * Removes / deletes a Bidding Data Exclusion.
   */
  public static async removeDataExclusion(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/biddingDataExclusions:mutate`,
      {
        operations: [
          {
            remove: resourceName
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. CAMPAIGN BID ADJUSTMENTS (campaign_criterion)
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Reads all campaign bid adjustment criteria (Device, Location, Ad Schedule, Audience/UserList)
   * for a specified campaign, including campaign restrictions and Smart Bidding support status.
   */
  public static async getCampaignBidAdjustments(
    organizationId: string,
    customerId: string,
    campaignIdOrResource: string
  ): Promise<CampaignBidAdjustmentsResponse> {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const isResource = campaignIdOrResource.startsWith("customers/");
    const cleanCampId = campaignIdOrResource.replace(/\D/g, "");

    // 1. Fetch campaign metadata & bidding type
    const campQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type,
        campaign.bidding_strategy_type,
        campaign.status
      FROM campaign
      WHERE ${isResource ? `campaign.resource_name = '${campaignIdOrResource}'` : `campaign.id = ${cleanCampId}`}
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
    const biddingStrategyType = campRow.biddingStrategyType || "UNKNOWN";

    const isPMax = campaignType === "PERFORMANCE_MAX";
    const isSmartBidding = [
      "TARGET_CPA",
      "TARGET_ROAS",
      "MAXIMIZE_CONVERSIONS",
      "MAXIMIZE_CONVERSION_VALUE"
    ].includes(biddingStrategyType);

    // Limitation notes based on official Google Ads API rules:
    // - PMax campaigns ignore traditional device, location, schedule, and audience bid adjustments.
    // - Target CPA / Target ROAS / Maximize Conversions use Smart Bidding:
    //   - Device: -100% (0.0) opt-out is supported; positive/negative bid adjustments may be ignored or limited to Target CPA modifiers.
    //   - Location & Ad Schedule: Not used directly by Smart Bidding algorithms except as reporting context or -100% exclusions.
    let limitationMessage: string | undefined;
    if (isPMax) {
      limitationMessage =
        "Performance Max campaigns automate channel allocation across Google AI; traditional device, location, schedule, and audience bid adjustments do not apply.";
    } else if (isSmartBidding) {
      limitationMessage =
        `Campaign uses automated Smart Bidding (${biddingStrategyType.replace(/_/g, " ")}). Device adjustments are supported (including -100% to opt out). Location and schedule adjustments serve as guardrails or can be adjusted if manual overrides are permitted.`;
    }

    const supportNotes = {
      deviceSupported: !isPMax,
      locationSupported: !isPMax,
      scheduleSupported: !isPMax,
      audienceSupported: !isPMax,
      limitationMessage
    };

    // 2. Fetch criteria for DEVICE, LOCATION, AD_SCHEDULE, USER_LIST
    const critQuery = `
      SELECT
        campaign_criterion.resource_name,
        campaign_criterion.criterion_id,
        campaign_criterion.type,
        campaign_criterion.bid_modifier,
        campaign_criterion.status,
        campaign_criterion.device.type,
        campaign_criterion.location.geo_target_constant,
        campaign_criterion.ad_schedule.day_of_week,
        campaign_criterion.ad_schedule.start_hour,
        campaign_criterion.ad_schedule.start_minute,
        campaign_criterion.ad_schedule.end_hour,
        campaign_criterion.ad_schedule.end_minute,
        campaign_criterion.user_list.user_list
      FROM campaign_criterion
      WHERE campaign.id = ${campaignId}
        AND campaign_criterion.type IN ('DEVICE', 'LOCATION', 'AD_SCHEDULE', 'USER_LIST')
      LIMIT 150
    `;

    const critRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: critQuery },
      { headers }
    );

    const rawRows = critRes.data?.results || [];

    const devices: BidAdjustmentItem[] = [];
    const locations: BidAdjustmentItem[] = [];
    const schedules: BidAdjustmentItem[] = [];
    const audiences: BidAdjustmentItem[] = [];

    const deviceMap: Record<string, string> = {
      DESKTOP: "Computers / Desktop",
      MOBILE: "Mobile Phones",
      TABLET: "Tablets",
      CONNECTED_TV: "Connected TVs",
      OTHER: "Other Devices"
    };

    const seenDevices = new Set<string>();

    for (const r of rawRows) {
      const c = r.campaignCriterion || {};
      const critType = c.type;
      const rawModifier = c.bidModifier !== undefined && c.bidModifier !== null ? Number(c.bidModifier) : 1.0;
      const percent = Math.round((rawModifier - 1.0) * 100);

      if (critType === "DEVICE") {
        const devType = c.device?.type || "UNKNOWN";
        seenDevices.add(devType);
        devices.push({
          resourceName: c.resourceName,
          criterionId: String(c.criterionId || ""),
          dimension: "DEVICE",
          targetName: deviceMap[devType] || devType,
          targetDetails: { deviceType: devType },
          bidModifier: rawModifier,
          bidModifierPercent: percent,
          isMutable: !isPMax,
          status: c.status
        });
      } else if (critType === "LOCATION") {
        const geoConstant = c.location?.geoTargetConstant || "";
        const geoId = geoConstant.split("/").pop() || c.criterionId;
        locations.push({
          resourceName: c.resourceName,
          criterionId: String(c.criterionId || ""),
          dimension: "LOCATION",
          targetName: `Location (Geo ID: ${geoId})`,
          targetDetails: { geoTargetConstant: geoConstant, geoId },
          bidModifier: rawModifier,
          bidModifierPercent: percent,
          isMutable: !isPMax,
          status: c.status
        });
      } else if (critType === "AD_SCHEDULE") {
        const sched = c.adSchedule || {};
        const day = sched.dayOfWeek || "ALL";
        const startH = String(sched.startHour || 0).padStart(2, "0");
        const startM = sched.startMinute === "ZERO" ? "00" : sched.startMinute === "FIFTEEN" ? "15" : sched.startMinute === "THIRTY" ? "30" : "45";
        const endH = String(sched.endHour || 24).padStart(2, "0");
        const endM = sched.endMinute === "ZERO" ? "00" : sched.endMinute === "FIFTEEN" ? "15" : sched.endMinute === "THIRTY" ? "30" : "45";
        schedules.push({
          resourceName: c.resourceName,
          criterionId: String(c.criterionId || ""),
          dimension: "AD_SCHEDULE",
          targetName: `${day} ${startH}:${startM} - ${endH}:${endM}`,
          targetDetails: sched,
          bidModifier: rawModifier,
          bidModifierPercent: percent,
          isMutable: !isPMax,
          status: c.status
        });
      } else if (critType === "USER_LIST") {
        const uList = c.userList?.userList || "";
        const uListId = uList.split("/").pop() || c.criterionId;
        audiences.push({
          resourceName: c.resourceName,
          criterionId: String(c.criterionId || ""),
          dimension: "AUDIENCE",
          targetName: `Audience User List (ID: ${uListId})`,
          targetDetails: { userList: uList },
          bidModifier: rawModifier,
          bidModifierPercent: percent,
          isMutable: !isPMax,
          status: c.status
        });
      }
    }

    // Default missing standard devices (Desktop, Mobile, Tablet) as 1.0 (0% modifier) for presentation
    if (!isPMax) {
      const standardDevs: Array<{ type: string; id: string; name: string }> = [
        { type: "DESKTOP", id: "30000", name: "Computers / Desktop" },
        { type: "MOBILE", id: "30001", name: "Mobile Phones" },
        { type: "TABLET", id: "30002", name: "Tablets" }
      ];

      for (const sd of standardDevs) {
        if (!seenDevices.has(sd.type)) {
          devices.push({
            resourceName: `customers/${cid}/campaignCriteria/${campaignId}~${sd.id}`,
            criterionId: sd.id,
            dimension: "DEVICE",
            targetName: sd.name,
            targetDetails: { deviceType: sd.type },
            bidModifier: 1.0,
            bidModifierPercent: 0,
            isMutable: true,
            status: "ENABLED"
          });
        }
      }
    }

    return {
      campaignId,
      campaignName,
      campaignType,
      biddingStrategyType,
      isPMax,
      isSmartBidding,
      supportNotes,
      adjustments: {
        devices,
        locations,
        schedules,
        audiences
      }
    };
  }

  /**
   * Updates the bid_modifier on an existing campaign_criterion.
   * bidModifier can be passed as decimal multiplier (e.g. 1.2 or 0.0) or percentage (-100 to +900).
   */
  public static async updateBidModifier(
    organizationId: string,
    customerId: string,
    resourceName: string,
    bidModifierInput: number
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!resourceName) {
      throw new Error("resourceName of the campaign criterion is required.");
    }

    // Convert input: if user inputs percentage (e.g. 20 for +20%, -50 for -50%, -100 for -100%)
    // Google Ads API expects multiplier: 1.2 for +20%, 0.5 for -50%, 0.0 for -100%
    let modifier = Number(bidModifierInput);
    if (isNaN(modifier)) {
      throw new Error("Invalid bid modifier value.");
    }

    if (modifier > 10 || modifier < -1) {
      // Input is percentage, e.g. 20 -> 1.2, -100 -> 0.0
      modifier = (100 + modifier) / 100;
    }

    // Google Ads API bid_modifier limits: 0.0 (-100% opt out) or between 0.1 (-90%) and 10.0 (+900%)
    if (modifier < 0.0 || (modifier > 0.0 && modifier < 0.1) || modifier > 10.0) {
      throw new Error(
        `Invalid bid modifier: ${bidModifierInput}. Supported ranges are 0.0 (-100% opt-out) or between 0.10 (-90%) and 10.0 (+900%).`
      );
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [
          {
            update: {
              resourceName,
              bidModifier: modifier
            },
            updateMask: "bid_modifier"
          }
        ]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName, bidModifier: modifier };
  }

  /**
   * Adds or sets a Location bid adjustment for a campaign.
   */
  public static async addLocationBidAdjustment(
    organizationId: string,
    customerId: string,
    input: AddLocationAdjustmentInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanCampId = input.campaignId.replace(/\D/g, "");
    const geoId = input.geoTargetConstantId.replace(/\D/g, "");

    if (!cleanCampId || !geoId) {
      throw new Error("campaignId and geoTargetConstantId are required.");
    }

    let modifier = input.bidModifier !== undefined ? Number(input.bidModifier) : 1.0;
    if (modifier > 10 || modifier < -1) {
      modifier = (100 + modifier) / 100;
    }

    const payload: any = {
      campaign: `customers/${cid}/campaigns/${cleanCampId}`,
      location: {
        geoTargetConstant: `geoTargetConstants/${geoId}`
      }
    };

    if (modifier !== 1.0) {
      payload.bidModifier = modifier;
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [{ create: payload }]
      },
      { headers }
    );

    return res.data?.results?.[0];
  }

  /**
   * Adds or sets an Ad Schedule bid adjustment for a campaign.
   */
  public static async addScheduleBidAdjustment(
    organizationId: string,
    customerId: string,
    input: AddScheduleAdjustmentInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    const cleanCampId = input.campaignId.replace(/\D/g, "");
    if (!cleanCampId) {
      throw new Error("campaignId is required.");
    }

    let modifier = input.bidModifier !== undefined ? Number(input.bidModifier) : 1.0;
    if (modifier > 10 || modifier < -1) {
      modifier = (100 + modifier) / 100;
    }

    const payload: any = {
      campaign: `customers/${cid}/campaigns/${cleanCampId}`,
      adSchedule: {
        dayOfWeek: input.dayOfWeek,
        startHour: input.startHour,
        startMinute: input.startMinute,
        endHour: input.endHour,
        endMinute: input.endMinute
      }
    };

    if (modifier !== 1.0) {
      payload.bidModifier = modifier;
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [{ create: payload }]
      },
      { headers }
    );

    return res.data?.results?.[0];
  }

  /**
   * Removes a campaign criterion (e.g. removes a custom location or schedule adjustment).
   */
  public static async removeCampaignCriterion(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!resourceName) {
      throw new Error("resourceName is required to remove campaign criterion.");
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [{ remove: resourceName }]
      },
      { headers }
    );

    return res.data?.results?.[0] || { resourceName };
  }
}

