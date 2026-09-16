import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class SalesDemandGenService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Sales Demand Gen",
      finalUrl = "https://www.example.com",
      mobileFinalUrl,
      campaignGoal = "Sales",
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      biddingFocus, // fallback
      targetCpa,
      targetRoas,
      startDate,
      endDate,
      locations = ["India"],
      locationTargetType,
      languages = ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      videos = [],
      carouselCards = [],
      adFormat = "SINGLE_IMAGE",
      adName = "Ad 1",
      callToAction = "Automated",
      businessName = "",
      dailyBudget,
      budget,
      demandGenBudgetType,
      euPolitical = "NO",
      channels = [],
      channelTargeting = "ALL",
      deviceTargeting = "ALL",
      audience,
      optimizedTargeting = true,
      customerAcquisitionMode,
      trackingTemplate,
      finalUrlSuffix,
      customParameters = [],
      ipExclusions,
      adSchedule = []
    } = payload;

    const validHeadlines = (headlines || []).filter((h: any) => h && h.trim());
    if (validHeadlines.length < 1) {
      throw new Error("At least 1 headline is required.");
    }
    const validDescriptions = (descriptions || []).filter((d: any) => d && d.trim());
    if (validDescriptions.length < 1) {
      throw new Error("At least 1 description is required.");
    }
    
    const effectiveBudget = Number(dailyBudget || budget || 1000);
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    const finalBiddingStrategy = biddingStrategy || (biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS");

    let biddingConfig: any = {};
    if (finalBiddingStrategy === "MAXIMIZE_CONVERSION_VALUE" || finalBiddingStrategy === "TARGET_ROAS") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else if (finalBiddingStrategy === "TARGET_CPA" && targetCpaMicros) {
      biddingConfig = { targetCpa: { targetCpaMicros: String(targetCpaMicros) } };
    } else {
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = (customerId || "").replace(/-/g, "").trim();
    let apiResult: any = { campaignId: `demandgen-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      
      let effectiveCampaignName = campaignName;
      let res;
      try {
        const createCampObj: any = {
          name: effectiveCampaignName,
          status: "PAUSED",
          advertisingChannelType: "DEMAND_GEN",
          campaignBudget: budgetRef,
          containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
          demandGenCampaignSettings: {
             upgradedTargeting: Boolean(optimizedTargeting)
          },
          ...biddingConfig
        };

        const campaignPayload = {
          operations: [
            {
              create: createCampObj
            }
          ]
        };

        res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME") || errDetails.includes("already assigned")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          const retryCreateCampObj: any = {
            name: effectiveCampaignName,
            status: "PAUSED",
            advertisingChannelType: "DEMAND_GEN",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            demandGenCampaignSettings: {
               upgradedTargeting: Boolean(optimizedTargeting)
            },
            ...biddingConfig
          };

          const retryPayload = {
            operations: [
              {
                create: retryCreateCampObj
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

      // 2. Create Ad Group without a type for Demand Gen
      const adGroupCreate: any = {
        campaign: campaignRef,
        name: `${campaignName} Ad Group 1`,
        status: "ENABLED"
      };

      if (channels && channels.length > 0) {
        const selectedChannels = {
          youtubeInStream: channels.includes("YouTube in-stream") || channels.includes("YouTube"),
          youtubeInFeed: channels.includes("YouTube in-feed") || channels.includes("YouTube"),
          youtubeShorts: channels.includes("YouTube Shorts") || channels.includes("YouTube"),
          discover: channels.includes("Discover"),
          gmail: channels.includes("Gmail"),
          display: channels.includes("Google Display Network"),
          maps: channels.includes("Maps New")
        };
          
        adGroupCreate.demandGenAdGroupSettings = {
          channelControls: {
            selectedChannels
          }
        };
      }

      const adGroupPayload = {
        operations: [{ create: adGroupCreate }]
      };
      
      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
      const adGroupRef = adGroupRes.data.results?.[0]?.resourceName;
      apiResult.adGroupResourceName = adGroupRef;

      // 3. Attach Location & Language Criteria to AdGroup (Location / Radius & Languages)
      if (adGroupRef) {
        await GoogleAdsBaseService.mutateAdGroupGeoAndLanguageCriteria(organizationId, customerId, [adGroupRef], {
          locations,
          languages,
          headers
        });
      }

      // 4. Create Image and Logo Assets with strict Aspect Ratio handling
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

      const toPollinationsTransform = (url: string, width: number, height: number): string => {
        if (typeof url === "string" && url.includes("image.pollinations.ai")) {
          return url.replace(/width=\d+/, `width=${width}`).replace(/height=\d+/, `height=${height}`);
        }
        return url;
      };

      const createdMarketingImages: string[] = [];
      const createdSquareImages: string[] = [];
      const createdLogoImages: string[] = [];

      const rawImagesList = Array.isArray(images) ? images : [];
      const rawLogosList = Array.isArray(logos) ? logos : [];

      for (const img of rawImagesList) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || img?.asset || "";
        if (!raw) continue;

        const fieldType = typeof img === "object" && img?.fieldType ? img.fieldType : null;
        const aspectRatio = typeof img === "object" && img?.aspectRatio ? img.aspectRatio : null;

        if (fieldType === "MARKETING_IMAGE" || aspectRatio === "1.91:1") {
          // Explicit Landscape (1.91:1)
          let landUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          landUrl = toPollinationsTransform(landUrl, 1200, 628);
          const ref = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, landUrl);
          if (ref && !createdMarketingImages.includes(ref)) createdMarketingImages.push(ref);
        } else if (fieldType === "SQUARE_MARKETING_IMAGE" || aspectRatio === "1:1") {
          // Explicit Square (1:1)
          let sqUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          sqUrl = toPollinationsTransform(sqUrl, 1200, 1200);
          const ref = await this.uploadImageAsset(organizationId, customerId, `DG_Sq_${Date.now()}`, sqUrl);
          if (ref && !createdSquareImages.includes(ref)) createdSquareImages.push(ref);
        } else if (fieldType === "LOGO") {
          // Explicit Logo (1:1)
          let logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
          logoUrl = toPollinationsTransform(logoUrl, 500, 500);
          const ref = await this.uploadImageAsset(organizationId, customerId, `DG_Logo_${Date.now()}`, logoUrl);
          if (ref && !createdLogoImages.includes(ref)) createdLogoImages.push(ref);
        } else {
          // Unclassified image: generate separate landscape & square assets
          let landUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          landUrl = toPollinationsTransform(landUrl, 1200, 628);
          const landRef = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, landUrl);
          if (landRef && !createdMarketingImages.includes(landRef)) createdMarketingImages.push(landRef);

          let sqUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          sqUrl = toPollinationsTransform(sqUrl, 1200, 1200);
          const sqRef = await this.uploadImageAsset(organizationId, customerId, `DG_Sq_${Date.now()}`, sqUrl);
          if (sqRef && !createdSquareImages.includes(sqRef)) createdSquareImages.push(sqRef);
        }
      }

      for (const logo of rawLogosList) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || logo?.asset || "";
        if (!raw) continue;

        let logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        logoUrl = toPollinationsTransform(logoUrl, 500, 500);
        const ref = await this.uploadImageAsset(organizationId, customerId, `DG_Logo_${Date.now()}`, logoUrl);
        if (ref && !createdLogoImages.includes(ref)) createdLogoImages.push(ref);
      }

      // Safe square fallback for squareMarketingImages only (never landscape)
      if (createdSquareImages.length === 0 && createdLogoImages.length > 0) {
        createdSquareImages.push(createdLogoImages[0]);
      }
      if (createdLogoImages.length === 0 && createdSquareImages.length > 0) {
        createdLogoImages.push(createdSquareImages[0]);
      }

      const DEFAULT_DG_LOGO = "https://ik.imagekit.io/automationjds/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";
      const DEFAULT_DG_LANDSCAPE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";

      if (createdMarketingImages.length === 0) {
        let landUrl = toImageKitTransform(DEFAULT_DG_LANDSCAPE, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
        const landRef = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, landUrl);
        if (landRef) createdMarketingImages.push(landRef);
      }

      if (createdLogoImages.length === 0) {
        let fallbackLogoUrl = toImageKitTransform(DEFAULT_DG_LOGO, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `DG_Logo_${Date.now()}`, fallbackLogoUrl);
        if (logoRef) createdLogoImages.push(logoRef);
      }

      // Final unique deduplication across all asset arrays
      const uniqueMarketingImages = Array.from(new Set(createdMarketingImages));
      const uniqueSquareImages = Array.from(new Set(createdSquareImages));
      const uniqueLogoImages = Array.from(new Set(createdLogoImages));

      if (uniqueMarketingImages.length === 0) {
        throw new Error("At least 1 landscape marketing image (1.91:1) is required for Demand Gen ads. Please provide or generate a landscape image.");
      }
      if (uniqueLogoImages.length === 0) {
        throw new Error("At least 1 logo (1:1) is required for Demand Gen ads. Please upload or generate a logo.");
      }

      // 5. Create Demand Gen Ad and AdGroupAd
      const cleanedHeadlines = validHeadlines
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 40))
        .filter((text: string) => text.length > 0);
      
      const safeHeadlines = (cleanedHeadlines.length > 0 ? cleanedHeadlines : ["Quality Services and Products"])
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const cleanedDescriptions = validDescriptions
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
        .filter((text: string) => text.length > 0);

      const safeDescriptions = (cleanedDescriptions.length > 0 ? cleanedDescriptions : ["Discover great offers and premium solutions tailored for you."])
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName || "My Business", 25) || "My Business";

      const demandGenAd = {
        demandGenMultiAssetAd: {
          headlines: safeHeadlines,
          descriptions: safeDescriptions,
          marketingImages: uniqueMarketingImages.map((asset: string) => ({ asset })),
          squareMarketingImages: uniqueSquareImages.map((asset: string) => ({ asset })),
          logoImages: uniqueLogoImages.map((asset: string) => ({ asset })),
          businessName: safeBusinessName
        },
        finalUrls: [finalUrl]
      };

      const adGroupAdPayload = {
        operations: [
          {
            create: {
              adGroup: adGroupRef,
              status: "ENABLED",
              ad: demandGenAd
            }
          }
        ]
      };

      const adGroupAdRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
      apiResult.adGroupAdResourceName = adGroupAdRes.data.results?.[0]?.resourceName;

    } catch (apiErr: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      console.error("[Google Ads API Error for Sales Demand Gen]:", formatted);
      throw new Error(formatted);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `demandgen-${Date.now()}`,
      name: campaignName,
      campaignType: "DEMAND_GEN",
      biddingStrategy: finalBiddingStrategy,
      budget: Number(effectiveBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: {
        locations,
        languages,
        channels,
        audience,
        brandGuidelines: {
          mainBrandColor: payload.brandGuidelines?.mainBrandColor || null,
          accentBrandColor: payload.brandGuidelines?.accentBrandColor || null,
          brandFont: payload.brandGuidelines?.brandFont || null
        },
        deviceTargeting,
        adSchedule,
        objective: "Sales"
      },
      advertisingChannelType: "DEMAND_GEN",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Demand Gen Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      },
      apiResult
    };
  }
}