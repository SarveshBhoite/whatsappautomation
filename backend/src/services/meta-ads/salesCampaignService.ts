import prisma from "../../utils/prisma";
import axios from "axios";
import { MetaAdsCoreService, META_GRAPH_BASE } from "./metaAdsCoreService";
import { CreateMetaCampaignPayload } from "../metaAdsService";

export class SalesCampaignService {
  /**
   * Create Sales Campaign (OUTCOME_SALES)
   */
  static async createSalesCampaign(organizationId: string, payload: CreateMetaCampaignPayload) {
    const config = await MetaAdsCoreService.getConfig(organizationId);

    const formattedAccountId = config.adAccountId
      ? (config.adAccountId.startsWith("act_") ? config.adAccountId : `act_${config.adAccountId}`)
      : "act_demo_123456789";

    let metaCampaignId: string | null = null;
    let metaAdSetId: string | null = null;
    let metaAdId: string | null = null;

    const objective = "OUTCOME_SALES";

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
        let buyingType = (payload.buyingType || "AUCTION").toUpperCase();
        if (buyingType === "RESERVATION") buyingType = "RESERVED";
        if (buyingType !== "AUCTION" && buyingType !== "RESERVED") buyingType = "AUCTION";

        let specialAdCat: string[] = [];
        if (payload.specialAdCategory && payload.specialAdCategory !== "NONE") {
          specialAdCat = [payload.specialAdCategory];
        }

        const budgetMinor = payload.dailyBudget ? Math.round(Number(payload.dailyBudget) * 100) : 50000;
        const isCbo = payload.cboEnabled !== false;

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
          campaignPayload.bid_strategy = payload.bidStrategy || "LOWEST_COST_WITHOUT_CAP";
        }

        const campResp = await axios.post(
          `${META_GRAPH_BASE}/${formattedAccountId}/campaigns`,
          campaignPayload
        );
        metaCampaignId = campResp.data.id;

        if (metaCampaignId) {
          let destType = (payload.conversionLocation || payload.destinationType || "WEBSITE").toUpperCase();
          if (destType === "MESSAGING") destType = "WHATSAPP";

          const adSetPayload: any = {
            name: payload.adSetName || `${payload.name} - Sales Ad Set`,
            campaign_id: metaCampaignId,
            status: "PAUSED",
            billing_event: "IMPRESSIONS",
            optimization_goal: destType === "WHATSAPP" ? "CONVERSATIONS" : "OFFSITE_CONVERSIONS",
            destination_type: destType,
            targeting: {
              geo_locations: { countries: payload.targeting?.countries || ["IN"] },
              age_min: payload.ageMin || 18,
              age_max: payload.ageMax || 65,
              genders: [1, 2],
            },
            access_token: config.accessToken,
          };

          if (!isCbo) {
            adSetPayload.daily_budget = budgetMinor;
          }

          if (payload.pixelId || config.pixelId) {
            adSetPayload.promoted_object = {
              pixel_id: payload.pixelId || config.pixelId,
              custom_event_type: payload.customEventType || "PURCHASE",
            };
          } else if (activePageId) {
            adSetPayload.promoted_object = { page_id: activePageId };
          }

          let adSetResp;
          try {
            adSetResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
              adSetPayload
            );
          } catch (asErr: any) {
            delete adSetPayload.promoted_object;
            adSetResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/adsets`,
              adSetPayload
            );
          }

          metaAdSetId = adSetResp.data?.id || null;
        }

        if (metaAdSetId && activePageId) {
          let ctaType = (payload.callToAction || "SHOP_NOW").toUpperCase();
          if (ctaType.includes("WHATSAPP")) ctaType = "WHATSAPP_MESSAGE";

          const linkUrl = payload.websiteUrl || payload.creativeMediaUrl || "https://example.com";

          const creativeResp = await axios.post(
            `${META_GRAPH_BASE}/${formattedAccountId}/adcreatives`,
            {
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
                    value: { link: linkUrl },
                  },
                },
              },
              access_token: config.accessToken,
            }
          );

          if (creativeResp.data?.id) {
            const adResp = await axios.post(
              `${META_GRAPH_BASE}/${formattedAccountId}/ads`,
              {
                name: payload.adName || `${payload.name} Ad`,
                adset_id: metaAdSetId,
                creative: { creative_id: creativeResp.data.id },
                status: "PAUSED",
                access_token: config.accessToken,
              }
            );
            metaAdId = adResp.data.id;
          }
        }
      } catch (err: any) {
        console.warn("[SalesCampaignService] Graph API error:", err.response?.data?.error?.message || err.message);
        throw new Error(`Meta Graph API Sales Error: ${err.response?.data?.error?.message || err.message}`);
      }
    }

    return prisma.metaAdCampaign.create({
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
        status: "PAUSED",
        effectiveStatus: "PAUSED",
        adSets: {
          create: {
            organizationId,
            adAccountId: formattedAccountId,
            metaAdSetId: metaAdSetId || `meta_adset_${Date.now()}`,
            name: payload.adSetName || `${payload.name} - Sales Ad Set`,
            dailyBudget: payload.dailyBudget || 500,
            destinationType: payload.conversionLocation || "WEBSITE",
            optimizationGoal: "OFFSITE_CONVERSIONS",
            ads: {
              create: {
                organizationId,
                adAccountId: formattedAccountId,
                metaAdId: metaAdId || `meta_ad_${Date.now()}`,
                name: payload.adName || `${payload.name} Creative Ad`,
                status: "PAUSED",
                creative: {
                  headline: payload.creativeHeadline,
                  body: payload.creativeBody,
                  mediaUrl: payload.creativeMediaUrl,
                  callToAction: payload.callToAction || "SHOP_NOW",
                },
              },
            },
          },
        },
      },
      include: { adSets: { include: { ads: true } } },
    });
  }
}
