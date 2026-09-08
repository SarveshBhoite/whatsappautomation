export interface ValidationError {
  field: string;
  message: string;
  type: "FIELD" | "ASSET" | "BUDGET" | "TARGETING";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  missingSummary: string[];
}

export interface ImageAssetItem {
  url?: string;
  data?: string;
  fieldType?: "MARKETING_IMAGE" | "SQUARE_MARKETING_IMAGE" | "LOGO" | string;
  name?: string;
}

export class GoogleAdsCampaignValidator {
  public static validate(state: any): ValidationResult {
    const errors: ValidationError[] = [];
    const missingSummary: string[] = [];

    const addError = (field: string, message: string, type: "FIELD" | "ASSET" | "BUDGET" | "TARGETING" = "FIELD") => {
      errors.push({ field, message, type });
      missingSummary.push(message);
    };

    if (!state || !state.campaignType) {
      addError("campaignType", "Campaign type is required.", "FIELD");
      return { isValid: false, errors, missingSummary };
    }

    const type = state.campaignType.toUpperCase();

    // 1. Common Campaign Level Validations
    if (!state.campaignName?.trim()) {
      addError("campaignName", "Campaign name is required.", "FIELD");
    }

    // Daily Budget
    const dailyBudgetNum = Number(state.dailyBudget);
    if (!state.dailyBudget || isNaN(dailyBudgetNum) || dailyBudgetNum <= 0) {
      addError("dailyBudget", "A valid positive daily budget greater than ₹0 is required.", "BUDGET");
    }

    // Locations
    if (!Array.isArray(state.locations) || state.locations.filter((l: any) => l && String(l).trim()).length === 0) {
      addError("locations", "At least one targeted location (e.g. 'India' or 'Mumbai') is required.", "TARGETING");
    }

    // Languages
    if (!state.language && (!Array.isArray(state.languages) || state.languages.length === 0)) {
      addError("language", "Target language is required (e.g. 'English').", "TARGETING");
    }

    // Dates validation (Common)
    const todayStr = new Date().toISOString().split("T")[0];
    if (state.startDate) {
      const startStr = String(state.startDate).split("T")[0];
      if (startStr < todayStr) {
        addError("startDate", `Start date cannot be in the past (${startStr}).`, "FIELD");
      }
    }
    if (state.endDate && state.startDate) {
      const startStr = String(state.startDate).split("T")[0];
      const endStr = String(state.endDate).split("T")[0];
      if (endStr <= startStr) {
        addError("endDate", `End date (${endStr}) must be after start date (${startStr}).`, "FIELD");
      }
    }

    // 2. Campaign Specific Validations
    switch (type) {
      case "PERFORMANCE_MAX": {
        // Business Name
        if (!state.businessName?.trim()) {
          addError("businessName", "Business name is required (max 25 characters).", "FIELD");
        } else if (state.businessName.trim().length > 25) {
          addError("businessName", "Business name must be 25 characters or fewer.", "FIELD");
        }

        // Final URL
        const pmaxUrl = state.website || state.finalUrl || "";
        if (!pmaxUrl.trim() || (!pmaxUrl.startsWith("http://") && !pmaxUrl.startsWith("https://"))) {
          addError("website", "A valid website landing page URL starting with http:// or https:// is required.", "FIELD");
        }

        // Bidding Strategy Validation
        const bStrategy = (state.biddingStrategy || "").trim();
        const normBStrategy = bStrategy.toLowerCase();
        if (normBStrategy === "target cpa" || normBStrategy === "target_cpa") {
          const cpaNum = Number(state.targetCpa);
          if (!state.targetCpa || isNaN(cpaNum) || cpaNum <= 0) {
            addError("targetCpa", "A valid positive Target CPA amount is required when Target CPA bidding is selected.", "FIELD");
          }
        } else if (normBStrategy === "target roas" || normBStrategy === "target_roas") {
          const roasNum = Number(state.targetRoas);
          if (!state.targetRoas || isNaN(roasNum) || roasNum <= 0) {
            addError("targetRoas", "A valid positive Target ROAS percentage (> 0) is required when Target ROAS bidding is selected.", "FIELD");
          }
        }

        // Headlines (at least 3 unique, <= 30 chars)
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 3) {
          addError("headlines", `At least 3 headlines are required for Performance Max (currently have ${validHeadlines.length}).`, "FIELD");
        }
        const uniqueHeadlines = Array.from(new Set(validHeadlines.map((h: string) => h.trim().toLowerCase())));
        if (uniqueHeadlines.length < validHeadlines.length) {
          addError("headlines", "All headlines must be unique.", "FIELD");
        }
        for (const h of validHeadlines) {
          if (h.length > 30) {
            addError("headlines", `Headline "${h.slice(0, 20)}..." exceeds the 30-character limit.`, "FIELD");
            break;
          }
        }

        // Long Headlines (at least 1 unique, <= 90 chars)
        const validLongHeadlines = (state.longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
        if (validLongHeadlines.length < 1) {
          addError("longHeadlines", "At least 1 long headline (up to 90 characters) is required for Performance Max.", "FIELD");
        }
        for (const lh of validLongHeadlines) {
          if (lh.length > 90) {
            addError("longHeadlines", `Long headline "${lh.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
        }

        // Descriptions (at least 2 unique, <= 90 chars)
        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 2) {
          addError("descriptions", `At least 2 descriptions are required for Performance Max (currently have ${validDescriptions.length}).`, "FIELD");
        }
        const uniqueDescriptions = Array.from(new Set(validDescriptions.map((d: string) => d.trim().toLowerCase())));
        if (uniqueDescriptions.length < validDescriptions.length) {
          addError("descriptions", "All descriptions must be unique.", "FIELD");
        }
        for (const d of validDescriptions) {
          if (d.length > 90) {
            addError("descriptions", `Description "${d.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
        }

        // ASSET REQUIREMENT: Landscape 1.91:1, Square 1:1, Logo 1:1
        const allImages: any[] = [
          ...(Array.isArray(state.images) ? state.images : []),
          ...(Array.isArray(state.uploadedImages) ? state.uploadedImages : [])
        ];
        const allLogos: any[] = [
          ...(Array.isArray(state.logos) ? state.logos : []),
          ...(Array.isArray(state.brandLogos) ? state.brandLogos : [])
        ];

        let hasLandscape = false;
        let hasSquare = false;
        let hasLogo = allLogos.length > 0;

        for (const img of allImages) {
          const raw = typeof img === "string" ? img : img?.url || img?.data || "";
          const fType = typeof img === "object" ? img?.fieldType : null;

          if (fType === "MARKETING_IMAGE") hasLandscape = true;
          else if (fType === "SQUARE_MARKETING_IMAGE") hasSquare = true;
          else if (fType === "LOGO") hasLogo = true;
          else if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
            // ImageKit transformation allows auto-deriving landscape and square
            hasLandscape = true;
            hasSquare = true;
          } else if (raw) {
            hasLandscape = true;
          }
        }

        // Check explicit logo formats
        for (const logo of allLogos) {
          const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || "";
          if (raw) hasLogo = true;
        }

        if (!hasLandscape) {
          addError("landscapeMarketingImage", "At least 1 landscape marketing image (1.91:1) is required for Performance Max.", "ASSET");
        }
        if (!hasSquare) {
          addError("squareMarketingImage", "At least 1 square marketing image (1:1) is required for Performance Max.", "ASSET");
        }
        if (!hasLogo) {
          addError("logo", "At least 1 square brand logo (1:1) is required for Performance Max.", "ASSET");
        }
        break;
      }

      case "SEARCH": {
        // Business Name
        if (!state.businessName?.trim()) {
          addError("businessName", "Business name is required.", "FIELD");
        }

        // Final URL
        const searchUrl = state.website || state.websiteVisitsUrl || state.finalUrl || "";
        if (!searchUrl.trim() || (!searchUrl.startsWith("http://") && !searchUrl.startsWith("https://"))) {
          addError("website", "A valid website URL starting with http:// or https:// is required.", "FIELD");
        }

        // Headlines (at least 3 unique, <= 30 chars)
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 3) {
          addError("headlines", `Search ads require at least 3 unique headlines (currently have ${validHeadlines.length}).`, "FIELD");
        }
        const uniqueHeadlines = Array.from(new Set(validHeadlines.map((h: string) => h.trim().toLowerCase())));
        if (uniqueHeadlines.length < validHeadlines.length) {
          addError("headlines", "All headlines must be unique.", "FIELD");
        }
        for (const h of validHeadlines) {
          if (h.length > 30) {
            addError("headlines", `Headline "${h.slice(0, 20)}..." exceeds the 30-character limit.`, "FIELD");
            break;
          }
        }

        // Descriptions (at least 2 unique, <= 90 chars)
        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 2) {
          addError("descriptions", `Search ads require at least 2 unique descriptions (currently have ${validDescriptions.length}).`, "FIELD");
        }
        const uniqueDescriptions = Array.from(new Set(validDescriptions.map((d: string) => d.trim().toLowerCase())));
        if (uniqueDescriptions.length < validDescriptions.length) {
          addError("descriptions", "All descriptions must be unique.", "FIELD");
        }
        for (const d of validDescriptions) {
          if (d.length > 90) {
            addError("descriptions", `Description "${d.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
        }

        // Keywords (at least 1)
        const validKeywords = (state.keywords || []).filter((k: any) => typeof k === "string" && k.trim().length > 0);
        if (validKeywords.length < 1) {
          addError("keywords", "At least 1 target search keyword is required.", "FIELD");
        }

        // Bidding Strategy Validation
        const searchBStrategy = (state.biddingStrategy || "").trim().toLowerCase();
        if (searchBStrategy === "target cpa" || searchBStrategy === "target_cpa") {
          const cpaNum = Number(state.targetCpa);
          if (!state.targetCpa || isNaN(cpaNum) || cpaNum <= 0) {
            addError("targetCpa", "A valid positive Target CPA amount is required when Target CPA bidding is selected.", "FIELD");
          }
        } else if (searchBStrategy === "target roas" || searchBStrategy === "target_roas") {
          const roasNum = Number(state.targetRoas);
          if (!state.targetRoas || isNaN(roasNum) || roasNum <= 0) {
            addError("targetRoas", "A valid positive Target ROAS percentage (> 0) is required when Target ROAS bidding is selected.", "FIELD");
          }
        } else if (searchBStrategy === "impression share" || searchBStrategy === "target impression share" || searchBStrategy === "target_impression_share") {
          const isPercent = Number(state.targetImpressionSharePercent);
          if (state.targetImpressionSharePercent !== undefined && (isNaN(isPercent) || isPercent <= 0 || isPercent > 100)) {
            addError("targetImpressionSharePercent", "Target impression share percentage must be between 1% and 100%.", "FIELD");
          }
        }
        break;
      }

      case "DISPLAY": {
        // Business Name
        if (!state.businessName?.trim()) {
          addError("businessName", "Business name is required.", "FIELD");
        }

        // Final URL
        const displayUrl = state.website || state.finalUrl || "";
        if (!displayUrl.trim() || (!displayUrl.startsWith("http://") && !displayUrl.startsWith("https://"))) {
          addError("website", "A valid landing page URL starting with http:// or https:// is required.", "FIELD");
        }

        // Headlines & Descriptions
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for Display campaigns.", "FIELD");
        }

        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for Display campaigns.", "FIELD");
        }

        // Display requires at least 1 image
        const hasImages = (Array.isArray(state.images) && state.images.length > 0) ||
                          (Array.isArray(state.uploadedImages) && state.uploadedImages.length > 0);
        if (!hasImages) {
          addError("images", "At least 1 marketing image is required for Display ads.", "ASSET");
        }
        break;
      }

      case "DEMAND_GEN": {
        if (!state.businessName?.trim()) {
          addError("businessName", "Business name is required for Demand Gen.", "FIELD");
        } else if (state.businessName.trim().length > 25) {
          addError("businessName", "Business name cannot exceed 25 characters.", "FIELD");
        }

        const dgUrl = state.website || state.finalUrl || "";
        if (!dgUrl.trim() || (!dgUrl.startsWith("http://") && !dgUrl.startsWith("https://"))) {
          addError("website", "A valid landing page URL starting with http:// or https:// is required.", "FIELD");
        } else {
          try {
            const parsed = new URL(dgUrl.trim());
            const host = parsed.hostname.toLowerCase();
            if (host === "example.com" || host.endsWith(".example.com") || host === "google.com" || host.endsWith(".google.com") || host === "localhost" || host === "127.0.0.1") {
              addError("website", `Final URL cannot use dummy or restricted domains (${host}).`, "FIELD");
            }
          } catch (e: any) {
            addError("website", "Invalid website URL format.", "FIELD");
          }
        }

        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for Demand Gen.", "FIELD");
        }
        for (const h of validHeadlines) {
          if (h.length > 40) {
            addError("headlines", `Headline "${h.slice(0, 20)}..." exceeds the 40-character limit.`, "FIELD");
            break;
          }
        }

        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for Demand Gen.", "FIELD");
        }
        for (const d of validDescriptions) {
          if (d.length > 90) {
            addError("descriptions", `Description "${d.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
        }

        const format = (state.adFormat || "SINGLE_IMAGE").toUpperCase();
        const allLogos = [
          ...(Array.isArray(state.logos) ? state.logos : []),
          ...(Array.isArray(state.brandLogos) ? state.brandLogos : [])
        ].filter((l: any) => l && (typeof l === "string" ? l.trim() : l.url || l.data || l.asset));

        if (allLogos.length < 1) {
          addError("logos", "At least 1 brand logo is required for Demand Gen ads.", "ASSET");
        }

        if (format === "SINGLE_IMAGE") {
          const allImages = [
            ...(Array.isArray(state.images) ? state.images : []),
            ...(Array.isArray(state.uploadedImages) ? state.uploadedImages : [])
          ].filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data || img.asset));
          if (allImages.length < 1) {
            addError("images", "At least 1 marketing image is required for Single Image Demand Gen ads.", "ASSET");
          }
        } else if (format === "VIDEO") {
          const allVideos = [
            ...(Array.isArray(state.videos) ? state.videos : []),
            ...(Array.isArray(state.youtubeVideos) ? state.youtubeVideos : [])
          ].filter((v: any) => v && (typeof v === "string" ? v.trim() : v.asset || v.videoId || v.url));
          if (allVideos.length < 1) {
            addError("videos", "At least 1 YouTube video asset is required for Video Demand Gen ads.", "ASSET");
          }
        } else if (format === "CAROUSEL") {
          const cards = Array.isArray(state.carouselCards) ? state.carouselCards : [];
          const validCards = cards.filter((c: any) => c && c.image && c.headline);
          if (validCards.length < 2) {
            addError("carouselCards", `At least 2 carousel cards with an image and headline are required for Carousel Demand Gen ads (currently have ${validCards.length}).`, "ASSET");
          }
        }

        // Bidding validation
        const bStrat = (state.biddingStrategy || "").trim().toLowerCase();
        if (bStrat === "target cpa" || bStrat === "target_cpa") {
          const cpaNum = Number(state.targetCpa);
          if (state.targetCpa === undefined || state.targetCpa === null || isNaN(cpaNum) || cpaNum <= 0) {
            addError("targetCpa", "A positive Target CPA amount is required when Target CPA bidding is selected.", "FIELD");
          }
        } else if (bStrat === "target roas" || bStrat === "target_roas") {
          const roasNum = Number(state.targetRoas);
          if (state.targetRoas === undefined || state.targetRoas === null || isNaN(roasNum) || roasNum <= 0) {
            addError("targetRoas", "A positive Target ROAS is required when Target ROAS bidding is selected.", "FIELD");
          }
        } else if (bStrat === "youtube engagements" || bStrat === "youtube_engagements") {
          addError("biddingStrategy", "YouTube engagements bidding is not supported for Demand Gen Website Traffic or Lead campaigns.", "FIELD");
        }
        break;
      }

      case "VIDEO": {
        const videoUrl = state.website || state.finalUrl || "";
        if (!videoUrl.trim() || (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://"))) {
          addError("website", "A valid final URL starting with http:// or https:// is required.", "FIELD");
        }
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for Video campaigns.", "FIELD");
        }
        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for Video campaigns.", "FIELD");
        }
        break;
      }

