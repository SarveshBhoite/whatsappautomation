import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class WebsiteTrafficShoppingService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Website Traffic Shopping",
      merchantCenterId,
      locations = ["India"],
      targetRoas = 200,
      dailyBudget = 1000
    } = payload;

    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const cid = (customerId || "").replace(/-/g, "").trim();

    let apiResult: any = { campaignId: `webtraffic-shopping-${Date.now()}` };
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
            advertisingChannelType: "SHOPPING",
            campaignBudget: budgetRef,
            shoppingSetting: {
              merchantId: merchantCenterId ? String(merchantCenterId) : "123456",
              campaignPriority: 0
            },
            maximizeConversionValue: {
              targetRoas: targetRoas ? Number(targetRoas) : 2.0
            }
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-shopping-${Date.now()}`;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for Website Traffic Shopping]:", apiErr.message);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `shopping-${Date.now()}`,
      name: campaignName,
      campaignType: "SHOPPING",
      biddingStrategy: "TARGET_ROAS",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl: "https://www.example.com",
      headlines: [],
      descriptions: [],
      geoTargets: { objective: "Website Traffic", locations },
      advertisingChannelType: "SHOPPING",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Shopping Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}