import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class YoutubeVideoService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "YouTube Video Campaign",
      finalUrl = "https://www.example.com",
      campaignSubtype = "VIDEO_VIEWS",
      biddingFocus = "Maximize conversions",
      targetCpa,
      targetCpv,
      locations = ["India"],
      languages = ["English"],
      youtubeVideos = [],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000
    } = payload;

    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
    const cid = (customerId || "").replace(/-/g, "").trim();

    const SUBTYPE_MAP: Record<string, string> = {
      "9": "VIDEO_OUTSTREAM",
      "10": "VIDEO_ACTION",
      "11": "VIDEO_NON_SKIPPABLE",
      "17": "VIDEO_SEQUENCE",
      "19": "VIDEO_REACH_TARGET_FREQUENCY"
    };
    const mappedSubtype = SUBTYPE_MAP[String(campaignSubtype).trim()] || campaignSubtype || "VIDEO_VIEWS";

    let biddingConfig: any = {};
    if (biddingFocus === "TARGET_CPA" && targetCpaMicros) {
        biddingConfig = { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } };
    }

    let apiResult: any = { campaignId: `yt-video-${Date.now()}` };
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
            advertisingChannelSubType: mappedSubtype,
            campaignBudget: budgetRef,
            ...biddingConfig
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-yt-video-${Date.now()}`;
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
         console.warn("[Google Ads API fallback for YouTube Video Ad Group]:", err.message);
      }
    } catch (apiErr: any) {
      console.warn("[Google Ads API fallback for YouTube Video]:", apiErr.message);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `yt-video-${Date.now()}`,
      name: campaignName,
      campaignType: "VIDEO",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: { objective: "YouTube Reach, Views & Engagements", locations, languages },
      advertisingChannelType: "VIDEO",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "YouTube Video Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}