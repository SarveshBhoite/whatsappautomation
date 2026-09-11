import prisma from "../../utils/prisma";
import axios from "axios";
import { META_GRAPH_BASE, MetaAdsCoreService } from "./metaAdsCoreService";
import { MetaCampaignDraft } from "./metaCampaignDraftService";
import { MetaAdsCapabilityService } from "./metaAdsCapabilityService";
import { LeadsCampaignService } from "./leadsCampaignService";
import { MetaImageGenerationService } from "./metaImageGenerationService";
import fs from "fs";
import path from "path";
import FormData from "form-data";

export type MetaErrorCategory =
  | "USER_ACTION_REQUIRED"
  | "PERMISSION_ERROR"
  | "VALIDATION_ERROR"
  | "RATE_LIMIT"
  | "TEMPORARY_META_ERROR"
  | "NETWORK_ERROR"
  | "INTERNAL_ERROR"
  | "UNKNOWN_ERROR";

export type DeploymentStatus = "FULL_SUCCESS" | "PARTIAL_CREATION" | "FAILED";

export interface ObjectStatus<T = string> {
  status: "CREATED" | "FAILED" | "NOT_ATTEMPTED";
  id: T | null;
  name?: string | null;
  verified?: boolean;
  errorCode?: number | null;
  errorSubcode?: number | null;
  errorMessage?: string | null;
}

export interface ExecutionResult {
  success: boolean;
  status: "SUCCESS" | "PARTIAL_FAILURE" | "FAILED";
  deploymentStatus: DeploymentStatus;
  executionId: string;
  draftId?: string | null;
  versionNumber?: number;

  campaign: ObjectStatus;
  adSet: ObjectStatus;
  creative: ObjectStatus;
  ad: ObjectStatus;

  // Backwards-compatible fields for existing callers & frontend
  campaignId?: string | null;
  adSetId?: string | null;
  creativeId?: string | null;
  adId?: string | null;
  metaCampaignId?: string | null;
  metaAdSetId?: string | null;
  metaCreativeId?: string | null;
  metaAdId?: string | null;

  errorMessage?: string | null;
  errorCategory?: MetaErrorCategory | null;
  userFacingRecoveryMessage?: string | null;
  stepFailed?: string | null;
}

// In-memory idempotency cache for active execution requests
const executionCache = new Map<string, ExecutionResult>();

export class MetaCampaignExecutionService {
  /**
   * Classify raw Meta Graph API errors into structured categories with helpful recovery messages
   */
  static classifyMetaError(err: any): {
    category: MetaErrorCategory;
    code?: number;
    subcode?: number;
    message: string;
    recovery: string;
  } {
    const errorData = err.response?.data?.error || {};
    const code = errorData.code;
    const subcode = errorData.error_subcode;
    const userMsg = errorData.error_user_msg || errorData.error_user_title;
    const rawMsg = userMsg
      ? `${userMsg} (${errorData.message || err.message})`
      : errorData.message || err.message || "Unknown error";

    if (subcode === 2859002 || code === 3) {
      return {
        category: "USER_ACTION_REQUIRED",
        code: code || 3,
        subcode: subcode || 2859002,
        message:
          userMsg ||
          errorData.message ||
          "Meta requires Non-discrimination Policy certification before this ad can be created/run.",
        recovery:
          "Meta requires Non-discrimination Policy certification before this ad can be created/run. Campaign/Ad Set/Creative creation may have succeeded, but the final Ad object was not created. Please certify compliance directly for your connected Meta Ad Account or Business Portfolio.",
      };
    }

    if (code === 190 || code === 102) {
      return {
        category: "PERMISSION_ERROR",
        code,
        subcode,
        message: rawMsg,
        recovery:
          "Your Meta Access Token has expired or lost permissions. Please reconnect your Meta account in Settings.",
      };
    }

    if (code === 17 || code === 4 || code === 613) {
      return {
        category: "RATE_LIMIT",
        code,
        subcode,
        message: rawMsg,
        recovery:
          "Meta API rate limit reached. The system will automatically retry in a few moments.",
      };
    }

    if (code === 100 || subcode === 1885316 || subcode === 1885760) {
      return {
        category: "VALIDATION_ERROR",
        code,
        subcode,
        message: rawMsg,
        recovery:
          "Meta rejected the configuration parameters (objective, optimization goal, or destination). Parameters must match Meta ODAX specifications.",
      };
    }

    if (code === 1 || code === 2) {
      return {
        category: "TEMPORARY_META_ERROR",
        code,
        subcode,
        message: rawMsg,
        recovery:
          "Meta Graph API servers experienced a temporary issue. Retrying shortly will resolve it.",
      };
    }

    if (err.code === "ECONNABORTED" || err.code === "ENOTFOUND" || !err.response) {
      return {
        category: "NETWORK_ERROR",
        code,
        subcode,
        message: rawMsg,
        recovery:
          "Network connectivity issue with Meta Graph API. Your draft is completely intact.",
      };
    }

    return {
      category: "VALIDATION_ERROR",
      code,
      subcode,
      message: rawMsg,
      recovery:
        "Meta rejected one of the campaign settings. Adjust the affected setting without losing your progress.",
    };
  }

  /**
   * Helper to safely sanitize error logs and payloads (never expose access tokens or secrets)
   */
  static sanitizeForLogging(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;
    const clone = Array.isArray(obj) ? [...obj] : { ...obj };
    for (const k of Object.keys(clone)) {
      if (/access_token|app_secret|user_token|pass|authorization/i.test(k)) {
        clone[k] = "[REDACTED_ACCESS_TOKEN]";
      } else if (k === "genders" && Array.isArray(clone[k])) {
        const val = clone[k];
        let label = "All Genders (Men & Women)";
        if (val.length === 1 && val[0] === 1) label = "Men Only (1)";
        else if (val.length === 1 && val[0] === 2) label = "Women Only (2)";
        clone["_genders_label"] = label;
      } else if ((k === "start_time" || k === "end_time") && typeof clone[k] === "number") {
        try {
          const d = new Date(clone[k] * 1000);
          clone[`_${k}_formatted`] = d.toLocaleString("en-IN", {
            dateStyle: "full",
            timeStyle: "medium",
            timeZone: "Asia/Kolkata",
          }) + " (IST)";
        } catch (e) {}
      } else if ((k === "daily_budget" || k === "lifetime_budget") && typeof clone[k] === "number") {
        const inr = (clone[k] / 100).toLocaleString("en-IN", { style: "currency", currency: "INR" });
        clone[`_${k}_formatted`] = k === "daily_budget" ? `${inr} / day` : `${inr} Total Budget`;
      } else if (typeof clone[k] === "object") {
        clone[k] = this.sanitizeForLogging(clone[k]);
      }
    }
    return clone;
  }