      case "APP": {
        if (!state.appId?.trim()) {
          addError("appId", "Mobile App package name (Android) or bundle ID (iOS) is required (e.g. 'com.hubmate.app').", "FIELD");
        }
        if (!state.businessName?.trim() && !state.business?.name?.trim()) {
          addError("businessName", "Business name is required for App promotion.", "FIELD");
        }
        const targetCpaNum = Number(state.targetCpa);
        if (state.targetCpa === undefined || state.targetCpa === null || state.targetCpa === "" || isNaN(targetCpaNum) || targetCpaNum <= 0) {
          addError("targetCpa", "A valid positive Target CPA is required for App install campaigns.", "FIELD");
        }
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for App promotion.", "FIELD");
        }
        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for App promotion.", "FIELD");
        }
        break;
      }

      case "SHOPPING": {
        const mId = state.merchantCenterId || state.merchantId || "";
        if (!mId.trim()) {
          addError("merchantCenterId", "Google Merchant Center Account ID is required before this Shopping campaign can be published.", "FIELD");
        } else if (!/^\d+$/.test(mId.trim())) {
          addError("merchantCenterId", "Merchant Center ID must be numeric (e.g. 5840531233).", "FIELD");
        }

        const country = state.salesCountry || state.feedLabel || "";
        if (!country.trim()) {
          addError("salesCountry", "Sales Country / Feed Label is required for Shopping campaigns.", "FIELD");
        }

        const shoppingUrl = state.website || state.finalUrl || "";
        if (!shoppingUrl.trim() || (!shoppingUrl.startsWith("http://") && !shoppingUrl.startsWith("https://"))) {
          addError("website", "A valid final landing page URL starting with http:// or https:// is required.", "FIELD");
        }

        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for Shopping campaigns.", "FIELD");
        }

        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for Shopping campaigns.", "FIELD");
        }

        if (state.adGroupName !== undefined && state.adGroupName !== null && !state.adGroupName.trim()) {
          addError("adGroupName", "Ad group name is required.", "FIELD");
        }

        const bStrategy = state.biddingStrategy;
        if (bStrategy === "TARGET_ROAS" || bStrategy === "Target ROAS") {
          const roas = Number(state.targetRoas);
          if (!state.targetRoas || isNaN(roas) || roas <= 0) {
            addError("targetRoas", "Target ROAS is required and must be greater than 0% when Target ROAS bidding is selected.", "FIELD");
          }
        } else if (bStrategy === "MANUAL_CPC" || bStrategy === "Manual CPC") {
          const bid = Number(state.adGroupBid);
          if (!state.adGroupBid || isNaN(bid) || bid <= 0) {
            addError("adGroupBid", "Ad group CPC bid must be greater than 0 for Manual CPC.", "FIELD");
          }
        } else if ((bStrategy === "MAXIMIZE_CLICKS" || bStrategy === "Maximize clicks" || bStrategy === "Clicks") && (state.setMaxCpcLimit || state.maxCpcLimit !== undefined && state.maxCpcLimit !== null && state.maxCpcLimit !== "")) {
          const maxCpc = Number(state.maxCpcLimit);
          if (isNaN(maxCpc) || maxCpc <= 0) {
            addError("maxCpcLimit", "Maximum CPC limit must be greater than 0 when enabled.", "FIELD");
          }
        }

        if (state.endDate && state.startDate && state.endDate < state.startDate) {
          addError("endDate", `End date cannot be earlier than start date (${state.startDate}).`, "FIELD");
        }
        break;
      }

      default:
        addError("campaignType", `Unsupported campaign type: ${state.campaignType}`, "FIELD");
        break;
    }

    return {
      isValid: errors.length === 0,
      errors,
      missingSummary
    };
  }
}
