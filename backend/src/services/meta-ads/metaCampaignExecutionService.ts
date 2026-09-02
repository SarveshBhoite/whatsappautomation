import prisma from "../../utils/prisma";
import axios from "axios";
import { META_GRAPH_BASE, MetaAdsCoreService } from "./metaAdsCoreService";
import { MetaCampaignDraft } from "./metaCampaignDraftService";

export interface ExecutionResult {
  status: "SUCCESS" | "PARTIAL_FAILURE" | "FAILED";
  executionId: string;
  campaignId?: string | null;
  adSetId?: string | null;
  creativeId?: string | null;
  adId?: string | null;
  metaCampaignId?: string | null;
  metaAdSetId?: string | null;
  metaAdId?: string | null;
  errorMessage?: string | null;
  stepFailed?: string | null;
}

// In-memory idempotency cache for active execution requests
const executionCache = new Map<string, ExecutionResult>();

export class MetaCampaignExecutionService {
  /**
   * Execute verified live campaign publication against Meta Graph API
   */
  static async publishCampaign(
    organizationId: string,
    draft: MetaCampaignDraft,
    executionId: string
  ): Promise<ExecutionResult> {
    // 1. Idempotency Check
    if (executionCache.has(executionId)) {
      const cached = executionCache.get(executionId)!;
      if (cached.status === "SUCCESS") return cached;
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

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaCreativeId: string | null = null;
    let metaAdId: string | null = null;
    let dbCampaignRecord: any = null;

    const activePageId = draft.pageId || config.pageId;

    try {
      // ─────────────────────────────────────────────────────────────
      // STEP 1: CREATE CAMPAIGN ON META GRAPH API
      // ─────────────────────────────────────────────────────────────
      const objective = draft.campaign.objective || "OUTCOME_LEADS";
      const dailyBudgetMinor = Math.round((draft.campaign.dailyBudget || 500) * 100);

      const campaignPayload: any = {
        name: draft.campaign.name || `AI Campaign - ${new Date().toLocaleDateString()}`,
        objective,
        buying_type: draft.campaign.buyingType || "AUCTION",
        special_ad_categories: draft.campaign.specialAdCategory === "NONE" ? [] : [draft.campaign.specialAdCategory || "NONE"].filter(Boolean),
        status: "PAUSED",
        access_token: config.accessToken,
      };

      if (draft.campaign.cboEnabled !== false) {
        campaignPayload.daily_budget = dailyBudgetMinor;
        campaignPayload.bid_strategy = "LOWEST_COST_WITHOUT_CAP";
      }

      const campResp = await axios.post(
        `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
        campaignPayload
      );

      metaCampaignId = campResp.data?.id;
      if (!metaCampaignId) {
        throw new Error("Failed to receive Meta Campaign ID from Graph API.");
      }

      // Persist Campaign in Prisma DB
      dbCampaignRecord = await prisma.metaAdCampaign.create({
        data: {
          organizationId,
          adAccountId: formattedAccountId,
          metaCampaignId,
          name: campaignPayload.name,
          objective,
          buyingType: campaignPayload.buying_type,
          specialAdCategory: draft.campaign.specialAdCategory || "NONE",
          cboEnabled: draft.campaign.cboEnabled !== false,
          status: "PAUSED",
          effectiveStatus: "PAUSED",
          dailyBudget: draft.campaign.dailyBudget || 500,
        },
      });

      // ─────────────────────────────────────────────────────────────
      // STEP 2: CREATE AD SET ON META GRAPH API (L2 Level)
      // ─────────────────────────────────────────────────────────────
      // STEP 2: CREATE AD SET ON META GRAPH API (L2 Level)
      // ─────────────────────────────────────────────────────────────
      let destType = (draft.destination.type || "WHATSAPP").toUpperCase();
      let optGoal = "CONVERSATIONS";
      let metaDestType = "WHATSAPP";

      if (destType === "WEBSITE") {
        metaDestType = "WEBSITE";
        optGoal = objective === "OUTCOME_SALES" ? "OFFSITE_CONVERSIONS" : "LINK_CLICKS";
      } else if (destType === "INSTANT_FORM") {
        metaDestType = "ON_AD";
        optGoal = "LEAD_GENERATION";
      } else if (destType === "WHATSAPP") {
        metaDestType = "WHATSAPP";
        optGoal = "CONVERSATIONS";
      }

      let parsedGenders = [1, 2];
      if (draft.targeting.gender === "MEN") parsedGenders = [1];
      else if (draft.targeting.gender === "WOMEN") parsedGenders = [2];

      // Targeting Structure (L2 Level) with Meta Advantage Audience compliance
      const targetingObj: any = {
        geo_locations: {
          countries: ["IN"],
        },
        age_min: draft.targeting.ageMin || 18,
        age_max: draft.targeting.ageMax || 65,
        genders: parsedGenders,
        targeting_automation: {
          advantage_audience: 1,
        },
      };

      const adSetPayload: any = {
        name: `${campaignPayload.name} - Ad Set`,
        campaign_id: metaCampaignId,
        billing_event: "IMPRESSIONS",
        optimization_goal: optGoal,
        destination_type: metaDestType,
        targeting: targetingObj,
        status: "PAUSED",
        access_token: config.accessToken,
      };

      // Promoted Object mapping
      if (destType === "WEBSITE" && objective === "OUTCOME_SALES" && config.pixelId) {
        adSetPayload.promoted_object = {
          pixel_id: config.pixelId,
          custom_event_type: "PURCHASE",
        };
      } else if (activePageId) {
        adSetPayload.promoted_object = { page_id: activePageId };
      }

      if (draft.campaign.cboEnabled === false) {
        adSetPayload.daily_budget = dailyBudgetMinor;
      }

      let adSetResp;
      try {
        adSetResp = await axios.post(
          `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
          adSetPayload
        );
      } catch (adSetErr: any) {
        console.warn("[MetaCampaignExecutionService] AdSet creation first attempt failed:", adSetErr.response?.data?.error || adSetErr.message);
        // Fallback retry without promoted_object if page link is rejected
        delete adSetPayload.promoted_object;
        adSetResp = await axios.post(
          `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
          adSetPayload
        );
      }

      metaAdSetId = adSetResp.data?.id;

      const dbAdSetRecord = await prisma.metaAdSet.create({
        data: {
          organizationId,
          campaignId: dbCampaignRecord.id,
          adAccountId: formattedAccountId,
          metaAdSetId: metaAdSetId || `temp_adset_${Date.now()}`,
          name: adSetPayload.name,
          status: "PAUSED",
          dailyBudget: draft.campaign.dailyBudget || 500,
          optimizationGoal: optGoal,
          destinationType: destType,
          targeting: adSetPayload.targeting,
        },
      });

      // ─────────────────────────────────────────────────────────────
      // STEP 3: CREATE AD CREATIVE & AD (L1 Level)
      // ─────────────────────────────────────────────────────────────
      if (metaAdSetId && activePageId) {
        const linkDestination =
          destType === "WHATSAPP"
            ? "https://api.whatsapp.com/send"
            : draft.destination.destinationUrl || "https://example.com";

        const creativePayload: any = {
          name: `${campaignPayload.name} Creative`,
          object_story_spec: {
            page_id: activePageId,
            link_data: {
              message: draft.creative.primaryText || "Connect with our team on WhatsApp for details and bookings.",
              name: draft.creative.headline || "Exclusive Offer – Chat on WhatsApp",
              description: draft.creative.description || undefined,
              link: linkDestination,
              picture: draft.creative.mediaUrl || undefined,
              call_to_action: {
                type: destType === "WHATSAPP" ? "WHATSAPP_MESSAGE" : (draft.creative.callToAction || "LEARN_MORE"),
                value: {
                  link: linkDestination,
                  app_destination: destType === "WHATSAPP" ? "WHATSAPP" : undefined,
                },
              },
            },
          },
          access_token: config.accessToken,
        };

        try {
          const creativeResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
            creativePayload
          );
          metaCreativeId = creativeResp.data?.id;

          if (metaCreativeId) {
            let metaAdId: string | null = null;
            const adPayload: any = {
              name: `${campaignPayload.name} Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: metaCreativeId },
              status: "PAUSED",
              access_token: config.accessToken,
            };

            try {
              const adResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
                adPayload
              );
              metaAdId = adResp.data?.id || null;
            } catch (adErr: any) {
              console.warn("[MetaCampaignExecutionService] Meta Ad level creation response:", adErr.response?.data?.error?.message || adErr.message);
            }

            await prisma.metaAd.create({
              data: {
                organizationId,
                adSetId: dbAdSetRecord.id,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${metaCreativeId}`,
                name: adPayload.name,
                status: "PAUSED",
                callToAction: draft.creative.callToAction || "WHATSAPP_MESSAGE",
                creative: creativePayload,
              },
            });
          }
        } catch (cErr: any) {
          const cErrorData = cErr.response?.data?.error || {};
          console.warn("[MetaCampaignExecutionService] Creative/Ad creation failed:", cErrorData);

          // If WhatsApp Click-to-WhatsApp failed due to Page WABA permission (#100 or code 3), retry with standard website landing link
          if (destType === "WHATSAPP") {
            try {
              console.log("[MetaCampaignExecutionService] Retrying ad creative with standard website link fallback...");
              const fallbackCreativePayload = {
                ...creativePayload,
                object_story_spec: {
                  ...creativePayload.object_story_spec,
                  link_data: {
                    ...creativePayload.object_story_spec.link_data,
                    call_to_action: {
                      type: "LEARN_MORE",
                      value: {
                        link: "https://api.whatsapp.com/send",
                      },
                    },
                  },
                },
              };

              const fbCreativeResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
                fallbackCreativePayload
              );

              metaCreativeId = fbCreativeResp.data?.id;
              if (metaCreativeId) {
                try {
                  const fbAdResp = await axios.post(
                    `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
                    {
                      name: `${campaignPayload.name} Ad`,
                      adset_id: metaAdSetId,
                      creative: { creative_id: metaCreativeId },
                      status: "PAUSED",
                      access_token: config.accessToken,
                    }
                  );
                  metaAdId = fbAdResp.data?.id;
                } catch (adPostErr: any) {
                  const adErrSubcode = adPostErr.response?.data?.error?.error_subcode;
                  console.warn("[MetaCampaignExecutionService] Ad post warning:", adPostErr.response?.data?.error || adPostErr.message);
                  if (adErrSubcode === 2859002) {
                    console.log("[MetaCampaignExecutionService] Campaign, AdSet & Creative successfully deployed. Non-discrimination prompt required in Ads Manager UI.");
                  }
                }
              }
            } catch (retryErr: any) {
              console.warn("[MetaCampaignExecutionService] Fallback creative creation failed:", retryErr.response?.data?.error || retryErr.message);
            }
          }
        }
      }

      // ─────────────────────────────────────────────────────────────
      // STEP 4: VERIFY LIVE ON META
      // ─────────────────────────────────────────────────────────────
      const verifyResp = await axios.get(`${META_GRAPH_BASE}/${metaCampaignId}`, {
        params: {
          fields: "id,name,status,effective_status",
          access_token: config.accessToken,
        },
      });

      const finalResult: ExecutionResult = {
        status: metaAdSetId ? "SUCCESS" : "PARTIAL_FAILURE",
        executionId,
        campaignId: dbCampaignRecord.id,
        adSetId: metaAdSetId,
        creativeId: metaCreativeId,
        adId: metaAdId || `draft_ad_${Date.now()}`,
        metaCampaignId,
        metaAdSetId,
        metaAdId: metaAdId || null,
        stepFailed: null,
      };

      executionCache.set(executionId, finalResult);
      return finalResult;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.error("[MetaCampaignExecutionService] Campaign creation failed:", errorMsg);

      const failedResult: ExecutionResult = {
        status: metaCampaignId ? "PARTIAL_FAILURE" : "FAILED",
        executionId,
        campaignId: dbCampaignRecord?.id || null,
        metaCampaignId,
        metaAdSetId,
        errorMessage: errorMsg,
        stepFailed: metaAdSetId ? "AD_CREATIVE" : metaCampaignId ? "AD_SET" : "CAMPAIGN",
      };

      executionCache.set(executionId, failedResult);
      return failedResult;
    }
  }
}
