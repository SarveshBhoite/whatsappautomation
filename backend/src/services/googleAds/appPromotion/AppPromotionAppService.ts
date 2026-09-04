import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class AppPromotionAppService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "App promotion – App 1",
      platform = "ANDROID",
      appId = "com.hubmate.app",
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      targetCpa = 25,
      dailyBudget = 1000
    } = payload;

    if (!headlines || headlines.length === 0 || !headlines[0]) {
      throw new Error("At least 1 headline is required.");
    }
    if (!descriptions || descriptions.length === 0 || !descriptions[0]) {
      throw new Error("At least 1 description is required.");
    }

    const appStore = platform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE";
    const biddingStrategyGoalType = "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = Math.round(Number(targetCpa) * 1_000_000);

    let apiResult: any = { campaignId: `app-cmp-${Date.now()}`, budgetResourceName: `customers/${customerId}/campaignBudgets/${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignObj: any = {
        name: campaignName,
        status: "PAUSED",
        advertisingChannelType: "MULTI_CHANNEL",
        advertisingChannelSubType: "APP_CAMPAIGN",
        appCampaignSetting: {
          appId: appId || "com.hubmate.app",
          appStore: appStore,
          biddingStrategyGoalType
        },
        targetCpa: {
          targetCpaMicros: String(targetCpaMicros)
        },
        containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        campaignBudget: budgetRef
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      let res;
      try {
        const campaignPayload = {
          operations: [{ create: campaignObj }]
        };
        res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME")) {
          const uniqueName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          campaignObj.name = uniqueName;
          const retryPayload = {
            operations: [{ create: campaignObj }]
          };
          res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, retryPayload, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = res.data?.results?.[0]?.resourceName;
      if (campaignRef) {
        apiResult.campaignResourceName = campaignRef;
        apiResult.campaignId = campaignRef.split("/").pop();
      }
    } catch (apiErr: any) {
      console.error("[Google Ads API Error for App Promotion]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
      console.error("[Google Ads API Raw Error Data]:", JSON.stringify(apiErr?.response?.data || apiErr.message, null, 2));
      throw new Error(GoogleAdsBaseService.formatGoogleAdsError(apiErr));
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `app-${Date.now()}`,
      name: campaignName,
      campaignType: "MULTI_CHANNEL",
      biddingStrategy: biddingStrategyGoalType,
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      headlines,
      descriptions,
      finalUrl: `https://play.google.com/store/apps/details?id=${appId}`,
      geoTargets: {
        locations,
        languages,
        objective: "App Promotion"
      },
      advertisingChannelType: "MULTI_CHANNEL",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "App Promotion Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      },
      backendMapping: {
        app_store: appStore,
        app_id: appId,
        "CampaignBudget.amount_micros": amountMicros
      }
    };
  }
}