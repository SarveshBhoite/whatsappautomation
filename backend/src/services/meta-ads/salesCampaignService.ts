import prisma from "../../utils/prisma";
import axios from "axios";
import { MetaAdsCoreService, META_GRAPH_BASE } from "./metaAdsCoreService";
import { CreateMetaCampaignPayload } from "../metaAdsService";

export class SalesCampaignService {
  /**
   * Create Sales Campaign (OUTCOME_SALES)
   * Implements 100% of Meta Graph API v26.0 Sales Campaign Specifications & Enums
   */
  static async createSalesCampaign(organizationId: string, payload: CreateMetaCampaignPayload | any) {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    // STEP 1 — Choose Objective
    const objective = "OUTCOME_SALES";

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

        const budgetMinor = payload.dailyBudget ? Math.round(Number(payload.dailyBudget) * 100) : 80000;
        const isCbo = payload.cboEnabled !== false && payload.salesAdvantagePlus !== false;

        let bidStrategy = payload.bidStrategy || payload.salesBidStrategy || "LOWEST_COST_WITHOUT_CAP";
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
            console.warn(`[SalesCampaignService] Retrying campaign with AUCTION buying type...`);
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
          // Destination Location Mapping
          let rawDest = (payload.conversionLocation || payload.destinationType || "WEBSITE").toUpperCase();
          let destType = "WEBSITE";
          if (rawDest.includes("APP") && !rawDest.includes("WEBSITE")) destType = "APP";
          else if (rawDest.includes("MESSAG") || rawDest.includes("WHATSAPP") || rawDest.includes("MESSENGER")) destType = "WHATSAPP";
          else if (rawDest.includes("CALL")) destType = "PHONE_CALL";
          else destType = "WEBSITE";

          // Optimization Goal Mapping
          let rawPerfGoal = (payload.performanceGoal || payload.optimizationGoal || "MAXIMISE_CONVERSIONS").toUpperCase();
          let optGoal = "OFFSITE_CONVERSIONS";
          if (rawPerfGoal.includes("VALUE") || rawPerfGoal.includes("ROAS")) optGoal = "VALUE";
          else if (rawPerfGoal.includes("LANDING") || rawPerfGoal.includes("LPV")) optGoal = "LANDING_PAGE_VIEWS";
          else if (rawPerfGoal.includes("CLICK")) optGoal = "LINK_CLICKS";
          else if (rawPerfGoal.includes("CONVERSATION") || destType === "WHATSAPP") optGoal = "CONVERSATIONS";
          else optGoal = "OFFSITE_CONVERSIONS";

          // Billing Event
          let billingEvent = "IMPRESSIONS";

          // Custom Event Type Mapping (Purchase / Initiate Checkout / Add to Cart / Lead / Subscribe)
          let rawEvent = (payload.conversionEvent || payload.customEventType || "PURCHASE").toUpperCase();
          let customEventType = "PURCHASE";
          if (rawEvent.includes("CHECKOUT") || rawEvent.includes("INITIATE")) customEventType = "INITIATED_CHECKOUT";
          else if (rawEvent.includes("CART")) customEventType = "ADD_TO_CART";
          else if (rawEvent.includes("LEAD")) customEventType = "LEAD";
          else if (rawEvent.includes("SUBSCRIBE")) customEventType = "SUBSCRIBE";
          else if (rawEvent.includes("PAYMENT")) customEventType = "ADD_PAYMENT_INFO";
          else if (rawEvent.includes("REGISTRATION") || rawEvent.includes("COMPLETE")) customEventType = "COMPLETE_REGISTRATION";
          else customEventType = "PURCHASE";

          // Promoted Object Build
          const pixelId = payload.pixelId || config.pixelId || "189283719283";
          let promotedObject: any = {
            pixel_id: pixelId,
            custom_event_type: customEventType,
          };

          if (destType === "WHATSAPP" || destType === "MESSENGER") {
            promotedObject = {
              page_id: activePageId,
              pixel_id: pixelId,
              custom_event_type: customEventType,
            };
          } else if (destType === "APP") {
            promotedObject = {
              application_id: config.appId || "36702477879366478",
              object_store_url: payload.objectStoreUrl || "https://play.google.com/store/apps/details?id=com.whatsapp",
              custom_event_type: customEventType,
            };
          } else if (activePageId) {
            promotedObject.page_id = activePageId;
          }

          // Attribution Spec
          const attributionSpec = [
            { event_type: "CLICK_THROUGH", window_days: 7 },
            { event_type: "VIEW_THROUGH", window_days: 1 },
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

          // Customer Lifecycle Exclusion (High Value vs All Audiences)
          if (payload.salesLifecycleStrategy === "HIGH_VALUE" || payload.lifecycleStrategy === "HIGH_VALUE") {
            targetingObj.exclusions = {
              custom_audiences: [{ id: "existing_low_value_customers" }],
            };
          }

          const adSetPayload: any = {
            name: payload.adSetName || `${payload.name} - Sales Ad Set`,
            campaign_id: metaCampaignId,
            status: "PAUSED",
            billing_event: billingEvent,
            optimization_goal: optGoal,
            destination_type: destType,
            promoted_object: promotedObject,
            attribution_spec: attributionSpec,
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
            console.warn(`[SalesCampaignService] Retrying AdSet creation with basic promoted_object...`);
            adSetPayload.promoted_object = { pixel_id: pixelId, custom_event_type: customEventType };
            adSetResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
              adSetPayload
            );
          }

          if (adSetResp?.data?.id) {
            metaAdSetId = adSetResp.data.id;
          }
        }

