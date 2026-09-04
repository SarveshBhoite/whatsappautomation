import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class NoGuidanceShoppingService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "No Guidance Shopping",
      merchantCenterId,
      salesCountry = "IN",
      feedLabel,
      locations = ["India"],
      targetRoas = 200,
      dailyBudget = 1000,
      budget,
      euPolitical = "NO",
      shoppingSetting
    } = payload;

    const effectiveBudget = Number(dailyBudget || budget || 1000);
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const cid = (customerId || "").replace(/-/g, "").trim();

    const mId = merchantCenterId || shoppingSetting?.merchantId;
    const country = salesCountry || shoppingSetting?.salesCountry || "IN";
    const label = feedLabel || shoppingSetting?.feedLabel || country;

    let apiResult: any = { campaignId: `noguidance-shopping-${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      
      let biddingConfig: any = {};
      const targetRoasRatio = targetRoas ? Number(targetRoas) / 100 : 2.0;

      if (payload.biddingStrategy === "TARGET_ROAS" || payload.biddingFocus === "Target ROAS" || (targetRoas && Number(targetRoas) > 0 && payload.biddingStrategy !== "MANUAL_CPC" && payload.biddingStrategy !== "MAXIMIZE_CLICKS")) {
        biddingConfig = {
          targetRoas: {
            targetRoas: targetRoasRatio
          }
        };
      } else if (payload.biddingStrategy === "MAXIMIZE_CLICKS") {
        biddingConfig = {
          maximizeClicks: payload.maxCpcLimit ? { cpcBidCeilingMicros: String(Math.round(Number(payload.maxCpcLimit) * 1_000_000)) } : {}
        };
      } else if (payload.biddingStrategy === "MANUAL_CPC") {
        biddingConfig = {
          manualCpc: {
            enhancedCpcEnabled: false
          }
        };
      } else {
        biddingConfig = {
          maximizeConversionValue: {}
        };
      }

      const baseCampaignObj: any = {
        name: campaignName,
        status: "PAUSED",
        advertisingChannelType: "SHOPPING",
        campaignBudget: budgetRef,
        containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        shoppingSetting: {
          merchantId: mId ? String(mId) : "5840531233",
          campaignPriority: 0,
          feedLabel: label
        },
        ...biddingConfig
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      let res;
      try {
        const campaignPayload = {
          operations: [{ create: baseCampaignObj }]
        };
        res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME")) {
          const uniqueName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          baseCampaignObj.name = uniqueName;
          const retryPayload = {
            operations: [{ create: baseCampaignObj }]
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
      console.error("[Google Ads API Error for No Guidance Shopping]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
      console.error("[Google Ads API Raw Error Data]:", JSON.stringify(apiErr?.response?.data || apiErr.message, null, 2));
      throw new Error(GoogleAdsBaseService.formatGoogleAdsError(apiErr));
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
      geoTargets: { objective: "No Guidance", locations },
      advertisingChannelType: "SHOPPING",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "No Guidance Shopping Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}