import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class YoutubeDisplayLocalService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "YouTube Display",
      finalUrl = "https://www.example.com",
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      biddingFocus,
      targetCpa,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      businessName = "",
      dailyBudget,
      budget,
      startDate,
      endDate,
      euPolitical = "NO"
    } = payload;

    if (!finalUrl) {
      throw new Error("Final URL is required.");
    }

    const validHeadlines = (headlines || []).filter((h: any) => h && typeof h === "string" && h.trim().length > 0);
    if (validHeadlines.length < 1) {
      validHeadlines.push("Quality Products & Fast Service");
    }

    const validDescriptions = (descriptions || []).filter((d: any) => d && typeof d === "string" && d.trim().length > 0);
    if (validDescriptions.length < 1) {
      validDescriptions.push("Explore our top rated solutions with fast delivery and great support.");
    }

    const effectiveBudget = Math.max(Number(dailyBudget || budget || 1000), 416);
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    const finalBiddingStrategy = biddingStrategy || (biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS");

    let biddingConfig: any = {};
    if (finalBiddingStrategy === "TARGET_ROAS" && targetRoas) {
      biddingConfig = { maximizeConversionValue: { targetRoas: Number(targetRoas) } };
    } else if (finalBiddingStrategy === "TARGET_CPA" && targetCpaMicros) {
      biddingConfig = { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } };
    } else {
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = (customerId || "").replace(/-/g, "").trim();
    let apiResult: any = { campaignId: `yt-display-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      // 1. Create Campaign Budget
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const euPoliticalValue = (euPolitical === "YES" || payload.euPoliticalAds === "YES")
        ? "CONTAINS_EU_POLITICAL_ADVERTISING"
        : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING";

      // 2. Create Campaign with duplicate name handling
      let effectiveCampaignName = campaignName;
      let res;
      try {
        const campaignPayload = {
          operations: [
            {
              create: {
                name: effectiveCampaignName,
                status: "PAUSED",
                advertisingChannelType: "DISPLAY",
                campaignBudget: budgetRef,
                containsEuPoliticalAdvertising: euPoliticalValue,
                ...biddingConfig
              }
            }
          ]
        };

        res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME") || errDetails.includes("already assigned")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          const retryPayload = {
            operations: [
              {
                create: {
                  name: effectiveCampaignName,
                  status: "PAUSED",
                  advertisingChannelType: "DISPLAY",
                  campaignBudget: budgetRef,
                  containsEuPoliticalAdvertising: euPoliticalValue,
                  ...biddingConfig
                }
              }
            ]
          };
          res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, retryPayload, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = res.data?.results?.[0]?.resourceName;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // 3. Create Standard Display Ad Group
      const adGroupPayload = {
        operations: [
          {
            create: {
              campaign: campaignRef,
              name: `${effectiveCampaignName} Ad Group 1`,
              status: "ENABLED",
              type: "DISPLAY_STANDARD"
            }
          }
        ]
      };
      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
      const adGroupRef = adGroupRes.data?.results?.[0]?.resourceName;
      apiResult.adGroupResourceName = adGroupRef;

      // 4. Create Image and Logo Assets with ImageKit aspect ratio transformations
      const createdAssets: {
        marketingImages: string[];
        squareMarketingImages: string[];
        logoImages: string[];
      } = {
        marketingImages: [],
        squareMarketingImages: [],
        logoImages: []
      };

      const toImageKitTransform = (url: string, transform: string): string => {
        if (typeof url === "string" && url.includes("ik.imagekit.io")) {
          if (url.includes("/tr:")) {
            return url.replace(/\/tr:[^/]+\//, `/${transform}/`);
          }
          const parts = url.split("ik.imagekit.io/");
          if (parts.length === 2) {
            const subParts = parts[1].split("/");
            const endpoint = subParts[0];
            const rest = subParts.slice(1).join("/");
            return `https://ik.imagekit.io/${endpoint}/${transform}/${rest}`;
          }
        }
        return url;
      };

      // Effective image candidates
      const rawImages = (images && images.length > 0) ? images : [
        "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png"
      ];
      const rawLogos = (logos && logos.length > 0) ? logos : [
        "https://ik.imagekit.io/automationjds/tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg"
      ];

      // Upload marketing images and square images
      for (const img of rawImages) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
        if (!raw) continue;
        const fieldType = typeof img === "object" && img?.fieldType ? img.fieldType : null;

        if (fieldType === "MARKETING_IMAGE") {
          // 1.91:1 Landscape (1200x628)
          const landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `YTDisp_Land_${Date.now()}`, landscapeUrl);
          if (landscapeRef && !createdAssets.marketingImages.includes(landscapeRef)) {
            createdAssets.marketingImages.push(landscapeRef);
          }
        } else if (fieldType === "SQUARE_MARKETING_IMAGE") {
          // 1:1 Square (1200x1200)
          const squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          const squareRef = await this.uploadImageAsset(organizationId, customerId, `YTDisp_Sq_${Date.now()}`, squareUrl);
          if (squareRef && !createdAssets.squareMarketingImages.includes(squareRef)) {
            createdAssets.squareMarketingImages.push(squareRef);
          }
        } else if (fieldType === "LOGO") {
          // 1:1 Logo (1200x1200)
          const logoUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          const logoRef = await this.uploadImageAsset(organizationId, customerId, `YTDisp_Logo_${Date.now()}`, logoUrl);
          if (logoRef && !createdAssets.logoImages.includes(logoRef)) {
            createdAssets.logoImages.push(logoRef);
          }
        } else {
          if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
            const landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
            const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `YTDisp_Land_${Date.now()}`, landscapeUrl);
            if (landscapeRef && !createdAssets.marketingImages.includes(landscapeRef)) {
              createdAssets.marketingImages.push(landscapeRef);
            }

            const squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
            const squareRef = await this.uploadImageAsset(organizationId, customerId, `YTDisp_Sq_${Date.now()}`, squareUrl);
            if (squareRef && !createdAssets.squareMarketingImages.includes(squareRef)) {
              createdAssets.squareMarketingImages.push(squareRef);
            }
          } else {
            const ref = await this.uploadImageAsset(organizationId, customerId, `YTDisp_Sq_${Date.now()}`, raw);
            if (ref && !createdAssets.squareMarketingImages.includes(ref)) {
              createdAssets.squareMarketingImages.push(ref);
            }
          }
        }
      }

      // Upload logos (1:1 square)
      for (const logo of rawLogos) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || "";
        if (!raw) continue;

        const logoUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `YTDisp_Logo_${Date.now()}`, logoUrl);
        if (logoRef && !createdAssets.logoImages.includes(logoRef)) {
          createdAssets.logoImages.push(logoRef);
        }
      }

      // 5. Clean text inputs according to Google Ads display constraints
      const cleanedHeadlines = validHeadlines
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 30))
        .filter((text: string) => text.length > 0);
      const safeHeadlines = (cleanedHeadlines.length > 0 ? cleanedHeadlines : ["Best Products Online"])
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const validLongHeadlines = (longHeadlines || []).filter((h: any) => h && typeof h === "string" && h.trim().length > 0);
      const cleanedLongHeadlines = validLongHeadlines
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
        .filter((text: string) => text.length > 0);
      const safeLongHeadline = cleanedLongHeadlines[0] || GoogleAdsBaseService.cleanAdText(validHeadlines[0] || "Explore Premium Products and Top Deals", 90);

      const cleanedDescriptions = validDescriptions
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
        .filter((text: string) => text.length > 0);
      const safeDescriptions = (cleanedDescriptions.length > 0 ? cleanedDescriptions : ["Get high quality products and expert service for your daily needs."])
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName || "My Business", 25) || "My Business";

      // 6. Create Responsive Display Ad
      if (createdAssets.marketingImages.length > 0 && createdAssets.squareMarketingImages.length > 0) {
        const responsiveDisplayAd: any = {
          marketingImages: createdAssets.marketingImages.map((asset: string) => ({ asset })),
          squareMarketingImages: createdAssets.squareMarketingImages.map((asset: string) => ({ asset })),
          headlines: safeHeadlines,
          longHeadline: { text: safeLongHeadline },
          descriptions: safeDescriptions,
          businessName: safeBusinessName
        };

        if (createdAssets.logoImages.length > 0) {
          responsiveDisplayAd.logoImages = createdAssets.logoImages.map((asset: string) => ({ asset }));
        }

        const adGroupAdPayload = {
          operations: [
            {
              create: {
                adGroup: adGroupRef,
                status: "ENABLED",
                ad: {
                  responsiveDisplayAd,
                  finalUrls: [finalUrl]
                }
              }
            }
          ]
        };

        const adGroupAdRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
        apiResult.adGroupAdResourceName = adGroupAdRes.data?.results?.[0]?.resourceName;
      }

    } catch (apiErr: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      console.error("[Google Ads API Error for YouTube Display]:", formatted);
      throw new Error(formatted);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `yt-display-${Date.now()}`,
      name: campaignName,
      campaignType: "DISPLAY",
      biddingStrategy: finalBiddingStrategy,
      budget: effectiveBudget,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines: validHeadlines,
      descriptions: validDescriptions,
      geoTargets: { objective: "YouTube Reach, Views & Engagements", locations, languages },
      advertisingChannelType: "DISPLAY",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "YouTube Display Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}