  /**
   * Optional verification of created Meta objects via Graph API GET calls
   */
  static async verifyObject(
    objectId: string,
    objectType: "campaign" | "adset" | "adcreative" | "ad",
    accessToken: string
  ): Promise<boolean> {
    try {
      const fields =
        objectType === "campaign"
          ? "id,name,status,account_id"
          : objectType === "adset"
          ? "id,name,status,campaign_id,account_id"
          : objectType === "adcreative"
          ? "id,name"
          : "id,name,status,effective_status,campaign_id,adset_id";

      const res = await axios.get(`${META_GRAPH_BASE}/${objectId}?fields=${fields}&access_token=${accessToken}`, {
        timeout: 10000,
      });
      return Boolean(res.data && res.data.id === objectId);
    } catch (e: any) {
      console.warn(`[META ADS] Object verification failed for ${objectType} ${objectId}:`, e.message);
      return false;
    }
  }

  /**
   * Execute verified live campaign publication against Meta Graph API with strict sequential validation,
   * deterministic parameter mapping, zero synthetic IDs, and idempotent retry.
   */
  static async publishCampaign(
    organizationId: string,
    draft: MetaCampaignDraft,
    executionId: string,
    versionNumber: number = 1,
    draftId?: string
  ): Promise<ExecutionResult> {
    // 1. Idempotency Check: return existing successful execution
    if (executionCache.has(executionId)) {
      const cached = executionCache.get(executionId)!;
      if (cached.status === "SUCCESS" && cached.deploymentStatus === "FULL_SUCCESS") {
        return cached;
      }
    }

    const config = await MetaAdsCoreService.getConfig(organizationId);
    if (!config.accessToken) {
      throw new Error("Meta Ads Access Token is not configured for this organization.");
    }

    const targetAccountId = draft.adAccountId || config.adAccountId;
    if (!targetAccountId) {
      throw new Error("No connected Meta Ad Account selected.");
    }

    const formattedAccountId = targetAccountId.startsWith("act_")
      ? targetAccountId
      : `act_${targetAccountId}`;

    const activePageId = draft.pageId || config.pageId;

    // Track object statuses strictly
    const campaignStatus: ObjectStatus = { status: "NOT_ATTEMPTED", id: null };
    const adSetStatus: ObjectStatus = { status: "NOT_ATTEMPTED", id: null };
    const creativeStatus: ObjectStatus = { status: "NOT_ATTEMPTED", id: null };
    const adStatus: ObjectStatus = { status: "NOT_ATTEMPTED", id: null };

    let dbCampaignRecord: any = null;
    let dbAdSetRecord: any = null;

    // ─────────────────────────────────────────────────────────────
    // DETERMINISTIC PARAMETER VALIDATION / MAPPING LAYER
    // ─────────────────────────────────────────────────────────────
    const spec = MetaAdsCapabilityService.resolveAndValidateSpec(
      draft.campaign.objective,
      draft.destination?.type,
      draft.creative?.callToAction
    );

    console.log("[META ADS] Validated ODAX Spec:", JSON.stringify(spec, null, 2));

    try {
      // ─────────────────────────────────────────────────────────────
      // STEP 1: CREATE CAMPAIGN ON META GRAPH API (OR REUSE IDEMPOTENT)
      // ─────────────────────────────────────────────────────────────
      console.log(`[META ADS] Campaign creation START account=${formattedAccountId}`);
      campaignStatus.status = "NOT_ATTEMPTED";

      const dailyBudgetMinor = Math.round((draft.campaign.dailyBudget || 500) * 100);
      let specialCategories = ["NONE"];
      if (draft.campaign.specialAdCategory && draft.campaign.specialAdCategory !== "NONE") {
        specialCategories = [draft.campaign.specialAdCategory];
      }

      const countryList = ["IN"];

      const campaignPayload: any = {
        name: draft.campaign.name || `AI Campaign - ${new Date().toLocaleDateString()}`,
        objective: spec.objective,
        buying_type: draft.campaign.buyingType || "AUCTION",
        special_ad_categories: specialCategories,
        status: "PAUSED",
        access_token: config.accessToken,
      };

      if (draft.campaign.specialAdCategory && draft.campaign.specialAdCategory !== "NONE") {
        campaignPayload.special_ad_category_country = countryList;
      }

      if (draft.campaign.cboEnabled !== false) {
        if ((draft.campaign as any).budgetType === "TOTAL" || draft.campaign.lifetimeBudget) {
          const lifetimeBudgetMinor = Math.round((draft.campaign.lifetimeBudget || (draft.campaign.dailyBudget || 500) * 30) * 100);
          campaignPayload.lifetime_budget = lifetimeBudgetMinor;
        } else {
          campaignPayload.daily_budget = dailyBudgetMinor;
        }
        campaignPayload.bid_strategy = "LOWEST_COST_WITHOUT_CAP";
      }

      console.log("\n=======================================================");
      console.log("🚀 [META GRAPH API EXECUTION] STEP 1: CAMPAIGN PAYLOAD");
      console.log("=======================================================");
      console.log(
        JSON.stringify(
          {
            endpoint: `POST ${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
            payload: this.sanitizeForLogging(campaignPayload),
          },
          null,
          2
        )
      );

      try {
        let existingCampId =
          (draft as any).metaCampaignId ||
          (draft.campaign as any)?.metaCampaignId ||
          (draft.campaign as any)?.id;

        if (existingCampId && typeof existingCampId === "string" && !existingCampId.startsWith("camp_")) {
          const isCampValid = await this.verifyObject(existingCampId, "campaign", config.accessToken);
          if (isCampValid) {
            campaignStatus.id = existingCampId;
            campaignStatus.name = campaignPayload.name;
            campaignStatus.status = "CREATED";
            campaignStatus.verified = true;
            console.log(`[META ADS] Reusing existing valid Campaign: ${campaignStatus.id}`);

            dbCampaignRecord = await prisma.metaAdCampaign.findFirst({
              where: { metaCampaignId: campaignStatus.id },
            });
            if (!dbCampaignRecord) {
              dbCampaignRecord = await prisma.metaAdCampaign.create({
                data: {
                  organizationId,
                  adAccountId: formattedAccountId,
                  metaCampaignId: campaignStatus.id,
                  name: campaignPayload.name,
                  objective: spec.objective,
                  buyingType: campaignPayload.buying_type,
                  specialAdCategory: draft.campaign.specialAdCategory || "NONE",
                  cboEnabled: draft.campaign.cboEnabled !== false,
                  status: "PAUSED",
                  effectiveStatus: "PAUSED",
                  dailyBudget: draft.campaign.dailyBudget || 500,
                },
              });
            }
          }
        }

        if (!campaignStatus.id) {
          const campResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
            campaignPayload
          );

          if (!campResp.data || !campResp.data.id) {
            throw new Error("Meta API did not return a valid Campaign ID.");
          }

          campaignStatus.id = campResp.data.id;
          campaignStatus.name = campaignPayload.name;
          campaignStatus.status = "CREATED";

          // Verify with Meta Graph API
          campaignStatus.verified = await this.verifyObject(campaignStatus.id!, "campaign", config.accessToken);
          console.log(`[META ADS] Campaign creation SUCCESS id=${campaignStatus.id} verified=${campaignStatus.verified}`);

          // Persist Campaign in DB
          dbCampaignRecord = await prisma.metaAdCampaign.create({
            data: {
              organizationId,
              adAccountId: formattedAccountId,
              metaCampaignId: campaignStatus.id,
              name: campaignPayload.name,
              objective: spec.objective,
              buyingType: campaignPayload.buying_type,
              specialAdCategory: draft.campaign.specialAdCategory || "NONE",
              cboEnabled: draft.campaign.cboEnabled !== false,
              status: "PAUSED",
              effectiveStatus: "PAUSED",
              dailyBudget: draft.campaign.dailyBudget || 500,
            },
          });
        }

        // Keep draft updated with created metaCampaignId for idempotent retries
        (draft as any).metaCampaignId = campaignStatus.id;
      } catch (campErr: any) {
        const classified = this.classifyMetaError(campErr);
        campaignStatus.status = "FAILED";
        campaignStatus.errorCode = classified.code;
        campaignStatus.errorSubcode = classified.subcode;
        campaignStatus.errorMessage = classified.message;
        console.error(`[META ADS] Campaign creation FAILED code=${classified.code} msg=${classified.message}`);
        throw campErr;
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 2: CREATE AD SET (USING ACTUAL RETURNED CAMPAIGN ID)
      // ─────────────────────────────────────────────────────────────
      console.log(`[META ADS] Ad Set creation START campaign_id=${campaignStatus.id}`);
      const isSpecialAdCat = Boolean(draft.campaign.specialAdCategory && draft.campaign.specialAdCategory !== "NONE");

      // Build targeting object reflecting AI chat parameters
      const targetingObj: any = {
        geo_locations: {
          countries: ["IN"],
        },
        age_min: isSpecialAdCat ? 18 : (draft.targeting?.ageMin || 18),
        age_max: isSpecialAdCat ? 65 : (draft.targeting?.ageMax || 65),
        targeting_automation: {
          advantage_audience: 1,
        },
      };

      // City / Location mapping
      targetingObj.geo_locations = await MetaAdsCapabilityService.resolveGeoLocations(
        draft.targeting,
        isSpecialAdCat,
        config.accessToken
      );

      // Demographics: Special Ad Category strictly forbids restricting gender (Non-Discrimination Policy)
      if (!isSpecialAdCat) {
        if (draft.targeting?.gender === "MEN") {
          targetingObj.genders = [1];
        } else if (draft.targeting?.gender === "WOMEN") {
          targetingObj.genders = [2];
        }
      }

      // Detailed Interests & Behaviors resolution via Meta Graph API (/search?type=adinterest)
      if (Array.isArray(draft.targeting?.interests) && draft.targeting.interests.length > 0 && !isSpecialAdCat) {
        const resolvedInterests: any[] = [];
        for (const interestName of draft.targeting.interests) {
          try {
            const intRes = await axios.get(`${META_GRAPH_BASE}/search`, {
              params: {
                type: "adinterest",
                q: interestName,
                access_token: config.accessToken,
              },
              timeout: 5000,
            });
            if (intRes.data?.data?.[0]?.id) {
              resolvedInterests.push({
                id: intRes.data.data[0].id,
                name: intRes.data.data[0].name || interestName,
              });
            }
          } catch (e: any) {
            console.warn(`[META ADS] Could not resolve interest key for ${interestName}:`, e.message);
          }
        }
        if (resolvedInterests.length > 0) {
          targetingObj.flexible_spec = [{ interests: resolvedInterests }];
        }
      }

      // Meta Marketing API Ad Locales / Languages targeting (e.g. [21] for Marathi, [20] for Hindi)
      if (Array.isArray(draft.targeting?.locales) && draft.targeting.locales.length > 0) {
        targetingObj.locales = draft.targeting.locales;
      }

      const adSetPayload: any = {
        name: `${campaignPayload.name} - Ad Set`,
        campaign_id: campaignStatus.id,
        billing_event: spec.billingEvent,
        optimization_goal: spec.optimizationGoal,
        status: "PAUSED",
        access_token: config.accessToken,
        targeting: targetingObj,
      };

      if (isSpecialAdCat) {
        adSetPayload.special_ad_category_country = ["IN"];
      }

      // Guarantee valid start_time and end_time for Meta API
      const nowMs = Date.now();
      let startMs = draft.campaign?.startTime ? new Date(draft.campaign.startTime).getTime() : nowMs;

      // If startMs is in the past or less than 5 minutes from now, set startMs to 10 mins from now
      if (isNaN(startMs) || startMs <= nowMs + 60 * 1000) {
        startMs = nowMs + 10 * 60 * 1000;
      }
      adSetPayload.start_time = Math.floor(startMs / 1000);

      // Meta MANDATES end_time for Lifetime budget ad sets! Must be at least 24 hours after start_time.
      const isLifetimeBudget = (draft.campaign as any)?.budgetType === "TOTAL" || Boolean(draft.campaign?.lifetimeBudget);
      let endMs = draft.campaign?.endTime ? new Date(draft.campaign.endTime).getTime() : 0;

      if (isLifetimeBudget || endMs > 0) {
        // If endMs is missing, invalid, or less than 24h after startMs, default endMs to 30 days after startMs
        if (!endMs || isNaN(endMs) || endMs <= startMs + 24 * 60 * 60 * 1000) {
          endMs = startMs + 30 * 24 * 60 * 60 * 1000;
        }
        adSetPayload.end_time = Math.floor(endMs / 1000);
      }

      if (spec.objective !== "OUTCOME_AWARENESS") {
        adSetPayload.destination_type = spec.metaDestinationType;
      }

      // Pixel ID resolution: check draft destination, draft root, campaign, config, and environment
      let resolvedPixelId =
        draft.destination?.pixelTracking?.pixelId ||
        draft.destination?.pixelId ||
        (draft as any).pixelId ||
        (draft.campaign as any)?.pixelId ||
        config.pixelId ||
        process.env.META_PIXEL_ID;

      if (!resolvedPixelId && (spec.requiresPixelPromotedObject || adSetPayload.optimization_goal === "OFFSITE_CONVERSIONS")) {
        try {
          const pixels = await MetaAdsCoreService.getPixels(organizationId);
          if (pixels && pixels.length > 0 && pixels[0].id) {
            resolvedPixelId = pixels[0].id;
            console.log(`[META ADS] Auto-discovered Meta Pixel: ${resolvedPixelId} (${pixels[0].name})`);
          }
        } catch (e: any) {
          console.warn(`[META ADS] Could not auto-discover Meta Pixels:`, e.message);
        }
      }

      // Promoted object validation according to Meta Marketing API specifications
      if (spec.destinationType === "APP" || draft.destination?.type === "APP") {
        adSetPayload.promoted_object = {
          application_id: draft.destination?.appId || config.appId || "1234567890",
          object_store_url: draft.destination?.appUrl || draft.destination?.destinationUrl || "https://play.google.com/store",
        };
      } else if (spec.requiresPixelPromotedObject || adSetPayload.optimization_goal === "OFFSITE_CONVERSIONS") {
        if (resolvedPixelId) {
          adSetPayload.promoted_object = {
            pixel_id: resolvedPixelId,
            custom_event_type: spec.customEventType || (spec.objective === "OUTCOME_SALES" ? "PURCHASE" : "LEAD"),
          };
        } else {
          // If no pixel ID is configured or found, Meta rejects OFFSITE_CONVERSIONS (code 100, subcode 1815143).
          // Gracefully fallback optimization_goal to LINK_CLICKS so the ad set deploys without error.
          console.warn(
            `[META ADS] No Meta Pixel available for off-site conversions. Falling back optimization_goal from ${adSetPayload.optimization_goal} to LINK_CLICKS.`
          );
          adSetPayload.optimization_goal = "LINK_CLICKS";
          delete adSetPayload.promoted_object;
        }
      } else if ((spec.destinationType === "PAGE_EVENT" || draft.destination?.type === "PAGE_EVENT") && draft.destination?.eventId) {
        adSetPayload.promoted_object = {
          page_id: activePageId,
          event_id: draft.destination.eventId,
        };
      } else if (activePageId) {
        adSetPayload.promoted_object = { page_id: activePageId };
      }

      // Hard safety guard: Never allow OFFSITE_CONVERSIONS without pixel_id or application_id
      if (adSetPayload.optimization_goal === "OFFSITE_CONVERSIONS") {
        if (!adSetPayload.promoted_object?.pixel_id && !adSetPayload.promoted_object?.application_id) {
          if (
            adSetPayload.destination_type === "WHATSAPP" ||
            adSetPayload.destination_type === "MESSENGER" ||
            adSetPayload.destination_type === "INSTAGRAM_DIRECT"
          ) {
            adSetPayload.optimization_goal = "CONVERSATIONS";
            if (activePageId) {
              adSetPayload.promoted_object = { page_id: activePageId };
            }
          } else {
            adSetPayload.optimization_goal = "LINK_CLICKS";
            delete adSetPayload.promoted_object;
          }
        }
      }

      if (draft.campaign.cboEnabled === false) {
        adSetPayload.daily_budget = dailyBudgetMinor;
      }

      console.log("\n=======================================================");
      console.log("🎯 [META GRAPH API EXECUTION] STEP 2: AD SET PAYLOAD");
      console.log("=======================================================");
      console.log(
        JSON.stringify(
          {
            endpoint: `POST ${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
            payload: this.sanitizeForLogging(adSetPayload),
          },
          null,
          2
        )
      );

      try {
        let adSetResp;
        try {
          adSetResp = await axios.post(`${META_GRAPH_BASE}/${formattedAccountId}/adsets`, adSetPayload);
        } catch (adSetErr1: any) {
          const errObj = adSetErr1.response?.data?.error || {};
          console.warn("[META ADS] Ad Set attempt 1 failed:", errObj.message, "Subcode:", errObj.error_subcode);

          const isOffsiteError =
            errObj.error_subcode === 1815143 ||
            (errObj.message && /off-site conversions|promoted object|pixel ID/i.test(errObj.message));

          if (isOffsiteError) {
            console.warn("[META ADS] Ad Set failed due to off-site conversions / promoted object. Auto-healing payload...");
            if (
              adSetPayload.destination_type === "WHATSAPP" ||
              adSetPayload.destination_type === "MESSENGER" ||
              adSetPayload.destination_type === "INSTAGRAM_DIRECT"
            ) {
              adSetPayload.optimization_goal = "CONVERSATIONS";
              if (activePageId) {
                adSetPayload.promoted_object = { page_id: activePageId };
              }
            } else if (resolvedPixelId) {
              adSetPayload.promoted_object = {
                pixel_id: resolvedPixelId,
                custom_event_type: spec.customEventType || (spec.objective === "OUTCOME_SALES" ? "PURCHASE" : "LEAD"),
              };
            } else {
              adSetPayload.optimization_goal = "LINK_CLICKS";
              delete adSetPayload.promoted_object;
            }
          }

          const isConflictingLocationError =
            errObj.error_subcode === 1487756 ||
            (errObj.message && /conflicting location/i.test(errObj.message));

          if (isConflictingLocationError && adSetPayload.targeting?.geo_locations) {
            console.warn("[META ADS] Ad Set failed due to conflicting geo locations (1487756). Auto-healing geo_locations...");
            if (adSetPayload.targeting.geo_locations.cities?.length > 0 || adSetPayload.targeting.geo_locations.zips?.length > 0) {
              // Priority given to granular cities/zips — remove parent countries
              delete adSetPayload.targeting.geo_locations.countries;
            } else if (adSetPayload.targeting.geo_locations.countries?.length > 0) {
              delete adSetPayload.targeting.geo_locations.cities;
              delete adSetPayload.targeting.geo_locations.zips;
            }
          }

          // Retry with advantage_audience set to 0 if 1 fails
          if (adSetPayload.targeting?.targeting_automation?.advantage_audience === 1) {
            adSetPayload.targeting.targeting_automation = { advantage_audience: 0 };
          } else {
            delete adSetPayload.targeting.targeting_automation;
          }
          delete adSetPayload.targeting.flexible_spec;

          try {
            adSetResp = await axios.post(`${META_GRAPH_BASE}/${formattedAccountId}/adsets`, adSetPayload);
          } catch (adSetErr2: any) {
            const errObj2 = adSetErr2.response?.data?.error || {};
            console.warn("[META ADS] Ad Set attempt 2 failed:", errObj2.message, "Subcode:", errObj2.error_subcode);

            if (
              errObj2.error_subcode === 1815143 ||
              (errObj2.message && /off-site conversions|promoted object|pixel ID/i.test(errObj2.message))
            ) {
              if (
                adSetPayload.destination_type === "WHATSAPP" ||
                adSetPayload.destination_type === "MESSENGER" ||
                adSetPayload.destination_type === "INSTAGRAM_DIRECT"
              ) {
                adSetPayload.optimization_goal = "CONVERSATIONS";
                if (activePageId) {
                  adSetPayload.promoted_object = { page_id: activePageId };
                }
              } else {
                adSetPayload.optimization_goal = "LINK_CLICKS";
                delete adSetPayload.promoted_object;
              }
            }

            const isConflictingLocationError2 =
              errObj2.error_subcode === 1487756 ||
              (errObj2.message && /conflicting location/i.test(errObj2.message));

            if (isConflictingLocationError2 && adSetPayload.targeting?.geo_locations) {
              console.warn("[META ADS] Ad Set attempt 2 conflicting geo locations. Cleaning geo_locations...");
              if (adSetPayload.targeting.geo_locations.cities?.length > 0) {
                delete adSetPayload.targeting.geo_locations.countries;
                delete adSetPayload.targeting.geo_locations.zips;
              } else {
                adSetPayload.targeting.geo_locations = { countries: ["IN"] };
              }
            }

            // Attempt 3: Completely strip targeting_automation if advantage_audience=0 also throws an error
            delete adSetPayload.targeting.targeting_automation;
            adSetResp = await axios.post(`${META_GRAPH_BASE}/${formattedAccountId}/adsets`, adSetPayload);
          }
        }

        if (!adSetResp.data || !adSetResp.data.id) {
          throw new Error("Meta API did not return a valid Ad Set ID.");
        }

        adSetStatus.id = adSetResp.data.id;
        adSetStatus.name = adSetPayload.name;
        adSetStatus.status = "CREATED";

        adSetStatus.verified = await this.verifyObject(adSetStatus.id!, "adset", config.accessToken);
        console.log(`[META ADS] Ad Set creation SUCCESS id=${adSetStatus.id} verified=${adSetStatus.verified}`);

        dbAdSetRecord = await prisma.metaAdSet.create({
          data: {
            organizationId,
            campaignId: dbCampaignRecord.id,
            adAccountId: formattedAccountId,
            metaAdSetId: adSetStatus.id,
            name: adSetPayload.name,
            status: "PAUSED",
            dailyBudget: draft.campaign.dailyBudget || 500,
            optimizationGoal: spec.optimizationGoal,
            destinationType: spec.destinationType,
            targeting: adSetPayload.targeting,
          },
        });
      } catch (adSetErr: any) {
        const classified = this.classifyMetaError(adSetErr);
        adSetStatus.status = "FAILED";
        adSetStatus.errorCode = classified.code;
        adSetStatus.errorSubcode = classified.subcode;
        adSetStatus.errorMessage = classified.message;
        console.error(`[META ADS] Ad Set creation FAILED code=${classified.code} msg=${classified.message}`);
        throw adSetErr;
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 3: CREATE AD CREATIVE (USING ACTUAL PAGE ID & CREATIVE COPY)
      // ─────────────────────────────────────────────────────────────
      console.log(`[META ADS] Creative creation START page_id=${activePageId}`);
      creativeStatus.status = "NOT_ATTEMPTED";

      if (!activePageId) {
        throw new Error("A valid Meta Page ID is required to build Ad Creative.");
      }

      let resolvedPhone =
        draft.destination?.whatsappPhoneNumber ||
        process.env.WHATSAPP_PHONE_NUMBER ||
        process.env.META_WHATSAPP_PHONE_NUMBER ||
        "";

      let linkDestination = draft.destination?.destinationUrl || "https://jisnudigital.com";

      if (spec.destinationType === "WHATSAPP") {
        try {
          const connectedWa = await MetaAdsCoreService.getWhatsAppNumbers(organizationId);
          if (connectedWa.length > 0) {
            const cleanResolved = resolvedPhone.replace(/\D/g, "");
            const isMatched = connectedWa.some((wn) => {
              const cleanWn = (wn.phoneNumber || "").replace(/\D/g, "");
              return cleanResolved && (cleanWn.endsWith(cleanResolved.slice(-10)) || cleanResolved.endsWith(cleanWn.slice(-10)));
            });

            // If draft phone number is not linked or missing, auto-align to verified Page/WABA number
            if (!isMatched) {
              console.log(
                `[META ADS] Auto-aligning WhatsApp creative to verified connected Page/WABA number: ${connectedWa[0].phoneNumber} (${connectedWa[0].verifiedName})`
              );
              resolvedPhone = connectedWa[0].phoneNumber;
            }
          }
        } catch (waLookupErr: any) {
          console.warn("[META ADS] Connected WhatsApp lookup warning:", waLookupErr?.message);
        }

        if (!resolvedPhone) {
          throw new Error("Click-to-WhatsApp destination requires a verified phone number connected with your Facebook Page or Meta WABA ID.");
        }
        const cleanPhone = resolvedPhone.replace(/\D/g, "");
        const prefillMsg = encodeURIComponent(
          `Hi! I saw your Meta Ad for "${draft.creative?.headline || draft.campaign.name || 'your offer'}" and would like to get more information.`
        );
        linkDestination = `https://wa.me/${cleanPhone}?text=${prefillMsg}`;
      } else if (spec.destinationType === "APP" || draft.destination?.type === "APP") {
        linkDestination = draft.destination?.appUrl || draft.destination?.destinationUrl || "https://play.google.com/store";
      } else if (spec.destinationType === "SHOP" || draft.destination?.type === "SHOP") {
        linkDestination = draft.destination?.shopUrl || draft.destination?.destinationUrl || "https://shop.facebook.com";
      } else if (spec.destinationType === "INSTAGRAM_PROFILE" || draft.destination?.type === "INSTAGRAM_PROFILE") {
        linkDestination = draft.destination?.instagramProfileUrl || draft.destination?.destinationUrl || "https://instagram.com";
      } else if (spec.destinationType === "PAGE_EVENT" || draft.destination?.type === "PAGE_EVENT") {
        linkDestination = draft.destination?.eventUrl || draft.destination?.destinationUrl || "https://facebook.com/events";
      } else if (spec.destinationType === "MESSENGER" || draft.destination?.type === "MESSENGER") {
        linkDestination = activePageId ? `https://m.me/${activePageId}` : (draft.destination?.destinationUrl || "https://m.me");
      } else if (spec.destinationType === "INSTAGRAM_DM" || draft.destination?.type === "INSTAGRAM_DM") {
        linkDestination = activePageId ? `https://ig.me/m/${activePageId}` : (draft.destination?.destinationUrl || "https://instagram.com");
      }

      const adCopy = draft.creative?.primaryText || `${draft.campaign.name || 'Special Offer'} - Connect with our team today!`;
      const adHeadline = draft.creative?.headline || draft.campaign.name || 'Exclusive Offer';
      const adDescription = draft.creative?.description || "";

      let callPhoneNumber = resolvedPhone;
      if (spec.cta === "CALL_NOW" || spec.destinationType === "PHONE_CALL") {
        if (!callPhoneNumber) {
          throw new Error("Phone Call campaign requires a valid contact number.");
        }
        const cleanDigits = callPhoneNumber.replace(/\D/g, "");
        callPhoneNumber = cleanDigits.length === 10 ? `+91${cleanDigits}` : `+${cleanDigits}`;
      }

      const callToActionObj: any = {
        type: spec.cta,
        value: {
          link: (spec.cta === "CALL_NOW" || spec.destinationType === "PHONE_CALL") ? `tel:${callPhoneNumber}` : linkDestination,
        },
      };

      // Official Meta Graph API Instant Lead Form Integration (/{PAGE_ID}/leadgen_forms)
      if (spec.destinationType === "INSTANT_FORM" || draft.destination?.type === "INSTANT_FORM") {
        let formId = draft.destination?.leadGenFormId;
        if (!formId && activePageId) {
          try {
            const existingForms = await LeadsCampaignService.getLeadGenForms(organizationId, activePageId);
            if (existingForms && existingForms.length > 0) {
              formId = existingForms[0].id;
            } else {
              const configuredFields =
                draft.destination?.leadGenFormFields && draft.destination.leadGenFormFields.length > 0
                  ? draft.destination.leadGenFormFields
                  : ["FULL_NAME", "PHONE", "EMAIL", "CITY"];

              const formQuestions: any[] = configuredFields.map((f: string) => ({ type: f.toUpperCase() }));

              if (draft.destination?.leadGenCustomQuestions && Array.isArray(draft.destination.leadGenCustomQuestions)) {
                for (const q of draft.destination.leadGenCustomQuestions) {
                  formQuestions.push({
                    type: "CUSTOM",
                    label: q,
                  });
                }
              }

              const createdForm = await LeadsCampaignService.createLeadGenForm(organizationId, activePageId, {
                name: draft.destination?.leadGenFormTitle || `${draft.campaign.name || 'Business'} Lead Form`,
                questions: formQuestions,
                privacy_policy: {
                  url: draft.destination?.destinationUrl || "https://jisnudigital.com/privacy",
                  link_text: "Privacy Policy",
                },
                thank_you_page: {
                  title: "Thank you for reaching out!",
                  body: "Our team will contact you shortly.",
                  button_type: "VIEW_WEBSITE",
                  button_text: "Visit Website",
                  website_url: draft.destination?.destinationUrl || "https://jisnudigital.com",
                },
              });
              if (createdForm?.id) {
                formId = createdForm.id;
              }
            }
          } catch (formErr: any) {
            console.warn("[META ADS] Instant Form resolution fallback:", formErr.message);
            throw new Error(`Instant Lead Form setup failed: ${formErr.message}`);
          }
        }

        if (formId) {
          callToActionObj.type = draft.creative?.callToAction || "APPLY_NOW";
          callToActionObj.value = {
            lead_gen_form_id: formId,
          };
        } else {
          throw new Error("Instant Form could not be linked or created on your Facebook Page. Please ensure your Page has permission to create lead forms.");
        }
      }

      const linkDataObj: any = {
        message: adCopy,
        name: adHeadline,
        description: adDescription,
        link: linkDestination,
        call_to_action: callToActionObj,
      };

      if (draft.destination?.displayLink) {
        linkDataObj.caption = draft.destination.displayLink;
      }

      let imageHash: string | null = null;
      let effectivePictureUrl = draft.creative?.mediaUrl;

      // 1. If mediaUrl is provided and local or remote, upload directly to Meta Ad Images
      if (effectivePictureUrl) {
        try {
          console.log(`[META ADS] Uploading creative image to Meta Ad Account images library: ${effectivePictureUrl}`);
          
          if (effectivePictureUrl.includes("/uploads/")) {
            // Local uploaded file
            const filename = effectivePictureUrl.split("/uploads/")[1];
            const localFilePath = path.join(process.cwd(), "uploads", filename);

            if (fs.existsSync(localFilePath)) {
              const form = new FormData();
              form.append("filename", fs.createReadStream(localFilePath));
              form.append("access_token", config.accessToken);

              const uploadResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/adimages`,
                form,
                { headers: form.getHeaders() }
              );

              const imagesObj = uploadResp.data?.images;
              if (imagesObj) {
                const firstKey = Object.keys(imagesObj)[0];
                if (firstKey && imagesObj[firstKey]?.hash) {
                  imageHash = imagesObj[firstKey].hash;
                  console.log(`[META ADS] Image uploaded successfully! Meta image_hash=${imageHash}`);
                }
              }
            }
          } else if (effectivePictureUrl.startsWith("http")) {
            // Remote image URL (Pollinations or CDN) -> upload via bytes to Meta
            const imgBuffer = await axios.get(effectivePictureUrl, { responseType: "arraybuffer" });
            const form = new FormData();
            form.append("bytes", Buffer.from(imgBuffer.data).toString("base64"));
            form.append("access_token", config.accessToken);

            const uploadResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adimages`,
              form,
              { headers: form.getHeaders() }
            );

            const imagesObj = uploadResp.data?.images;
            if (imagesObj) {
              const firstKey = Object.keys(imagesObj)[0];
              if (firstKey && imagesObj[firstKey]?.hash) {
                imageHash = imagesObj[firstKey].hash;
                console.log(`[META ADS] Remote image uploaded! Meta image_hash=${imageHash}`);
              }
            }
          }
        } catch (uploadErr: any) {
          console.warn("[META ADS] Ad image upload to Meta /adimages warning:", uploadErr.response?.data || uploadErr.message);
        }
      }

      // If no imageHash was obtained and no picture URL exists, generate one
      if (!imageHash && (!effectivePictureUrl || !effectivePictureUrl.startsWith("http"))) {
        try {
          const prompt = draft.creative?.visualDirection || draft.campaign?.name || "Professional business promotion advertisement";
          const generated = await MetaImageGenerationService.generateAdGraphic(
            prompt,
            draft.campaign?.name,
            draft.creative?.headline
          );
          effectivePictureUrl = generated.imageUrl;
        } catch {
          const randomSeed = Math.floor(Math.random() * 1000000);
          const topic = encodeURIComponent(draft.campaign.name || "business offer");
          effectivePictureUrl = `https://image.pollinations.ai/prompt/High%20conversion%20modern%20ad%20banner%20for%20${topic}?width=1080&height=1080&nologo=true&seed=${randomSeed}`;
        }
      }

      if (imageHash) {
        linkDataObj.image_hash = imageHash;
      } else if (effectivePictureUrl && effectivePictureUrl.startsWith("http")) {
        linkDataObj.picture = effectivePictureUrl;
      }

      // Explicitly set display_url so Meta shows the brand website cleanly
      try {
        const parsedUrl = new URL(linkDestination);
        linkDataObj.caption = parsedUrl.hostname.replace(/^www\./, "");
      } catch {
        linkDataObj.caption = "jisnudigital.com";
      }

      const creativePayload: any = {
        name: `${campaignPayload.name} Creative`,
        object_story_spec: {
          page_id: activePageId,
          link_data: linkDataObj,
        },
        access_token: config.accessToken,
      };

      console.log("\n=======================================================");
      console.log("🎨 [META GRAPH API EXECUTION] STEP 3: AD CREATIVE PAYLOAD");
      console.log("=======================================================");
      console.log(
        JSON.stringify(
          {
            endpoint: `POST ${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
            payload: this.sanitizeForLogging(creativePayload),
          },
          null,
          2
        )
      );

      try {
        const creativeResp = await axios.post(
          `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
          creativePayload
        );

        if (!creativeResp.data || !creativeResp.data.id) {
          throw new Error("Meta API did not return a valid Ad Creative ID.");
        }

        creativeStatus.id = creativeResp.data.id;
        creativeStatus.name = creativePayload.name;
        creativeStatus.status = "CREATED";

        creativeStatus.verified = await this.verifyObject(creativeStatus.id!, "adcreative", config.accessToken);
        console.log(`[META ADS] Creative creation SUCCESS id=${creativeStatus.id} verified=${creativeStatus.verified}`);
      } catch (cErr: any) {
        const classified = this.classifyMetaError(cErr);
        creativeStatus.status = "FAILED";
        creativeStatus.errorCode = classified.code;
        creativeStatus.errorSubcode = classified.subcode;
        creativeStatus.errorMessage = classified.message;
        console.error(`[META ADS] Creative creation FAILED code=${classified.code} msg=${classified.message}`);
        throw cErr;
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 4: CREATE AD OBJECT (STRICT DEPENDENCE ON ADSET_ID & CREATIVE_ID)
      // ─────────────────────────────────────────────────────────────
      console.log(
        `[META ADS] Ad creation START adset_id=${adSetStatus.id} creative_id=${creativeStatus.id}`
      );
      adStatus.status = "NOT_ATTEMPTED";

      const adPayload = {
        name: `${campaignPayload.name} Ad`,
        adset_id: adSetStatus.id,
        creative: { creative_id: creativeStatus.id },
        status: "PAUSED",
        access_token: config.accessToken,
      };

      console.log("\n=======================================================");
      console.log("📢 [META GRAPH API EXECUTION] STEP 4: AD OBJECT PAYLOAD");
      console.log("=======================================================");
      console.log(
        JSON.stringify(
          {
            endpoint: `POST ${META_GRAPH_BASE}/${formattedAccountId}/ads`,
            payload: this.sanitizeForLogging(adPayload),
          },
          null,
          2
        )
      );

      try {
        const adResp = await axios.post(
          `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
          adPayload
        );

        if (!adResp.data || !adResp.data.id) {
          throw new Error("Meta API did not return a valid Ad Object ID.");
        }

        adStatus.id = adResp.data.id;
        adStatus.name = adPayload.name;
        adStatus.status = "CREATED";

        adStatus.verified = await this.verifyObject(adStatus.id!, "ad", config.accessToken);
        console.log(`[META ADS] Ad creation SUCCESS id=${adStatus.id} verified=${adStatus.verified}`);

        // Persist Ad in Prisma DB
        await prisma.metaAd.create({
          data: {
            organizationId,
            adSetId: dbAdSetRecord.id,
            adAccountId: formattedAccountId,
            metaAdId: adStatus.id,
            name: adPayload.name,
            status: "PAUSED",
            callToAction: spec.cta,
            creative: creativePayload,
          },
        });
      } catch (adErr: any) {
        const classified = this.classifyMetaError(adErr);
        adStatus.status = "FAILED";
        adStatus.errorCode = classified.code;
        adStatus.errorSubcode = classified.subcode;
        adStatus.errorMessage = classified.message;
        console.error(
          `[META ADS] Ad creation FAILED code=${classified.code} subcode=${classified.subcode} msg=${classified.message}`
        );

        // DO NOT synthesize fake IDs or mark as success.
        // Return PARTIAL_CREATION with exact Meta failure info
        console.log("[META ADS] DEPLOYMENT STATUS=PARTIAL_CREATION");

        const partialResult: ExecutionResult = {
          success: false,
          status: "PARTIAL_FAILURE",
          deploymentStatus: "PARTIAL_CREATION",
          executionId,
          draftId,
          versionNumber,

          campaign: campaignStatus,
          adSet: adSetStatus,
          creative: creativeStatus,
          ad: adStatus,

          campaignId: dbCampaignRecord?.id || null,
          adSetId: adSetStatus.id,
          creativeId: creativeStatus.id,
          adId: null, // STRICT: Ad was NOT created on Meta
          metaCampaignId: campaignStatus.id,
          metaAdSetId: adSetStatus.id,
          metaCreativeId: creativeStatus.id,
          metaAdId: null,

          errorMessage: classified.message,
          errorCategory: classified.category,
          userFacingRecoveryMessage: classified.recovery,
          stepFailed: "AD_OBJECT",
        };

        executionCache.set(executionId, partialResult);
        return partialResult;
      }

      // Log verified object relationships
      console.log(`[META ADS] Object Relationship Map:
Campaign: ${campaignStatus.id}
Ad Set: ${adSetStatus.id} (campaign_id: ${campaignStatus.id})
Creative: ${creativeStatus.id}
Ad: ${adStatus.id} (adset_id: ${adSetStatus.id}, creative_id: ${creativeStatus.id})`);

      console.log("[META ADS] DEPLOYMENT STATUS=FULL_SUCCESS");

      const fullResult: ExecutionResult = {
        success: true,
        status: "SUCCESS",
        deploymentStatus: "FULL_SUCCESS",
        executionId,
        draftId,
        versionNumber,

        campaign: campaignStatus,
        adSet: adSetStatus,
        creative: creativeStatus,
        ad: adStatus,

        campaignId: dbCampaignRecord.id,
        adSetId: adSetStatus.id,
        creativeId: creativeStatus.id,
        adId: adStatus.id,
        metaCampaignId: campaignStatus.id,
        metaAdSetId: adSetStatus.id,
        metaCreativeId: creativeStatus.id,
        metaAdId: adStatus.id,

        stepFailed: null,
      };

      executionCache.set(executionId, fullResult);
      return fullResult;
    } catch (err: any) {
      const classified = this.classifyMetaError(err);
      console.error("[META ADS] Execution failed with exception:", classified.message);

      const hasAnyObject = Boolean(campaignStatus.id || adSetStatus.id || creativeStatus.id);
      const deploymentStatus: DeploymentStatus = hasAnyObject ? "PARTIAL_CREATION" : "FAILED";
      console.log(`[META ADS] DEPLOYMENT STATUS=${deploymentStatus}`);

      const failedResult: ExecutionResult = {
        success: false,
        status: hasAnyObject ? "PARTIAL_FAILURE" : "FAILED",
        deploymentStatus,
        executionId,
        draftId,
        versionNumber,

        campaign: campaignStatus,
        adSet: adSetStatus,
        creative: creativeStatus,
        ad: adStatus,

        campaignId: dbCampaignRecord?.id || null,
        adSetId: adSetStatus.id,
        creativeId: creativeStatus.id,
        adId: null,
        metaCampaignId: campaignStatus.id,
        metaAdSetId: adSetStatus.id,
        metaCreativeId: creativeStatus.id,
        metaAdId: null,

        errorMessage: classified.message,
        errorCategory: classified.category,
        userFacingRecoveryMessage: classified.recovery,
        stepFailed: creativeStatus.id
          ? "AD_OBJECT"
          : adSetStatus.id
          ? "AD_CREATIVE"
          : campaignStatus.id
          ? "AD_SET"
          : "CAMPAIGN",
      };

      executionCache.set(executionId, failedResult);
      return failedResult;
    }
  }

  /**
   * Idempotent retry of final Ad creation when Campaign, AdSet, and Creative already exist
   */
  static async retryAdCreation(
    organizationId: string,
    adSetId: string,
    creativeId: string,
    adName: string
  ): Promise<ObjectStatus> {
    console.log(`[META ADS] Retry Ad creation START adset_id=${adSetId} creative_id=${creativeId}`);
    const config = await MetaAdsCoreService.getConfig(organizationId);
    if (!config.accessToken) {
      throw new Error("Meta Ads Access Token is not configured.");
    }

    const formattedAccountId = (config.adAccountId || "").startsWith("act_")
      ? config.adAccountId
      : `act_${config.adAccountId}`;

    try {
      const adPayload = {
        name: adName || "AI Campaign Ad",
        adset_id: adSetId,
        creative: { creative_id: creativeId },
        status: "PAUSED",
        access_token: config.accessToken,
      };

      const adResp = await axios.post(
        `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
        adPayload
      );

      const adId = adResp.data?.id;
      if (!adId) {
        throw new Error("Meta API did not return an Ad ID upon retry.");
      }

      const verified = await this.verifyObject(adId, "ad", config.accessToken);
      console.log(`[META ADS] Retry Ad creation SUCCESS id=${adId} verified=${verified}`);

      return {
        status: "CREATED",
        id: adId,
        name: adName,
        verified,
      };
    } catch (err: any) {
      const classified = this.classifyMetaError(err);
      console.error(`[META ADS] Retry Ad creation FAILED code=${classified.code} subcode=${classified.subcode}`);
      return {
        status: "FAILED",
        id: null,
        errorCode: classified.code,
        errorSubcode: classified.subcode,
        errorMessage: classified.message,
      };
    }
  }
}
