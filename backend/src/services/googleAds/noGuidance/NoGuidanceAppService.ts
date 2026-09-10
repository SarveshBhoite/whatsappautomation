// No Guidance App Service - production ready implementation (Google Ads API v24)
import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class NoGuidanceAppService extends GoogleAdsBaseService {
  /**
   * Create a No Guidance App Campaign.
   * Performs strict validation, creates all required Google Ads resources,
   * rolls back on any failure and persists to DB only after success.
   */
  public static async createCampaign(
    organizationId: string,
    customerId: string,
    payload: any
  ) {
    // ---- Validation ----
    if (!organizationId || organizationId === "demo-org-123") {
      throw new Error("Invalid organizationId");
    }
    const cleanCustomerId = (customerId || "").replace(/-/g, "").trim();
    if (!cleanCustomerId) {
      throw new Error("Missing or invalid customerId");
    }

    const {
      campaignName,
      appId,
      appStore,
      dailyBudget,
      targetCpa,
      locations = [],
      languages = [],
      headlines = [],
      descriptions = [],
      startDate,
      endDate,
      euPoliticalAds,
      images,
      youtubeVideoIds,
    } = payload;

    if (!campaignName) throw new Error("campaignName is required");
    if (!appId) throw new Error("appId (package/bundle identifier) is required");
    if (!appStore || !["GOOGLE_APP_STORE", "APPLE_APP_STORE"].includes(appStore)) {
      throw new Error("appStore must be GOOGLE_APP_STORE or APPLE_APP_STORE");
    }
    const budgetMicros = Math.round(Number(dailyBudget) * 1_000_000);
    if (isNaN(budgetMicros) || budgetMicros <= 0) {
      throw new Error("dailyBudget must be a positive number");
    }
    const targetCpaMicros = Math.round(Number(targetCpa) * 1_000_000);
    if (isNaN(targetCpaMicros) || targetCpaMicros <= 0) {
      throw new Error("targetCpa must be a positive number");
    }
    if (!headlines.length) throw new Error("At least one headline is required");
    if (!descriptions.length) throw new Error("At least one description is required");

    const ADS_BASE = "https://googleads.googleapis.com/v24";
    const { headers } = await this.getAdsHeaders(organizationId, cleanCustomerId);
    const createdResources: { name: string; resourceName: string }[] = [];

    try {
      // 1. Campaign Budget
      const budgetPayload = {
        operations: [
          { create: { name: `${campaignName} Budget`, amountMicros: budgetMicros } },
        ],
      };
      const budgetRes = await axios.post(
        `${ADS_BASE}/customers/${cleanCustomerId}/campaignBudgets:mutate`,
        budgetPayload,
        { headers }
      );
      const budgetRef = budgetRes.data.results[0].resourceName;
      createdResources.push({ name: "campaignBudget", resourceName: budgetRef });

      // 2. Campaign
      const campaignPayload = {
        operations: [
          {
            create: {
              name: campaignName,
              status: "PAUSED",
              advertisingChannelType: "MULTI_CHANNEL",
              advertisingChannelSubType: "APP_CAMPAIGN",
              campaignBudget: budgetRef,
              appCampaignSetting: {
                appId,
                appStore,
                biddingStrategyGoalType: "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST",
              },
              targetCpa: { targetCpaMicros: String(targetCpaMicros) },
              startDate: startDate?.replace(/-/g, ""),
              endDate: endDate?.replace(/-/g, ""),
              containsEuPoliticalAdvertising:
                euPoliticalAds === "YES"
                  ? "CONTAINS_EU_POLITICAL_ADVERTISING"
                  : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            },
          },
        ],
      };
      const campaignRes = await axios.post(
        `${ADS_BASE}/customers/${cleanCustomerId}/campaigns:mutate`,
        campaignPayload,
        { headers }
      );
      const campaignRef = campaignRes.data.results[0].resourceName;
      createdResources.push({ name: "campaign", resourceName: campaignRef });

      // 3. Location & Language criteria
      const criteriaOps: any[] = [];
      for (const loc of locations) {
        const geoTargetConstant = await this.resolveGeoTargetConstant(loc);
        criteriaOps.push({ create: { campaign: campaignRef, location: { geoTargetConstant } } });
      }
      for (const lang of languages) {
        const languageConstant = await this.resolveLanguageConstant(lang);
        criteriaOps.push({ create: { campaign: campaignRef, language: { languageConstant } } });
      }
      if (criteriaOps.length) {
        await axios.post(
          `${ADS_BASE}/customers/${cleanCustomerId}/campaignCriteria:mutate`,
          { operations: criteriaOps },
          { headers }
        );
      }

      // 4. Ad Group (no type for app campaigns)
      const adGroupPayload = {
        operations: [
          {
            create: {
              name: `${campaignName} AdGroup`,
              campaign: campaignRef,
              status: "ENABLED",
            },
          },
        ],
      };
      const adGroupRes = await axios.post(
        `${ADS_BASE}/customers/${cleanCustomerId}/adGroups:mutate`,
        adGroupPayload,
        { headers }
      );
      const adGroupRef = adGroupRes.data.results[0].resourceName;
      createdResources.push({ name: "adGroup", resourceName: adGroupRef });

      // 5. Assets (images / YouTube videos)
      const assetRefs: string[] = [];
      if (Array.isArray(images)) {
        for (const img of images) {
          const assetRes = await axios.post(
            `${ADS_BASE}/customers/${cleanCustomerId}/assets:mutate`,
            { operations: [{ create: { imageAsset: { data: img.base64 }, type: "IMAGE" } }] },
            { headers }
          );
          assetRefs.push(assetRes.data.results[0].resourceName);
        }
      }
      if (Array.isArray(youtubeVideoIds)) {
        for (const vid of youtubeVideoIds) {
          const assetRes = await axios.post(
            `${ADS_BASE}/customers/${cleanCustomerId}/assets:mutate`,
            { operations: [{ create: { youtubeVideoAsset: { youtubeVideoId: vid } } }] },
            { headers }
          );
          assetRefs.push(assetRes.data.results[0].resourceName);
        }
      }

      // 6. Ad Group Ad with AppAdInfo
      const appAdInfo: any = {
        headlines: headlines.map((t: string) => ({ text: t })),
        descriptions: descriptions.map((t: string) => ({ text: t })),
      };
      if (assetRefs.length) {
        appAdInfo.images = assetRefs.map((ref) => ({ asset: ref }));
      }
      const adGroupAdPayload = {
        operations: [
          {
            create: {
              adGroup: adGroupRef,
              status: "ENABLED",
              ad: { appAd: appAdInfo },
            },
          },
        ],
      };
      const adGroupAdRes = await axios.post(
        `${ADS_BASE}/customers/${cleanCustomerId}/adGroupAds:mutate`,
        adGroupAdPayload,
        { headers }
      );
      const adGroupAdRef = adGroupAdRes.data.results[0].resourceName;
      createdResources.push({ name: "adGroupAd", resourceName: adGroupAdRef });

      // 7. Persist to DB only after successful Google Ads calls
      const localCampaign = await this.saveCampaignToDatabase({
        organizationId,
        customerId: cleanCustomerId,
        googleAdsCampaignId: campaignRef.split("/").pop(),
        name: campaignName,
        campaignType: "APP_CAMPAIGN",
        biddingStrategy: "TARGET_CPA",
        budget: Number(dailyBudget),
        budgetResourceName: budgetRef,
        status: "PAUSED",
        finalUrl:
          appStore === "GOOGLE_APP_STORE"
            ? `https://play.google.com/store/apps/details?id=${appId}`
            : `https://apps.apple.com/app/id=${appId}`,
        headlines,
        descriptions,
        geoTargets: { locations, languages },
        advertisingChannelType: "MULTI_CHANNEL",
        amountMicros: BigInt(budgetMicros),
        costMicros: BigInt(0),
        impressions: BigInt(0),
        clicks: BigInt(0),
      });

      return {
        message: "No Guidance App Campaign created successfully (Paused)",
        campaign: {
          ...localCampaign,
          amountMicros: Number(localCampaign.amountMicros),
          costMicros: Number(localCampaign.costMicros),
          impressions: Number(localCampaign.impressions),
          clicks: Number(localCampaign.clicks),
        },
        apiResult: { budgetRef, campaignRef, adGroupRef, adGroupAdRef },
      };
    } catch (err: any) {
      console.error("[NoGuidanceAppService] error, initiating rollback", err);
      // Best-effort cleanup of any resources that were created
      for (const res of createdResources.reverse()) {
        try {
          await axios.post(
            `${ADS_BASE}/customers/${cleanCustomerId}/${res.name}s:mutate`,
            { operations: [{ remove: res.resourceName }] },
            { headers }
          );
        } catch (_) {
          /* ignore cleanup errors */
        }
      }
      throw new Error(this.formatGoogleAdsError(err));
    }
  }
}