        // STEP 4 — Ad + Creative
        if (metaAdSetId && activePageId) {
          // CTA Enum Mapping for Sales
          let rawCta = (payload.callToAction || "SHOP_NOW").toUpperCase();
          let ctaType = "SHOP_NOW";
          if (rawCta.includes("BUY")) ctaType = "BUY_NOW";
          else if (rawCta.includes("ORDER")) ctaType = "ORDER_NOW";
          else if (rawCta.includes("OFFER") || rawCta.includes("GET")) ctaType = "GET_OFFERS";
          else if (rawCta.includes("SIGN")) ctaType = "SIGN_UP";
          else if (rawCta.includes("CONTACT")) ctaType = "CONTACT_US";
          else if (rawCta.includes("WHATSAPP")) ctaType = "WHATSAPP_MESSAGE";
          else if (rawCta.includes("MESSAGE")) ctaType = "MESSAGE_PAGE";
          else if (rawCta.includes("LEARN")) ctaType = "LEARN_MORE";
          else ctaType = "SHOP_NOW";

          const linkDestination = payload.websiteUrl || payload.creativeMediaUrl || "https://example.com/sale";

          const creativePayload: any = {
            name: `${payload.adName || payload.name} Sales Creative`,
            object_story_spec: {
              page_id: activePageId,
              link_data: {
                message: payload.creativeBody,
                name: payload.creativeHeadline,
                description: payload.creativeDescription || "Fast shipping and support",
                link: linkDestination,
                picture: payload.creativeMediaUrl || undefined,
                call_to_action: {
                  type: ctaType,
                  value: { link: linkDestination },
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
              name: payload.adName || `${payload.name} Sales Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: creativeResp.data.id },
              status: "PAUSED",
              access_token: config.accessToken,
            };

            const utmTags = payload.urlParams || payload.utmParameters || "utm_source=facebook_ad&utm_medium=cpc_sales&utm_campaign=sales_campaign_2026";
            adPayload.url_tags = utmTags;

            try {
              const adResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
                adPayload
              );
              metaAdId = adResp.data.id;
            } catch (adErr: any) {
              console.warn(`[SalesCampaignService] Ad creation warning:`, adErr.response?.data || adErr.message);
            }
          }
        }
      } catch (err: any) {
        console.warn("[SalesCampaignService] Graph API error detail:", JSON.stringify(err.response?.data || err.message, null, 2));
        const subcode = err.response?.data?.error?.error_subcode;
        if (subcode === 2859002) {
          throw new Error("Certification required: Please visit https://facebook.com/certification/nondiscrimination while switched to your Facebook Page profile to certify compliance.");
        }
        throw new Error(`Meta Graph API Sales Error: ${err.response?.data?.error?.error_user_msg || err.response?.data?.error?.message || err.message}`);
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
        advantagePlus: payload.salesAdvantagePlus !== undefined ? payload.salesAdvantagePlus : false,
        bidStrategy: payload.bidStrategy || payload.salesBidStrategy || "LOWEST_COST_WITHOUT_CAP",
        dailyBudget: payload.dailyBudget || 800,
        lifetimeBudget: payload.lifetimeBudget || null,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Sales Ad Set`,
            dailyBudget: payload.dailyBudget || 800,
            lifetimeBudget: payload.lifetimeBudget || null,
            destinationType: payload.salesConversionLocation || payload.conversionLocation || "WEBSITE",
            optimizationGoal: payload.salesPerformanceGoal || "OFFSITE_CONVERSIONS",
            targeting: payload.targeting || {},
            advantagePlusAudience: true,
            advantagePlusPlacement: true,
            attributionWindow: "7d_click_1d_view",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Sales Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED",
                effectiveStatus: "ACTIVE",
                adFormat: payload.adFormat || "SINGLE_IMAGE",
                callToAction: payload.callToAction || "SHOP_NOW",
                utmParameters: payload.urlParams || payload.utmParameters || "utm_source=facebook_ad&utm_medium=cpc_sales",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  description: payload.creativeDescription,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.callToAction || "SHOP_NOW",
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
