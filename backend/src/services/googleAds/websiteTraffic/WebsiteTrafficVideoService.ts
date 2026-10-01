import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import { YouTubeService } from "../../youtubeService";
import axios from "axios";

export class WebsiteTrafficVideoService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    if (organizationId) {
      const ytStatus = await YouTubeService.getOrganizationConnectionStatus(organizationId);
      if (!ytStatus.isConnected) {
        throw new Error("YouTube account is not authenticated for this organization. Please connect YouTube before launching a Video campaign.");
      }
    }

    const {
      campaignName = "Website Traffic Video",
      finalUrl = "https://www.example.com",
      campaignSubtype = "VIDEO_ACTION",
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      biddingFocus,
      targetCpa = 25,
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
      euPolitical = "NO",
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
      channels = ["YouTube Shorts", "YouTube In-feed", "Discover", "Gmail"]
    } = payload;

    const allVideoList = [...(videos || []), ...(youtubeVideos || [])];
    const resolvedVideoUrls: string[] = allVideoList.map((v: any) => {
      if (typeof v === "string") return v.trim();
      return v?.url || v?.videoId || v?.asset || "";
    }).filter(Boolean);

    console.log(`\n==================== 🎬 [WEBSITE TRAFFIC VIDEO CAMPAIGN LAUNCH] ====================`);
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
    console.log(`====================================================================================\n`);

    if (!finalUrl) throw new Error("Final URL is required.");

    const rawBudget = dailyBudget !== undefined && dailyBudget !== "" ? dailyBudget : budget;
    const effectiveBudget = Number(rawBudget) || 1000;
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
    const cid = (customerId || "").replace(/-/g, "").trim();

    let apiResult: any = { campaignId: `webtraffic-video-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const euPoliticalValue = (euPolitical === "YES" || payload.euPoliticalAds === "YES")
        ? "CONTAINS_EU_POLITICAL_ADVERTISING"
        : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING";

      const campaignPayload = {
        operations: [{
          create: {
            name: campaignName,
            status: "PAUSED",
            advertisingChannelType: "DEMAND_GEN",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: euPoliticalValue,
            demandGenCampaignSettings: {
              upgradedTargeting: true
            },
            ...(targetCpaMicros ? { targetCpa: { targetCpaMicros: String(targetCpaMicros) } } : { maximizeConversions: {} })
          }
        }]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-video-${Date.now()}`;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
      
      try {
        const adGroupPayload = {
          operations: [{
            create: {
              campaign: campaignRef,
              name: `${campaignName} Ad Group 1`,
              status: "ENABLED"
            }
          }]
        };
        const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
        apiResult.adGroupResourceName = adGroupRes.data?.results?.[0]?.resourceName;
      } catch (err: any) {
         console.warn("[Google Ads API fallback for Website Traffic Video Ad Group]:", err.message);
      }
    } catch (apiErr: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      console.error("[Google Ads API Error for Website Traffic Video]:", formatted);
      throw new Error(formatted);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `video-${Date.now()}`,
      name: campaignName,
      campaignType: "VIDEO",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS",
      budget: Number(effectiveBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
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
        locations,
        languages,
        channels: payload.channels || channels || [],
        audience: payload.audience || audienceSignal || null,
        brandGuidelines: {
          mainBrandColor: mainBrandColor || payload.brandGuidelines?.mainBrandColor || null,
          accentBrandColor: accentBrandColor || payload.brandGuidelines?.accentBrandColor || null,
          brandFont: brandFont || payload.brandGuidelines?.brandFont || null
        },
        deviceTargeting: payload.deviceTargeting || deviceTargeting || "ALL",
        devices: payload.devices || devices || [],
        adSchedule: payload.adSchedule || adSchedule || [],
        videoUrls: resolvedVideoUrls,
        objective: "Website Traffic"
      },
      advertisingChannelType: "VIDEO",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Video Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}