import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";
import prisma from "../../../utils/prisma";

export class SalesPerformanceMaxService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Sales Performance Max",
      assetGroupName = "Asset Group 1",
      finalUrl,
      businessName = "",
      dailyBudget, // daily budget
      biddingFocus = "Maximize conversions",
      targetCpaMicros,
      targetRoas,
      startDate,
      endDate,
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      searchThemes = [],
      audienceSignal,
      locations = ["India"],
      languages = ["English"],
      adSchedule,
      euPolitical = "NO",
      trackingTemplate,
      finalUrlSuffix,
      customParameters,
      enableFinalUrlExpansion,
      sitelinks,
      callouts,
      callAsset,
      structuredSnippets,
      promotions,
      prices,
      finalMobileUrls,
      assetGroupTrackingTemplate,
      assetGroupCustomParameters,
      locationTargetingType = "PRESENCE_INTEREST",
      brandGuidelinesEnabled
    } = payload;

    if (!finalUrl) throw new Error("Final URL is required.");

    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);

    const validHeadlines = (headlines || []).filter((h: any) => typeof h === "string" && h.trim());
    if (validHeadlines.length < 3) throw new Error("Performance Max requires at least 3 headlines.");
    const validDescriptions = (descriptions || []).filter((d: any) => typeof d === "string" && d.trim());
    if (validDescriptions.length < 2) throw new Error("Performance Max requires at least 2 descriptions.");

    const cid = (customerId || "").replace(/-/g, "").trim();
    const todayIso = new Date().toISOString().split("T")[0];
    let cleanStartDate = startDate ? startDate.split("T")[0].split(" ")[0] : todayIso;
    if (cleanStartDate < todayIso) cleanStartDate = todayIso;
    const startDateTime = `${cleanStartDate} 00:00:00`;
    let cleanEndDate = endDate ? endDate.split("T")[0].split(" ")[0] : undefined;
    if (cleanEndDate && cleanEndDate < cleanStartDate) cleanEndDate = cleanStartDate;
    const endDateTime = cleanEndDate ? `${cleanEndDate} 23:59:59` : undefined;

    let biddingConfig: any = {};
    const normalizedFocus = biddingFocus.trim().toLowerCase();
    if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else {
      biddingConfig = { maximizeConversions: targetCpaMicros ? { targetCpaMicros: String(targetCpaMicros) } : {} };
    }

    let structuredAudienceSignal: any = undefined;
    if (audienceSignal) {
       // Mock for now based on legacy logic
       structuredAudienceSignal = typeof audienceSignal === "string" ? { resourceName: audienceSignal, type: "AUDIENCE" } : audienceSignal;
    }

    let apiResult: any = { campaignId: `sales-pmax-${Date.now()}` };
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
            advertisingChannelType: "PERFORMANCE_MAX",
            campaignBudget: budgetRef,
            audienceSetting: { useAudienceGrouped: true },
            brandGuidelinesEnabled: brandGuidelinesEnabled ?? false,
            containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            ...(startDateTime ? { startDateTime } : {}),
            ...(endDateTime ? { endDateTime } : {}),
            ...biddingConfig
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      let campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = campaignRes.data?.results?.[0]?.resourceName;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // In a complete implementation, AssetGroup creation would follow here.
    } catch (err: any) {
      console.error(
        "[Google Ads API error for Sales Performance Max]:",
        JSON.stringify(err?.response?.data || err.message, null, 2)
      );
      throw err;
    }
    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `pmax-${Date.now()}`,
      name: campaignName,
      campaignType: "PERFORMANCE_MAX",
      biddingStrategy: normalizedFocus,
      budget: amountMicros / 1_000_000,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines: validHeadlines,
      descriptions: validDescriptions,
      geoTargets: {
        objective: "Sales",
        locations,
        languages
      },
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Performance Max Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      }
    };
  }
}