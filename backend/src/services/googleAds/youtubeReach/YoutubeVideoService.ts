import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import { YouTubeService } from "../../youtubeService";
import axios from "axios";

export class YoutubeVideoService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    if (organizationId) {
      const ytStatus = await YouTubeService.getOrganizationConnectionStatus(organizationId);
      if (!ytStatus.isConnected) {
        throw new Error("YouTube account is not authenticated for this organization. Please connect YouTube before launching a Video campaign.");
      }
    }

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
      videos = [],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000,
      budget,
      startDate,
      endDate,
      keywords = [],
      searchThemes = [],
      audienceSignal,
      audienceSignals = [],
      adSchedule = [],
      deviceTargeting = "ALL",
      devices = [],
      brandFont,
      mainBrandColor,
      accentBrandColor,
      brandGuidelines,
      channels = ["YouTube Shorts", "YouTube In-feed", "Discover", "Gmail"],
      conversionGoals
    } = payload;

    const allVideoList = [...(videos || []), ...(youtubeVideos || [])];
    const resolvedVideoUrls: string[] = allVideoList.map((v: any) => {
      if (typeof v === "string") return v.trim();
      return v?.url || v?.videoId || v?.asset || "";
    }).filter(Boolean);

    console.log(`\n==================== 🎬 [YOUTUBE VIDEO CAMPAIGN LAUNCH] ====================`);
    console.log(`Campaign Name:        ${campaignName}`);
    console.log(`Customer ID:          ${customerId}`);
    console.log(`Targeting Channels:   ${channels.join(", ")}`);
    console.log(`🎬 YouTube Video Links (${resolvedVideoUrls.length}):`);
    if (resolvedVideoUrls.length > 0) {
      resolvedVideoUrls.forEach((url, i) => console.log(`   [${i + 1}] ${url}`));
    } else {
      console.log(`   ⚠️ No direct YouTube video links provided in payload.`);
    }
    console.log(`🎨 Brand Guidelines:`);
    console.log(`   • Main Color:   ${mainBrandColor || brandGuidelines?.mainColor || "Default (#3b82f6)"}`);
    console.log(`   • Accent Color: ${accentBrandColor || brandGuidelines?.accentColor || "Default (#10b981)"}`);
    console.log(`   • Font:         ${brandFont || brandGuidelines?.font || "Any font"}`);
    console.log(`📱 Device Targeting:   ${deviceTargeting}`);
    console.log(`⏰ Ad Schedule:        ${Array.isArray(adSchedule) && adSchedule.length > 0 ? JSON.stringify(adSchedule) : "24/7 All days"}`);
    console.log(`🔑 Keywords (${keywords.length}):     ${keywords.join(", ") || "None"}`);
    console.log(`🎯 Search Themes (${searchThemes.length}): ${searchThemes.join(", ") || "None"}`);
    console.log(`========================================================================\n`);

    const effectiveDailyBudget = Number(dailyBudget !== undefined && dailyBudget !== "" ? dailyBudget : budget || 1000);
    const amountMicros = Math.round(effectiveDailyBudget * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
    const cid = (customerId || "").replace(/-/g, "").trim();

    // Attempt to upload/link YouTube Video Assets to Google Ads account
    const uploadedAssetRefs: string[] = [];
    for (const vUrl of resolvedVideoUrls) {
      try {
        const assetRef = await this.uploadYouTubeVideoAsset(organizationId, cid, vUrl);
        if (assetRef) {
          uploadedAssetRefs.push(assetRef);
          console.log(`[YouTubeVideoService] Successfully linked YouTube Video asset to Google Ads: ${assetRef} (${vUrl})`);
        }
      } catch (assetErr: any) {
        console.warn(`[YouTubeVideoService] Notice linking video asset "${vUrl}":`, assetErr.message);
      }
    }

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
      linkedVideoAssets: uploadedAssetRefs,
      notice: "Video campaigns in Google Ads API are currently supported for reporting, video asset linking, and CRM planning. To publish responsive video ads directly via the API, Demand Gen Video is also enabled."
    };

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId,
      name: campaignName,
      campaignType: "VIDEO",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS",
      budget: Number(effectiveDailyBudget),
      budgetResourceName: null,
      status: "PAUSED",
      startDate: startDate ? new Date(String(startDate).split("T")[0]) : null,
      endDate: endDate ? new Date(String(endDate).split("T")[0]) : null,
      finalUrl,
      headlines,
      descriptions,
      keywords,
      searchThemes,
      audienceSignal: audienceSignal ? (typeof audienceSignal === "object" ? JSON.stringify(audienceSignal) : String(audienceSignal)) : null,
      adSchedule,
      geoTargets: {
        objective: "YouTube Reach, Views & Engagements",
        locations,
        languages,
        channels,
        audience: audienceSignal || (audienceSignals.length > 0 ? audienceSignals[0] : null),
        brandGuidelines: {
          mainBrandColor: mainBrandColor || brandGuidelines?.mainColor || null,
          accentBrandColor: accentBrandColor || brandGuidelines?.accentColor || null,
          brandFont: brandFont || brandGuidelines?.font || null
        },
        deviceTargeting,
        devices,
        adSchedule,
        videoUrls: resolvedVideoUrls,
        conversionGoals: conversionGoals || []
      },
      advertisingChannelType: "VIDEO",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "YouTube Video Campaign saved and video links registered successfully",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}