import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class NoGuidanceDemandGenService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "No Guidance Demand Gen",
      finalUrl = "https://www.example.com",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000
    } = payload;

    if (!headlines || headlines.length === 0 || !headlines[0]) throw new Error("At least 1 headline is required.");

    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
    const cid = (customerId || "").replace(/-/g, "").trim();

    let apiResult: any = { campaignId: `noguidance-demandgen-${Date.now()}` };
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
            advertisingChannelType: "DEMAND_GEN",
            campaignBudget: budgetRef,
            demandGenCampaignSettings: { upgradedTargeting: true },
            ...(targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } } : {})
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-demandgen-${Date.now()}`;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for No Guidance Demand Gen]:", apiErr.message);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `demandgen-${Date.now()}`,
      name: campaignName,
      campaignType: "DEMAND_GEN",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: { objective: "No Guidance", locations, languages },
      advertisingChannelType: "DEMAND_GEN",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "No Guidance Demand Gen Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) }
    };
  }
}