import axios from "axios";
import { GoogleAdsBaseService } from "./shared/GoogleAdsBaseService";

export type DayOfWeekEnum =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type MinuteOfHourEnum = "ZERO" | "FIFTEEN" | "THIRTY" | "FORTY_FIVE";

export interface AdScheduleItem {
  resourceName: string;
  criterionId: string;
  dayOfWeek: DayOfWeekEnum;
  startHour: number; // 0 - 23
  startMinute: MinuteOfHourEnum;
  endHour: number;   // 0 - 24
  endMinute: MinuteOfHourEnum;
  startTimeFormatted: string; // e.g. "09:00"
  endTimeFormatted: string;   // e.g. "17:30"
  status: string;             // ENABLED | PAUSED | REMOVED
  bidModifier?: number;       // Multiplier (if any modifier attached)
  bidModifierPercent?: number;// e.g. +20, -50
  campaignId: string;
  campaignName: string;
  isMutable: boolean;
}

export interface CampaignAdSchedulesResponse {
  campaignId: string;
  campaignName: string;
  campaignType: string;
  isPMax: boolean;
  supportsAdSchedule: boolean;
  limitationMessage?: string;
  schedules: AdScheduleItem[];
  total: number;
}

export interface AddAdScheduleInput {
  campaignId: string;
  dayOfWeek: DayOfWeekEnum;
  startHour: number;
  startMinute: MinuteOfHourEnum;
  endHour: number;
  endMinute: MinuteOfHourEnum;
  bidModifier?: number; // Optional modifier percentage or multiplier
}

export interface UpdateAdScheduleInput {
  resourceName: string;
  dayOfWeek?: DayOfWeekEnum;
  startHour?: number;
  startMinute?: MinuteOfHourEnum;
  endHour?: number;
  endMinute?: MinuteOfHourEnum;
  bidModifier?: number;
  campaignId?: string;
}

const VALID_DAYS: DayOfWeekEnum[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];

const VALID_MINUTES: MinuteOfHourEnum[] = ["ZERO", "FIFTEEN", "THIRTY", "FORTY_FIVE"];

function minuteToNumber(m: MinuteOfHourEnum): number {
  switch (m) {
    case "ZERO": return 0;
    case "FIFTEEN": return 15;
    case "THIRTY": return 30;
    case "FORTY_FIVE": return 45;
    default: return 0;
  }
}

function minuteToString(m: MinuteOfHourEnum): string {
  switch (m) {
    case "ZERO": return "00";
    case "FIFTEEN": return "15";
    case "THIRTY": return "30";
    case "FORTY_FIVE": return "45";
    default: return "00";
  }
}

export class GoogleAdsAdScheduleService extends GoogleAdsBaseService {
  private static readonly ADS_BASE = "https://googleads.googleapis.com/v24";

  /**
   * Retrieves all ad schedule criteria for a campaign.
   */
  public static async getCampaignAdSchedules(
    organizationId: string,
    customerId: string,
    campaignId: string
  ): Promise<CampaignAdSchedulesResponse> {
    const cid = customerId.replace(/-/g, "").trim();
    const cleanCampId = campaignId.replace(/\D/g, "");
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // 1. Fetch Campaign info to detect type and restrictions
    const campQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.advertising_channel_type,
        campaign.status
      FROM campaign
      WHERE campaign.id = ${cleanCampId}
      LIMIT 1
    `;

    const campRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: campQuery },
      { headers }
    );

    const campRow = campRes.data?.results?.[0]?.campaign;
    if (!campRow) {
      throw new Error(`Campaign with ID ${campaignId} not found in customer account ${cid}.`);
    }

    const campaignName = campRow.name || `Campaign ${cleanCampId}`;
    const channelType = String(campRow.advertisingChannelType || "");
    const isPMax = channelType === "PERFORMANCE_MAX";

    // Traditional Ad Schedule serving hours are supported for Search, Display, Shopping, Video, etc.
    // Performance Max does not support custom ad schedule criteria via campaign_criterion in v24.
    const supportsAdSchedule = !isPMax;
    let limitationMessage: string | undefined;

    if (isPMax) {
      limitationMessage =
        "Performance Max campaigns automate continuous AI serving across Google networks and do not support traditional campaign ad schedule criteria.";
    }

    // 2. Fetch existing AD_SCHEDULE criteria
    const schedQuery = `
      SELECT
        campaign_criterion.resource_name,
        campaign_criterion.criterion_id,
        campaign_criterion.status,
        campaign_criterion.bid_modifier,
        campaign_criterion.ad_schedule.day_of_week,
        campaign_criterion.ad_schedule.start_hour,
        campaign_criterion.ad_schedule.start_minute,
        campaign_criterion.ad_schedule.end_hour,
        campaign_criterion.ad_schedule.end_minute
      FROM campaign_criterion
      WHERE campaign.id = ${cleanCampId}
        AND campaign_criterion.type = 'AD_SCHEDULE'
        AND campaign_criterion.status != 'REMOVED'
      ORDER BY campaign_criterion.ad_schedule.day_of_week, campaign_criterion.ad_schedule.start_hour
      LIMIT 100
    `;

    const schedRes = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/googleAds:search`,
      { query: schedQuery },
      { headers }
    );

