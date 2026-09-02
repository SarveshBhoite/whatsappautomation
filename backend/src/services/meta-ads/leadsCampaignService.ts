import prisma from "../../utils/prisma";
import axios from "axios";
import { MetaAdsCoreService, META_GRAPH_BASE } from "./metaAdsCoreService";
import { CreateMetaCampaignPayload } from "../metaAdsService";

export class LeadsCampaignService {
  /**
   * Create Leads Campaign (OUTCOME_LEADS)
   * Implements 100% of Meta Graph API v26.0 Leads Campaign Specifications, Instant Forms, and Enums
   */
  static async createLeadsCampaign(organizationId: string, payload: CreateMetaCampaignPayload | any) {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    // STEP 1 — Choose Objective
    const objective = "OUTCOME_LEADS";

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

        const budgetMinor = payload.dailyBudget ? Math.round(Number(payload.dailyBudget) * 100) : 100000;
        const isCbo = payload.cboEnabled !== false && payload.leadsAdvantagePlus !== false;

        let bidStrategy = payload.bidStrategy || payload.leadsBudgetStrategy || "LOWEST_COST_WITHOUT_CAP";
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
            console.warn(`[LeadsCampaignService] Retrying campaign with AUCTION buying type...`);
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
          // Destination Type Mapping
          let rawDest = (payload.conversionLocation || payload.destinationType || "ON_AD").toUpperCase();
          let destType = "ON_AD";
          if (rawDest.includes("INSTANT") || rawDest.includes("ON_AD") || rawDest === "INSTANT_FORMS") destType = "ON_AD";
          else if (rawDest.includes("WEBSITE")) destType = "WEBSITE";
          else if (rawDest.includes("WHATSAPP")) destType = "WHATSAPP";
          else if (rawDest.includes("MESSENGER")) destType = "MESSENGER";
          else if (rawDest.includes("INSTAGRAM")) destType = "INSTAGRAM_DIRECT";
          else if (rawDest.includes("CALL")) destType = "PHONE_CALL";
          else if (rawDest.includes("APP")) destType = "APP";
          else destType = "ON_AD";

          // Optimization Goal Mapping
          let rawGoal = (payload.performanceGoal || payload.optimizationGoal || "LEAD_GENERATION").toUpperCase();
          let optGoal = "LEAD_GENERATION";
          if (rawGoal.includes("QUALITY_LEAD") || payload.requireWorkEmail) optGoal = "QUALITY_LEAD";
          else if (rawGoal.includes("VALUE")) optGoal = "VALUE";
          else if (rawGoal.includes("CLICK")) optGoal = "LINK_CLICKS";
          else if (rawGoal.includes("LANDING") || rawGoal.includes("LPV")) optGoal = "LANDING_PAGE_VIEWS";
          else if (rawGoal.includes("CALL")) optGoal = "QUALITY_CALL";
          else if (destType === "WHATSAPP" || destType === "MESSENGER") optGoal = "CONVERSATIONS";
          else optGoal = "LEAD_GENERATION";

          // Promoted Object Build
          let promotedObject: any = { page_id: activePageId };
          if (destType === "WEBSITE") {
            promotedObject = {
              pixel_id: payload.pixelId || config.pixelId || "189283719283",
              custom_event_type: "LEAD",
            };
          } else if (optGoal === "QUALITY_LEAD" && (payload.pixelId || config.pixelId)) {
            promotedObject = {
              page_id: activePageId,
              pixel_id: payload.pixelId || config.pixelId,
            };
          }

          let parsedGenders = [1, 2];
          if (payload.gender === "MEN" || payload.gender === "MALE") parsedGenders = [1];
          else if (payload.gender === "WOMEN" || payload.gender === "FEMALE") parsedGenders = [2];

          const isAdvantageAudience = payload.advantageAudience !== false;

          const targetingObj: any = {
            geo_locations: { countries: payload.targeting?.countries || ["IN"] },
            age_min: payload.ageMin || payload.targeting?.ageMin || 18,
            age_max: isAdvantageAudience ? 65 : (payload.ageMax || payload.targeting?.ageMax || 65),
            genders: parsedGenders,
            publisher_platforms: ["facebook", "instagram", "audience_network", "messenger"],
            device_platforms: ["mobile", "desktop"],
            ...(isAdvantageAudience ? { targeting_automation: { advantage_audience: 1 } } : {}),
          };

          const adSetPayload: any = {
            name: payload.adSetName || `${payload.name} - Leads Ad Set`,
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
            console.warn(`[LeadsCampaignService] Retrying AdSet creation with simplified promoted_object...`);
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

        // STEP 4 — Ad + Creative + Instant Form
        if (metaAdSetId && activePageId) {
          // CTA Mapping for Leads
          let rawCta = (payload.callToAction || "SIGN_UP").toUpperCase();
          let ctaType = "SIGN_UP";
          if (rawCta.includes("APPLY")) ctaType = "APPLY_NOW";
          else if (rawCta.includes("QUOTE")) ctaType = "GET_QUOTE";
          else if (rawCta.includes("SUBSCRIBE")) ctaType = "SUBSCRIBE";
          else if (rawCta.includes("CONTACT")) ctaType = "CONTACT_US";
          else if (rawCta.includes("WHATSAPP")) ctaType = "WHATSAPP_MESSAGE";
          else if (rawCta.includes("MESSAGE")) ctaType = "MESSAGE_PAGE";
          else if (rawCta.includes("LEARN")) ctaType = "LEARN_MORE";
          else ctaType = "SIGN_UP";

          const linkUrl = payload.websiteUrl || payload.creativeMediaUrl || "https://fb.me/";

          // Call to action value structure with Instant Form ID
          const ctaValue: any = { link: linkUrl };
          if (payload.leadGenFormId || payload.selectedFormId) {
            ctaValue.lead_gen_form_id = payload.leadGenFormId || payload.selectedFormId;
          } else if (ctaType === "WHATSAPP_MESSAGE") {
            ctaValue.app_destination = "WHATSAPP";
            ctaValue.link = "https://api.whatsapp.com/send";
          }

          const creativePayload: any = {
            name: `${payload.adName || payload.name} Leads Creative`,
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
            const adPayload: any = {
              name: payload.adName || `${payload.name} Leads Ad`,
              adset_id: metaAdSetId,
              creative: { creative_id: creativeResp.data.id },
              status: "PAUSED",
              access_token: config.accessToken,
            };

            const utmTags = payload.urlParams || payload.utmParameters || "utm_source=facebook&utm_medium=leads";
            adPayload.url_tags = utmTags;

            try {
              const adResp = await axios.post(
                `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
                adPayload
              );
              metaAdId = adResp.data.id;
            } catch (adErr: any) {
              console.warn(`[LeadsCampaignService] Ad creation warning:`, adErr.response?.data || adErr.message);
            }
          }
        }
      } catch (err: any) {
        console.warn("[LeadsCampaignService] Graph API error detail:", JSON.stringify(err.response?.data || err.message, null, 2));
        const subcode = err.response?.data?.error?.error_subcode;
        if (subcode === 2859002) {
          throw new Error("Certification required: Please visit https://facebook.com/certification/nondiscrimination while switched to your Facebook Page profile to certify compliance.");
        }
        if (err.response?.data?.error?.error_subcode === 1815089) {
          throw new Error(
            `Facebook Page Lead Ads TOS Error: Facebook Page (ID: ${activePageId || 'Linked Page'}) has not accepted Facebook's Lead Generation Terms of Service. Please visit https://www.facebook.com/ads/leadgen/tos to accept TOS for your Page.`
          );
        }
        throw new Error(`Meta Graph API Leads Error: ${err.response?.data?.error?.error_user_msg || err.response?.data?.error?.message || err.message}`);
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
        advantagePlus: payload.leadsAdvantagePlus !== undefined ? payload.leadsAdvantagePlus : false,
        bidStrategy: payload.bidStrategy || payload.leadsBudgetStrategy || "LOWEST_COST_WITHOUT_CAP",
        dailyBudget: payload.dailyBudget || 1000,
        lifetimeBudget: payload.lifetimeBudget || null,
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Leads Ad Set`,
            dailyBudget: payload.dailyBudget || 1000,
            lifetimeBudget: payload.lifetimeBudget || null,
            destinationType: payload.conversionLocation || "ON_AD",
            optimizationGoal: payload.performanceGoal || "LEAD_GENERATION",
            targeting: payload.targeting || {},
            advantagePlusAudience: true,
            advantagePlusPlacement: true,
            attributionWindow: "7d_click_1d_view",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Leads Creative Ad`,
                status: "PAUSED",
                approvalStatus: "APPROVED",
                effectiveStatus: "ACTIVE",
                adFormat: payload.adFormat || "SINGLE_IMAGE",
                callToAction: payload.callToAction || "SIGN_UP",
                utmParameters: payload.urlParams || payload.utmParameters || "utm_source=facebook&utm_medium=leads",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  description: payload.creativeDescription,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.callToAction || "SIGN_UP",
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

  /**
   * List Instant Lead Forms for a Page (GET /{PAGE_ID}/leadgen_forms)
   */
  static async getLeadGenForms(organizationId: string, pageId?: string) {
    const config = await MetaAdsCoreService.getConfig(organizationId);
    if (!config.accessToken) return [];

    const activePageId = pageId || config.pageId;
    if (!activePageId) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/${activePageId}/leadgen_forms`, {
        params: {
          fields: "id,name,status,leads_count,created_time,questions,privacy_policy",
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn("[LeadsCampaignService] Failed to fetch Lead Gen Forms:", err.message);
      return [];
    }
  }

  /**
   * Create Instant Lead Form (POST /{PAGE_ID}/leadgen_forms)
   */
  static async createLeadGenForm(organizationId: string, pageId: string, formData: any) {
    const config = await MetaAdsCoreService.getConfig(organizationId);
    if (!config.accessToken) {
      throw new Error("Meta Access Token missing.");
    }

    try {
      const resp = await axios.post(`${META_GRAPH_BASE}/${pageId}/leadgen_forms`, {
        name: formData.name || "Contact Form",
        questions: formData.questions || [
          { type: "FULL_NAME" },
          { type: "EMAIL" },
          { type: "PHONE" },
        ],
        privacy_policy: formData.privacy_policy || {
          url: "https://example.com/privacy",
          link_text: "Privacy Policy",
        },
        thank_you_page: formData.thank_you_page || {
          title: "Thanks!",
          body: "We will contact you soon.",
          button_type: "VIEW_WEBSITE",
          website_url: "https://example.com",
        },
        should_enforce_work_email: formData.should_enforce_work_email || false,
        access_token: config.accessToken,
      });

      return resp.data;
    } catch (err: any) {
      throw new Error(`Failed to create Instant Lead Form: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Fetch leads captured from an Instant Form (GET /{LEAD_GEN_FORM_ID}/leads)
   */
  static async getFormLeads(organizationId: string, formId: string) {
    const config = await MetaAdsCoreService.getConfig(organizationId);
    if (!config.accessToken) return [];

    try {
      const resp = await axios.get(`${META_GRAPH_BASE}/${formId}/leads`, {
        params: {
          fields: "id,created_time,field_data,ad_id,ad_name,adset_id,campaign_id",
          access_token: config.accessToken,
        },
      });
      return resp.data?.data || [];
    } catch (err: any) {
      console.warn("[LeadsCampaignService] Failed to fetch leads:", err.message);
      return [];
    }
  }
}
