import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import { CampaignNormalizationService } from "../shared/CampaignNormalizationService";
import axios from "axios";

export class SalesPerformanceMaxService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName,
      assetGroupName,
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
      budgetType,
      totalBudget,
      startDate,
      endDate,
      euPolitical = "NO",
      businessName,
      logos = [],
      brandGuidelinesEnabled = false,
      // Enhanced PMax Parameters
      merchantCenterId,
      merchantId,
      feedLabel,
      salesCountry,
      positiveGeoTargetType,
      negativeGeoTargetType,
      trackingTemplate,
      finalUrlSuffix,
      customParameters,
      customerAcquisitionMode,
      displayPath1,
      displayPath2,
      mobileFinalUrl,
      searchThemes = [],
      audienceSignals = [],
      sitelinks = [],
      callouts = [],
      promotions = [],
      prices = [],
      callAsset,
      structuredSnippets = [],
      adSchedule = [],
      devices,
      demographicExclusions,
      conversionGoals = []
    } = payload;

    if (!campaignName || !campaignName.trim()) {
      throw new Error("Campaign Name is required. Please specify a campaign name.");
    }

    if (!businessName || !businessName.trim()) {
      throw new Error("Business Name is required. Please specify your business or shop name.");
    }

    const safeFinalUrl = GoogleAdsBaseService.cleanUrl(finalUrl);
    if (!safeFinalUrl) throw new Error("A valid Final URL is required.");

    const isCustomPeriod = String(budgetType).toUpperCase() === "TOTAL" && Number(totalBudget) > 0 && Boolean(startDate && endDate);
    const rawBudget = dailyBudget !== undefined && dailyBudget !== null && dailyBudget !== ""
      ? dailyBudget
      : (budget !== undefined && budget !== null && budget !== "" ? budget : (isCustomPeriod ? totalBudget : null));
    const effectiveBudget = Number(rawBudget);
    if (isNaN(effectiveBudget) || effectiveBudget <= 0) {
      throw new Error("A valid positive budget greater than 0 is required.");
    }
    const amountMicrosVal = amountMicros || Math.round(effectiveBudget * 1_000_000);

    const validHeadlines = (headlines || []).filter((h: any) => h && h.trim());
    const validLongHeadlines = (longHeadlines || []).filter((h: any) => h && h.trim());
    const validDescriptions = (descriptions || []).filter((d: any) => d && d.trim());

    const isAiGuided = payload?.source === "AI_GUIDED" || payload?.isAiGuided === true;

    // Clean & Sanitize Text Assets
    const cleanedHeadlines = validHeadlines
      .map((text: string) => GoogleAdsBaseService.cleanAdText(String(text), 30))
      .filter((text: string) => text.length > 0);

    const cleanedLongHeadlines = validLongHeadlines
      .map((text: string) => GoogleAdsBaseService.cleanAdText(String(text), 90))
      .filter((text: string) => text.length > 0);

    const cleanedDescriptions = validDescriptions
      .map((text: string) => GoogleAdsBaseService.cleanAdText(String(text), 90))
      .filter((text: string) => text.length > 0);

    if (isAiGuided) {
      if (cleanedHeadlines.length < 3) {
        throw new Error(`Performance Max requires at least 3 valid headlines (provided ${cleanedHeadlines.length}).`);
      }
      const uniqueH = Array.from(new Set(cleanedHeadlines.map((h: string) => h.toLowerCase())));
      if (uniqueH.length < cleanedHeadlines.length) {
        throw new Error("All headlines must be unique.");
      }
      if (cleanedLongHeadlines.length < 1) {
        throw new Error("Performance Max requires at least 1 valid long headline.");
      }
      if (cleanedDescriptions.length < 2) {
        throw new Error(`Performance Max requires at least 2 valid descriptions (provided ${cleanedDescriptions.length}).`);
      }
      const uniqueD = Array.from(new Set(cleanedDescriptions.map((d: string) => d.toLowerCase())));
      if (uniqueD.length < cleanedDescriptions.length) {
        throw new Error("All descriptions must be unique.");
      }
    }

    const safeHeadlines = cleanedHeadlines.slice(0, 5);
    const safeLongHeadlines = cleanedLongHeadlines.slice(0, 5);
    const safeDescriptions = cleanedDescriptions.slice(0, 5);
    const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName.trim(), 25);
    const effectiveAssetGroupName = assetGroupName && assetGroupName.trim() ? assetGroupName.trim() : `${campaignName.trim()} Asset Group 1`;

    const cid = (customerId || "").replace(/-/g, "").trim();

    let biddingConfig: any = {};
    const normalizedFocus = biddingFocus.trim().toLowerCase();
    if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else {
      biddingConfig = { maximizeConversions: targetCpaMicros ? { targetCpaMicros: String(targetCpaMicros) } : {} };
    }

    // Build URL Custom Parameters if provided
    const validCustomParameters = GoogleAdsBaseService.cleanCustomParameters(customParameters);
    const cleanTrackingTemplate = GoogleAdsBaseService.cleanTrackingTemplate(trackingTemplate);

    // Optional Merchant Center Shopping Setting
    const effectiveMerchantId = merchantCenterId || merchantId;
    let shoppingSetting: any = undefined;
    if (effectiveMerchantId && String(effectiveMerchantId).trim()) {
      shoppingSetting = {
        merchantId: String(effectiveMerchantId).trim(),
        ...(feedLabel ? { feedLabel: String(feedLabel).trim() } : salesCountry ? { feedLabel: String(salesCountry).trim() } : {})
      };
    }

    // Customer Acquisition Setting (Google Ads API: customerAcquisitionSetting.optimizationMode)
    let customerAcquisitionSetting: any = undefined;
    if (customerAcquisitionMode) {
      const normAcq = CampaignNormalizationService.normalizeCustomerAcquisitionMode(customerAcquisitionMode);
      customerAcquisitionSetting = { optimizationMode: normAcq };
    }

    // Geo Target Type Setting
    let geoTargetTypeSetting: any = undefined;
    if (positiveGeoTargetType || negativeGeoTargetType) {
      geoTargetTypeSetting = {
        ...(positiveGeoTargetType ? { positiveGeoTargetType } : { positiveGeoTargetType: "PRESENCE_OR_INTEREST" }),
        ...(negativeGeoTargetType ? { negativeGeoTargetType } : { negativeGeoTargetType: "PRESENCE" })
      };
    }

    const effectiveAdSchedule = Array.isArray(adSchedule) ? adSchedule : [];

    // Pre-declare Conversion Goals Tracking Variables for campaign lifecycle & DB persistence
    const rawGoalsList = Array.isArray(conversionGoals) ? conversionGoals : (conversionGoals ? [conversionGoals] : []);
    const mappedGoogleAdsGoals: Array<{ category: string; origin: string; biddable: boolean }> = [];
    let goalConfigLevel = "CUSTOMER_LEVEL";

    let apiResult: any = { campaignId: `sales-pmax-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      // 1. Create Budget
      const isCustomPeriod = String(budgetType).toUpperCase() === "TOTAL" && Number(totalBudget) > 0 && Boolean(startDate && endDate);
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget,
        period: isCustomPeriod ? "CUSTOM_PERIOD" : "DAILY",
        totalAmount: isCustomPeriod ? Number(totalBudget) : undefined
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);

      // Helper function to build Campaign mutate payload
      const buildCampaignPayload = (campName: string) => {
        const createObj: any = {
          name: campName,
          status: "PAUSED",
          advertisingChannelType: "PERFORMANCE_MAX",
          campaignBudget: budgetRef,
          containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
          brandGuidelinesEnabled: Boolean(brandGuidelinesEnabled),
          ...(startDate ? { startDateTime: `${String(startDate).split("T")[0]} 00:00:00` } : {}),
          ...(endDate ? { endDateTime: `${String(endDate).split("T")[0]} 23:59:59` } : {}),
          ...biddingConfig
        };

        if (shoppingSetting) createObj.shoppingSetting = shoppingSetting;
        if (customerAcquisitionSetting) createObj.customerAcquisitionSetting = customerAcquisitionSetting;
        if (geoTargetTypeSetting) createObj.geoTargetTypeSetting = geoTargetTypeSetting;
        if (cleanTrackingTemplate) createObj.trackingUrlTemplate = cleanTrackingTemplate;
        if (finalUrlSuffix && String(finalUrlSuffix).trim()) createObj.finalUrlSuffix = String(finalUrlSuffix).trim();
        if (validCustomParameters.length > 0) createObj.urlCustomParameters = validCustomParameters;

        return { operations: [{ create: createObj }] };
      };

      // 2. Create Campaign (with duplicate name auto-retry)
      let effectiveCampaignName = campaignName;
      let campaignRes;
      try {
        campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, buildCampaignPayload(effectiveCampaignName), { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME") || errDetails.includes("already assigned")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, buildCampaignPayload(effectiveCampaignName), { headers });
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
      const assetGroupCreate: any = {
        resourceName: tempAssetGroupResourceName,
        campaign: campaignRef,
        name: effectiveAssetGroupName,
        status: "ENABLED",
        finalUrls: [safeFinalUrl]
      };

      if (displayPath1 && String(displayPath1).trim()) assetGroupCreate.path1 = String(displayPath1).trim().slice(0, 15);
      if (displayPath2 && String(displayPath2).trim()) assetGroupCreate.path2 = String(displayPath2).trim().slice(0, 15);
      if (mobileFinalUrl && String(mobileFinalUrl).trim()) assetGroupCreate.finalMobileUrls = [String(mobileFinalUrl).trim()];

      const mutateOperations: any[] = [
        {
          assetGroupOperation: {
            create: assetGroupCreate
          }
        }
      ];

      // Brand Guidelines Rule (Google Ads API v21+ / v24):
      // When brandGuidelinesEnabled is true, brand assets (BUSINESS_NAME, LOGO) are linked at the CAMPAIGN level via CampaignAsset.
      // When brandGuidelinesEnabled is false, brand assets are linked at the ASSET_GROUP level via AssetGroupAsset.
      if (!brandGuidelinesEnabled) {
        if (businessNameAssetRef) {
          mutateOperations.push({
            assetGroupAssetOperation: {
              create: {
                assetGroup: tempAssetGroupResourceName,
                asset: businessNameAssetRef,
                fieldType: "BUSINESS_NAME",
                status: "ENABLED"
              }
            }
          });
        }

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
      }

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

      // Asset Group Signals (Search Themes and Audience Signals)
      const validSearchThemes = Array.isArray(searchThemes)
        ? searchThemes
            .map((t: any) => GoogleAdsBaseService.cleanSearchTheme(t))
            .filter(Boolean)
        : [];
      validSearchThemes.forEach((theme: string) => {
        mutateOperations.push({
          assetGroupSignalOperation: {
            create: {
              assetGroup: tempAssetGroupResourceName,
              searchTheme: { text: theme }
            }
          }
        });
      });

      const validAudiences = Array.isArray(audienceSignals) ? audienceSignals : [];
      validAudiences.forEach((aud: any) => {
        const audResource = typeof aud === "string" ? aud : aud?.resourceName;
        if (audResource && String(audResource).trim()) {
          mutateOperations.push({
            assetGroupSignalOperation: {
              create: {
                assetGroup: tempAssetGroupResourceName,
                audience: { audience: String(audResource).trim() }
              }
            }
          });
        }
      });

      const mutateRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:mutate`, { mutateOperations }, { headers });
      const results = mutateRes.data.mutateOperationResponses;
      apiResult.assetGroupResourceName = results[0]?.assetGroupResult?.resourceName;

      // 7. Mutate Campaign Criteria (Locations + Proximity Radius + Languages)
      const criteriaResults = await GoogleAdsBaseService.mutateCampaignGeoAndLanguageCriteria(
        organizationId,
        customerId,
        campaignRef,
        { locations, languages, headers }
      );
      apiResult.criteriaResults = criteriaResults;

      // 7b. Mutate Campaign Criteria for Ad Schedule (if specified)
      if (effectiveAdSchedule.length > 0) {
        try {
          const scheduleResults = await GoogleAdsBaseService.mutateCampaignAdScheduleCriteria(
            organizationId,
            customerId,
            campaignRef,
            effectiveAdSchedule,
            headers
          );
          if (scheduleResults.length > 0) {
            apiResult.scheduleCriteriaResults = scheduleResults;
          }
        } catch (schedErr: any) {
          console.warn("[PMax Ad Schedule Warning]:", schedErr?.response?.data || schedErr.message);
        }
      }

      // 7c. Campaign Conversion Goals Configuration (campaignConversionGoals:mutate or customer-level inheritance)
      let appliedGoals: string[] = [];
      let skippedGoals: string[] = [];
      let skipReason: string | null = null;

      // Goal category/origin mapping dictionary
      const goalMappingDict: Record<string, { category: string; origin: string }> = {
        "phone_leads": { category: "PHONE_CALL_LEAD", origin: "WEBSITE" },
        "phone call leads": { category: "PHONE_CALL_LEAD", origin: "WEBSITE" },
        "contacts": { category: "CONTACT", origin: "WEBSITE" },
        "get_directions": { category: "GET_DIRECTIONS", origin: "GOOGLE_HOSTED" },
        "get directions": { category: "GET_DIRECTIONS", origin: "GOOGLE_HOSTED" },
        "engagements": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
        "youtube follow-on views": { category: "ENGAGEMENT", origin: "YOUTUBE_HOSTED" },
        "purchase": { category: "PURCHASE", origin: "WEBSITE" },
        "purchases": { category: "PURCHASE", origin: "WEBSITE" },
        "submit_lead_form": { category: "SUBMIT_LEAD_FORM", origin: "WEBSITE" },
        "lead": { category: "SUBMIT_LEAD_FORM", origin: "WEBSITE" },
        "leads": { category: "SUBMIT_LEAD_FORM", origin: "WEBSITE" },
        "sign_up": { category: "SIGNUP", origin: "WEBSITE" }
      };

      for (const rg of rawGoalsList) {
        if (!rg) continue;
        const normKey = String(rg).trim().toLowerCase();
        if (goalMappingDict[normKey]) {
          mappedGoogleAdsGoals.push({
            category: goalMappingDict[normKey].category,
            origin: goalMappingDict[normKey].origin,
            biddable: true
          });
          appliedGoals.push(`${rg} -> ${goalMappingDict[normKey].category} (${goalMappingDict[normKey].origin})`);
        } else if (typeof rg === "object" && rg.category && rg.origin) {
          mappedGoogleAdsGoals.push({
            category: rg.category,
            origin: rg.origin,
            biddable: rg.biddable !== undefined ? Boolean(rg.biddable) : true
          });
          appliedGoals.push(`${rg.category} (${rg.origin})`);
        } else {
          skippedGoals.push(String(rg));
        }
      }

      if (mappedGoogleAdsGoals.length > 0) {
        try {
          const conversionOps: any[] = [];
          for (const cg of mappedGoogleAdsGoals) {
            const goalResName = `customers/${cid}/campaignConversionGoals/${campaignRef.split("/").pop()}~${cg.category}~${cg.origin}`;
            conversionOps.push({
              update: {
                resourceName: goalResName,
                biddable: cg.biddable
              },
              updateMask: "biddable"
            });
          }
          if (conversionOps.length > 0) {
            await axios.post(`${ADS_BASE}/customers/${cid}/campaignConversionGoals:mutate`, {
              operations: conversionOps
            }, { headers });
            goalConfigLevel = "CAMPAIGN_LEVEL";
          }
        } catch (cgErr: any) {
          goalConfigLevel = "CUSTOMER_LEVEL (Inherited)";
          skipReason = cgErr?.response?.data?.error?.message || cgErr?.message || "Campaign inherits account-level conversion goal settings";
          console.warn("[SalesPerformanceMaxService] campaignConversionGoals mutate notice (inheriting customer-level goals):", skipReason);
        }
      } else {
        goalConfigLevel = "CUSTOMER_LEVEL (Inherited)";
        if (rawGoalsList.length === 0) {
          skipReason = "No campaign-level conversion goal overrides specified; inheriting customer-level conversion goals";
        }
      }

      console.log(`\n==================== 🎯 [AI GUIDED CONVERSION GOALS] ====================`);
      console.log(`Objective:                   Sales`);
      console.log(`Selected UI Goals:           ${JSON.stringify(rawGoalsList)}`);
      console.log(`Mapped Google Ads Goals:     ${JSON.stringify(mappedGoogleAdsGoals)}`);
      console.log(`Goal Config Level:           ${goalConfigLevel}`);
      console.log(`Successfully Applied:        ${appliedGoals.length > 0 ? appliedGoals.join(", ") : "Customer-Level Inherited"}`);
      console.log(`Skipped:                     ${skippedGoals.length > 0 ? skippedGoals.join(", ") : "None"}`);
      if (skipReason) console.log(`Skip Reason / Notice:        ${skipReason}`);
      console.log(`=========================================================================\n`);
      try {
        const campaignAssetOperations: any[] = [];

        // Brand Guidelines (Google Ads API v21+ / v24):
        // When brandGuidelinesEnabled is true, BUSINESS_NAME and LOGO must be linked as CampaignAsset
        if (brandGuidelinesEnabled) {
          if (businessNameAssetRef) {
            campaignAssetOperations.push({
              create: {
                campaign: campaignRef,
                asset: businessNameAssetRef,
                fieldType: "BUSINESS_NAME",
                status: "ENABLED"
              }
            });
          }

          logoRefs.forEach((asset: string) => {
            campaignAssetOperations.push({
              create: {
                campaign: campaignRef,
                asset,
                fieldType: "LOGO",
                status: "ENABLED"
              }
            });
          });
        }

        // Sitelinks
        const validSitelinks = Array.isArray(sitelinks) ? sitelinks.filter((s: any) => s && s.text && s.url) : [];
        for (const st of validSitelinks) {
          const sRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                type: "SITELINK",
                sitelinkAsset: {
                  linkText: GoogleAdsBaseService.cleanAdText(st.text, 25),
                  description1: st.desc1 ? GoogleAdsBaseService.cleanAdText(st.desc1, 35) : undefined,
                  description2: st.desc2 ? GoogleAdsBaseService.cleanAdText(st.desc2, 35) : undefined
                },
                finalUrls: [GoogleAdsBaseService.cleanUrl(st.url)]
              }
            }]
          }, { headers });
          const assetRef = sRes.data?.results?.[0]?.resourceName;
          if (assetRef) {
            campaignAssetOperations.push({
              create: {
                campaign: campaignRef,
                asset: assetRef,
                fieldType: "SITELINK",
                status: "ENABLED"
              }
            });
          }
        }

        // Callouts
        const validCallouts = Array.isArray(callouts) ? callouts.map((c: any) => String(c).trim()).filter(Boolean) : [];
        for (const co of validCallouts) {
          const coRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                type: "CALLOUT",
                calloutAsset: {
                  calloutText: GoogleAdsBaseService.cleanAdText(co, 25)
                }
              }
            }]
          }, { headers });
          const assetRef = coRes.data?.results?.[0]?.resourceName;
          if (assetRef) {
            campaignAssetOperations.push({
              create: {
                campaign: campaignRef,
                asset: assetRef,
                fieldType: "CALLOUT",
                status: "ENABLED"
              }
            });
          }
        }

        // Call Asset
        if (callAsset && callAsset.phone) {
          const callRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                type: "CALL",
                callAsset: {
                  countryCode: callAsset.countryCode || "IN",
                  phoneNumber: String(callAsset.phone).trim()
                }
              }
            }]
          }, { headers });
          const assetRef = callRes.data?.results?.[0]?.resourceName;
          if (assetRef) {
            campaignAssetOperations.push({
              create: {
                campaign: campaignRef,
                asset: assetRef,
                fieldType: "CALL",
                status: "ENABLED"
              }
            });
          }
        }

        // Structured Snippets
        const validSnippets = Array.isArray(structuredSnippets) ? structuredSnippets.filter((sn: any) => sn && sn.header && Array.isArray(sn.values) && sn.values.length > 0) : [];
        for (const sn of validSnippets) {
          const snRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                type: "STRUCTURED_SNIPPET",
                structuredSnippetAsset: {
                  header: sn.header,
                  values: sn.values.map((v: string) => GoogleAdsBaseService.cleanAdText(String(v), 25)).filter(Boolean)
                }
              }
            }]
          }, { headers });
          const assetRef = snRes.data?.results?.[0]?.resourceName;
          if (assetRef) {
            campaignAssetOperations.push({
              create: {
                campaign: campaignRef,
                asset: assetRef,
                fieldType: "STRUCTURED_SNIPPET",
                status: "ENABLED"
              }
            });
          }
        }

        // Promotions (PromotionAsset)
        const validPromotions = Array.isArray(promotions) ? promotions : [];
        for (const promo of validPromotions) {
          const target = (promo.promotionTarget || promo.item || "").trim();
          const promoUrl = (promo.finalUrl || promo.url || safeFinalUrl).trim();
          if (target && promoUrl) {
            try {
              const promoBody: any = {
                promotionTarget: GoogleAdsBaseService.cleanAdText(target, 30),
                languageCode: promo.languageCode || "en"
              };
              if (promo.occasion && promo.occasion !== "None") {
                promoBody.occasion = promo.occasion;
              }
              if (promo.percentOff) {
                promoBody.percentOff = Math.round(Number(promo.percentOff) * 10000);
              } else if (promo.moneyAmountOff) {
                promoBody.moneyAmountOff = {
                  currencyCode: promo.currencyCode || "INR",
                  amountMicros: String(Math.round(Number(promo.moneyAmountOff) * 1_000_000))
                };
              }
              if (promo.promotionCode) {
                promoBody.promotionCode = String(promo.promotionCode).trim();
              }
              const pRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
                operations: [{
                  create: {
                    name: `Promo - ${target.slice(0, 20)} - ${Date.now()}`,
                    type: "PROMOTION",
                    promotionAsset: promoBody,
                    finalUrls: [GoogleAdsBaseService.cleanUrl(promoUrl)]
                  }
                }]
              }, { headers });
              const assetRef = pRes.data?.results?.[0]?.resourceName;
              if (assetRef) {
                campaignAssetOperations.push({
                  create: {
                    campaign: campaignRef,
                    asset: assetRef,
                    fieldType: "PROMOTION",
                    status: "ENABLED"
                  }
                });
              }
            } catch (pErr: any) {
              console.warn("[SalesPerformanceMaxService] Promotion asset creation skipped:", pErr?.message || pErr);
            }
          }
        }

        // Prices (PriceAsset)
        const validPrices = Array.isArray(prices) ? prices : [];
        for (const pr of validPrices) {
          const priceHeader = (pr.header || "").trim();
          const prFinalUrl = (pr.finalUrl || safeFinalUrl).trim();
          if (priceHeader) {
            try {
              const priceAssetBody: any = {
                type: pr.type || "PRODUCT_CATEGORIES",
                priceQualifier: pr.qualifier || "UNSPECIFIED",
                languageCode: pr.languageCode || "en",
                priceOfferings: [{
                  header: GoogleAdsBaseService.cleanAdText(priceHeader, 25),
                  description: GoogleAdsBaseService.cleanAdText(pr.description || priceHeader, 25),
                  finalUrls: [GoogleAdsBaseService.cleanUrl(prFinalUrl)],
                  price: {
                    currencyCode: pr.currencyCode || "INR",
                    amountMicros: String(Math.round(Number(pr.amount || 100) * 1_000_000))
                  },
                  unit: pr.unit || "UNSPECIFIED"
                }]
              };
              const prRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
                operations: [{
                  create: {
                    name: `Price - ${priceHeader.slice(0, 20)} - ${Date.now()}`,
                    type: "PRICE",
                    priceAsset: priceAssetBody
                  }
                }]
              }, { headers });
              const assetRef = prRes.data?.results?.[0]?.resourceName;
              if (assetRef) {
                campaignAssetOperations.push({
                  create: {
                    campaign: campaignRef,
                    asset: assetRef,
                    fieldType: "PRICE",
                    status: "ENABLED"
                  }
                });
              }
            } catch (prErr: any) {
              console.warn("[SalesPerformanceMaxService] Price asset creation skipped:", prErr?.message || prErr);
            }
          }
        }

        if (campaignAssetOperations.length > 0) {
          await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
            operations: campaignAssetOperations
          }, { headers });
        }
      } catch (extErr: any) {
        console.warn("[PMax Extension Assets Warning]:", extErr?.response?.data || extErr.message);
      }

    } catch (err: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(err);
      console.error("[Google Ads API error for Sales Performance Max]:", formatted);
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
      startDate: startDate ? new Date(String(startDate).split("T")[0]) : null,
      endDate: endDate ? new Date(String(endDate).split("T")[0]) : null,
      finalUrl,
      headlines: safeHeadlines,
      descriptions: safeDescriptions,
      geoTargets: {
        objective: "Sales",
        locations,
        languages,
        devices: devices || null,
        demographicExclusions: demographicExclusions || null,
        callouts: callouts || [],
        structuredSnippets: structuredSnippets || [],
        conversionGoals: {
          objective: "Sales",
          selectedConversionGoals: rawGoalsList,
          effectiveConversionGoals: mappedGoogleAdsGoals,
          goalConfigLevel
        }
      },
      languages: languages || ["Hindi"],
      searchThemes: Array.isArray(searchThemes) && searchThemes.length > 0 ? searchThemes : null,
      adSchedule: effectiveAdSchedule.length > 0 ? effectiveAdSchedule : null,
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicrosVal),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Performance Max Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}