    const rows = schedRes.data?.results || [];

    const schedules: AdScheduleItem[] = rows.map((r: any) => {
      const c = r.campaignCriterion || {};
      const s = c.adSchedule || {};

      const dayOfWeek = (s.dayOfWeek || "MONDAY") as DayOfWeekEnum;
      const startHour = Number(s.startHour || 0);
      const startMinute = (s.startMinute || "ZERO") as MinuteOfHourEnum;
      const endHour = Number(s.endHour || 24);
      const endMinute = (s.endMinute || "ZERO") as MinuteOfHourEnum;

      const rawModifier = c.bidModifier ? Number(c.bidModifier) : 1.0;
      const percent = Math.round((rawModifier - 1.0) * 100);

      const startTimeFormatted = `${String(startHour).padStart(2, "0")}:${minuteToString(startMinute)}`;
      const endTimeFormatted = `${String(endHour).padStart(2, "0")}:${minuteToString(endMinute)}`;

      return {
        resourceName: c.resourceName,
        criterionId: String(c.criterionId || ""),
        dayOfWeek,
        startHour,
        startMinute,
        endHour,
        endMinute,
        startTimeFormatted,
        endTimeFormatted,
        status: c.status || "ENABLED",
        bidModifier: rawModifier,
        bidModifierPercent: percent,
        campaignId: cleanCampId,
        campaignName,
        isMutable: supportsAdSchedule
      };
    });

