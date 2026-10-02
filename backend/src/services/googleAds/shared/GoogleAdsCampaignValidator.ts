import { GoogleAdsBaseService } from "./GoogleAdsBaseService";
import { YouTubeService } from "../../youtubeService";

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

    if (!state.objective?.trim()) {
      addError("objective", "Campaign objective is required.", "FIELD");
    }

    // Common Final URL Validation (Applicable to all campaign types except APP)
    if (type !== "APP") {
      const candidateUrl = (state.website || state.finalUrl || state.websiteVisitsUrl || "").trim();
      if (!candidateUrl) {
        addError("website", "A landing page / website URL starting with http:// or https:// is required.", "FIELD");
      } else if (!candidateUrl.startsWith("http://") && !candidateUrl.startsWith("https://")) {
        addError("website", "Landing page URL must start with http:// or https://.", "FIELD");
      } else {
        try {
          const parsed = new URL(candidateUrl);
          const host = parsed.hostname.toLowerCase();
          if (!host || !host.includes(".")) {
            addError("website", "A valid domain name (e.g. yourbusiness.com) is required for the landing page URL.", "FIELD");
          } else if (host === "example.com" || host.endsWith(".example.com") || host === "localhost" || host === "127.0.0.1" || host === "test.com") {
            addError("website", `Landing page URL cannot use placeholder or local test domains (${host}).`, "FIELD");
          }
        } catch {
          addError("website", "Invalid website landing page URL format.", "FIELD");
        }
      }
    }

    // Common Tracking Template Validation
    if (state.trackingTemplate) {
      const tt = String(state.trackingTemplate).trim();
      if (tt.length > 0) {
        const hasTag = /\{(lpurl|unescapedlpurl|escapedlpurl|lpurl\+\d+)\}/i.test(tt);
        if (!hasTag) {
          addError("trackingTemplate", "Tracking template must contain at least one landing page tag (e.g. {lpurl}?utm_source=google).", "FIELD");
        }
      }
    }

    // Budget Validation (Daily Budget vs Campaign Total Budget)
    const budgetType = (state.budgetType || "DAILY").toUpperCase() as "DAILY" | "TOTAL";
    const rawBudgetInput = state.dailyBudget !== undefined && state.dailyBudget !== null && state.dailyBudget !== "" 
      ? state.dailyBudget 
      : (state.totalBudget !== undefined && state.totalBudget !== null && state.totalBudget !== "" ? state.totalBudget : state.budget);
    const parsedBudgetNum = Number(rawBudgetInput);
    const currency = (state.currencyCode || state.currency || "INR").toUpperCase();
    const currencySymbol = currency === "USD" ? "$" : (currency === "EUR" ? "€" : (currency === "GBP" ? "£" : (currency === "INR" ? "₹" : `${currency} `)));

    if (rawBudgetInput === undefined || rawBudgetInput === null || String(rawBudgetInput).trim() === "") {
      addError("dailyBudget", `${budgetType === "TOTAL" ? "Campaign Total Budget" : "Daily budget"} is required.`, "BUDGET");
    } else if (isNaN(parsedBudgetNum) || !isFinite(parsedBudgetNum)) {
      addError("dailyBudget", "Budget must be a finite numeric value (rejecting NaN and Infinity).", "BUDGET");
    } else if (parsedBudgetNum <= 0) {
      addError("dailyBudget", `${budgetType === "TOTAL" ? "Campaign Total Budget" : "Daily budget"} must be greater than ${currencySymbol}0.`, "BUDGET");
    } else if (parsedBudgetNum > 10_000_000) {
      addError("dailyBudget", `Budget value (${currencySymbol}${parsedBudgetNum}) exceeds the maximum allowed limit of ${currencySymbol}10,000,000.`, "BUDGET");
    }

    // Calculate duration and daily equivalent for TOTAL budget
    let durationDays: number | null = null;
    let calculatedDailyEquivalent: number | null = null;
    if (budgetType === "TOTAL") {
      if (!state.endDate || !String(state.endDate).trim()) {
        addError("endDate", "End date is required when using Campaign Total Budget.", "FIELD");
      } else if (state.startDate) {
        const sTime = new Date(String(state.startDate).trim().split("T")[0]).getTime();
        const eTime = new Date(String(state.endDate).trim().split("T")[0]).getTime();
        if (!isNaN(sTime) && !isNaN(eTime) && eTime > sTime) {
          durationDays = Math.max(1, Math.ceil((eTime - sTime) / (1000 * 60 * 60 * 24)));
          if (!isNaN(parsedBudgetNum) && parsedBudgetNum > 0) {
            calculatedDailyEquivalent = Math.max(1, Math.round(parsedBudgetNum / durationDays));
          }
        }
      }
    } else {
      if (!isNaN(parsedBudgetNum) && parsedBudgetNum > 0) {
        calculatedDailyEquivalent = parsedBudgetNum;
      }
    }

    console.log(`\n==================== 💰 [AI GUIDED BUDGET VALIDATION] ====================`);
    console.log(`Budget Type:                     ${budgetType === "TOTAL" ? "CAMPAIGN_TOTAL_BUDGET" : "DAILY_BUDGET"}`);
    console.log(`Input Budget:                    ${currencySymbol}${rawBudgetInput} (${currency})`);
    console.log(`Start Date:                      ${state.startDate || "N/A (defaults to today)"}`);
    console.log(`End Date:                        ${state.endDate || "None (Continuous)"}`);
    console.log(`Duration Days:                   ${durationDays !== null ? `${durationDays} days` : "N/A"}`);
    console.log(`Calculated Daily Equivalent:     ${calculatedDailyEquivalent !== null ? `${currencySymbol}${calculatedDailyEquivalent}/day` : "N/A"}`);
    console.log(`Google Ads Budget Representation:${budgetType === "TOTAL" ? (type === "VIDEO" ? "CAMPAIGN_TOTAL_BUDGET" : `DAILY_BUDGET (derived ${currencySymbol}${calculatedDailyEquivalent}/day)`) : `DAILY_BUDGET (${currencySymbol}${parsedBudgetNum}/day)`}`);
    console.log(`=========================================================================\n`);

    // Common Locations & Proximity Validation
    if (!Array.isArray(state.locations) || state.locations.filter((l: any) => l && (typeof l === "string" ? l.trim() : (l.name || l.locationName))).length === 0) {
      addError("locations", "At least one targeted location (e.g. 'India' or 'Mumbai') is required.", "TARGETING");
    } else {
      for (const loc of state.locations) {
        if (!loc) continue;
        if (typeof loc === "object") {
          if (loc.type === "PROXIMITY" || loc.mode === "RADIUS" || loc.radius !== undefined) {
            const rad = Number(loc.radius);
            if (isNaN(rad) || !isFinite(rad) || rad <= 0 || rad > 500) {
              addError("locations", "Proximity radius must be between 1 and the maximum supported radius (500 km / 300 mi).", "TARGETING");
              break;
            }
          }
        } else if (typeof loc === "string") {
          const radiusMatch = loc.match(/^(\d+(?:\.\d+)?)\s*(km|mi|miles|kilometers)\s+(?:around|radius\s+of)\s+(.+)$/i);
          if (radiusMatch) {
            const rad = Number(radiusMatch[1]);
            if (isNaN(rad) || !isFinite(rad) || rad <= 0 || rad > 500) {
              addError("locations", "Proximity radius must be between 1 and the maximum supported radius (500 km / 300 mi).", "TARGETING");
              break;
            }
          }
        }
      }
    }

    // Common Languages Validation
    if (!state.language && (!Array.isArray(state.languages) || state.languages.length === 0)) {
      addError("language", "Target language is required (e.g. 'English' or 'All languages').", "TARGETING");
    }

    // Common Dates Validation
    const todayStr = new Date().toISOString().split("T")[0];
    if (state.startDate) {
      const startStr = String(state.startDate).trim().split("T")[0];
      if (startStr < todayStr) {
        addError("startDate", `Start date cannot be in the past (${startStr}). Please choose today (${todayStr}) or a future date.`, "FIELD");
      }
    }

    if (state.endDate && state.startDate) {
      const startStr = String(state.startDate).trim().split("T")[0];
      const endStr = String(state.endDate).trim().split("T")[0];
      if (endStr <= startStr) {
        addError("endDate", `End date (${endStr}) must be after start date (${startStr}).`, "FIELD");
      }
    }

    // Common Ad Schedule Validation
    const rawSchedule = state.adSchedule || (state as any).adScheduleList;
    if (rawSchedule && Array.isArray(rawSchedule) && rawSchedule.length > 0) {
      const receivedRows = rawSchedule.length;
      let validRows = 0;
      let removedDuplicateRows = 0;
      let invalidRows = 0;
      const seen = new Set<string>();

      for (const s of rawSchedule) {
        if (!s || typeof s !== "object") {
          invalidRows++;
          continue;
        }
        const day = String(s.day || s.dayOfWeek || "").trim();
        const start = String(s.start || "").trim();
        const end = String(s.end || "").trim();

        if (!day || !start || !end) {
          invalidRows++;
          addError("adSchedule", "Each schedule row must have a valid day, start time, and end time.", "TARGETING");
          break;
        }

        const key = `${day.toLowerCase()}_${start}_${end}`;
        if (seen.has(key)) {
          removedDuplicateRows++;
          continue;
        }
        seen.add(key);

        const isFullDay = (start === "00:00" || start === "0:00") && (end === "00:00" || end === "0:00" || end === "24:00");
        if (!isFullDay && start >= end) {
          invalidRows++;
          addError("adSchedule", `Schedule start time (${start}) must be strictly before end time (${end}) for ${day}.`, "TARGETING");
          break;
        }
        validRows++;
      }

      console.log(`\n==================== ⏰ [AI GUIDED SCHEDULE VALIDATION] ====================`);
      console.log(`Received Rows:                   ${receivedRows}`);
      console.log(`Valid Rows:                      ${validRows}`);
      console.log(`Removed Duplicate Rows:          ${removedDuplicateRows}`);
      console.log(`Invalid Rows:                    ${invalidRows}`);
      console.log(`Final Google Ads Schedule:       ${validRows} active interval(s)`);
      console.log(`===========================================================================\n`);
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
        const validHeadlines = (state.headlines || [])
          .map((h: any) => GoogleAdsBaseService.cleanAdText(String(h || ""), 30))
          .filter((h: string) => h.length > 0);
        if (validHeadlines.length < 3) {
          addError("headlines", `At least 3 headlines are required for Performance Max (currently have ${validHeadlines.length}).`, "FIELD");
        }
        const uniqueHeadlines = Array.from(new Set(validHeadlines.map((h: string) => h.trim().toLowerCase())));
        if (uniqueHeadlines.length < validHeadlines.length) {
          addError("headlines", "All headlines must be unique.", "FIELD");
        }

        // Long Headlines (at least 1 unique, <= 90 chars)
        const validLongHeadlines = (state.longHeadlines || [])
          .map((lh: any) => GoogleAdsBaseService.cleanAdText(String(lh || ""), 90))
          .filter((lh: string) => lh.length > 0);
        if (validLongHeadlines.length < 1) {
          addError("longHeadlines", "At least 1 long headline (up to 90 characters) is required for Performance Max.", "FIELD");
        }

        // Descriptions (at least 2 unique, <= 90 chars)
        const validDescriptions = (state.descriptions || [])
          .map((d: any) => GoogleAdsBaseService.cleanAdText(String(d || ""), 90))
          .filter((d: string) => d.length > 0);
        if (validDescriptions.length < 2) {
          addError("descriptions", `At least 2 descriptions are required for Performance Max (currently have ${validDescriptions.length}).`, "FIELD");
        }
        const uniqueDescriptions = Array.from(new Set(validDescriptions.map((d: string) => d.trim().toLowerCase())));
        if (uniqueDescriptions.length < validDescriptions.length) {
          addError("descriptions", "All descriptions must be unique.", "FIELD");
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
          const ratio = typeof img === "object" ? img?.aspectRatio : null;
          const name = (typeof img === "object" && img?.name) ? img.name.toLowerCase() : "";
          const dims = typeof img === "object" ? img?.dimensions : null;

          const isSquareDetected = fType === "SQUARE_MARKETING_IMAGE" ||
            ratio === "1:1" ||
            name.includes("1x1") ||
            name.includes("1:1") ||
            name.includes("square") ||
            (dims && Math.abs(dims.width - dims.height) <= 20);

          const isLandscapeDetected = fType === "MARKETING_IMAGE" ||
            ratio === "1.91:1" ||
            name.includes("1.91x1") ||
            name.includes("1.91:1") ||
            name.includes("landscape") ||
            (dims && dims.width >= dims.height * 1.3);

          if (isSquareDetected) {
            hasSquare = true;
          }
          if (isLandscapeDetected) {
            hasLandscape = true;
          }
          if (fType === "LOGO") {
            hasLogo = true;
          } else if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
            // ImageKit transformation allows auto-deriving landscape and square
            hasLandscape = true;
            hasSquare = true;
          } else if (raw && !isSquareDetected && !isLandscapeDetected) {
            // Default generic image fallback
            hasLandscape = true;
          }
        }

        // Check explicit logo formats
        for (const logo of allLogos) {
          const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || "";
          if (raw) hasLogo = true;
        }

        const isAiGuidedFlow = Boolean((state as any).isAiGuided || (state as any).source === "AI_GUIDED");

        if (!isAiGuidedFlow) {
          if (!hasLandscape) {
            addError("landscapeMarketingImage", "At least 1 landscape marketing image (1.91:1) is required for Performance Max.", "ASSET");
          }
          if (!hasSquare) {
            addError("squareMarketingImage", "At least 1 square marketing image (1:1) is required for Performance Max.", "ASSET");
          }
          if (!hasLogo) {
            addError("logo", "At least 1 square brand logo (1:1) is required for Performance Max.", "ASSET");
          }
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
        const validHeadlines = (state.headlines || [])
          .map((h: any) => GoogleAdsBaseService.cleanAdText(String(h || ""), 30))
          .filter((h: string) => h.length > 0);
        if (validHeadlines.length < 3) {
          addError("headlines", `Search ads require at least 3 unique headlines (currently have ${validHeadlines.length}).`, "FIELD");
        }
        const uniqueHeadlines = Array.from(new Set(validHeadlines.map((h: string) => h.trim().toLowerCase())));
        if (uniqueHeadlines.length < validHeadlines.length) {
          addError("headlines", "All headlines must be unique.", "FIELD");
        }

        // Descriptions (at least 2 unique, <= 90 chars)
        const validDescriptions = (state.descriptions || [])
          .map((d: any) => GoogleAdsBaseService.cleanAdText(String(d || ""), 90))
          .filter((d: string) => d.length > 0);
        if (validDescriptions.length < 2) {
          addError("descriptions", `Search ads require at least 2 unique descriptions (currently have ${validDescriptions.length}).`, "FIELD");
        }
        const uniqueDescriptions = Array.from(new Set(validDescriptions.map((d: string) => d.trim().toLowerCase())));
        if (uniqueDescriptions.length < validDescriptions.length) {
          addError("descriptions", "All descriptions must be unique.", "FIELD");
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
          addError("businessName", "Business name is required for Display campaigns.", "FIELD");
        } else if (state.businessName.trim().length > 25) {
          addError("businessName", "Business name cannot exceed 25 characters.", "FIELD");
        }

        // Final URL
        const displayUrl = state.website || state.finalUrl || "";
        if (!displayUrl.trim() || (!displayUrl.startsWith("http://") && !displayUrl.startsWith("https://"))) {
          addError("website", "A valid landing page URL starting with http:// or https:// is required.", "FIELD");
        } else {
          try {
            const parsed = new URL(displayUrl.trim());
            const host = parsed.hostname.toLowerCase();
            if (host === "example.com" || host.endsWith(".example.com") || host === "localhost" || host === "127.0.0.1") {
              addError("website", `Final URL cannot use dummy or restricted domains (${host}).`, "FIELD");
            }
          } catch (e: any) {
            addError("website", "Invalid website URL format.", "FIELD");
          }
        }

        // Headlines (at least 1, <= 30 chars)
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for Display campaigns.", "FIELD");
        }
        for (const h of validHeadlines) {
          if (h.length > 30) {
            addError("headlines", `Headline "${h.slice(0, 20)}..." exceeds the 30-character limit for Display ads.`, "FIELD");
            break;
          }
        }

        // Long Headlines (at least 1, <= 90 chars)
        const validLongHeadlines = (state.longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
        if (validLongHeadlines.length < 1 && validHeadlines.length < 1) {
          addError("longHeadlines", "At least 1 long headline is required for Responsive Display ads.", "FIELD");
        }
        for (const lh of validLongHeadlines) {
          if (lh.length > 90) {
            addError("longHeadlines", `Long headline "${lh.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
        }

        // Descriptions (at least 1, <= 90 chars)
        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for Display campaigns.", "FIELD");
        }
        for (const d of validDescriptions) {
          if (d.length > 90) {
            addError("descriptions", `Description "${d.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
        }

        // Display requires at least 1 image
        const hasImages = (Array.isArray(state.images) && state.images.length > 0) ||
                          (Array.isArray((state as any).uploadedImages) && (state as any).uploadedImages.length > 0);
        if (!hasImages) {
          addError("images", "At least 1 marketing image (1.91:1 or 1:1) is required for Display ads.", "ASSET");
        }

        // Display requires at least 1 logo
        const allLogos = [
          ...(Array.isArray(state.logos) ? state.logos : []),
          ...(Array.isArray(state.brandLogos) ? state.brandLogos : [])
        ].filter((l: any) => l && (typeof l === "string" ? l.trim() : l.url || l.data || l.asset));
        if (allLogos.length < 1) {
          addError("logos", "At least 1 square brand logo (1:1) is required for Display ads.", "ASSET");
        }

        // Bidding strategy validation
        const dStrat = (state.biddingStrategy || "").trim().toLowerCase();
        if (dStrat === "target cpa" || dStrat === "target_cpa") {
          const cpaNum = Number(state.targetCpa);
          if (state.targetCpa === undefined || state.targetCpa === null || isNaN(cpaNum) || cpaNum <= 0) {
            addError("targetCpa", "A positive Target CPA amount is required when Target CPA bidding is selected.", "FIELD");
          }
        } else if (dStrat === "target roas" || dStrat === "target_roas") {
          const roasNum = Number(state.targetRoas);
          if (state.targetRoas === undefined || state.targetRoas === null || isNaN(roasNum) || roasNum <= 0) {
            addError("targetRoas", "A positive Target ROAS is required when Target ROAS bidding is selected.", "FIELD");
          }
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
          if (state.isYouTubeConnected === false) {
            addError("videos", "YouTube account is not authenticated for this organization. Video Demand Gen ads require an authenticated YouTube channel.", "ASSET");
          }
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

        // Demand Gen requires a valid positive daily budget (> 0).
        // Authoritative currency-specific per-day minimum is enforced directly by Google Ads API
        // and surfaced accurately via BUDGET_BELOW_PER_DAY_MINIMUM (BudgetPerDayMinimumErrorDetails).
        const effectiveDailyEquivalent = calculatedDailyEquivalent !== null ? calculatedDailyEquivalent : parsedBudgetNum;
        if (isNaN(effectiveDailyEquivalent) || !isFinite(effectiveDailyEquivalent) || effectiveDailyEquivalent <= 0) {
          addError("dailyBudget", `Demand Gen budget must be greater than ${currencySymbol}0.`, "BUDGET");
        }

        break;
      }

      case "VIDEO": {
        if (state.isYouTubeConnected === false) {
          addError("campaignType", "YouTube account is not authenticated for this organization. Please connect YouTube before launching a Video campaign.", "FIELD");
        }

        if (!state.businessName?.trim()) {
          addError("businessName", "Business name is required for Video campaigns.", "FIELD");
        } else if (state.businessName.trim().length > 25) {
          addError("businessName", "Business name cannot exceed 25 characters.", "FIELD");
        }

        const videoUrl = state.website || state.finalUrl || "";
        if (!videoUrl.trim() || (!videoUrl.startsWith("http://") && !videoUrl.startsWith("https://"))) {
          addError("website", "A valid landing page / final URL starting with http:// or https:// is required.", "FIELD");
        } else {
          try {
            const parsed = new URL(videoUrl.trim());
            const host = parsed.hostname.toLowerCase();
            if (host === "example.com" || host.endsWith(".example.com") || host === "localhost" || host === "127.0.0.1") {
              addError("website", `Final URL cannot use dummy or restricted domains (${host}).`, "FIELD");
            }
          } catch (e: any) {
            addError("website", "Invalid website URL format.", "FIELD");
          }
        }

        // Headlines validation (<= 30 chars for standard video ads)
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for Video campaigns.", "FIELD");
        }
        for (const h of validHeadlines) {
          if (h.length > 30) {
            addError("headlines", `Headline "${h.slice(0, 20)}..." exceeds the 30-character limit for Video ads.`, "FIELD");
            break;
          }
        }

        // Long Headlines validation (<= 90 chars)
        const validLongHeadlines = (state.longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
        for (const lh of validLongHeadlines) {
          if (lh.length > 90) {
            addError("longHeadlines", `Long headline "${lh.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
        }

        // Descriptions validation (<= 90 chars)
        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for Video campaigns.", "FIELD");
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
          addError("logos", "At least 1 brand logo is required for Video ads.", "ASSET");
        }

        if (format === "VIDEO") {
          const allVideos = [
            ...(Array.isArray(state.videos) ? state.videos : []),
            ...(Array.isArray((state as any).youtubeVideos) ? (state as any).youtubeVideos : [])
          ].filter((v: any) => v && (typeof v === "string" ? v.trim() : v.asset || v.videoId || v.url));
          if (allVideos.length < 1) {
            addError("videos", "At least 1 YouTube video URL/asset is required for Video ads.", "ASSET");
          }
          if (validLongHeadlines.length < 1) {
            addError("longHeadlines", "At least 1 long headline is required for responsive Video ads.", "FIELD");
          }
        } else if (format === "CAROUSEL") {
          const cards = Array.isArray(state.carouselCards) ? state.carouselCards : [];
          const validCards = cards.filter((c: any) => c && c.image && c.headline);
          if (validCards.length < 2) {
            addError("carouselCards", `At least 2 carousel cards with an image and headline are required for Carousel Video ads (currently have ${validCards.length}).`, "ASSET");
          }
        } else {
          // SINGLE_IMAGE format fallback
          const allImages = [
            ...(Array.isArray(state.images) ? state.images : []),
            ...(Array.isArray((state as any).uploadedImages) ? (state as any).uploadedImages : [])
          ].filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data || img.asset));
          if (allImages.length < 1) {
            addError("images", "At least 1 marketing image is required for Single Image Video ads.", "ASSET");
          }
        }

        // Bidding strategy validation
        const vStrat = (state.biddingStrategy || "").trim().toLowerCase();
        if (vStrat === "target cpa" || vStrat === "target_cpa") {
          const cpaNum = Number(state.targetCpa);
          if (state.targetCpa === undefined || state.targetCpa === null || isNaN(cpaNum) || cpaNum <= 0) {
            addError("targetCpa", "A positive Target CPA amount is required when Target CPA bidding is selected.", "FIELD");
          }
        } else if (vStrat === "target roas" || vStrat === "target_roas") {
          const roasNum = Number(state.targetRoas);
          if (state.targetRoas === undefined || state.targetRoas === null || isNaN(roasNum) || roasNum <= 0) {
            addError("targetRoas", "A positive Target ROAS is required when Target ROAS bidding is selected.", "FIELD");
          }
        }
        break;
      }

      case "APP": {
        const pForm = (state.platform || (state.appStore === "APPLE_APP_STORE" ? "IOS" : "ANDROID")).toUpperCase();
        const trimmedAppId = (state.appId || "").trim();
        if (!trimmedAppId) {
          addError("appId", "Mobile App package name (Android) or numerical App Store ID (iOS) is required.", "FIELD");
        } else if (pForm === "IOS" && !/^\d+$/.test(trimmedAppId) && !trimmedAppId.includes(".")) {
          addError("appId", "iOS App ID must be a numeric Store ID (e.g. '123456789') or valid bundle ID.", "FIELD");
        } else if (pForm === "ANDROID" && !trimmedAppId.includes(".")) {
          addError("appId", "Android package name must follow standard dot notation (e.g. 'com.company.app').", "FIELD");
        }

        if (!state.businessName?.trim() && !state.business?.name?.trim()) {
          addError("businessName", "Business name is required for App promotion.", "FIELD");
        } else if ((state.businessName || state.business?.name || "").trim().length > 25) {
          addError("businessName", "Business name cannot exceed 25 characters.", "FIELD");
        }

        const targetCpaNum = Number(state.targetCpa);
        if (state.targetCpa === undefined || state.targetCpa === null || state.targetCpa === "" || isNaN(targetCpaNum) || targetCpaNum <= 0) {
          addError("targetCpa", "A valid positive Target CPA is required for App install campaigns. Fallback or zero CPA is prohibited by Google Ads API.", "FIELD");
        }

        // Headlines validation (<= 30 chars)
        const validHeadlines = (state.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
        if (validHeadlines.length < 1) {
          addError("headlines", "At least 1 headline is required for App promotion.", "FIELD");
        }
        for (const h of validHeadlines) {
          if (h.length > 30) {
            addError("headlines", `Headline "${h.slice(0, 20)}..." exceeds the 30-character limit for App ads.`, "FIELD");
            break;
          }
        }

        // Descriptions validation (<= 90 chars)
        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          addError("descriptions", "At least 1 description is required for App promotion.", "FIELD");
        }
        for (const d of validDescriptions) {
          if (d.length > 90) {
            addError("descriptions", `Description "${d.slice(0, 20)}..." exceeds the 90-character limit.`, "FIELD");
            break;
          }
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
          if (!state.headlines || !Array.isArray(state.headlines)) {
            state.headlines = ["Shop Top Deals Now"];
          } else if (state.headlines.length === 0) {
            state.headlines.push("Shop Top Deals Now");
          }
        }

        const validDescriptions = (state.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
        if (validDescriptions.length < 1) {
          if (!state.descriptions || !Array.isArray(state.descriptions)) {
            state.descriptions = ["Explore our exclusive shopping collection with fast delivery and great discounts."];
          } else if (state.descriptions.length === 0) {
            state.descriptions.push("Explore our exclusive shopping collection with fast delivery and great discounts.");
          }
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

  /**
   * Deterministically validates campaign state asynchronously, querying live YouTube authentication
   * status via YouTubeService.getOrganizationConnectionStatus(organizationId) when organizationId is provided.
   */
  public static async validateAsync(state: any, organizationId?: string): Promise<ValidationResult> {
    const clone = { ...state };
    if (organizationId && (clone.isYouTubeConnected === undefined || clone.isYouTubeConnected === null)) {
      try {
        const ytStatus = await YouTubeService.getOrganizationConnectionStatus(organizationId);
        clone.isYouTubeConnected = Boolean(ytStatus.isConnected);
      } catch (err: any) {
        console.warn("[GoogleAdsCampaignValidator] Could not check YouTube connection status:", err?.message);
        clone.isYouTubeConnected = false;
      }
    }
    return this.validate(clone);
  }
}
