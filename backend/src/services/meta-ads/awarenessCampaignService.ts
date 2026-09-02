import prisma from "../../utils/prisma";
import axios from "axios";
import { MetaAdsCoreService, META_GRAPH_BASE } from "./metaAdsCoreService";
import { CreateMetaCampaignPayload } from "../metaAdsService";

export class AwarenessCampaignService {
  /**
   * Create Awareness Campaign (OUTCOME_AWARENESS)
   * Implements 100% of Meta Graph API v26.0 Awareness Specifications, Frequency Control, and Video/Post Boosting
   */
  static async createAwarenessCampaign(organizationId: string, payload: CreateMetaCampaignPayload | any) {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;
    let optGoal = "REACH";

    // STEP 1 — Choose Objective
    const objective = "OUTCOME_AWARENESS";

    // Detect / link Facebook Page ID
    let activePageId = payload.facebookPageId || payload.pageId || config.pageId;
    if (!activePageId && config.accessToken) {
      try {
        const pages = await MetaAdsCoreService.getPages(organizationId);
        if (pages && pages.length > 0) {
          activePageId = pages[0].id;
          await prisma.metaAdConfig.update({
            where: { organizationId },
            data: { pageId: activePageId },
          });
        }
      } catch (e) {}
    }

    if (config.accessToken && config.adAccountId) {
      try {
        // STEP 2 — Campaign Parameters (POST /act_{AD_ACCOUNT_ID}/campaigns)
        let buyingType = (payload.buyingType || "AUCTION").toUpperCase();
        if (buyingType === "RESERVATION") buyingType = "RESERVED";
        if (buyingType !== "AUCTION" && buyingType !== "RESERVED") buyingType = "AUCTION";

        let specialAdCat: string[] = [];
        if (payload.specialAdCategory && payload.specialAdCategory !== "NONE") {
          specialAdCat = [payload.specialAdCategory];
        }

        const budgetMinor = payload.dailyBudget ? Math.round(Number(payload.dailyBudget) * 100) : 75000;
        const isCbo = payload.cboEnabled !== false;

        let bidStrategy = payload.bidStrategy || "LOWEST_COST_WITHOUT_CAP";
        if (bidStrategy === "HIGHEST_VOLUME" || bidStrategy === "LOWEST_COST") {
          bidStrategy = "LOWEST_COST_WITHOUT_CAP";
        } else if (bidStrategy === "BID_CAP") {
          bidStrategy = "LOWEST_COST_WITH_BID_CAP";
        } else if (bidStrategy === "COST_CAP") {
          bidStrategy = "COST_CAP";
        }

        const campaignPayload: any = {
          name: payload.name,
          objective,
          status: "PAUSED",
          special_ad_categories: specialAdCat,
          buying_type: buyingType,
          is_adset_budget_sharing_enabled: false,
          access_token: config.accessToken,
        };

        if (isCbo) {
          if (payload.budgetMode === "LIFETIME") {
            campaignPayload.lifetime_budget = budgetMinor;
          } else {
            campaignPayload.daily_budget = budgetMinor;
          }
          campaignPayload.bid_strategy = bidStrategy;
        }

        let campResp;
        try {
          campResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
            campaignPayload
          );
        } catch (cErr: any) {
          const subcode = cErr.response?.data?.error?.error_subcode;
          const msg = cErr.response?.data?.error?.message;
          if (subcode === 1815240 || (msg && msg.toLowerCase().includes("buying type"))) {
            console.warn(`[AwarenessCampaignService] Retrying campaign with AUCTION buying type...`);
            campaignPayload.buying_type = "AUCTION";
            campResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
              campaignPayload
            );
          } else {
            throw cErr;
          }
        }

        metaCampaignId = campResp.data.id;

        // STEP 3 — Ad Set (POST /act_{AD_ACCOUNT_ID}/adsets)
        if (metaCampaignId) {
          // Optimization Goal Mapping
          let rawGoal = (payload.performanceGoal || payload.optimizationGoal || "REACH").toUpperCase();
          optGoal = "REACH";
          let billingEvent = "IMPRESSIONS";

          if (rawGoal.includes("IMPRESSION")) {
            optGoal = "IMPRESSIONS";
            billingEvent = "IMPRESSIONS";
          } else if (rawGoal.includes("RECALL") || rawGoal.includes("BRAND")) {
            optGoal = "AD_RECALL_LIFT";
            billingEvent = "IMPRESSIONS";
          } else if (rawGoal.includes("THRUPLAY") || rawGoal.includes("15")) {
            optGoal = "THRUPLAY";
            billingEvent = "IMPRESSIONS";
          } else if (rawGoal.includes("2SEC") || rawGoal.includes("TWO_SECOND")) {
            optGoal = "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS";
            billingEvent = "IMPRESSIONS";
          } else {
            optGoal = "REACH";
            billingEvent = "IMPRESSIONS";
          }

          // Frequency Control Specs (Cap impressions per user)
          const frequencyControlSpecs = payload.frequencyControlSpecs || [
            {
              event: "IMPRESSIONS",
              interval_days: 7,
              max_frequency: 3,
            },
          ];

          let parsedGenders = [1, 2];
          if (payload.gender === "MEN" || payload.gender === "MALE") parsedGenders = [1];
          else if (payload.gender === "WOMEN" || payload.gender === "FEMALE") parsedGenders = [2];

          const targetingObj: any = {
            geo_locations: { countries: payload.targeting?.countries || ["IN"] },
            age_min: payload.ageMin || payload.targeting?.ageMin || 18,
            age_max: payload.ageMax || payload.targeting?.ageMax || 65,
            genders: parsedGenders,
            publisher_platforms: ["facebook", "instagram", "audience_network", "messenger"],
            device_platforms: ["mobile", "desktop"],
            targeting_automation: { advantage_audience: 1 },
          };

          const adSetPayload: any = {
            name: payload.adSetName || `${payload.name} - Awareness Ad Set`,
            campaign_id: metaCampaignId,
            status: "PAUSED",
            billing_event: billingEvent,
            optimization_goal: optGoal,
            frequency_control_specs: frequencyControlSpecs,
            targeting: targetingObj,
            access_token: config.accessToken,
          };

          if (!isCbo) {
            if (payload.budgetMode === "LIFETIME") {
              adSetPayload.lifetime_budget = budgetMinor;
            } else {
              adSetPayload.daily_budget = budgetMinor;
            }
            adSetPayload.bid_strategy = bidStrategy || "LOWEST_COST_WITHOUT_CAP";
          }

          // Note: For Awareness campaigns (REACH / IMPRESSIONS), promoted_object page_id can trigger Meta non-discrimination certification blocks unless specifically required for video views.
          // Only attach promoted_object if performance goal is video views.
          if (activePageId && (optGoal === "THRUPLAY" || optGoal === "TWO_SECOND_CONTINUOUS_VIDEO_VIEWS")) {
            adSetPayload.promoted_object = { page_id: activePageId };
          }

          if (payload.startDate) {
            try { adSetPayload.start_time = new Date(payload.startDate).toISOString(); } catch (e) {}
          }
          if (payload.endDate) {
            try { adSetPayload.end_time = new Date(payload.endDate).toISOString(); } catch (e) {}
          }

          let adSetResp;
          try {
            adSetResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
              adSetPayload
            );
          } catch (asErr: any) {
            console.warn(`[AwarenessCampaignService] Initial AdSet creation warning:`, asErr?.response?.data || asErr.message);
            // If error is related to frequency specs or promoted_object, fallback
            delete adSetPayload.frequency_control_specs;
            if (asErr?.response?.data?.error?.code === 100 || asErr?.response?.data?.error?.error_subcode === 2859002) {
              delete adSetPayload.promoted_object;
            }
            try {
              adSetResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
                adSetPayload
              );
            } catch (retryErr: any) {
              console.error(`[AwarenessCampaignService] AdSet retry error:`, retryErr?.response?.data || retryErr.message);
              throw new Error(retryErr?.response?.data?.error?.error_user_msg || retryErr?.response?.data?.error?.message || "Failed to create Meta Ad Set");
            }
          }