    return {
      campaignId: cleanCampId,
      campaignName,
      campaignType: channelType,
      isPMax,
      supportsAdSchedule,
      limitationMessage,
      schedules,
      total: schedules.length
    };
  }

  /**
   * Validates schedule inputs against Google Ads API v24 rules.
   */
  public static validateSchedule(
    input: AddAdScheduleInput,
    existingSchedules: AdScheduleItem[] = []
  ): void {
    if (!VALID_DAYS.includes(input.dayOfWeek)) {
      throw new Error(`Invalid dayOfWeek '${input.dayOfWeek}'. Supported values: ${VALID_DAYS.join(", ")}`);
    }

    if (input.startHour < 0 || input.startHour > 23 || isNaN(input.startHour)) {
      throw new Error("startHour must be an integer between 0 and 23.");
    }

    if (input.endHour < 0 || input.endHour > 24 || isNaN(input.endHour)) {
      throw new Error("endHour must be an integer between 0 and 24.");
    }

    if (!VALID_MINUTES.includes(input.startMinute)) {
      throw new Error(`Invalid startMinute '${input.startMinute}'. Supported values: ZERO, FIFTEEN, THIRTY, FORTY_FIVE`);
    }

    if (!VALID_MINUTES.includes(input.endMinute)) {
      throw new Error(`Invalid endMinute '${input.endMinute}'. Supported values: ZERO, FIFTEEN, THIRTY, FORTY_FIVE`);
    }

    // When endHour is 24, endMinute must be ZERO (end of day)
    if (input.endHour === 24 && input.endMinute !== "ZERO") {
      throw new Error("When endHour is 24, endMinute must be ZERO.");
    }

    const startTotalMinutes = input.startHour * 60 + minuteToNumber(input.startMinute);
    const endTotalMinutes = input.endHour * 60 + minuteToNumber(input.endMinute);

    if (startTotalMinutes >= endTotalMinutes) {
      throw new Error("Start time must be strictly before end time.");
    }

    // Minimum interval in Google Ads is 15 minutes
    if (endTotalMinutes - startTotalMinutes < 15) {
      throw new Error("Ad schedule duration must be at least 15 minutes.");
    }

    // Check for overlapping intervals on the same day
    for (const existing of existingSchedules) {
      if (existing.dayOfWeek === input.dayOfWeek) {
        const exStart = existing.startHour * 60 + minuteToNumber(existing.startMinute);
        const exEnd = existing.endHour * 60 + minuteToNumber(existing.endMinute);

        // Check intersection: start < exEnd && end > exStart
        if (startTotalMinutes < exEnd && endTotalMinutes > exStart) {
          throw new Error(
            `Schedule overlaps with existing schedule on ${input.dayOfWeek} (${existing.startTimeFormatted} - ${existing.endTimeFormatted}). Google Ads does not permit overlapping schedules.`
          );
        }
      }
    }
  }

  /**
   * Creates a new campaign ad schedule criterion.
   */
  public static async addAdSchedule(
    organizationId: string,
    customerId: string,
    input: AddAdScheduleInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const cleanCampId = input.campaignId.replace(/\D/g, "");
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    // 1. Fetch current schedules to validate overlap
    const current = await this.getCampaignAdSchedules(organizationId, cid, cleanCampId);
    if (!current.supportsAdSchedule) {
      throw new Error(current.limitationMessage || "Campaign type does not support ad scheduling.");
    }

    this.validateSchedule(input, current.schedules);

    // 2. Prepare payload
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

    if (input.bidModifier !== undefined && input.bidModifier !== 1.0) {
      let modifier = Number(input.bidModifier);
      if (modifier > 10 || modifier < -1) {
        modifier = (100 + modifier) / 100;
      }
      payload.bidModifier = modifier;
    }

    // 3. Mutate via campaignCriteria:mutate
    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
      {
        operations: [{ create: payload }]
      },
      { headers }
    );

    const created = res.data?.results?.[0];
    return {
      success: true,
      resourceName: created?.resourceName,
      campaignId: cleanCampId,
      dayOfWeek: input.dayOfWeek,
      startHour: input.startHour,
      startMinute: input.startMinute,
      endHour: input.endHour,
      endMinute: input.endMinute
    };
  }

  /**
   * Updates an ad schedule criterion (Google Ads API v24: time boundaries in campaign_criterion
   * are immutable, so updating times requires removing the old criterion and creating the new one;
   * bid_modifier can be updated in-place with updateMask: "bid_modifier").
   */
  public static async updateAdSchedule(
    organizationId: string,
    customerId: string,
    input: UpdateAdScheduleInput
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!input.resourceName) {
      throw new Error("resourceName is required.");
    }

    // If time bounds changed, recreate criterion
    const hasTimeChanges =
      input.dayOfWeek !== undefined ||
      input.startHour !== undefined ||
      input.startMinute !== undefined ||
      input.endHour !== undefined ||
      input.endMinute !== undefined;

    if (hasTimeChanges) {
      if (!input.campaignId || !input.dayOfWeek || input.startHour === undefined || !input.startMinute || input.endHour === undefined || !input.endMinute) {
        throw new Error("Full schedule time bounds (dayOfWeek, startHour, startMinute, endHour, endMinute) are required to update schedule.");
      }

      // 1. Remove old schedule
      await this.removeAdSchedule(organizationId, cid, input.resourceName);

      // 2. Create new schedule
      return await this.addAdSchedule(organizationId, cid, {
        campaignId: input.campaignId,
        dayOfWeek: input.dayOfWeek,
        startHour: input.startHour,
        startMinute: input.startMinute,
        endHour: input.endHour,
        endMinute: input.endMinute,
        bidModifier: input.bidModifier
      });
    }

    // Otherwise, if only bidModifier changed, update in-place
    if (input.bidModifier !== undefined) {
      let modifier = Number(input.bidModifier);
      if (modifier > 10 || modifier < -1) {
        modifier = (100 + modifier) / 100;
      }

      const res = await axios.post(
        `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
        {
          operations: [
            {
              update: {
                resourceName: input.resourceName,
                bidModifier: modifier
              },
              updateMask: "bid_modifier"
            }
          ]
        },
        { headers }
      );

      return {
        success: true,
        resourceName: input.resourceName,
        bidModifier: modifier,
        result: res.data?.results?.[0]
      };
    }

    return { success: true, resourceName: input.resourceName };
  }

  /**
   * Removes an ad schedule criterion.
   */
  public static async removeAdSchedule(
    organizationId: string,
    customerId: string,
    resourceName: string
  ) {
    const cid = customerId.replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, cid);

    if (!resourceName || !resourceName.includes("campaignCriteria")) {
      throw new Error(`Invalid ad schedule resourceName: ${resourceName}`);
    }

    const res = await axios.post(
      `${this.ADS_BASE}/customers/${cid}/campaignCriteria:mutate`,
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
