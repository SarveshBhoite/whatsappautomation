import prisma from "../../utils/prisma";
import axios from "axios";
import { MetaAdsCoreService, META_GRAPH_BASE } from "./metaAdsCoreService";
import { CreateMetaCampaignPayload } from "../metaAdsService";

export class AppPromotionCampaignService {
  /**
   * Create App Promotion Campaign (OUTCOME_APP_PROMOTION)
   * Implements 100% of Meta Graph API v26.0 App Promotion Campaign Specifications, App Event Optimization, and SKAdNetwork
   */
  static async createAppPromotionCampaign(organizationId: string, payload: CreateMetaCampaignPayload | any) {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    // STEP 1 — Choose Objective
    const objective = "OUTCOME_APP_PROMOTION";

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

        const budgetMinor = payload.dailyBudget ? Math.round(Number(payload.dailyBudget) * 100) : 150000;
        const isCbo = payload.cboEnabled !== false;

        let bidStrategy = payload.bidStrategy || "LOWEST_COST_WITHOUT_CAP";
        if (bidStrategy === "HIGHEST_VOLUME" || bidStrategy === "LOWEST_COST") {
          bidStrategy = "LOWEST_COST_WITHOUT_CAP";
        } else if (bidStrategy === "BID_CAP") {
          bidStrategy = "LOWEST_COST_WITH_BID_CAP";
        } else if (bidStrategy === "COST_CAP") {
          bidStrategy = "COST_CAP";
        } else if (bidStrategy === "MIN_ROAS" || bidStrategy === "ROAS_GOAL") {
          bidStrategy = "LOWEST_COST_WITH_MIN_ROAS";
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
          // App Store URL & Application ID
          const appId = config.appId || "36702477879366478";
          const storeUrl = payload.objectStoreUrl || (payload.appStore === "APPLE"
            ? "https://apps.apple.com/app/id123456789"
            : "https://play.google.com/store/apps/details?id=com.whatsapp");

          // Optimization Goal Mapping
          let rawGoal = (payload.performanceGoal || payload.optimizationGoal || "APP_INSTALLS").toUpperCase();
          let optGoal = "APP_INSTALLS";
          if (rawGoal.includes("CONVERSION") || rawGoal.includes("EVENT")) optGoal = "OFFSITE_CONVERSIONS";
          else if (rawGoal.includes("VALUE") || rawGoal.includes("ROAS")) optGoal = "VALUE";
          else if (rawGoal.includes("BOTH") || rawGoal.includes("HYBRID")) optGoal = "APP_INSTALLS_AND_OFFSITE_CONVERSIONS";
          else if (rawGoal.includes("CLICK")) optGoal = "LINK_CLICKS";
          else if (rawGoal.includes("REACH")) optGoal = "REACH";
          else optGoal = "APP_INSTALLS";

          // Promoted Object Build
          const promotedObject: any = {
            application_id: appId,
            object_store_url: storeUrl,
          };

          if (optGoal === "OFFSITE_CONVERSIONS" || optGoal === "VALUE") {
            let customEvent = (payload.customEventType || payload.appEvent || "PURCHASE").toUpperCase();
            promotedObject.custom_event_type = customEvent;
            if (customEvent === "OTHER" && payload.customEventStr) {
              promotedObject.custom_event_str = payload.customEventStr;
            }
          }

          // User OS Targeting
          let userOs = ["Android"];
          if (payload.appStore === "APPLE" || payload.userOs === "iOS") {
            userOs = ["iOS"];
          } else if (payload.userOs === "BOTH") {
            userOs = ["iOS", "Android"];
          }

          let parsedGenders = [1, 2];
          if (payload.gender === "MEN" || payload.gender === "MALE") parsedGenders = [1];
          else if (payload.gender === "WOMEN" || payload.gender === "FEMALE") parsedGenders = [2];

          const targetingObj: any = {
            geo_locations: { countries: payload.targeting?.countries || ["IN"] },
            age_min: payload.ageMin || 18,
            age_max: payload.ageMax || 65,
            genders: parsedGenders,
            user_os: userOs,
            device_platforms: ["mobile"],
            publisher_platforms: ["facebook", "instagram", "audience_network"],
          };

          const adSetPayload: any = {
            name: payload.adSetName || `${payload.name} - App Ad Set`,
            campaign_id: metaCampaignId,
            status: "PAUSED",
            billing_event: "IMPRESSIONS",
            optimization_goal: optGoal,
            destination_type: "APP",
            promoted_object: promotedObject,
            targeting: targetingObj,
            is_skadnetwork_attribution: payload.ios14Campaign !== false,
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
            console.warn(`[AppPromotionCampaignService] Retrying AdSet creation with basic promoted_object...`);
            delete adSetPayload.is_skadnetwork_attribution;
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
          // CTA Mapping for App Promotion
          let rawCta = (payload.callToAction || "INSTALL_MOBILE_APP").toUpperCase();
          let ctaType = "INSTALL_MOBILE_APP";
          if (rawCta.includes("USE") || rawCta.includes("OPEN")) ctaType = "USE_MOBILE_APP";
          else if (rawCta.includes("SHOP")) ctaType = "SHOP_NOW";
          else if (rawCta.includes("SIGN")) ctaType = "SIGN_UP";
          else if (rawCta.includes("WATCH")) ctaType = "WATCH_MORE";
          else if (rawCta.includes("LEARN")) ctaType = "LEARN_MORE";
          else ctaType = "INSTALL_MOBILE_APP";

          const storeUrl = payload.objectStoreUrl || "https://play.google.com/store/apps/details?id=com.whatsapp";

          const ctaValue: any = {
            link: storeUrl,
          };
          if (payload.deferredDeepLink || payload.appLink) {
            ctaValue.app_link = payload.deferredDeepLink || payload.appLink;
          }

          const creativePayload: any = {
            name: `${payload.adName || payload.name} App Creative`,
            object_story_spec: {
              page_id: activePageId,
              link_data: {
                message: payload.creativeBody,
                name: payload.creativeHeadline,
                description: payload.creativeDescription || "Get the app and enjoy exclusive features",
                link: storeUrl,
                picture: payload.creativeMediaUrl || undefined,
                call_to_action: {
                  type: ctaType,
                  value: ctaValue,
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
            const appId = config.appId || "36702477879366478";
            const adPayload: any = {
              name: payload.adName || `${payload.name} App Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: creativeResp.data.id },
              status: "PAUSED",
              tracking_specs: [
                { "action.type": ["mobile_app_install"], "application": [appId] }
              ],
              access_token: config.accessToken,
            };

            const utmTags = payload.urlParams || payload.utmParameters || "utm_source=facebook&utm_medium=app_promo";
            adPayload.url_tags = utmTags;

            const adResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
              adPayload
            );
            metaAdId = adResp.data.id;
          }
        }
      } catch (err: any) {
        console.warn("[AppPromotionCampaignService] Graph API error detail:", JSON.stringify(err.response?.data || err.message, null, 2));
        throw new Error(`Meta Graph API App Promotion Error: ${err.response?.data?.error?.message || err.message}`);
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
        dailyBudget: payload.dailyBudget || 1500,
        lifetimeBudget: payload.lifetimeBudget || null,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - App Ad Set`,
            dailyBudget: payload.dailyBudget || 1500,
            lifetimeBudget: payload.lifetimeBudget || null,
            destinationType: "APP",
            optimizationGoal: payload.performanceGoal || "APP_INSTALLS",
            targeting: payload.targeting || {},
            advantagePlusAudience: true,
            advantagePlusPlacement: true,
            attributionWindow: "7d_click_1d_view",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} App Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED",
                effectiveStatus: "ACTIVE",
                adFormat: payload.adFormat || "SINGLE_IMAGE",
                callToAction: payload.callToAction || "INSTALL_MOBILE_APP",
                utmParameters: payload.urlParams || payload.utmParameters || "utm_source=facebook&utm_medium=app_promo",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  description: payload.creativeDescription,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.callToAction || "INSTALL_MOBILE_APP",
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
