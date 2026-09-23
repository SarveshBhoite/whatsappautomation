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

    let apiResult: any = { 
      campaignId: `crm-video-${Date.now()}`,
      isCrmPlanningOnly: true,
      notice: "Video campaigns in Google Ads API are currently supported for reporting and CRM planning. To publish video ads directly via the API, use Demand Gen Video."
    };

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId,
      name: campaignName,
      campaignType: "VIDEO",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
      budgetResourceName: null,
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
      message: "YouTube Video Campaign saved to CRM planning (API publishing is supported via Demand Gen Video)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}