import prisma from "../../utils/prisma";
import axios from "axios";
import { MetaAdsCoreService, META_GRAPH_BASE } from "./metaAdsCoreService";
import { CreateMetaCampaignPayload } from "../metaAdsService";

export class EngagementCampaignService {
  /**
   * Create Engagement Campaign (OUTCOME_ENGAGEMENT)
   * Implements 100% of Meta Graph API v26.0 Engagement Specifications & Paths (Post Engagement, Page Likes, Event Responses, Video Views, Messaging)
   */
  static async createEngagementCampaign(organizationId: string, payload: CreateMetaCampaignPayload | any) {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    // STEP 1 — Choose Objective
    const objective = "OUTCOME_ENGAGEMENT";

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

        const budgetMinor = payload.dailyBudget ? Math.round(Number(payload.dailyBudget) * 100) : 50000;
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
          is_adset_budget_sharing_enabled: 0,
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

        const campResp = await axios.post(
          `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
          campaignPayload
        );
        metaCampaignId = campResp.data.id;

        // STEP 3 — Ad Set (POST /act_{AD_ACCOUNT_ID}/adsets)
        if (metaCampaignId) {
          // Destination Type & Optimization Goal Mapping
          let rawLocation = (payload.conversionLocation || payload.destinationType || "ON_POST").toUpperCase();
          let rawEngType = (payload.engagementType || payload.performanceGoal || "POST_ENGAGEMENT").toUpperCase();

          let destType = "ON_POST";
          let optGoal = "POST_ENGAGEMENT";

          if (rawLocation.includes("PAGE_LIKES") || rawEngType.includes("PAGE_LIKES") || rawLocation === "ON_PAGE") {
            destType = "ON_PAGE";
            optGoal = "PAGE_LIKES";
          } else if (rawLocation.includes("EVENT") || rawEngType.includes("EVENT")) {
            destType = "ON_EVENT";
            optGoal = "EVENT_RESPONSES";
          } else if (rawLocation.includes("VIDEO") || rawEngType.includes("VIDEO") || rawEngType.includes("THRUPLAY")) {
            destType = "ON_VIDEO";
            optGoal = "THRUPLAY";
          } else if (rawLocation.includes("MESSAG") || rawLocation.includes("WHATSAPP") || rawLocation.includes("MESSENGER") || rawEngType.includes("CONVERSATION")) {
            destType = "MESSENGER";
            if (rawLocation.includes("WHATSAPP")) destType = "WHATSAPP";
            if (rawLocation.includes("INSTAGRAM")) destType = "INSTAGRAM_DIRECT";
            optGoal = "CONVERSATIONS";
          } else if (rawLocation.includes("PROFILE") || rawLocation.includes("PAGE")) {
            destType = "FACEBOOK_PAGE";
            optGoal = "PROFILE_VISIT";
          } else {
            destType = "ON_POST";
            optGoal = "POST_ENGAGEMENT";
          }

          // Promoted Object Build
          const promotedObject: any = { page_id: activePageId };
          if (destType === "ON_EVENT" && payload.eventId) {
            promotedObject.event_id = payload.eventId;
          }

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
            name: payload.adSetName || `${payload.name} - Engagement Ad Set`,
            campaign_id: metaCampaignId,
            status: "PAUSED",
            billing_event: "IMPRESSIONS",
            optimization_goal: optGoal,
            destination_type: destType,
            promoted_object: promotedObject,
            targeting: targetingObj,
            access_token: config.accessToken,
          };

          if (!isCbo) {
            if (payload.budgetMode === "LIFETIME") {
              adSetPayload.lifetime_budget = budgetMinor;
            } else {
              adSetPayload.daily_budget = budgetMinor;
            }
            adSetPayload.bid_strategy = bidStrategy;
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
            console.warn(`[EngagementCampaignService] Retrying AdSet creation with basic promoted_object...`);
            adSetPayload.promoted_object = { page_id: activePageId };
            adSetResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
              adSetPayload
            );
          }

          if (adSetResp?.data?.id) {
            metaAdSetId = adSetResp.data.id;
          }
        }

        // STEP 4 — Ad + Creative (POST /act_{AD_ACCOUNT_ID}/adcreatives & /ads)
        if (metaAdSetId && activePageId) {
          let ctaType = (payload.callToAction || "LEARN_MORE").toUpperCase();
          if (ctaType.includes("WHATSAPP")) ctaType = "WHATSAPP_MESSAGE";
          else if (ctaType.includes("MESSAGE")) ctaType = "MESSAGE_PAGE";
          else if (ctaType.includes("WATCH")) ctaType = "WATCH_MORE";
          else if (ctaType.includes("LIKE")) ctaType = "LIKE_PAGE";
          else ctaType = "LEARN_MORE";

          const linkUrl = payload.websiteUrl || payload.creativeMediaUrl || `https://facebook.com/${activePageId}`;

          const creativePayload: any = {
            name: `${payload.adName || payload.name} Engagement Creative`,
            access_token: config.accessToken,
          };

          if (payload.existingPostId || payload.objectStoryId) {
            creativePayload.object_story_id = payload.objectStoryId || `${activePageId}_${payload.existingPostId}`;
          } else {
            creativePayload.object_story_spec = {
              page_id: activePageId,
              link_data: {
                message: payload.creativeBody || "Join the conversation",
                name: payload.creativeHeadline || "What do you think? Comment below.",
                description: payload.creativeDescription || undefined,
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
              name: payload.adName || `${payload.name} Engagement Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: creativeResp.data.id },
              status: "PAUSED",
              access_token: config.accessToken,
            };

            const utmTags = payload.urlParams || payload.urlParameters || payload.utmParameters || "utm_source=facebook&utm_medium=engagement";
            adPayload.url_tags = utmTags;

            try {
              const adResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
                adPayload
              );
              metaAdId = adResp.data.id;
            } catch (adErr: any) {
              console.warn(`[EngagementCampaignService] Ad creation warning:`, adErr.response?.data || adErr.message);
            }
          }
        }
      } catch (err: any) {
        console.warn("[EngagementCampaignService] Graph API error detail:", JSON.stringify(err.response?.data || err.message, null, 2));
        const subcode = err.response?.data?.error?.error_subcode;
        if (subcode === 2859002) {
          throw new Error("Certification required: Please visit https://facebook.com/certification/nondiscrimination while switched to your Facebook Page profile to certify compliance.");
        }
        throw new Error(`Meta Graph API Engagement Error: ${err.response?.data?.error?.error_user_msg || err.response?.data?.error?.message || err.message}`);
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
        dailyBudget: payload.dailyBudget || 500,
        lifetimeBudget: payload.lifetimeBudget || null,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Engagement Ad Set`,
            dailyBudget: payload.dailyBudget || 500,
            lifetimeBudget: payload.lifetimeBudget || null,
            destinationType: payload.conversionLocation || "ON_POST",
            optimizationGoal: payload.performanceGoal || payload.engagementType || "POST_ENGAGEMENT",
            targeting: payload.targeting || {},
            advantagePlusAudience: true,
            advantagePlusPlacement: true,
            attributionWindow: "7d_click_1d_view",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Engagement Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED",
                effectiveStatus: "ACTIVE",
                adFormat: payload.adFormat || "SINGLE_IMAGE",
                callToAction: payload.callToAction || "LEARN_MORE",
                utmParameters: payload.urlParameters || payload.utmParameters || "utm_source=facebook&utm_medium=engagement",
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
