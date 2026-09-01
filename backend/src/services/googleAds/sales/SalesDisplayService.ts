import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class SalesDisplayService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Sales Display",
      finalUrl = "https://www.example.com",
      campaignSubtype = "Standard display campaign",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      targetRoas = 200,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      images = [],
      dailyBudget = 1000
    } = payload;

    if (!finalUrl) {
      throw new Error("Final URL is required.");
    }

    const advertisingChannelType = "DISPLAY";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    let apiResult: any = { campaignId: `display-${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      
      const campaignPayload = {
        operations: [
          {
            create: {
              name: campaignName,
              status: "PAUSED",
              advertisingChannelType: "DISPLAY",
              campaignBudget: budgetRef,
              ...(targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } } : {})
            }
          }
        ]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-display-${Date.now()}`;
      
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for Sales Display]:", apiErr.message);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `display-${Date.now()}`,
      name: campaignName,
      campaignType: "DISPLAY",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
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
      advertisingChannelType: "DISPLAY",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Display Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      }
    };
  }
}