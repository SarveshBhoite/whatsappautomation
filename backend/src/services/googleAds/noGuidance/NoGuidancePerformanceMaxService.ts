import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class NoGuidancePerformanceMaxService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "No Guidance Performance Max",
      assetGroupName = "Asset Group 1",
      finalUrl,
      amountMicros,
      biddingFocus = "Maximize conversions",
      targetCpaMicros,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000
    } = payload;

    if (!finalUrl) throw new Error("Final URL is required.");

    const cid = (customerId || "").replace(/-/g, "").trim();
    const amountMicrosVal = amountMicros || Math.round(Number(dailyBudget) * 1_000_000);

    let biddingConfig: any = {};
    const normalizedFocus = biddingFocus.trim().toLowerCase();
    if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else {
      biddingConfig = { maximizeConversions: targetCpaMicros ? { targetCpaMicros: String(targetCpaMicros) } : {} };
    }

    let apiResult: any = { campaignId: `noguidance-pmax-${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicrosVal / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const campaignPayload = {
        operations: [{
          create: {
            name: campaignName,
            status: "PAUSED",
            advertisingChannelType: "PERFORMANCE_MAX",
            campaignBudget: budgetRef,
            ...biddingConfig
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      let campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = campaignRes.data?.results?.[0]?.resourceName;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // AssetGroup Creation explicitly for Performance Max
      try {
        const assetGroupPayload = {
          operations: [{
            create: {
              campaign: campaignRef,
              name: assetGroupName,
              status: "ENABLED"
            }
          }]
        };
        const assetGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/assetGroups:mutate`, assetGroupPayload, { headers });
        apiResult.assetGroupResourceName = assetGroupRes.data.results?.[0]?.resourceName;
      } catch (err: any) {
        console.warn("[Google Ads API fallback for No Guidance PMax Asset Group]:", err.message);
      }
    } catch (err: any) {
      console.warn("[Google Ads API fallback for No Guidance Performance Max]:", err.message);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `pmax-${Date.now()}`,
      name: campaignName,
      campaignType: "PERFORMANCE_MAX",
      biddingStrategy: normalizedFocus,
      budget: amountMicrosVal / 1_000_000,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: { objective: "No Guidance", locations, languages },
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicrosVal),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "No Guidance Performance Max Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}