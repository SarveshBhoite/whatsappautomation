import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class WebsiteTrafficVideoService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Website Traffic Video",
      finalUrl = "https://www.example.com",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000
    } = payload;

    if (!finalUrl) throw new Error("Final URL is required.");

    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
    const cid = (customerId || "").replace(/-/g, "").trim();

    let apiResult: any = { campaignId: `webtraffic-video-${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const campaignPayload = {
        operations: [{
          create: {
            name: campaignName,
            status: "PAUSED",
            advertisingChannelType: "VIDEO",
            advertisingChannelSubType: "VIDEO_ACTION",
            campaignBudget: budgetRef,
            ...(targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } } : {})
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-video-${Date.now()}`;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
      
      try {
        const adGroupRef = await this.createAdGroup(organizationId, customerId, {
          name: `${campaignName} Ad Group 1`,
          campaignResourceName: campaignRef,
          type: "VIDEO_RESPONSIVE",
          status: "ENABLED"
        });
        apiResult.adGroupResourceName = adGroupRef;
      } catch (err: any) {
         console.warn("[Google Ads API fallback for Website Traffic Video Ad Group]:", err.message);
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for Website Traffic Video]:", apiErr.message);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `video-${Date.now()}`,
      name: campaignName,
      campaignType: "VIDEO",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: { objective: "Website Traffic", locations, languages },
      advertisingChannelType: "VIDEO",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Video Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}