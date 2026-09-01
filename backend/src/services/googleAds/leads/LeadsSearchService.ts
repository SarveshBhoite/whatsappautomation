import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class LeadsSearchService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Leads Search",
      websiteVisitsUrl = "https://www.example.com",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      locations = ["India"],
      languages = ["English"],
      keywords = [],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000,
      euPolitical = "NO"
    } = payload;

    const finalUrl = websiteVisitsUrl;
    if (!headlines || headlines.length === 0 || !headlines[0]) throw new Error("At least 1 headline is required.");

    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
    const cid = (customerId || "").replace(/-/g, "").trim();

    let apiResult: any = { campaignId: `leads-search-${Date.now()}` };
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
            advertisingChannelType: "SEARCH",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            ...(targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } } : {})
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-search-${Date.now()}`;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // Create Ad Group
      try {
        const adGroupRef = await this.createAdGroup(organizationId, customerId, {
          name: `${campaignName} Ad Group 1`,
          campaignResourceName: campaignRef,
          type: "SEARCH_STANDARD",
          status: "ENABLED"
        });
        apiResult.adGroupResourceName = adGroupRef;
      } catch (err: any) {
        if (err?.response?.data) {
          console.error("[Google Ads API Error for Leads Search Ad Group]:", JSON.stringify(err.response.data, null, 2));
        } else {
          console.error("[Leads Search Ad Group API Error]:", err.message);
        }
        throw err;
      }
    } catch (apiErr: any) {
      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error for Leads Search]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Leads Search API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `search-${Date.now()}`,
      name: campaignName,
      campaignType: "SEARCH",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: { objective: "Leads", locations, languages },
      advertisingChannelType: "SEARCH",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Leads Search Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}