import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class NoGuidanceAppService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "No Guidance App",
      appId = "com.example.app",
      appStore = "GOOGLE_APP_STORE",
      dailyBudget = 1000,
      targetCpa = 1.5,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = []
    } = payload;

    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = Math.round(Number(targetCpa) * 1_000_000);
    const cid = (customerId || "").replace(/-/g, "").trim();

    let apiResult: any = { campaignId: `noguidance-app-${Date.now()}` };
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
            advertisingChannelType: "MULTI_CHANNEL",
            advertisingChannelSubType: "APP_CAMPAIGN",
            campaignBudget: budgetRef,
            appCampaignSetting: {
              appId: appId,
              appStore: appStore,
              biddingStrategyGoalType: "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST"
            },
            targetCpa: {
              targetCpaMicros: String(targetCpaMicros)
            },
            containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING"
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-app-${Date.now()}`;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
    } catch (apiErr: any) {
      console.error("[Google Ads API Error for No Guidance App]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
      console.error("[Google Ads API Raw Error Data]:", JSON.stringify(apiErr?.response?.data || apiErr.message, null, 2));
      throw new Error(GoogleAdsBaseService.formatGoogleAdsError(apiErr));
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `app-${Date.now()}`,
      name: campaignName,
      campaignType: "APP_CAMPAIGN",
      biddingStrategy: "TARGET_CPA",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl: "https://play.google.com/store/apps/details?id=" + appId,
      headlines,
      descriptions,
      geoTargets: { objective: "No Guidance", locations, languages },
      advertisingChannelType: "MULTI_CHANNEL",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "No Guidance App Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}