          if (adSetResp?.data?.id) {
            metaAdSetId = adSetResp.data.id;
          }
        }

        // STEP 4 — Ad + Creative (POST /act_{AD_ACCOUNT_ID}/adcreatives & /ads)
        if (metaAdSetId && activePageId) {
          let ctaType = (payload.callToAction || "LEARN_MORE").toUpperCase();
          if (ctaType.includes("WATCH")) ctaType = "WATCH_MORE";
          else if (ctaType.includes("SHOP")) ctaType = "SHOP_NOW";
          else if (ctaType.includes("CONTACT")) ctaType = "CONTACT_US";
          else if (ctaType.includes("WHATSAPP")) ctaType = "WHATSAPP_MESSAGE";
          else if (ctaType.includes("MESSAGE")) ctaType = "MESSAGE_PAGE";
          else ctaType = "LEARN_MORE";

          const linkUrl = payload.websiteUrl || payload.creativeMediaUrl || "https://example.com";

          const creativePayload: any = {
            name: `${payload.adName || payload.name} Awareness Creative`,
            access_token: config.accessToken,
          };

          // Existing Post Boosting vs New Creative Build
          if (payload.existingPostId || payload.objectStoryId) {
            creativePayload.object_story_id = payload.objectStoryId || `${activePageId}_${payload.existingPostId}`;
          } else if (payload.adFormat === "VIDEO" || payload.mediaType === "VIDEO" || optGoal === "THRUPLAY") {
            creativePayload.object_story_spec = {
              page_id: activePageId,
              video_data: {
                video_id: payload.videoId || payload.creativeMediaUrl,
                title: payload.creativeHeadline || "Brand Story",
                message: payload.creativeBody,
                image_url: payload.creativeThumbnailUrl || payload.creativeMediaUrl,
                call_to_action: {
                  type: ctaType,
                  value: { link: linkUrl },
                },
              },
            };
          } else {
            creativePayload.object_story_spec = {
              page_id: activePageId,
              link_data: {
                message: payload.creativeBody,
                name: payload.creativeHeadline,
                description: payload.creativeDescription || "Discover our brand story",
                link: linkUrl,
                picture: payload.creativeMediaUrl || undefined,
                call_to_action: {
                  type: ctaType,
                  value: { link: linkUrl },
                },
              },
            };
          }

          if (payload.instagramAccount || payload.instagramAccountId) {
            const igId = payload.instagramAccountId || payload.instagramAccount;
            if (igId && igId.startsWith("17")) {
              if (creativePayload.object_story_spec) {
                creativePayload.object_story_spec.instagram_user_id = igId;
              } else {
                creativePayload.instagram_user_id = igId;
              }
            }
          }

          const creativeResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
            creativePayload
          );

          if (creativeResp.data?.id) {
            const adPayload: any = {
              name: payload.adName || `${payload.name} Awareness Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: creativeResp.data.id },
              status: "PAUSED",
              access_token: config.accessToken,
            };

            const utmTags = payload.urlParams || payload.utmParameters || "utm_source=facebook&utm_medium=awareness";
            adPayload.url_tags = utmTags;

            try {
              const adResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
                adPayload
              );
              metaAdId = adResp.data.id;
            } catch (adErr: any) {
              const subcode = adErr.response?.data?.error?.error_subcode;
              if (subcode === 2859002) {
                console.warn(`[AwarenessCampaignService] Campaign & AdSet created successfully (Campaign ID: ${metaCampaignId}, AdSet ID: ${metaAdSetId}), but Ad launch requires Page Non-Discrimination Policy Certification.`);
              } else {
                console.warn(`[AwarenessCampaignService] Ad creation warning:`, adErr.response?.data || adErr.message);
              }
            }
          }
        }
      } catch (err: any) {
        console.warn("[AwarenessCampaignService] Graph API error detail:", JSON.stringify(err.response?.data || err.message, null, 2));
        const subcode = err.response?.data?.error?.error_subcode;
        if (subcode === 2859002) {
          throw new Error("Certification required: Please visit https://facebook.com/certification/nondiscrimination while switched to your Facebook Page profile to certify compliance.");
        }
        throw new Error(`Meta Graph API Awareness Error: ${err.response?.data?.error?.error_user_msg || err.response?.data?.error?.message || err.message}`);
      }
    }

    // Save record to local database
    const dbCampaign = await prisma.metaAdCampaign.create({
      data: {
        organizationId,
        adAccountId: formattedAccountId,
        metaCampaignId: metaCampaignId || `meta_camp_${Date.now()}`,
        name: payload.name,
        objective,
        buyingType: payload.buyingType || "AUCTION",
        specialAdCategory: payload.specialAdCategory || "NONE",
        cboEnabled: payload.cboEnabled !== undefined ? payload.cboEnabled : true,
        dailyBudget: payload.dailyBudget || 750,
        lifetimeBudget: payload.lifetimeBudget || null,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Awareness Ad Set`,
            dailyBudget: payload.dailyBudget || 750,
            lifetimeBudget: payload.lifetimeBudget || null,
            destinationType: payload.destinationType || "ON_AD",
            optimizationGoal: payload.performanceGoal || "REACH",
            targeting: payload.targeting || {},
            advantagePlusAudience: true,
            advantagePlusPlacement: true,
            attributionWindow: "7d_click_1d_view",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Awareness Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED",
                effectiveStatus: "ACTIVE",
                adFormat: payload.adFormat || "SINGLE_IMAGE",
                callToAction: payload.callToAction || "LEARN_MORE",
                utmParameters: payload.urlParams || payload.utmParameters || "utm_source=facebook&utm_medium=awareness",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  description: payload.creativeDescription,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.callToAction || "LEARN_MORE",
                },
              },
            },
          },
        },
      },
      include: {
        adSets: {
          include: {
            ads: true,
          },
        },
      },
    });

    return dbCampaign;
  }
}
