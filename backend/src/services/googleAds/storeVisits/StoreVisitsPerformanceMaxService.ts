import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class StoreVisitsPerformanceMaxService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Store Visits Performance Max",
      assetGroupName = "Asset Group 1",
      finalUrl,
      amountMicros,
      biddingFocus = "Maximize conversions",
      targetCpaMicros,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      dailyBudget,
      budget,
      euPolitical = "NO",
      businessName,
      logos = [],
      brandGuidelinesEnabled = false
    } = payload;

    let safeFinalUrl = finalUrl ? String(finalUrl).trim() : "https://www.google.com";
    if (!safeFinalUrl.startsWith("http://") && !safeFinalUrl.startsWith("https://")) {
      safeFinalUrl = `https://${safeFinalUrl}`;
    }
    // Google Ads disallows example.com or localhost URLs with DESTINATION_NOT_WORKING
    if (safeFinalUrl.includes("example.com") || safeFinalUrl.includes("localhost") || safeFinalUrl.includes("example.org")) {
      safeFinalUrl = "https://www.google.com";
    }

    const effectiveBudget = Number(dailyBudget || budget || 1000);
    const amountMicrosVal = amountMicros || Math.round(effectiveBudget * 1_000_000);

    const validHeadlines = (headlines || []).filter((h: any) => h && h.trim());
    const validLongHeadlines = (longHeadlines || []).filter((h: any) => h && h.trim());
    const validDescriptions = (descriptions || []).filter((d: any) => d && d.trim());

    // Clean & Sanitize Text Assets
    const cleanedHeadlines = validHeadlines
      .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 30))
      .filter((text: string) => text.length > 0);
    const safeHeadlines = (cleanedHeadlines.length >= 3 ? cleanedHeadlines : [...cleanedHeadlines, "Visit Our Store", "Exclusive In-Store Offers", "Find Nearby Stores"]).slice(0, 5);

    const cleanedLongHeadlines = validLongHeadlines
      .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
      .filter((text: string) => text.length > 0);
    const safeLongHeadlines = (cleanedLongHeadlines.length >= 1 ? cleanedLongHeadlines : ["Experience our in-store collection and personalized service today."]).slice(0, 5);

    const cleanedDescriptions = validDescriptions
      .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
      .filter((text: string) => text.length > 0);
    const safeDescriptions = (cleanedDescriptions.length >= 2 ? cleanedDescriptions : [...cleanedDescriptions, "Visit our store today for special promotions.", "Get directions and visit us for exclusive discounts."]).slice(0, 5);

    const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName || "My Store", 25) || "My Store";

    const cid = (customerId || "").replace(/-/g, "").trim();

    let biddingConfig: any = {};
    const normalizedFocus = biddingFocus.trim().toLowerCase();
    if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else {
      biddingConfig = { maximizeConversions: targetCpaMicros ? { targetCpaMicros: String(targetCpaMicros) } : {} };
    }

    let apiResult: any = { campaignId: `store-pmax-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      // 1. Create Budget
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);

      // 2. Create Campaign (with duplicate name auto-retry)
      let effectiveCampaignName = campaignName;
      let campaignRes;
      try {
        const campaignPayload = {
          operations: [{
            create: {
              name: effectiveCampaignName,
              status: "PAUSED",
              advertisingChannelType: "PERFORMANCE_MAX",
              campaignBudget: budgetRef,
              containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
              brandGuidelinesEnabled: false,
              ...biddingConfig
            }
          }]
        };

        campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME") || errDetails.includes("already assigned")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          const retryPayload = {
            operations: [{
              create: {
                name: effectiveCampaignName,
                status: "PAUSED",
                advertisingChannelType: "PERFORMANCE_MAX",
                campaignBudget: budgetRef,
                containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
                brandGuidelinesEnabled: false,
                ...biddingConfig
              }
            }]
          };
          campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, retryPayload, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = campaignRes.data?.results?.[0]?.resourceName;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // 3. Create Business Name Text Asset
      const bnRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
        operations: [{
          create: {
            type: "TEXT",
            textAsset: { text: safeBusinessName }
          }
        }]
      }, { headers });
      const businessNameAssetRef = bnRes.data.results?.[0]?.resourceName;

      // 4. Create Text Assets (Headlines, Long Headlines, Descriptions)
      const textOperations: any[] = [];
      safeHeadlines.forEach((text: string) => textOperations.push({ create: { type: "TEXT", textAsset: { text } } }));
      safeLongHeadlines.forEach((text: string) => textOperations.push({ create: { type: "TEXT", textAsset: { text } } }));
      safeDescriptions.forEach((text: string) => textOperations.push({ create: { type: "TEXT", textAsset: { text } } }));

      const textRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, { operations: textOperations }, { headers });
      const textResults = textRes.data.results || [];
      let idx = 0;
      const headlineRefs: string[] = safeHeadlines.map(() => textResults[idx++]?.resourceName).filter(Boolean);
      const longHeadlineRefs: string[] = safeLongHeadlines.map(() => textResults[idx++]?.resourceName).filter(Boolean);
      const descriptionRefs: string[] = safeDescriptions.map(() => textResults[idx++]?.resourceName).filter(Boolean);

      // 5. Upload Image and Logo Assets with ImageKit Aspect Ratio Transformations
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

      const marketingImageRefs: string[] = [];
      const squareImageRefs: string[] = [];
      const logoRefs: string[] = [];

      const inputImages = Array.isArray(images) && images.length > 0 ? images : [];
      const inputLogos = Array.isArray(logos) && logos.length > 0 ? logos : Array.isArray(payload.brandLogos) ? payload.brandLogos : [];

      // Collect fallback ImageKit URL if available
      let fallbackImageKitUrl = "";
      for (const img of inputImages) {
        const raw = typeof img === "string" ? img : img?.data || img?.url || "";
        if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
          fallbackImageKitUrl = raw;
          break;
        }
      }
      if (!fallbackImageKitUrl) {
        for (const logo of inputLogos) {
          const raw = typeof logo === "string" ? logo : logo?.data || logo?.url || "";
          if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
            fallbackImageKitUrl = raw;
            break;
          }
        }
      }

      // Process inputImages strictly by their explicit fieldType
      for (const img of inputImages) {
        const raw = typeof img === "string" ? img : img?.data || img?.url || "";
        if (!raw) continue;
        const fieldType = typeof img === "object" && img?.fieldType ? img.fieldType : null;

        if (fieldType === "MARKETING_IMAGE") {
          // Explicit Landscape (1.91:1)
          const landUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          const ref = await this.uploadImageAsset(organizationId, customerId, `PMax_Land_${Date.now()}`, landUrl);
          if (ref && !marketingImageRefs.includes(ref)) marketingImageRefs.push(ref);
        } else if (fieldType === "SQUARE_MARKETING_IMAGE") {
          // Explicit Square (1:1)
          const sqUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          const ref = await this.uploadImageAsset(organizationId, customerId, `PMax_Sq_${Date.now()}`, sqUrl);
          if (ref && !squareImageRefs.includes(ref)) squareImageRefs.push(ref);
        } else if (fieldType === "LOGO") {
          // Explicit Logo (1:1)
          const logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
          const ref = await this.uploadImageAsset(organizationId, customerId, `PMax_Logo_${Date.now()}`, logoUrl);
          if (ref && !logoRefs.includes(ref)) logoRefs.push(ref);
        } else {
          // Unclassified image (e.g. raw ImageKit URL): generate separate landscape & square assets
          if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
            const landUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
            const landRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Land_${Date.now()}`, landUrl);
            if (landRef && !marketingImageRefs.includes(landRef)) marketingImageRefs.push(landRef);

            const sqUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
            const sqRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Sq_${Date.now()}`, sqUrl);
            if (sqRef && !squareImageRefs.includes(sqRef)) squareImageRefs.push(sqRef);
          } else {
            // Default base64 without fieldType: upload as marketing image
            const ref = await this.uploadImageAsset(organizationId, customerId, `PMax_Img_${Date.now()}`, raw);
            if (ref && !marketingImageRefs.includes(ref)) marketingImageRefs.push(ref);
          }
        }
      }

      // Process inputLogos (Strict 1:1 Square)
      for (const logo of inputLogos) {
        const raw = typeof logo === "string" ? logo : logo?.data || logo?.url || "";
        if (!raw) continue;

        const logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Logo_${Date.now()}`, logoUrl);
        if (logoRef && !logoRefs.includes(logoRef)) logoRefs.push(logoRef);
      }

      // Safe Aspect-Ratio-Preserving Fallbacks:
      const DEFAULT_PMAX_IMAGE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";
      const DEFAULT_PMAX_LOGO = "https://ik.imagekit.io/automationjds/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";

      // 1. Logo fallback from Square Marketing Image (Both are 1:1 Square)
      if (logoRefs.length === 0 && squareImageRefs.length > 0) {
        logoRefs.push(squareImageRefs[0]);
      }
      // 2. Square Marketing Image fallback from Logo (Both are 1:1 Square)
      if (squareImageRefs.length === 0 && logoRefs.length > 0) {
        squareImageRefs.push(logoRefs[0]);
      }
      // 3. Marketing Image (Landscape 1.91:1) fallback via ImageKit URL transformation
      if (marketingImageRefs.length === 0) {
        const fallbackUrl = fallbackImageKitUrl || DEFAULT_PMAX_IMAGE;
        const landUrl = toImageKitTransform(fallbackUrl, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
        const landRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Land_${Date.now()}`, landUrl);
        if (landRef && !marketingImageRefs.includes(landRef)) marketingImageRefs.push(landRef);
      }
      // 4. Square Image fallback via ImageKit URL transformation
      if (squareImageRefs.length === 0) {
        const fallbackUrl = fallbackImageKitUrl || DEFAULT_PMAX_IMAGE;
        const sqUrl = toImageKitTransform(fallbackUrl, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
        const sqRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Sq_${Date.now()}`, sqUrl);
        if (sqRef && !squareImageRefs.includes(sqRef)) squareImageRefs.push(sqRef);
      }
      // 5. Logo fallback via ImageKit URL transformation
      if (logoRefs.length === 0) {
        const fallbackUrl = fallbackImageKitUrl || DEFAULT_PMAX_LOGO;
        const logoUrl = toImageKitTransform(fallbackUrl, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Logo_${Date.now()}`, logoUrl);
        if (logoRef && !logoRefs.includes(logoRef)) logoRefs.push(logoRef);
      }

      if (marketingImageRefs.length === 0 || squareImageRefs.length === 0 || logoRefs.length === 0) {
        throw new Error("At least 1 landscape marketing image (1.91:1), 1 square marketing image (1:1), and 1 logo (1:1) are required for Performance Max.");
      }

      // 6. Mutate Asset Group and AssetGroupAssets
      const tempAssetGroupResourceName = `customers/${cid}/assetGroups/-1`;
      const mutateOperations: any[] = [
        {
          assetGroupOperation: {
            create: {
              resourceName: tempAssetGroupResourceName,
              campaign: campaignRef,
              name: assetGroupName || `${campaignName} Asset Group 1`,
              status: "ENABLED",
              finalUrls: [safeFinalUrl]
            }
          }
        },
        {
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              asset: businessNameAssetRef,
              fieldType: "BUSINESS_NAME",
              status: "ENABLED"
            }
          }
        }
      ];

      logoRefs.forEach((asset: string) => {
        mutateOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              asset,
              fieldType: "LOGO",
              status: "ENABLED"
            }
          }
        });
      });

      headlineRefs.forEach((asset: string) => {
        mutateOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              asset,
              fieldType: "HEADLINE",
              status: "ENABLED"
            }
          }
        });
      });

      longHeadlineRefs.forEach((asset: string) => {
        mutateOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              asset,
              fieldType: "LONG_HEADLINE",
              status: "ENABLED"
            }
          }
        });
      });

      descriptionRefs.forEach((asset: string) => {
        mutateOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              asset,
              fieldType: "DESCRIPTION",
              status: "ENABLED"
            }
          }
        });
      });

      marketingImageRefs.forEach((asset: string) => {
        mutateOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              asset,
              fieldType: "MARKETING_IMAGE",
              status: "ENABLED"
            }
          }
        });
      });

      squareImageRefs.forEach((asset: string) => {
        mutateOperations.push({
          assetGroupAssetOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              asset,
              fieldType: "SQUARE_MARKETING_IMAGE",
              status: "ENABLED"
            }
          }
        });
      });

      const mutateRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:mutate`, { mutateOperations }, { headers });
      const results = mutateRes.data.mutateOperationResponses;
      apiResult.assetGroupResourceName = results[0]?.assetGroupResult?.resourceName;

    } catch (err: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(err);
      console.error("[Google Ads API error for Store Visits Performance Max]:", formatted);
      throw new Error(formatted);
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `pmax-${Date.now()}`,
      name: campaignName,
      campaignType: "PERFORMANCE_MAX",
      biddingStrategy: normalizedFocus,
      budget: amountMicrosVal / 1_000_000,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines: safeHeadlines,
      descriptions: safeDescriptions,
      geoTargets: { objective: "Local Store Visits", locations, languages },
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicrosVal),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Store Visits Performance Max Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}