import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class SalesVideoService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Sales Video",
      finalUrl = "https://www.example.com",
      campaignSubtype = "VIDEO_ACTION",
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      biddingFocus,
      targetCpa,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      youtubeVideos = [],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      businessName = "",
      dailyBudget = 1000,
      budget,
      startDate,
      endDate,
      euPolitical = "NO"
    } = payload;

    if (!finalUrl) {
      throw new Error("Final URL is required.");
    }

    const effectiveBudget = Math.max(Number(dailyBudget || budget || 1000), 416);
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    const finalBiddingStrategy = biddingStrategy || (biddingFocus === "Target CPA" || biddingFocus === "TARGET_CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS");

    let biddingConfig: any = {};
    if (finalBiddingStrategy === "TARGET_CPA" && targetCpaMicros) {
      biddingConfig = { targetCpa: { targetCpaMicros: String(targetCpaMicros) } };
    } else {
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = (customerId || "").replace(/-/g, "").trim();
    let apiResult: any = { campaignId: `video-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      // 1. Create Campaign Budget
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const euPoliticalValue = (euPolitical === "YES" || payload.euPoliticalAds === "YES")
        ? "CONTAINS_EU_POLITICAL_ADVERTISING"
        : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING";

      // In Google Ads API v24, Sales / Action Video campaigns are created as DEMAND_GEN (or VIDEO_ACTION with DEMAND_GEN channel)
      let effectiveCampaignName = campaignName;
      let res;
      try {
        const campaignPayload = {
          operations: [
            {
              create: {
                name: effectiveCampaignName,
                status: "PAUSED",
                advertisingChannelType: "DEMAND_GEN",
                campaignBudget: budgetRef,
                containsEuPoliticalAdvertising: euPoliticalValue,
                demandGenCampaignSettings: {
                  upgradedTargeting: true
                },
                ...biddingConfig
              }
            }
          ]
        };

        res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME") || errDetails.includes("already assigned")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          const retryPayload = {
            operations: [
              {
                create: {
                  name: effectiveCampaignName,
                  status: "PAUSED",
                  advertisingChannelType: "DEMAND_GEN",
                  campaignBudget: budgetRef,
                  containsEuPoliticalAdvertising: euPoliticalValue,
                  demandGenCampaignSettings: {
                    upgradedTargeting: true
                  },
                  ...biddingConfig
                }
              }
            ]
          };
          res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, retryPayload, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = res.data?.results?.[0]?.resourceName;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // 2. Create Ad Group with channel controls
      try {
        const selectedChannels = {
          youtubeInStream: true,
          youtubeInFeed: true,
          youtubeShorts: true,
          discover: true,
          gmail: true,
          display: true
        };

        const adGroupPayload = {
          operations: [
            {
              create: {
                campaign: campaignRef,
                name: `${effectiveCampaignName} Ad Group 1`,
                status: "ENABLED",
                demandGenAdGroupSettings: {
                  channelControls: {
                    selectedChannels
                  }
                }
              }
            }
          ]
        };
        const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
        const adGroupRef = adGroupRes.data?.results?.[0]?.resourceName;
        apiResult.adGroupResourceName = adGroupRef;
      } catch (adgErr: any) {
        console.warn("[Google Ads API fallback for Sales Video Ad Group]:", adgErr?.response?.data || adgErr.message);
      }

    } catch (apiErr: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      console.error("[Google Ads API Error for Sales Video]:", formatted);
      console.error("[Google Ads API Raw Error Data]:", JSON.stringify(apiErr?.response?.data || apiErr.message, null, 2));
      throw new Error(formatted);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `video-${Date.now()}`,
      name: campaignName,
      campaignType: "VIDEO",
      biddingStrategy: finalBiddingStrategy,
      budget: Number(effectiveBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: {
        locations,
        languages,
        objective: "Sales"
      },
      advertisingChannelType: "VIDEO",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Video Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      },
      apiResult
    };
  }
}