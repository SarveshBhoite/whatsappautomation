import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class LeadsVideoService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Leads Video",
      finalUrl = "https://www.example.com",
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      biddingFocus,
      targetCpa,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      businessName = "",
      dailyBudget = 1000,
      budget,
      startDate,
      endDate,
      euPolitical = "NO"
    } = payload;

    if (!finalUrl) throw new Error("Final URL is required.");

    const effectiveBudget = Math.max(Number(dailyBudget || budget || 1000), 416);
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
    const cid = (customerId || "").replace(/-/g, "").trim();

    const finalBiddingStrategy = biddingStrategy || (biddingFocus === "Target CPA" || biddingFocus === "TARGET_CPA" ? "TARGET_CPA" : "MAXIMIZE_CONVERSIONS");

    let biddingConfig: any = {};
    if (finalBiddingStrategy === "TARGET_CPA" && targetCpaMicros) {
      biddingConfig = { targetCpa: { targetCpaMicros: String(targetCpaMicros) } };
    } else {
      biddingConfig = { maximizeConversions: {} };
    }

    let apiResult: any = { campaignId: `leads-video-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const euPoliticalValue = (payload.euPolitical === "YES" || payload.euPoliticalAds === "YES")
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
            ...(startDate ? { startDateTime: `${String(startDate).split("T")[0]} 00:00:00` } : {}),
            ...(endDate ? { endDateTime: `${String(endDate).split("T")[0]} 23:59:59` } : {}),
            ...biddingConfig
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
        console.warn("[Google Ads API fallback for Leads Video Ad Group]:", err.message);
      }

      // 3. Create Video Ad (Demand Gen multi-asset ad in Google Ads v24)
      const createdAssets = {
        marketingImages: [] as string[],
        squareMarketingImages: [] as string[],
        logoImages: [] as string[]
      };

      const toImageKitTransform = (url: string, transform: string) => {
        if (!url) return url;
        if (url.includes("ik.imagekit.io")) {
          const parts = url.split("ik.imagekit.io/");
          if (parts.length === 2) {
            const endpointAndRest = parts[1];
            const subParts = endpointAndRest.split("/");
            const endpoint = subParts[0];
            const rest = subParts.slice(1).join("/");
            return `https://ik.imagekit.io/${endpoint}/${transform}/${rest}`;
          }
        }
        return url;
      };

      // Upload marketing images (Landscape 1.91:1 and Square 1:1)
      for (const img of (images || [])) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
        if (!raw) continue;

        const landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
        const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `Vid_Land_${Date.now()}`, landscapeUrl);
        if (landscapeRef && !createdAssets.marketingImages.includes(landscapeRef)) {
          createdAssets.marketingImages.push(landscapeRef);
        }

        const squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
        const squareRef = await this.uploadImageAsset(organizationId, customerId, `Vid_Sq_${Date.now()}`, squareUrl);
        if (squareRef && !createdAssets.squareMarketingImages.includes(squareRef)) {
          createdAssets.squareMarketingImages.push(squareRef);
        }
      }

      // Upload logos (Square 1:1)
      for (const logo of (logos || [])) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || "";
        if (!raw) continue;

        const logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `Vid_Logo_${Date.now()}`, logoUrl);
        if (logoRef && !createdAssets.logoImages.includes(logoRef)) {
          createdAssets.logoImages.push(logoRef);
        }
      }

      if (createdAssets.squareMarketingImages.length > 0 && createdAssets.logoImages.length === 0) {
        createdAssets.logoImages.push(createdAssets.squareMarketingImages[0]);
      }
      if (createdAssets.marketingImages.length === 0 && createdAssets.squareMarketingImages.length > 0) {
        createdAssets.marketingImages.push(createdAssets.squareMarketingImages[0]);
      }

      if (createdAssets.marketingImages.length > 0 && createdAssets.logoImages.length > 0 && apiResult.adGroupResourceName) {
        const cleanedHeadlines = (headlines || [])
          .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 40))
          .filter((text: string) => text.length > 0);
        
        const safeHeadlines = (cleanedHeadlines.length > 0 ? cleanedHeadlines : ["Quality Leads and Services"])
          .slice(0, 5)
          .map((text: string) => ({ text }));

        const cleanedDescriptions = (descriptions || [])
          .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
          .filter((text: string) => text.length > 0);

        const safeDescriptions = (cleanedDescriptions.length > 0 ? cleanedDescriptions : ["Get in touch with us today for personalized solutions."])
          .slice(0, 5)
          .map((text: string) => ({ text }));

        const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName || "My Business", 25) || "My Business";

        const videoAd = {
          demandGenMultiAssetAd: {
            headlines: safeHeadlines,
            descriptions: safeDescriptions,
            marketingImages: createdAssets.marketingImages.map((asset: string) => ({ asset })),
            squareMarketingImages: createdAssets.squareMarketingImages.map((asset: string) => ({ asset })),
            logoImages: createdAssets.logoImages.map((asset: string) => ({ asset })),
            businessName: safeBusinessName
          },
          finalUrls: [finalUrl]
        };

        const adGroupAdPayload = {
          operations: [
            {
              create: {
                adGroup: apiResult.adGroupResourceName,
                status: "ENABLED",
                ad: videoAd
              }
            }
          ]
        };

        try {
          const adGroupAdRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
          apiResult.adGroupAdResourceName = adGroupAdRes.data.results?.[0]?.resourceName;
        } catch (adErr: any) {
          console.warn("[Google Ads API fallback for Leads Video AdGroupAd]:", adErr?.response?.data || adErr.message);
        }
      }

    } catch (apiErr: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      console.error("[Google Ads API Error for Leads Video]:", formatted);
      throw new Error(formatted);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `video-${Date.now()}`,
      name: campaignName,
      campaignType: "VIDEO",
      biddingStrategy: finalBiddingStrategy,
      budget: Number(effectiveBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: {
        objective: "Leads",
        locations,
        languages,
        channels: payload.channels || [],
        audience: payload.audience || null,
        brandGuidelines: {
          mainBrandColor: payload.brandGuidelines?.mainBrandColor || null,
          accentBrandColor: payload.brandGuidelines?.accentBrandColor || null,
          brandFont: payload.brandGuidelines?.brandFont || null
        },
        deviceTargeting: payload.deviceTargeting || "ALL",
        adSchedule: payload.adSchedule || []
      },
      advertisingChannelType: "VIDEO",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Leads Video Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}