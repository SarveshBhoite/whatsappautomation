import prisma from "../../utils/prisma";
import axios from "axios";
import { MetaAdsCoreService, META_GRAPH_BASE } from "./metaAdsCoreService";
import { CreateMetaCampaignPayload } from "../metaAdsService";

export class TrafficCampaignService {
  /**
   * Create Traffic Campaign, Ad Set, and Ad (OUTCOME_TRAFFIC)
   */
  static async createTrafficCampaign(organizationId: string, payload: CreateMetaCampaignPayload) {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    // STEP 1: OBJECTIVE
    const objective = "OUTCOME_TRAFFIC";

    // STEP 2: CAMPAIGN PARAMETERS
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
        // 2B: POST /act_{AD_ACCOUNT_ID}/campaigns
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
            console.warn(`[TrafficCampaignService] Retrying campaign with AUCTION buying type...`);
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

        // STEP 3: AD SET (POST /act_{AD_ACCOUNT_ID}/adsets)
        if (metaCampaignId) {
          let destType = (payload.destinationType || payload.adDestinationRadio || "WEBSITE").toUpperCase();
          if (destType === "MESSAGING") destType = "WHATSAPP";
          if (destType === "INSTAGRAM") destType = "INSTAGRAM_DIRECT";
          if (destType === "CALL") destType = "PHONE_CALL";

          let optGoal = (payload.performanceGoal || payload.optimizationGoal || "LINK_CLICKS").toUpperCase();
          if (optGoal.includes("CLICK")) optGoal = "LINK_CLICKS";
          else if (optGoal.includes("LANDING")) optGoal = "LANDING_PAGE_VIEWS";
          else if (optGoal.includes("CONVERSATION")) optGoal = "CONVERSATIONS";
          else if (optGoal.includes("REACH")) optGoal = "REACH";
          else if (optGoal.includes("IMPRESSION")) optGoal = "IMPRESSIONS";

          let billingEvent = "IMPRESSIONS";
          if (optGoal === "LINK_CLICKS") {
            billingEvent = "LINK_CLICKS";
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
          };

          const adSetPayload: any = {
            name: payload.adSetName || `${payload.name} - Traffic Ad Set`,
            campaign_id: metaCampaignId,
            status: "PAUSED",
            billing_event: billingEvent,
            optimization_goal: optGoal,
            destination_type: destType,
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

          if (activePageId) {
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
            console.warn(`[TrafficCampaignService] AdSet fallback retry...`);
            delete adSetPayload.promoted_object;
            adSetResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
              adSetPayload
            );
          }

          if (adSetResp?.data?.id) {
            metaAdSetId = adSetResp.data.id;
          }
        }

        // STEP 4: AD & CREATIVE
        if (metaAdSetId && activePageId) {
          let ctaType = (payload.callToAction || "LEARN_MORE").toUpperCase();
          if (ctaType.includes("WHATSAPP")) ctaType = "WHATSAPP_MESSAGE";
          else if (ctaType.includes("MESSAGE") && !ctaType.includes("WHATSAPP")) ctaType = "MESSAGE_PAGE";
          else if (ctaType.includes("SHOP")) ctaType = "SHOP_NOW";
          else if (ctaType.includes("CONTACT")) ctaType = "CONTACT_US";
          else if (ctaType.includes("SIGN")) ctaType = "SIGN_UP";
          else if (ctaType.includes("BOOK")) ctaType = "BOOK_NOW";
          else if (ctaType.includes("OFFER")) ctaType = "GET_OFFER";

          const linkUrl = payload.websiteUrl || payload.creativeMediaUrl || "https://example.com";

          const creativePayload: any = {
            name: `${payload.adName || payload.name} Creative`,
            object_story_spec: {
              page_id: activePageId,
              link_data: {
                message: payload.creativeBody,
                name: payload.creativeHeadline,
                description: payload.creativeDescription || undefined,
                link: linkUrl,
                picture: payload.creativeMediaUrl || undefined,
                call_to_action: {
                  type: ctaType,
                  value: { link: linkUrl }
                },
              },
            },
            access_token: config.accessToken,
          };

          if (payload.instagramAccount || payload.instagramAccountId) {
            const igId = payload.instagramAccountId || payload.instagramAccount;
            if (igId && igId.startsWith("17")) {
              creativePayload.object_story_spec.instagram_user_id = igId;
            }
          }

          const creativeResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
            creativePayload
          );

          if (creativeResp.data?.id) {
            const adPayload: any = {
              name: payload.adName || `${payload.name} Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: creativeResp.data.id },
              status: "PAUSED",
              access_token: config.accessToken,
            };

            if (payload.urlParams || payload.utmParameters || payload.urlParameters) {
              adPayload.url_tags = payload.urlParams || payload.utmParameters || payload.urlParameters;
            }

            const adResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
              adPayload
            );
            metaAdId = adResp.data.id;
          }
        }
      } catch (err: any) {
        const errorData = err.response?.data?.error || {};
        console.warn("[TrafficCampaignService] Graph API creation error detail:", JSON.stringify(err.response?.data || err.message, null, 2));

        let msg = errorData.error_user_msg || errorData.message || err.message;
        throw new Error(`Meta Graph API Traffic Error: ${msg}`);
      }
    }

    // STEP 5: SAVE TO LOCAL DATABASE
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
        advantagePlus: payload.advantagePlus !== undefined ? payload.advantagePlus : false,
        bidStrategy: payload.bidStrategy || "LOWEST_COST_WITHOUT_CAP",
        dailyBudget: payload.dailyBudget || 500,
        lifetimeBudget: payload.lifetimeBudget || null,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Traffic Ad Set`,
            dailyBudget: payload.dailyBudget || 500,
            lifetimeBudget: payload.lifetimeBudget || null,
            destinationType: payload.destinationType || "WEBSITE",
            optimizationGoal: payload.optimizationGoal || payload.performanceGoal || "LINK_CLICKS",
            targeting: payload.targeting || {},
            advantagePlusAudience: payload.advantagePlusAudience !== undefined ? payload.advantagePlusAudience : true,
            advantagePlusPlacement: payload.advantagePlusPlacement !== undefined ? payload.advantagePlusPlacement : true,
            attributionWindow: payload.attributionWindow || "7d_click_1d_view",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED",
                effectiveStatus: "ACTIVE",
                adFormat: payload.adFormat || "SINGLE_IMAGE",
                callToAction: payload.callToAction || "LEARN_MORE",
                utmParameters: payload.urlParams || payload.utmParameters || "utm_source=meta&utm_medium=cpc",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  description: payload.creativeDescription,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.callToAction || "LEARN_MORE",
                  whatsappNumber: payload.whatsappNumber || payload.whatsappPhone,
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
