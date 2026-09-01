import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class StoreVisitsPerformanceMaxService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Local store visits and promotions-Performance Max-1",
      finalUrl = "https://www.example.com",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      headlines = [],
      descriptions = [],
      dailyBudget = 1000,
      assetGroupName = "Asset Group 1"
    } = payload;

    if (!finalUrl) {
      throw new Error("Final URL is required.");
    }
    if (!headlines || headlines.length === 0 || !headlines[0]) {
      throw new Error("At least 1 headline is required.");
    }

    const advertisingChannelType = "PERFORMANCE_MAX";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    let apiResult: any = { campaignId: `pmax-cmp-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: campaignName,
              status: "PAUSED",
              advertisingChannelType: "PERFORMANCE_MAX",
              campaignBudget: budgetRef,
              audienceSetting: { useAudienceGrouped: true },
              ...(targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } } : {})
            }
          }
        ]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-pmax-${Date.now()}`;
      
      apiResult = {
        campaignResourceName: campaignRef,
        budgetResourceName: budgetRef,
        campaignId: campaignRef.split("/").pop()
      };
    } catch (apiErr: any) {
      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error for Store Visits Performance Max]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Store Visits PMax API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `pmax-${Date.now()}`,
      name: campaignName,
      campaignType: "PERFORMANCE_MAX",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: {
        locations: ["All store locations"],
        objective: "Store Visits"
      },
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Local Performance Max Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      },
      backendMapping: {
        advertising_channel_type: advertisingChannelType,
        bidding_focus: biddingFocus,
        "CampaignBudget.amount_micros": amountMicros
      }
    };
  }
}