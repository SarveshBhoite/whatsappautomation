import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class YoutubeDemandGenService extends GoogleAdsBaseService {
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

  /**
   * Helper: Maps minute to Google Ads MinuteOfHour enum
   */
  public static mapMinuteToEnum(minStr: string | number): string {
    const m = parseInt(String(minStr || "0"), 10);
    if (m >= 45) return "FORTY_FIVE";
    if (m >= 30) return "THIRTY";
    if (m >= 15) return "FIFTEEN";
    return "ZERO";
  }

  /**
   * Helper: Builds AdScheduleInfo criterion objects from frontend adSchedule list
   */
  public static buildAdScheduleCriteria(schedules: any[]): any[] {
    if (!Array.isArray(schedules) || schedules.length === 0) return [];

    const dayMap: Record<string, string[]> = {
      "all days": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"],
      "mondays - fridays": ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      "saturdays - sundays": ["SATURDAY", "SUNDAY"],
      "mondays": ["MONDAY"],
      "tuesdays": ["TUESDAY"],
      "wednesdays": ["WEDNESDAY"],
      "thursdays": ["THURSDAY"],
      "fridays": ["FRIDAY"],
      "saturdays": ["SATURDAY"],
      "sundays": ["SUNDAY"],
      "monday": ["MONDAY"],
      "tuesday": ["TUESDAY"],
      "wednesday": ["WEDNESDAY"],
      "thursday": ["THURSDAY"],
      "friday": ["FRIDAY"],
      "saturday": ["SATURDAY"],
      "sunday": ["SUNDAY"]
    };

    const criteria: any[] = [];

    for (const sched of schedules) {
      if (!sched || typeof sched !== "object") continue;
      const rawDay = String(sched.day || sched.dayOfWeek || "All days").trim().toLowerCase();
      const targetDays = dayMap[rawDay] || [rawDay.toUpperCase()];

      let sHour = 0;
      let sMinStr = "ZERO";
      let eHour = 24;
      let eMinStr = "ZERO";

      const start = String(sched.start || "00:00").trim();
      const end = String(sched.end || "00:00").trim();

      if ((start === "00:00" || start === "0:00") && (end === "00:00" || end === "0:00" || end === "24:00" || end === "23:45")) {
        sHour = 0;
        sMinStr = "ZERO";
        eHour = 24;
        eMinStr = "ZERO";
      } else {
        const [sh, sm] = start.split(":").map(v => parseInt(v, 10));
        const [eh, em] = end.split(":").map(v => parseInt(v, 10));

        sHour = isNaN(sh) ? 0 : Math.max(0, Math.min(23, sh));
        sMinStr = this.mapMinuteToEnum(sm || 0);

        eHour = isNaN(eh) ? 24 : Math.max(0, Math.min(24, eh));
        eMinStr = this.mapMinuteToEnum(em || 0);

        const startTotalMinutes = sHour * 60 + (sm || 0);
        const endTotalMinutes = eHour * 60 + (em || 0);
        if (endTotalMinutes <= startTotalMinutes && eHour !== 24) {
          throw new Error(`Invalid ad schedule: End time (${end}) must be after start time (${start}) for ${sched.day || "day"}.`);
        }
      }

      for (const d of targetDays) {
        criteria.push({
          dayOfWeek: d,
          startHour: sHour,
          startMinute: sMinStr,
          endHour: eHour,
          endMinute: eMinStr
        });
      }
    }

    return criteria;
  }

  /**
   * Helper: Builds Audience dimensions from user-provided audience settings
   */
  public static buildAudienceDimensions(audience: any, cid?: string): any[] {
    if (!audience || typeof audience !== "object") return [];
    const dimensions: any[] = [];

    // 1. Age Dimension
    const ageStart = parseInt(String(audience.ageRangeStart || "18"), 10);
    const ageEndStr = String(audience.ageRangeEnd || "65+").trim();
    const includeUnknownAge = audience.ageUnknown !== false;

    const ageRanges: string[] = [];
    if (ageStart <= 18 && (ageEndStr.includes("24") || ageEndStr.includes("34") || ageEndStr.includes("44") || ageEndStr.includes("54") || ageEndStr.includes("64") || ageEndStr.includes("65"))) ageRanges.push("AGE_RANGE_18_24");
    if (ageStart <= 25 && (ageEndStr.includes("34") || ageEndStr.includes("44") || ageEndStr.includes("54") || ageEndStr.includes("64") || ageEndStr.includes("65"))) ageRanges.push("AGE_RANGE_25_34");
    if (ageStart <= 35 && (ageEndStr.includes("44") || ageEndStr.includes("54") || ageEndStr.includes("64") || ageEndStr.includes("65"))) ageRanges.push("AGE_RANGE_35_44");
    if (ageStart <= 45 && (ageEndStr.includes("54") || ageEndStr.includes("64") || ageEndStr.includes("65"))) ageRanges.push("AGE_RANGE_45_54");
    if (ageStart <= 55 && (ageEndStr.includes("64") || ageEndStr.includes("65"))) ageRanges.push("AGE_RANGE_55_64");
    if (ageEndStr.includes("65")) ageRanges.push("AGE_RANGE_65_UP");
    if (includeUnknownAge) ageRanges.push("AGE_RANGE_UNDETERMINED");

    if (ageRanges.length > 0 && ageRanges.length < 7) {
      dimensions.push({
        age: {
          ageRanges,
          includeUndetermined: includeUnknownAge
        }
      });
    }

    // 2. Gender Dimension
    if (audience.genderTargeting && typeof audience.genderTargeting === "object") {
      const genders: string[] = [];
      if (audience.genderTargeting.Male !== false) genders.push("MALE");
      if (audience.genderTargeting.Female !== false) genders.push("FEMALE");
      if (audience.genderTargeting.Unknown !== false) genders.push("UNDETERMINED");

      if (genders.length > 0 && genders.length < 3) {
        dimensions.push({
          gender: {
            genders,
            includeUndetermined: audience.genderTargeting.Unknown !== false
          }
        });
      }
    }

    // 3. Parental Status Dimension
    if (audience.parentalStatus && typeof audience.parentalStatus === "object") {
      const parentalStatuses: string[] = [];
      if (audience.parentalStatus.Parent !== false) parentalStatuses.push("PARENT");
      if (audience.parentalStatus["Not a parent"] !== false) parentalStatuses.push("NOT_A_PARENT");
      if (audience.parentalStatus.Unknown !== false) parentalStatuses.push("UNDETERMINED");

      if (parentalStatuses.length > 0 && parentalStatuses.length < 3) {
        dimensions.push({
          parentalStatus: {
            parentalStatuses,
            includeUndetermined: audience.parentalStatus.Unknown !== false
          }
        });
      }
    }

    // 4. Audience Segments (Custom Segments, User Lists / Remarketing, Lookalikes)
    const segments: any[] = [];
    const customerPrefix = cid ? `customers/${cid}` : "customers/{cid}";

    // Custom Segments
    if (Array.isArray(audience.customSegments || audience.customSegmentsList)) {
      const list = audience.customSegments || audience.customSegmentsList;
      for (const cs of list) {
        const segVal = typeof cs === "string" ? cs.trim() : cs?.resourceName || cs?.id;
        if (segVal) {
          const resName = segVal.startsWith("customers/") ? segVal : `${customerPrefix}/customAudiences/${segVal}`;
          segments.push({ customAudience: { customAudience: resName } });
        }
      }
    }

    // Your Data / Remarketing User Lists
    if (Array.isArray(audience.yourData || audience.yourDataList)) {
      const list = audience.yourData || audience.yourDataList;
      for (const yd of list) {
        const segVal = typeof yd === "string" ? yd.trim() : yd?.resourceName || yd?.id;
        if (segVal) {
          const resName = segVal.startsWith("customers/") ? segVal : `${customerPrefix}/userLists/${segVal}`;
          segments.push({ userList: { userList: resName } });
        }
      }
    }

    // Lookalike Segments
    if (Array.isArray(audience.lookalikes || audience.lookalikeSegmentsList)) {
      const list = audience.lookalikes || audience.lookalikeSegmentsList;
      for (const lk of list) {
        const segVal = typeof lk === "string" ? lk.trim() : lk?.resourceName || lk?.id;
        if (segVal) {
          const resName = segVal.startsWith("customers/") ? segVal : `${customerPrefix}/userLists/${segVal}`;
          segments.push({ userList: { userList: resName } });
        }
      }
    }

    if (segments.length > 0) {
      dimensions.push({
        audienceSegments: {
          segments
        }
      });
    }

    return dimensions;
  }

  public static async resolveGeoTargetConstant(
    locationNameOrId: string,
    headers: any,
    isAiGuided: boolean
  ): Promise<string | null> {
    if (!locationNameOrId || typeof locationNameOrId !== "string") return null;
    const trimmed = locationNameOrId.trim();
    if (!trimmed || trimmed.toUpperCase() === "ALL") return null;

    if (/^\d+$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("geoTargetConstants/")) return trimmed.replace("geoTargetConstants/", "");

    const lower = trimmed.toLowerCase();
    if (this.GEO_TARGET_CONSTANT_MAP[lower]) {
      return this.GEO_TARGET_CONSTANT_MAP[lower];
    }

    try {
      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.get(`${ADS_BASE}/geoTargetConstants:suggest`, {
        params: { "location_names.names": trimmed, locale: "en" },
        headers,
        timeout: 8000
      });
      const suggestions = res.data?.geoTargetConstantSuggestions || [];
      if (suggestions.length > 0 && suggestions[0]?.geoTargetConstant?.id) {
        return String(suggestions[0].geoTargetConstant.id);
      }
    } catch (e: any) {
      console.warn(`[YoutubeDemandGenService] geoTargetConstants:suggest failed for "${trimmed}":`, e?.message || e);
    }

    if (isAiGuided) {
      throw new Error(`Location "${trimmed}" could not be resolved to a valid Google Ads geo target. Please select a valid city, state, or country.`);
    }
    return null;
  }

  public static resolveLanguageConstant(languageNameOrId: string, isAiGuided: boolean): string | null {
    if (!languageNameOrId || typeof languageNameOrId !== "string") return null;
    const trimmed = languageNameOrId.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("languageConstants/")) return trimmed.replace("languageConstants/", "");

    const lower = trimmed.toLowerCase();
    if (this.LANGUAGE_CONSTANT_MAP[lower]) {
      return this.LANGUAGE_CONSTANT_MAP[lower];
    }

    if (isAiGuided) {
      throw new Error(`Language "${trimmed}" could not be resolved to a valid Google Ads language constant.`);
    }
    return null;
  }

  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const isAiGuided = Boolean(payload.isAiGuided || payload.source === "AI_GUIDED");

    // ── 1. STRICT PRE-FLIGHT VALIDATION (NO FAKES / SILENT FALLBACKS) ──
    if (!customerId || customerId.trim().length === 0) {
      throw new Error("Customer ID is required for campaign creation.");
    }
    const rawCid = customerId.replace(/-/g, "").trim();
    if (rawCid === "0000000000" || rawCid === "1234567890" || rawCid.startsWith("9999")) {
      throw new Error(`Invalid or dummy customer ID provided: "${customerId}". A real authenticated Google Ads account is required.`);
    }

    if (!payload.campaignName || payload.campaignName.trim().length === 0) {
      throw new Error("Campaign name is required.");
    }

    const inputUrl = (payload.finalUrl || payload.website || "").trim();
    if (!inputUrl) {
      throw new Error("Final URL is required.");
    }
    try {
      const parsedUrl = new URL(inputUrl);
      if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
        throw new Error("Final URL must use http or https protocol.");
      }
      const host = parsedUrl.hostname.toLowerCase();
      if (host === "example.com" || host.endsWith(".example.com") || host === "google.com" || host.endsWith(".google.com") || host === "localhost" || host === "127.0.0.1") {
        throw new Error(`Final URL cannot use dummy or restricted domains (${host}). A real business destination URL is required.`);
      }
    } catch (urlErr: any) {
      throw new Error(`Invalid Final URL: ${urlErr.message}`);
    }

    if (payload.mobileFinalUrl && typeof payload.mobileFinalUrl === "string" && payload.mobileFinalUrl.trim()) {
      try {
        const parsedMobile = new URL(payload.mobileFinalUrl.trim());
        if (parsedMobile.protocol !== "http:" && parsedMobile.protocol !== "https:") {
          throw new Error("Mobile final URL must use http or https protocol.");
        }
        const mHost = parsedMobile.hostname.toLowerCase();
        if (mHost === "example.com" || mHost.endsWith(".example.com") || mHost === "localhost" || mHost === "127.0.0.1") {
          throw new Error(`Mobile final URL cannot use dummy or restricted domains (${mHost}).`);
        }
      } catch (mErr: any) {
        throw new Error(`Invalid mobile final URL: ${mErr.message}`);
      }
    }

    const rawBudget = payload.dailyBudget !== undefined && payload.dailyBudget !== "" ? payload.dailyBudget : payload.budget;
    if (rawBudget === undefined || rawBudget === null || rawBudget === "" || isNaN(Number(rawBudget))) {
      throw new Error("Campaign budget is required and must be a valid number.");
    }
    const numBudget = Number(rawBudget);
    if (numBudget <= 0) {
      throw new Error("Campaign budget must be greater than 0.");
    }

    const rawBusinessName = (payload.businessName || "").trim();
    if (!rawBusinessName) {
      throw new Error("Business name is required for Demand Gen ads.");
    }
    if (rawBusinessName.length > 25) {
      throw new Error(`Business name "${rawBusinessName}" exceeds the Google Ads limit of 25 characters.`);
    }

    // Format-aware asset validation
    const format = (payload.adFormat || "SINGLE_IMAGE").toUpperCase();
    const rawHeadlines: string[] = (payload.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
    if (rawHeadlines.length < 1) {
      throw new Error("At least 1 headline is required for Demand Gen ads.");
    }
    for (const h of rawHeadlines) {
      if (h.length > 40) {
        throw new Error(`Headline "${h}" exceeds the Google Ads limit of 40 characters.`);
      }
    }

    const rawDescriptions: string[] = (payload.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
    if (rawDescriptions.length < 1) {
      throw new Error("At least 1 description is required for Demand Gen ads.");
    }
    for (const d of rawDescriptions) {
      if (d.length > 90) {
        throw new Error(`Description "${d}" exceeds the Google Ads limit of 90 characters.`);
      }
    }

    if (format === "SINGLE_IMAGE") {
      const rawImages = (payload.images || payload.marketingImages || []).filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data || img.asset));
      if (rawImages.length < 1) {
        throw new Error("At least 1 marketing image is required for Single Image Demand Gen ads.");
      }
      const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data || lg.asset));
      if (rawLogos.length < 1) {
        throw new Error("At least 1 logo is required for Demand Gen ads.");
      }
    } else if (format === "VIDEO") {
      const rawVideos = (payload.videos || payload.youtubeVideos || []).filter((v: any) => v && (typeof v === "string" ? v.trim() : v.asset || v.videoId || v.url));
      if (rawVideos.length < 1) {
        throw new Error("At least 1 YouTube video is required for Video Demand Gen ads.");
      }
      const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data || lg.asset));
      if (rawLogos.length < 1) {
        throw new Error("At least 1 logo is required for Video Demand Gen ads.");
      }
    } else if (format === "CAROUSEL") {
      const rawCards = (payload.carouselCards || []).filter((c: any) => c && c.image && c.headline);
      if (rawCards.length < 2) {
        throw new Error(`At least 2 carousel cards with an image and headline are required for Carousel Demand Gen ads (received ${rawCards.length}).`);
      }
      const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data || lg.asset));
      if (rawLogos.length < 1) {
        throw new Error("At least 1 logo is required for Carousel Demand Gen ads.");
      }
    }

    // Dates validation
    const todayStr = new Date().toISOString().split("T")[0];
    if (payload.startDate) {
      const startStr = String(payload.startDate).split("T")[0];
      if (startStr < todayStr) {
        throw new Error(`Start date cannot be in the past (${startStr}).`);
      }
    }
    if (payload.endDate && payload.startDate) {
      const startStr = String(payload.startDate).split("T")[0];
      const endStr = String(payload.endDate).split("T")[0];
      if (endStr <= startStr) {
        throw new Error(`End date (${endStr}) must be after start date (${startStr}).`);
      }
    }

    // Bidding validation
    const bStrat = (payload.biddingStrategy || payload.biddingFocus || "MAXIMIZE_CONVERSIONS").trim().toUpperCase();
    if (bStrat === "YOUTUBE_ENGAGEMENTS" || bStrat === "YOUTUBE ENGAGEMENTS") {
      throw new Error("YouTube engagements bidding is not supported for Demand Gen campaigns in Google Ads API v24.");
    }
    if (bStrat === "TARGET_CPA" || bStrat === "TARGET CPA") {
      const cpa = Number(payload.targetCpa);
      if (isNaN(cpa) || cpa <= 0) {
        throw new Error("A positive Target CPA amount is required when Target CPA bidding is selected.");
      }
    }
    if (bStrat === "TARGET_ROAS" || bStrat === "TARGET ROAS") {
      const roas = Number(payload.targetRoas);
      if (isNaN(roas) || roas <= 0) {
        throw new Error("A positive Target ROAS is required when Target ROAS bidding is selected.");
      }
    }

    // ── 2. PREPARE PARAMETERS ──
    const {
      campaignName = "YouTube Demand Gen",
      finalUrl: inputFinalUrl,
      website,
      mobileFinalUrl,
      campaignGoal = "YouTube",
      biddingStrategy: inputBiddingStrategy,
      biddingFocus,
      targetCpa,
      targetRoas,
      startDate,
      endDate,
      locations = isAiGuided ? [] : ["India"],
      locationTargetType,
      languages = isAiGuided ? [] : ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      videos = [],
      youtubeVideos = [],
      carouselCards = [],
      adFormat = "SINGLE_IMAGE",
      adName = "Ad 1",
      callToAction = "Automated",
      businessName,
      dailyBudget,
      budget,
      demandGenBudgetType = "Daily",
      euPolitical = "NO",
      channels = [],
      channelTargeting = "ALL",
      deviceTargeting = "ALL",
      devices = [],
      audience,
      optimizedTargeting = true,
      customerAcquisitionMode,
      trackingTemplate,
      finalUrlSuffix,
      customParameters = [],
      ipExclusions,
      adSchedule = [],
      sitelinks = [],
      callouts = [],
      structuredSnippets = [],
      promotions = [],
      conversionGoals = [],
      adGroups: inputAdGroups
    } = payload;

    const finalUrl = (inputFinalUrl || website).trim();
    const resolvedMobileFinalUrl = (mobileFinalUrl && typeof mobileFinalUrl === "string" && mobileFinalUrl.trim()) ? mobileFinalUrl.trim() : null;
    const effectiveBudget = Number(dailyBudget !== undefined && dailyBudget !== "" ? dailyBudget : budget);
    const isCampaignTotal = String(demandGenBudgetType).toLowerCase().includes("total");

    // ── 3. RESOLVE BIDDING CONFIGURATION (NO SILENT BIDDING FALLBACK) ──
    const rawBStrat = (inputBiddingStrategy || (biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : biddingFocus === "Clicks" ? "MAXIMIZE_CLICKS" : "MAXIMIZE_CONVERSIONS")).trim().toUpperCase();

    let biddingConfig: any = {};
    let finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";

    if (rawBStrat === "MAXIMIZE_CONVERSIONS" || rawBStrat === "CONVERSIONS") {
      finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
      biddingConfig = { maximizeConversions: {} };
    } else if (rawBStrat === "TARGET_CPA") {
      finalBiddingStrategy = "TARGET_CPA";
      const cpaVal = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
      biddingConfig = cpaVal ? { targetCpa: { targetCpaMicros: String(cpaVal) } } : { maximizeConversions: {} };
    } else if (rawBStrat === "TARGET_ROAS") {
      finalBiddingStrategy = "TARGET_ROAS";
      const roasVal = targetRoas ? Number(targetRoas) : undefined;
      biddingConfig = roasVal ? { maximizeConversionValue: { targetRoas: roasVal } } : { maximizeConversionValue: {} };
    } else if (rawBStrat === "MAXIMIZE_CONVERSION_VALUE" || rawBStrat === "CONVERSION VALUE") {
      finalBiddingStrategy = "MAXIMIZE_CONVERSION_VALUE";
      biddingConfig = targetRoas ? { maximizeConversionValue: { targetRoas: Number(targetRoas) } } : { maximizeConversionValue: {} };
    } else if (rawBStrat === "MAXIMIZE_CLICKS" || rawBStrat === "CLICKS") {
      finalBiddingStrategy = "MAXIMIZE_CLICKS";
      biddingConfig = { targetSpend: {} };
    } else if (rawBStrat === "YOUTUBE_ENGAGEMENTS" || rawBStrat === "YOUTUBE ENGAGEMENTS") {
      throw new Error("YouTube engagements bidding is not supported for Demand Gen campaigns in Google Ads API v24.");
    } else {
      finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = (customerId || "").replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    let apiResult: any = { campaignId: `yt-demandgen-${Date.now()}` };
    let createdCampaignResource: string | null = null;
    let createdBudgetResource: string | null = null;
    const createdAssetResources: string[] = [];

    try {
      // ── 4. CREATE BUDGET (CampaignBudget) ──
      const budgetAmountMicros = Math.round(effectiveBudget * 1_000_000);
      const budgetPayload: any = {
        name: `${campaignName} Budget ${Date.now()}`.slice(0, 100),
        deliveryMethod: "STANDARD",
        explicitlyShared: false
      };

      if (isCampaignTotal) {
        budgetPayload.totalAmountMicros = String(budgetAmountMicros);
        budgetPayload.period = "CUSTOM_PERIOD";
      } else {
        budgetPayload.amountMicros = String(budgetAmountMicros);
      }

      const budgetRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignBudgets:mutate`, {
        operations: [{ create: budgetPayload }]
      }, { headers });

      const budgetRef = budgetRes.data?.results?.[0]?.resourceName;
      if (!budgetRef) {
        throw new Error("Failed to create CampaignBudget for Demand Gen.");
      }
      createdBudgetResource = budgetRef;
      apiResult.budgetResourceName = budgetRef;

      // ── 5. CREATE CAMPAIGN ──
      let effectiveCampaignName = campaignName;
      const startStr = startDate ? String(startDate).split("T")[0] : todayStr;
      const endStr = endDate ? String(endDate).split("T")[0] : undefined;

      const campaignPayloadCreate: any = {
        name: effectiveCampaignName,
        status: "PAUSED",
        advertisingChannelType: "DEMAND_GEN",
        campaignBudget: budgetRef,
        containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        startDateTime: `${startStr} 00:00:00`,
        ...biddingConfig
      };

      if (endStr) {
        campaignPayloadCreate.endDateTime = `${endStr} 23:59:59`;
      }

      // Customer acquisition goal settings (Demand Gen v24)
      if (customerAcquisitionMode === "NEW_CUSTOMERS_ONLY" || customerAcquisitionMode === "BID_HIGHER_FOR_NEW_CUSTOMERS") {
        campaignPayloadCreate.customerAcquisitionGoalSettings = {
          optimizationMode: "BID_HIGHER_FOR_NEW_CUSTOMERS"
        };
      } else if (customerAcquisitionMode === "ALL_CUSTOMERS" || customerAcquisitionMode === "TARGET_ALL_EQUALLY") {
        campaignPayloadCreate.customerAcquisitionGoalSettings = {
          optimizationMode: "TARGET_ALL_EQUALLY"
        };
      }

      if (trackingTemplate) campaignPayloadCreate.trackingUrlTemplate = trackingTemplate;
      if (finalUrlSuffix) campaignPayloadCreate.finalUrlSuffix = finalUrlSuffix;
      if (Array.isArray(customParameters) && customParameters.length > 0) {
        campaignPayloadCreate.urlCustomParameters = customParameters.filter(p => p.name && p.value).map(p => ({ key: p.name, value: p.value }));
      }

      let campRes;
      try {
        campRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
          operations: [{ create: campaignPayloadCreate }]
        }, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          campaignPayloadCreate.name = effectiveCampaignName;
          campRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{ create: campaignPayloadCreate }]
          }, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = campRes.data?.results?.[0]?.resourceName;
      if (!campaignRef) {
        throw new Error("Failed to create Demand Gen Campaign.");
      }
      createdCampaignResource = campaignRef;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // ── 6. ATTACH CAMPAIGN-LEVEL CRITERIA (AD SCHEDULE & DEVICE TARGETING & IP BLOCK) ──
      const campaignCriterionOps: any[] = [];

      // A. Ad Schedule Criteria
      if (Array.isArray(adSchedule) && adSchedule.length > 0) {
        const scheduleCriteria = YoutubeDemandGenService.buildAdScheduleCriteria(adSchedule);
        for (const sched of scheduleCriteria) {
          campaignCriterionOps.push({
            create: {
              campaign: campaignRef,
              adSchedule: sched
            }
          });
        }
      }

      // B. Device Targeting Criteria
      if (deviceTargeting === "SPECIFIC" && Array.isArray(devices) && devices.length > 0) {
        const deviceMap: Record<string, string> = {
          "DESKTOP": "DESKTOP",
          "COMPUTERS": "DESKTOP",
          "MOBILE": "HIGH_END_MOBILE",
          "MOBILE_PHONES": "HIGH_END_MOBILE",
          "TABLET": "TABLET",
          "TABLETS": "TABLET",
          "CONNECTED_TV": "CONNECTED_TV",
          "TV_SCREENS": "CONNECTED_TV"
        };
        for (const dev of devices) {
          const mapped = deviceMap[String(dev).toUpperCase()];
          if (mapped) {
            campaignCriterionOps.push({
              create: {
                campaign: campaignRef,
                device: {
                  type: mapped
                }
              }
            });
          }
        }
      }

      // C. IP Exclusions Criteria
      if (ipExclusions) {
        const ipList: string[] = Array.isArray(ipExclusions)
          ? ipExclusions
          : String(ipExclusions).split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

        for (const ip of ipList) {
          if (ip) {
            campaignCriterionOps.push({
              create: {
                campaign: campaignRef,
                ipBlock: {
                  ipAddress: ip
                }
              }
            });
          }
        }
      }

      if (campaignCriterionOps.length > 0) {
        try {
          const critRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignCriteria:mutate`, {
            operations: campaignCriterionOps
          }, { headers });
          apiResult.campaignCriteriaResourceNames = (critRes.data?.results || []).map((r: any) => r.resourceName);
        } catch (campCritErr: any) {
          console.warn("[YoutubeDemandGenService] campaignCriteria mutate warning:", campCritErr?.response?.data || campCritErr.message);
          if (isAiGuided) {
            throw campCritErr;
          }
        }
      }

      // ── 7. CREATE MULTIPLE AD GROUPS & CHANNEL CONTROLS ──
      const adGroupList = (Array.isArray(inputAdGroups) && inputAdGroups.length > 0)
        ? inputAdGroups
        : [{ name: `${effectiveCampaignName} Ad Group 1`, status: "ENABLED" }];

      const adGroupOps: any[] = [];

      for (let i = 0; i < adGroupList.length; i++) {
        const agItem = adGroupList[i];
        const agName = agItem.name || `${effectiveCampaignName} Ad Group ${i + 1}`;
        const agCreate: any = {
          campaign: campaignRef,
          name: agName,
          status: agItem.status || "ENABLED",
          optimizedTargetingEnabled: optimizedTargeting !== undefined ? Boolean(optimizedTargeting) : true
        };

        if (channels && channels.length > 0) {
          const selectedChannels = {
            youtubeInStream: channels.includes("YouTube in-stream") || channels.includes("YouTube"),
            youtubeInFeed: channels.includes("YouTube in-feed") || channels.includes("YouTube"),
            youtubeShorts: channels.includes("YouTube Shorts") || channels.includes("YouTube"),
            discover: channels.includes("Discover"),
            gmail: channels.includes("Gmail"),
            display: channels.includes("Google Display Network")
          };

          agCreate.demandGenAdGroupSettings = {
            channelControls: {
              selectedChannels
            }
          };
        }

        adGroupOps.push({ create: agCreate });
      }

      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, {
        operations: adGroupOps
      }, { headers });

      const createdAdGroupRefs: string[] = (adGroupRes.data.results || []).map((r: any) => r.resourceName);
      if (createdAdGroupRefs.length === 0) {
        throw new Error("Failed to create any AdGroup for Demand Gen.");
      }

      apiResult.adGroupResourceNames = createdAdGroupRefs;
      apiResult.adGroupResourceName = createdAdGroupRefs[0];

      // ── 8. ATTACH LOCATION & LANGUAGE CRITERIA TO AD GROUPS ──
      const adGroupCriterionOps: any[] = [];

      // Resolve locations
      const rawLocs = Array.isArray(locations) ? locations : [locations];
      for (const loc of rawLocs) {
        if (!loc || loc === "ALL" || loc === "All countries and territories") continue;
        const geoId = await this.resolveGeoTargetConstant(loc, headers, isAiGuided);
        if (geoId) {
          for (const agRef of createdAdGroupRefs) {
            adGroupCriterionOps.push({
              create: {
                adGroup: agRef,
                location: {
                  geoTargetConstant: `geoTargetConstants/${geoId}`
                }
              }
            });
          }
        }
      }

      // Resolve languages
      const rawLangs = Array.isArray(languages) ? languages : [languages];
      for (const lang of rawLangs) {
        const langId = this.resolveLanguageConstant(lang, isAiGuided);
        if (langId) {
          for (const agRef of createdAdGroupRefs) {
            adGroupCriterionOps.push({
              create: {
                adGroup: agRef,
                language: {
                  languageConstant: `languageConstants/${langId}`
                }
              }
            });
          }
        }
      }

      // Resolve Audience and attach as AdGroupCriterion
      let createdAudienceResource: string | null = null;
      if (audience && typeof audience === "object") {
        const dimensions = YoutubeDemandGenService.buildAudienceDimensions(audience, cid);
        if (dimensions.length > 0) {
          const audienceName = (audience.audienceName || `DG_Audience_${Date.now()}`).slice(0, 100);
          try {
            const audRes = await axios.post(`${ADS_BASE}/customers/${cid}/audiences:mutate`, {
              operations: [
                {
                  create: {
                    name: audienceName,
                    description: `Audience for YouTube Demand Gen Campaign ${effectiveCampaignName}`.slice(0, 255),
                    dimensions
                  }
                }
              ]
            }, { headers });

            const audRef = audRes.data?.results?.[0]?.resourceName;
            if (audRef) {
              createdAudienceResource = audRef;
              apiResult.audienceResourceName = audRef;

              // Attach audience criterion to each created ad group
              for (const agRef of createdAdGroupRefs) {
                adGroupCriterionOps.push({
                  create: {
                    adGroup: agRef,
                    audience: {
                      audience: audRef
                    }
                  }
                });
              }
            }
          } catch (audErr: any) {
            console.warn("[YoutubeDemandGenService] Audience resource creation warning:", audErr?.response?.data || audErr.message);
            if (isAiGuided) {
              throw audErr;
            }
          }
        }
      }

      if (adGroupCriterionOps.length > 0) {
        try {
          const agCritRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`, {
            operations: adGroupCriterionOps
          }, { headers });
          apiResult.adGroupCriteriaResourceNames = (agCritRes.data?.results || []).map((r: any) => r.resourceName);
        } catch (critErr: any) {
          console.warn("[YoutubeDemandGenService] adGroupCriteria mutate warning:", critErr?.response?.data || critErr.message);
          if (isAiGuided) {
            throw critErr;
          }
        }
      }

      // ── 9. ATTACH DEMAND GEN EXTENSIONS (SITELINKS, CALLOUTS, STRUCTURED SNIPPETS, PROMOTIONS) ──
      const hasExtensions = (Array.isArray(sitelinks) && sitelinks.length > 0) ||
                            (Array.isArray(callouts) && callouts.length > 0) ||
                            (Array.isArray(structuredSnippets) && structuredSnippets.length > 0) ||
                            (Array.isArray(promotions) && promotions.length > 0);

      if (hasExtensions) {
        const campaignAssetOperations: any[] = [];

        // Sitelinks
        if (Array.isArray(sitelinks) && sitelinks.length > 0) {
          for (const sl of sitelinks) {
            const linkText = (sl.text || sl.linkText || "").trim();
            const slUrl = (sl.url || sl.finalUrl || "").trim();
            if (linkText && slUrl) {
              try {
                const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
                  operations: [{
                    create: {
                      name: `Sitelink - ${linkText.slice(0, 20)} - ${Date.now()}`,
                      sitelinkAsset: {
                        linkText: GoogleAdsBaseService.cleanAdText(linkText, 25),
                        ...(sl.desc1 || sl.description1 ? { description1: GoogleAdsBaseService.cleanAdText((sl.desc1 || sl.description1).trim(), 35) } : {}),
                        ...(sl.desc2 || sl.description2 ? { description2: GoogleAdsBaseService.cleanAdText((sl.desc2 || sl.description2).trim(), 35) } : {})
                      },
                      finalUrls: [slUrl]
                    }
                  }]
                }, { headers });

                const assetRef = assetRes.data?.results?.[0]?.resourceName;
                if (assetRef) {
                  createdAssetResources.push(assetRef);
                  campaignAssetOperations.push({
                    create: {
                      campaign: campaignRef,
                      asset: assetRef,
                      fieldType: "SITELINK",
                      status: "ENABLED"
                    }
                  });
                }
              } catch (slErr: any) {
                console.warn("[YoutubeDemandGenService] Sitelink asset creation warning:", slErr?.response?.data || slErr.message);
              }
            }
          }
        }

        // Callouts
        if (Array.isArray(callouts) && callouts.length > 0) {
          for (const co of callouts) {
            const coText = typeof co === "string" ? co.trim() : co?.text?.trim() || "";
            if (coText) {
              try {
                const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
                  operations: [{
                    create: {
                      name: `Callout - ${coText.slice(0, 20)} - ${Date.now()}`,
                      calloutAsset: {
                        calloutText: GoogleAdsBaseService.cleanAdText(coText, 25)
                      }
                    }
                  }]
                }, { headers });
                const assetRef = assetRes.data?.results?.[0]?.resourceName;
                if (assetRef) {
                  createdAssetResources.push(assetRef);
                  campaignAssetOperations.push({
                    create: {
                      campaign: campaignRef,
                      asset: assetRef,
                      fieldType: "CALLOUT",
                      status: "ENABLED"
                    }
                  });
                }
              } catch (e: any) {
                console.warn("[YoutubeDemandGenService] Callout asset warning:", e?.response?.data || e.message);
              }
            }
          }
        }

        // Structured Snippets
        if (Array.isArray(structuredSnippets) && structuredSnippets.length > 0) {
          for (const snip of structuredSnippets) {
            const header = snip.header || "Types";
            const values = Array.isArray(snip.values) ? snip.values.filter(Boolean) : [];
            if (values.length > 0) {
              try {
                const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
                  operations: [{
                    create: {
                      name: `Snippet - ${header} - ${Date.now()}`,
                      structuredSnippetAsset: {
                        header,
                        values: values.map((v: string) => GoogleAdsBaseService.cleanAdText(v, 25))
                      }
                    }
                  }]
                }, { headers });
                const assetRef = assetRes.data?.results?.[0]?.resourceName;
                if (assetRef) {
                  createdAssetResources.push(assetRef);
                  campaignAssetOperations.push({
                    create: {
                      campaign: campaignRef,
                      asset: assetRef,
                      fieldType: "STRUCTURED_SNIPPET",
                      status: "ENABLED"
                    }
                  });
                }
              } catch (e: any) {
                console.warn("[YoutubeDemandGenService] Structured snippet asset warning:", e?.response?.data || e.message);
              }
            }
          }
        }

        // Promotions
        if (Array.isArray(promotions) && promotions.length > 0) {
          for (const promo of promotions) {
            const promoTarget = promo.target || promo.discountModifier || promo.promotionTarget || "";
            if (promoTarget) {
              try {
                const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
                  operations: [{
                    create: {
                      name: `Promo - ${promoTarget.slice(0, 20)} - ${Date.now()}`,
                      promotionAsset: {
                        promotionTarget: GoogleAdsBaseService.cleanAdText(promoTarget, 30),
                        discountModifier: "UP_TO",
                        ...(promo.percentOff ? { percentOff: Math.round(Number(promo.percentOff) * 100) } : {}),
                        ...(promo.moneyAmountOff ? { moneyAmountOff: { amountMicros: String(Math.round(Number(promo.moneyAmountOff) * 1_000_000)), currencyCode: promo.currencyCode || "INR" } } : {})
                      },
                      finalUrls: [promo.finalUrl || finalUrl]
                    }
                  }]
                }, { headers });
                const assetRef = assetRes.data?.results?.[0]?.resourceName;
                if (assetRef) {
                  createdAssetResources.push(assetRef);
                  campaignAssetOperations.push({
                    create: {
                      campaign: campaignRef,
                      asset: assetRef,
                      fieldType: "PROMOTION",
                      status: "ENABLED"
                    }
                  });
                }
              } catch (e: any) {
                console.warn("[YoutubeDemandGenService] Promotion asset warning:", e?.response?.data || e.message);
              }
            }
          }
        }

        if (campaignAssetOperations.length > 0) {
          try {
            await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
              operations: campaignAssetOperations
            }, { headers });
          } catch (caErr: any) {
            console.warn("[YoutubeDemandGenService] campaignAssets mutate warning:", caErr?.response?.data || caErr.message);
          }
        }
      }

      // ── 9B. CONVERSION GOALS CONFIGURATION (campaignConversionGoals:mutate) ──
      if (Array.isArray(conversionGoals) && conversionGoals.length > 0) {
        try {
          const conversionOps: any[] = [];
          for (const cg of conversionGoals) {
            const goalResName = cg.resourceName || (cg.category && cg.origin ? `customers/${cid}/campaignConversionGoals/${campaignRef.split("/").pop()}~${cg.category}~${cg.origin}` : null);
            if (goalResName) {
              conversionOps.push({
                update: {
                  resourceName: goalResName,
                  biddable: cg.biddable !== undefined ? Boolean(cg.biddable) : true
                },
                updateMask: "biddable"
              });
            }
          }
          if (conversionOps.length > 0) {
            await axios.post(`${ADS_BASE}/customers/${cid}/campaignConversionGoals:mutate`, {
              operations: conversionOps
            }, { headers });
          }
        } catch (cgErr: any) {
          console.warn("[YoutubeDemandGenService] campaignConversionGoals mutate warning:", cgErr?.response?.data || cgErr.message);
        }
      }

      // ── 10. UPLOAD ASSETS & PREPARE FORMAT-SPECIFIC AD ──
      const formatType = (adFormat || "SINGLE_IMAGE").toUpperCase();
      const validHeadlines = (headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
      const validLongHeadlines = (longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
      const validDescriptions = (descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);

      const safeHeadlines = validHeadlines
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 40) }));

      const safeDescriptions = validDescriptions
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 90) }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName, 25);

      // Upload or find Logos (STRICT: Never fallback or cross-assign marketing images as logos)
      let resolvedLogoAsset: string | null = null;
      for (const logo of (logos || [])) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || logo?.asset || "";
        if (!raw) continue;
        if (raw.startsWith("customers/") && raw.includes("/assets/")) {
          resolvedLogoAsset = raw;
          break;
        }
        const uploaded = await this.uploadImageAsset(organizationId, customerId, `DG_Logo_${Date.now()}`, raw);
        if (uploaded) {
          resolvedLogoAsset = uploaded;
          break;
        }
      }

      if (!resolvedLogoAsset) {
        throw new Error("A valid square logo image is required for Demand Gen ads. Cross-assigning marketing images as logos is not permitted.");
      }

      const adGroupAdOps: any[] = [];
      const primaryAdGroup = createdAdGroupRefs[0];

      if (formatType === "VIDEO") {
        // VIDEO RESPONSIVE AD
        const allVideos = [...(videos || []), ...(youtubeVideos || [])];
        let resolvedVideoAsset: string | null = null;
        for (const v of allVideos) {
          const raw = typeof v === "string" ? v : v?.asset || v?.videoId || v?.id || "";
          if (raw.startsWith("customers/") && raw.includes("/assets/")) {
            resolvedVideoAsset = raw;
            break;
          }
        }

        if (!resolvedVideoAsset && !isAiGuided) {
          try {
            const vRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:searchStream`, {
              query: "SELECT asset.resource_name FROM asset WHERE asset.type = 'YOUTUBE_VIDEO' LIMIT 1"
            }, { headers });
            resolvedVideoAsset = vRes.data?.[0]?.results?.[0]?.asset?.resourceName || null;
          } catch (e) {}
        }

        if (!resolvedVideoAsset) {
          throw new Error("A valid YouTube video asset is required for Video Demand Gen ads.");
        }

        const safeLongHeadlines = (validLongHeadlines.length > 0 ? validLongHeadlines : [validHeadlines[0]])
          .slice(0, 5)
          .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 90) }));

        adGroupAdOps.push({
          create: {
            adGroup: primaryAdGroup,
            status: "ENABLED",
            ad: {
              name: adName ? `${adName} - Video` : `Video Ad ${Date.now()}`,
              finalUrls: [finalUrl],
              ...(resolvedMobileFinalUrl ? { finalMobileUrls: [resolvedMobileFinalUrl] } : {}),
              demandGenVideoResponsiveAd: {
                businessName: { text: safeBusinessName },
                logoImages: [{ asset: resolvedLogoAsset }],
                videos: [{ asset: resolvedVideoAsset }],
                headlines: safeHeadlines,
                longHeadlines: safeLongHeadlines,
                descriptions: safeDescriptions
              }
            }
          }
        });

      } else if (formatType === "CAROUSEL") {
        // CAROUSEL AD
        const cardAssetRefs: string[] = [];
        const cardsToProcess = Array.isArray(carouselCards) ? carouselCards : [];

        for (let idx = 0; idx < cardsToProcess.length; idx++) {
          const card = cardsToProcess[idx];
          const imgRaw = typeof card.image === "string" ? card.image : card.image?.url || card.image?.data || card.imageAsset || "";
          let cardImgAsset: string | null = null;
          if (imgRaw.startsWith("customers/") && imgRaw.includes("/assets/")) {
            cardImgAsset = imgRaw;
          } else if (imgRaw) {
            cardImgAsset = await this.uploadImageAsset(organizationId, customerId, `DG_Card_Img_${Date.now()}_${idx}`, imgRaw);
          }

          if (cardImgAsset) {
            const cardAssetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [
                {
                  create: {
                    name: `DG Card ${Date.now()} ${idx + 1}`.slice(0, 100),
                    type: "DEMAND_GEN_CAROUSEL_CARD",
                    finalUrls: [card.finalUrl || finalUrl],
                    ...(resolvedMobileFinalUrl ? { finalMobileUrls: [resolvedMobileFinalUrl] } : {}),
                    demandGenCarouselCardAsset: {
                      marketingImageAsset: cardImgAsset,
                      headline: GoogleAdsBaseService.cleanAdText(card.headline || `Card Item ${idx + 1}`, 40)
                    }
                  }
                }
              ]
            }, { headers });

            const createdCardRef = cardAssetRes.data?.results?.[0]?.resourceName;
            if (createdCardRef) {
              cardAssetRefs.push(createdCardRef);
            }
          }
        }

        if (cardAssetRefs.length < 2) {
          throw new Error(`Carousel Demand Gen ads require at least 2 valid carousel card assets (created ${cardAssetRefs.length}).`);
        }

        adGroupAdOps.push({
          create: {
            adGroup: primaryAdGroup,
            status: "ENABLED",
            ad: {
              name: adName ? `${adName} - Carousel` : `Carousel Ad ${Date.now()}`,
              finalUrls: [finalUrl],
              ...(resolvedMobileFinalUrl ? { finalMobileUrls: [resolvedMobileFinalUrl] } : {}),
              demandGenCarouselAd: {
                businessName: safeBusinessName,
                logoImage: { asset: resolvedLogoAsset },
                headline: safeHeadlines[0],
                description: safeDescriptions[0],
                carouselCards: cardAssetRefs.map(asset => ({ asset }))
              }
            }
          }
        });

      } else {
        // SINGLE IMAGE AD (demandGenMultiAssetAd)
        const marketingImages: string[] = [];
        const squareMarketingImages: string[] = [];

        const inputLandscapeImages = payload.marketingImages || images || [];
        const inputSquareImages = payload.squareMarketingImages || (payload.squareImages || []);

        for (const img of inputLandscapeImages) {
          const raw = typeof img === "string" ? img : img?.url || img?.data || img?.asset || "";
          if (!raw) continue;
          if (raw.startsWith("customers/") && raw.includes("/assets/")) {
            marketingImages.push(raw);
            continue;
          }
          const uploaded = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, raw);
          if (uploaded) {
            marketingImages.push(uploaded);
          }
        }

        for (const img of inputSquareImages) {
          const raw = typeof img === "string" ? img : img?.url || img?.data || img?.asset || "";
          if (!raw) continue;
          if (raw.startsWith("customers/") && raw.includes("/assets/")) {
            squareMarketingImages.push(raw);
            continue;
          }
          const uploaded = await this.uploadImageAsset(organizationId, customerId, `DG_Sq_${Date.now()}`, raw);
          if (uploaded) {
            squareMarketingImages.push(uploaded);
          }
        }

        if (marketingImages.length === 0) {
          throw new Error("At least 1 marketing image is required for Demand Gen Single Image ads.");
        }

        if (squareMarketingImages.length === 0 && resolvedLogoAsset) {
          squareMarketingImages.push(resolvedLogoAsset);
        }

        adGroupAdOps.push({
          create: {
            adGroup: primaryAdGroup,
            status: "ENABLED",
            ad: {
              name: adName ? `${adName} - Single` : `Single Image Ad ${Date.now()}`,
              finalUrls: [finalUrl],
              ...(resolvedMobileFinalUrl ? { finalMobileUrls: [resolvedMobileFinalUrl] } : {}),
              demandGenMultiAssetAd: {
                headlines: safeHeadlines,
                descriptions: safeDescriptions,
                marketingImages: marketingImages.map(asset => ({ asset })),
                squareMarketingImages: squareMarketingImages.map(asset => ({ asset })),
                logoImages: [{ asset: resolvedLogoAsset }],
                businessName: safeBusinessName
              }
            }
          }
        });
      }

      // Mutate AdGroupAd
      const adRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, {
        operations: adGroupAdOps
      }, { headers });

      apiResult.adGroupAdResourceName = adRes.data?.results?.[0]?.resourceName;

    } catch (apiErr: any) {
      // ── 11. ATOMIC ROLLBACK ON ERROR ──
      console.error("[Google Ads API Error for YouTube Demand Gen]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
      if (createdCampaignResource) {
        try {
          console.warn(`[Rollback] Removing created campaign ${createdCampaignResource}...`);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{ remove: createdCampaignResource }]
          }, { headers });
        } catch (rollbackErr: any) {
          console.error(`[Rollback Failed for Campaign]:`, rollbackErr?.message);
        }
      }
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      throw new Error(formatted);
    }

    // ── 12. PERSIST TO DATABASE ONLY ON SUCCESS ──
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `yt-demandgen-${Date.now()}`,
      name: campaignName,
      campaignType: "DEMAND_GEN",
      biddingStrategy: finalBiddingStrategy,
      budget: Number(effectiveBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      mobileFinalUrl: resolvedMobileFinalUrl,
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
        devices,
        adSchedule,
        ipExclusions,
        customerAcquisitionMode,
        optimizedTargeting,
        sitelinks,
        callouts,
        structuredSnippets,
        promotions,
        conversionGoals,
        objective: "YouTube"
      },
      advertisingChannelType: "DEMAND_GEN",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "YouTube Demand Gen Campaign created successfully (Paused)",
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