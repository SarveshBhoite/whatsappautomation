import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class LeadsPerformanceMaxService extends GoogleAdsBaseService {
  public static readonly GEO_TARGET_CONSTANT_MAP: Record<string, string> = {
    "india": "2356",
    "mumbai": "1007788",
    "mumbai, maharashtra, india": "1007788",
    "delhi": "1007785",
    "delhi, india": "1007785",
    "bengaluru": "1007768",
    "bengaluru, karnataka, india": "1007768",
    "bangalore": "1007768",
    "hyderabad": "1007773",
    "hyderabad, telangana, india": "1007773",
    "pune": "1007801",
    "pune, maharashtra, india": "1007801",
    "kolkata": "1007743",
    "kolkata, west bengal, india": "1007743",
    "chennai": "1007809",
    "chennai, tamil nadu, india": "1007809",
    "ahmedabad": "1007753",
    "ahmedabad, gujarat, india": "1007753",
    "jaipur": "1007828",
    "jaipur, rajasthan, india": "1007828",
    "surat": "1007754",
    "surat, gujarat, india": "1007754",
    "lucknow": "1007782",
    "lucknow, uttar pradesh, india": "1007782",
    "united states": "2840",
    "united kingdom": "2826",
    "australia": "2036",
    "canada": "2124",
    "united arab emirates": "2784",
    "singapore": "2702"
  };

  public static readonly LANGUAGE_CONSTANT_MAP: Record<string, string> = {
    "english": "1000",
    "spanish": "1003",
    "french": "1002",
    "german": "1001",
    "italian": "1004",
    "portuguese": "1014",
    "dutch": "1010",
    "russian": "1031",
    "japanese": "1005",
    "chinese": "1017",
    "chinese (simplified)": "1017",
    "chinese (traditional)": "1018",
    "korean": "1012",
    "arabic": "1019",
    "hindi": "1023",
    "bengali": "1056",
    "gujarati": "1072",
    "kannada": "1086",
    "malayalam": "1098",
    "marathi": "1101",
    "punjabi": "1110",
    "tamil": "1130",
    "telugu": "1131",
    "urdu": "1041"
  };

  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const isAiGuided = payload?.source === "AI_GUIDED" || payload?.isAiGuided === true;

    const {
      campaignName = "Leads Performance Max",
      assetGroupName = "Asset Group 1",
      finalUrl,
      amountMicros,
      biddingFocus = "Maximize conversions",
      targetCpa,
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
      startDate,
      endDate,
      euPolitical = "NO",
      businessName,
      logos = [],
      brandGuidelinesEnabled = false
    } = payload;

    const safeFinalUrl = GoogleAdsBaseService.cleanUrl(finalUrl);
    if (!safeFinalUrl) throw new Error("A valid Final URL is required.");

    // Validate Daily Budget
    const rawBudget = dailyBudget !== undefined && dailyBudget !== null && dailyBudget !== "" ? dailyBudget : budget;
    if (isAiGuided) {
      const budgetNum = Number(rawBudget);
      if (!rawBudget || isNaN(budgetNum) || budgetNum <= 0) {
        throw new Error("A valid positive daily budget greater than ₹0 is required for AI Guided Performance Max.");
      }
    }
    const effectiveBudget = Number(rawBudget || 1000);
    const amountMicrosVal = amountMicros || Math.round(effectiveBudget * 1_000_000);

    const validHeadlines = (headlines || []).filter((h: any) => h && String(h).trim());
    const validLongHeadlines = (longHeadlines || []).filter((h: any) => h && String(h).trim());
    const validDescriptions = (descriptions || []).filter((d: any) => d && String(d).trim());

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

    // AI Guided: Strict check with NO fake silent text fallbacks
    if (isAiGuided) {
      if (!businessName || !String(businessName).trim()) {
        throw new Error("Business name is required (max 25 characters).");
      }
      if (String(businessName).trim().length > 25) {
        throw new Error("Business name must be 25 characters or fewer.");
      }
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

    const safeHeadlines = isAiGuided
      ? cleanedHeadlines.slice(0, 5)
      : (cleanedHeadlines.length >= 3 ? cleanedHeadlines : [...cleanedHeadlines, "Best Solutions", "Top Quality Services", "Grow Your Business"]).slice(0, 5);

    const safeLongHeadlines = isAiGuided
      ? cleanedLongHeadlines.slice(0, 5)
      : (cleanedLongHeadlines.length >= 1 ? cleanedLongHeadlines : ["Experience premium digital services and fast business growth."]).slice(0, 5);

    const safeDescriptions = isAiGuided
      ? cleanedDescriptions.slice(0, 5)
      : (cleanedDescriptions.length >= 2 ? cleanedDescriptions : [...cleanedDescriptions, "Discover great offers and personalized support.", "Get in touch today for expert services."]).slice(0, 5);

    const safeBusinessName = isAiGuided
      ? GoogleAdsBaseService.cleanAdText(String(businessName), 25)
      : (GoogleAdsBaseService.cleanAdText(businessName || "My Business", 25) || "My Business");

    const cid = (customerId || "").replace(/-/g, "").trim();

    // Bidding Strategy mapping
    let biddingConfig: any = {};
    const normalizedFocus = (biddingFocus || "maximize conversions").trim().toLowerCase();
    const effectiveCpaMicros = targetCpaMicros || (targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined);

    if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
      if (isAiGuided && (normalizedFocus === "target roas" || targetRoas !== undefined)) {
        const roasVal = Number(targetRoas);
        if (isNaN(roasVal) || roasVal <= 0) {
          throw new Error("A positive Target ROAS is required when Target ROAS bidding is selected.");
        }
      }
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else {
      if (isAiGuided && (normalizedFocus === "target cpa" || targetCpa !== undefined)) {
        const cpaVal = Number(targetCpa);
        if (isNaN(cpaVal) || cpaVal <= 0) {
          throw new Error("A positive Target CPA is required when Target CPA bidding is selected.");
        }
      }
      biddingConfig = { maximizeConversions: effectiveCpaMicros ? { targetCpaMicros: String(effectiveCpaMicros) } : {} };
    }

    // Dates validation
    let formattedStartDate: string | undefined = undefined;
    let formattedEndDate: string | undefined = undefined;
    if (startDate) {
      formattedStartDate = String(startDate).split("T")[0];
    }
    if (endDate) {
      formattedEndDate = String(endDate).split("T")[0];
      if (formattedStartDate && formattedEndDate <= formattedStartDate) {
        throw new Error(`End date (${formattedEndDate}) must be after start date (${formattedStartDate}).`);
      }
    }

    let apiResult: any = { campaignId: `leads-pmax-${Date.now()}` };
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
        const createOp: any = {
          name: effectiveCampaignName,
          status: "PAUSED",
          advertisingChannelType: "PERFORMANCE_MAX",
          campaignBudget: budgetRef,
          containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
          brandGuidelinesEnabled: false,
          ...biddingConfig
        };
        if (formattedStartDate) createOp.startDateTime = `${formattedStartDate} 00:00:00`;
        if (formattedEndDate) createOp.endDateTime = `${formattedEndDate} 23:59:59`;

        const campaignPayload = {
          operations: [{ create: createOp }]
        };

        campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          const retryOp: any = {
            name: effectiveCampaignName,
            status: "PAUSED",
            advertisingChannelType: "PERFORMANCE_MAX",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            brandGuidelinesEnabled: false,
            ...biddingConfig
          };
          if (formattedStartDate) retryOp.startDateTime = `${formattedStartDate} 00:00:00`;
          if (formattedEndDate) retryOp.endDateTime = `${formattedEndDate} 23:59:59`;

          const retryPayload = {
            operations: [{ create: retryOp }]
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

      // Safe Aspect-Ratio-Preserving Fallbacks (MANUAL FLOW ONLY):
      // In AI Guided, strict explicit asset types are required - no cross-asset borrowing!
      if (!isAiGuided) {
        // 1. Logo fallback from Square Marketing Image (Both are 1:1 Square)
        if (logoRefs.length === 0 && squareImageRefs.length > 0) {
          logoRefs.push(squareImageRefs[0]);
        }
        // 2. Square Marketing Image fallback from Logo (Both are 1:1 Square)
        if (squareImageRefs.length === 0 && logoRefs.length > 0) {
          squareImageRefs.push(logoRefs[0]);
        }
        // 3. Marketing Image (Landscape 1.91:1) fallback via ImageKit URL transformation
        if (marketingImageRefs.length === 0 && fallbackImageKitUrl) {
          const landUrl = toImageKitTransform(fallbackImageKitUrl, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          const landRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Land_${Date.now()}`, landUrl);
          if (landRef && !marketingImageRefs.includes(landRef)) marketingImageRefs.push(landRef);
        }
        // 4. Square Image fallback via ImageKit URL transformation
        if (squareImageRefs.length === 0 && fallbackImageKitUrl) {
          const sqUrl = toImageKitTransform(fallbackImageKitUrl, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          const sqRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Sq_${Date.now()}`, sqUrl);
          if (sqRef && !squareImageRefs.includes(sqRef)) squareImageRefs.push(sqRef);
        }
        // 5. Logo fallback via ImageKit URL transformation
        if (logoRefs.length === 0 && fallbackImageKitUrl) {
          const logoUrl = toImageKitTransform(fallbackImageKitUrl, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
          const logoRef = await this.uploadImageAsset(organizationId, customerId, `PMax_Logo_${Date.now()}`, logoUrl);
          if (logoRef && !logoRefs.includes(logoRef)) logoRefs.push(logoRef);
        }
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

      // 7. Mutate Campaign Criteria (Locations + Proximity Radius + Languages)
      const criteriaResults = await GoogleAdsBaseService.mutateCampaignGeoAndLanguageCriteria(
        organizationId,
        customerId,
        campaignRef,
        { locations, languages, headers }
      );
      apiResult.criteriaResults = criteriaResults;

    } catch (err: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(err);
      console.error("[Google Ads API error for Leads Performance Max]:", formatted);
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
      geoTargets: { objective: "Leads", locations, languages },
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicrosVal),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Leads Performance Max Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}