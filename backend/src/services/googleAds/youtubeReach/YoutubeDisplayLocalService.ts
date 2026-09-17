import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class YoutubeDisplayLocalService extends GoogleAdsBaseService {
  // Known canonical mapping for instant geo resolution
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

  // Official Google Ads API v24 LanguageConstant mapping
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

  // Official Google Ads API v24 ContentLabelTypeEnum mapping
  public static readonly CONTENT_LABEL_MAP: Record<string, string> = {
    "DL-G": "VIDEO_RATING_DV_G",
    "DL-PG": "VIDEO_RATING_DV_PG",
    "DL-T": "VIDEO_RATING_DV_T",
    "DL-MA": "VIDEO_RATING_DV_MA",
    "NOT_YET_LABELED": "VIDEO_NOT_YET_RATED",
    "Tragedy and conflict": "TRAGEDY",
    "Sensitive social issues": "SOCIAL_ISSUES",
    "Profanity and rough language": "PROFANITY",
    "Sexually suggestive": "SEXUALLY_SUGGESTIVE",
    "Live streaming videos": "LIVE_STREAMING_VIDEO",
    "Embedded YouTube videos": "EMBEDDED_VIDEO",
    "Below-the-fold": "BELOW_THE_FOLD",
    "Parked domains": "PARKED_DOMAIN",
    "In-video": "VIDEO"
  };

  // Official Google Ads API v24 IncomeRangeTypeEnum mapping
  public static readonly INCOME_RANGE_MAP: Record<string, string> = {
    "Top 10%": "INCOME_RANGE_90_UP",
    "11 - 20%": "INCOME_RANGE_80_90",
    "21 - 30%": "INCOME_RANGE_70_80",
    "31 - 40%": "INCOME_RANGE_60_70",
    "41 - 50%": "INCOME_RANGE_50_60",
    "Lower 50%": "INCOME_RANGE_0_50",
    "Unknown": "INCOME_RANGE_UNDETERMINED"
  };

  public static mapMinuteToEnum(minStr: string | number): string {
    const m = parseInt(String(minStr || "0"), 10);
    if (m >= 45) return "FORTY_FIVE";
    if (m >= 30) return "THIRTY";
    if (m >= 15) return "FIFTEEN";
    return "ZERO";
  }

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

  public static async resolveGeoTargetConstant(
    locationNameOrId: string,
    headers: any
  ): Promise<string | null> {
    if (!locationNameOrId || typeof locationNameOrId !== "string") return null;
    const trimmed = locationNameOrId.trim();
    if (!trimmed || trimmed.toUpperCase() === "ALL" || trimmed.toLowerCase() === "all countries and territories") return null;

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
      console.warn(`[YoutubeDisplayLocalService] geoTargetConstants:suggest failed for "${trimmed}":`, e?.message || e);
    }

    return null;
  }

  public static resolveLanguageConstant(languageNameOrId: string): string | null {
    if (!languageNameOrId || typeof languageNameOrId !== "string") return null;
    const trimmed = languageNameOrId.trim();
    if (!trimmed) return null;

    if (/^\d+$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("languageConstants/")) return trimmed.replace("languageConstants/", "");

    const lower = trimmed.toLowerCase();
    if (this.LANGUAGE_CONSTANT_MAP[lower]) {
      return this.LANGUAGE_CONSTANT_MAP[lower];
    }

    return null;
  }

  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    // ── 1. STRICT PREFLIGHT VALIDATION (NO FAKES / PLACEHOLDERS / DEMO IDS) ──
    if (!organizationId || organizationId.trim().length === 0 || organizationId === "demo-org-123") {
      throw new Error("A valid Organization ID is required. Demo organization IDs are not allowed.");
    }

    if (!customerId || customerId.trim().length === 0) {
      throw new Error("Customer ID is required for Display campaign creation.");
    }
    const cleanCid = customerId.replace(/-/g, "").trim();
    const fakeCids = ["1234567890", "0000000000", "default", "demo-org-123"];
    if (!cleanCid || fakeCids.includes(cleanCid) || !/^\d{10}$/.test(cleanCid)) {
      throw new Error(`A valid 10-digit Google Ads Customer ID is required (received: "${customerId}"). Placeholder account IDs are not permitted.`);
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
      const blockedDomains = ["example.com", "google.com", "localhost", "127.0.0.1", "jds-automation.com"];
      if (blockedDomains.some(b => host === b || host.endsWith(`.${b}`))) {
        throw new Error(`Final URL cannot use placeholder or dummy domains (${host}). A real business destination URL is required.`);
      }
    } catch (urlErr: any) {
      throw new Error(`Invalid Final URL: ${urlErr.message}`);
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
    if (!rawBusinessName || rawBusinessName.toLowerCase() === "jds" || rawBusinessName.toLowerCase() === "my business") {
      throw new Error("A valid business name is required for Responsive Display ads.");
    }
    if (rawBusinessName.length > 25) {
      throw new Error(`Business name "${rawBusinessName}" exceeds the Google Ads limit of 25 characters.`);
    }

    // Text assets validation
    const rawHeadlines: string[] = (payload.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
    if (rawHeadlines.length < 1) {
      throw new Error("At least 1 headline is required for Responsive Display ads.");
    }
    for (const h of rawHeadlines) {
      if (h.length > 30) {
        throw new Error(`Headline "${h}" exceeds the Google Ads limit of 30 characters for Display ads.`);
      }
    }

    const rawLongHeadlines: string[] = (payload.longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
    if (rawLongHeadlines.length < 1) {
      throw new Error("At least 1 long headline is required for Responsive Display ads.");
    }
    if (rawLongHeadlines[0].length > 90) {
      throw new Error(`Long headline "${rawLongHeadlines[0]}" exceeds the Google Ads limit of 90 characters.`);
    }

    const rawDescriptions: string[] = (payload.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
    if (rawDescriptions.length < 1) {
      throw new Error("At least 1 description is required for Responsive Display ads.");
    }
    for (const d of rawDescriptions) {
      if (d.length > 90) {
        throw new Error(`Description "${d}" exceeds the Google Ads limit of 90 characters for Display ads.`);
      }
    }

    // Media assets validation (strictly requires at least 1 landscape/marketing image, 1 square image, and 1 logo)
    const rawLandscapeImages = (payload.landscapeImages || []).filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data || img.asset));
    const rawSquareImages = (payload.squareImages || []).filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data || img.asset));
    const rawGeneralImages = (payload.images || []).filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data || img.asset));
    const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data || lg.asset));

    const hasMarketingImages = rawLandscapeImages.length > 0 || rawGeneralImages.some((i: any) => (typeof i === "object" && i?.fieldType === "MARKETING_IMAGE") || typeof i === "string");
    const hasSquareImages = rawSquareImages.length > 0 || rawGeneralImages.some((i: any) => (typeof i === "object" && i?.fieldType === "SQUARE_MARKETING_IMAGE") || typeof i === "string");

    if (!hasMarketingImages || !hasSquareImages || (rawLandscapeImages.length === 0 && rawSquareImages.length === 0 && rawGeneralImages.length === 0)) {
      throw new Error("Responsive Display ads require at least 1 Landscape Marketing Image (1.91:1) and 1 Square Marketing Image (1:1).");
    }

    if (rawLogos.length < 1) {
      throw new Error("At least 1 logo (1:1) is required for Responsive Display ads.");
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

    // ── 2. PREPARE PARAMETERS ──
    const {
      campaignName,
      finalUrl: inputFinalUrl,
      website,
      biddingStrategy: inputBiddingStrategy,
      biddingFocus,
      conversionBiddingType,
      targetCpa,
      targetRoas,
      viewableCpmBid,
      startDate,
      endDate,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      landscapeImages = [],
      squareImages = [],
      logos = [],
      videos = [],
      callToAction = "Automated",
      callToActionText,
      mainCustomColor,
      accentCustomColor,
      businessName,
      dailyBudget,
      budget,
      euPolitical = "NO",
      deviceTargeting = "ALL",
      deviceOption,
      devices = [],
      selectedAudiences = [],
      audiences = [],
      demographicsGender,
      demographicsAge,
      demographicsParental,
      demographicsIncome,
      keywords = [],
      enteredKeywordsText,
      topics = [],
      selectedTopics = [],
      placements = [],
      selectedPlacements = [],
      contentLabels,
      sensitiveContent,
      contentTypeExclusions,
      useOptimizedTargeting = true,
      optimizedTargeting,
      trackingTemplate,
      finalUrlSuffix,
      customParameters = [],
      customParamsList = [],
      ipExclusions,
      adSchedule = [],
      adScheduleList = [],
      useAssetEnhancements = true,
      useAutoGeneratedVideo = true,
      useNativeFormats = true
    } = payload;

    const finalUrl = (inputFinalUrl || website).trim();
    const effectiveBudget = Number(dailyBudget !== undefined && dailyBudget !== "" ? dailyBudget : budget);

    // ── 3. RESOLVE BIDDING STRATEGY OBJECT (OFFICIAL GOOGLE ADS v24 FOR DISPLAY) ──
    const rawFocus = String(biddingFocus || "").trim();
    const rawConvType = String(conversionBiddingType || "").trim();
    const rawStrat = String(inputBiddingStrategy || "").trim().toUpperCase();

    let biddingConfig: any = {};
    let finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";

    if (rawFocus === "Conversion value" || rawStrat === "TARGET_ROAS" || rawStrat === "MAXIMIZE_CONVERSION_VALUE") {
      finalBiddingStrategy = "TARGET_ROAS";
      const roasVal = targetRoas ? Number(targetRoas) : undefined;
      biddingConfig = roasVal ? { maximizeConversionValue: { targetRoas: roasVal } } : { maximizeConversionValue: {} };
    } else if (rawFocus === "Impressions" || rawStrat === "VIEWABLE_CPM" || rawStrat === "MANUAL_CPM") {
      finalBiddingStrategy = "MANUAL_CPM";
      biddingConfig = { manualCpm: {} };
    } else if (rawConvType === "TARGET_CPA" || rawStrat === "TARGET_CPA" || (rawFocus === "Target CPA" && targetCpa)) {
      finalBiddingStrategy = "TARGET_CPA";
      const cpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
      biddingConfig = cpaMicros ? { maximizeConversions: { targetCpaMicros: String(cpaMicros) } } : { maximizeConversions: {} };
    } else {
      finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = cleanCid;
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    const apiResult: any = { campaignId: `awareness-display-${Date.now()}` };

    // Resource tracking for Atomic Rollback
    let createdCampaignResource: string | null = null;
    let createdBudgetResource: string | null = null;
    let createdAdGroupResource: string | null = null;
    const createdAssetResources: string[] = [];

    try {
      // ── 4. CREATE CAMPAIGN BUDGET ──
      const budgetAmountMicros = Math.round(effectiveBudget * 1_000_000);
      const budgetPayload: any = {
        name: `${campaignName} Budget ${Date.now()}`.slice(0, 100),
        amountMicros: String(budgetAmountMicros),
        explicitlyShared: false
      };

      const budgetRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignBudgets:mutate`, {
        operations: [{ create: budgetPayload }]
      }, { headers });

      const budgetRef = budgetRes.data?.results?.[0]?.resourceName;
      if (!budgetRef) {
        throw new Error("Failed to create CampaignBudget for Awareness Display.");
      }
      createdBudgetResource = budgetRef;
      apiResult.budgetResourceName = budgetRef;

      // ── 5. CREATE CAMPAIGN ──
      let effectiveCampaignName = campaignName;
      const startStr = startDate ? String(startDate).split("T")[0] : todayStr;
      const endStr = endDate ? String(endDate).split("T")[0] : undefined;

      const euPoliticalValue = (euPolitical === "YES" || payload.euPoliticalAds === "YES")
        ? "CONTAINS_EU_POLITICAL_ADVERTISING"
        : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING";

      const campaignPayloadCreate: any = {
        name: effectiveCampaignName,
        status: "PAUSED",
        advertisingChannelType: "DISPLAY",
        campaignBudget: budgetRef,
        containsEuPoliticalAdvertising: euPoliticalValue,
        startDateTime: `${startStr} 00:00:00`,
        ...biddingConfig
      };

      if (endStr) {
        campaignPayloadCreate.endDateTime = `${endStr} 23:59:59`;
      }

      if (trackingTemplate) campaignPayloadCreate.trackingUrlTemplate = trackingTemplate;
      if (finalUrlSuffix) campaignPayloadCreate.finalUrlSuffix = finalUrlSuffix;

      const effectiveCustomParams = (Array.isArray(customParameters) && customParameters.length > 0)
        ? customParameters
        : customParamsList;
      if (Array.isArray(effectiveCustomParams) && effectiveCustomParams.length > 0) {
        const cleanParams = effectiveCustomParams.filter((p: any) => p && p.name && p.value).map((p: any) => ({ key: p.name, value: p.value }));
        if (cleanParams.length > 0) {
          campaignPayloadCreate.urlCustomParameters = cleanParams;
        }
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
        throw new Error("Failed to create Awareness Display Campaign.");
      }
      createdCampaignResource = campaignRef;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // ── 6. ATTACH CAMPAIGN-LEVEL CRITERIA (LOCATIONS, LANGUAGES, AD SCHEDULE, DEVICES, IP BLOCK, CONTENT LABELS) ──
      const campaignCriterionOps: any[] = [];

      // A. Location Criteria (Mutate at Campaign Level)
      const rawLocs = Array.isArray(locations) ? locations : [locations];
      for (const loc of rawLocs) {
        if (!loc || loc === "ALL" || loc === "All countries and territories") continue;
        const locStr = typeof loc === "object" ? loc.canonicalName || loc.name || loc.id : String(loc);
        const geoId = await YoutubeDisplayLocalService.resolveGeoTargetConstant(locStr, headers);
        if (geoId) {
          campaignCriterionOps.push({
            create: {
              campaign: campaignRef,
              location: {
                geoTargetConstant: `geoTargetConstants/${geoId}`
              }
            }
          });
        }
      }

      // B. Language Criteria (Mutate at Campaign Level)
      const rawLangs = Array.isArray(languages) ? languages : [languages];
      for (const lang of rawLangs) {
        const langId = YoutubeDisplayLocalService.resolveLanguageConstant(String(lang));
        if (langId) {
          campaignCriterionOps.push({
            create: {
              campaign: campaignRef,
              language: {
                languageConstant: `languageConstants/${langId}`
              }
            }
          });
        }
      }

      // C. Ad Schedule Criteria
      const effectiveAdSchedule = (Array.isArray(adSchedule) && adSchedule.length > 0) ? adSchedule : adScheduleList;
      if (Array.isArray(effectiveAdSchedule) && effectiveAdSchedule.length > 0) {
        const scheduleCriteria = YoutubeDisplayLocalService.buildAdScheduleCriteria(effectiveAdSchedule);
        for (const sched of scheduleCriteria) {
          campaignCriterionOps.push({
            create: {
              campaign: campaignRef,
              adSchedule: sched
            }
          });
        }
      }

      // D. Device Targeting Criteria
      const isSpecificDevices = (deviceTargeting === "SPECIFIC" || deviceOption === "SPECIFIC") && Array.isArray(devices) && devices.length > 0;
      if (isSpecificDevices) {
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

      // E. IP Exclusions Criteria
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

      // F. Content Label Exclusions
      const allContentExclusionSources: Record<string, boolean>[] = [];
      if (contentLabels && typeof contentLabels === "object") allContentExclusionSources.push(contentLabels);
      if (sensitiveContent && typeof sensitiveContent === "object") allContentExclusionSources.push(sensitiveContent);
      if (contentTypeExclusions && typeof contentTypeExclusions === "object") allContentExclusionSources.push(contentTypeExclusions);

      const processedLabels = new Set<string>();
      for (const source of allContentExclusionSources) {
        for (const [label, isExcluded] of Object.entries(source)) {
          if (isExcluded) {
            const mappedLabelEnum = YoutubeDisplayLocalService.CONTENT_LABEL_MAP[label];
            if (mappedLabelEnum && !processedLabels.has(mappedLabelEnum)) {
              processedLabels.add(mappedLabelEnum);
              campaignCriterionOps.push({
                create: {
                  campaign: campaignRef,
                  negative: true,
                  contentLabel: {
                    type: mappedLabelEnum
                  }
                }
              });
            }
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
          console.warn("[YoutubeDisplayLocalService] campaignCriteria mutate warning:", campCritErr?.response?.data || campCritErr.message);
        }
      }

      // ── 7. CREATE STANDARD DISPLAY AD GROUP ──
      const isOptimized = optimizedTargeting !== undefined ? Boolean(optimizedTargeting) : (useOptimizedTargeting !== undefined ? Boolean(useOptimizedTargeting) : true);
      const agCreate: any = {
        campaign: campaignRef,
        name: `${effectiveCampaignName} Ad Group 1`,
        status: "ENABLED",
        type: "DISPLAY_STANDARD",
        optimizedTargetingEnabled: isOptimized
      };

      if (finalBiddingStrategy === "MANUAL_CPM" && viewableCpmBid) {
        agCreate.cpmBidMicros = String(Math.round(Number(viewableCpmBid) * 1_000_000));
      }

      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, {
        operations: [{ create: agCreate }]
      }, { headers });

      const adGroupRef = adGroupRes.data?.results?.[0]?.resourceName;
      if (!adGroupRef) {
        throw new Error("Failed to create AdGroup for Awareness Display.");
      }
      createdAdGroupResource = adGroupRef;
      apiResult.adGroupResourceName = adGroupRef;

      // ── 8. ATTACH AD GROUP CRITERIA (DEMOGRAPHICS, TOPICS, PLACEMENTS, KEYWORDS, AUDIENCES) ──
      const adGroupCriterionOps: any[] = [];

      // A. Demographics: Gender
      if (demographicsGender && typeof demographicsGender === "object") {
        for (const [genderKey, isIncluded] of Object.entries(demographicsGender)) {
          if (isIncluded === false) {
            const mappedGender = genderKey === "Female" ? "FEMALE" : genderKey === "Male" ? "MALE" : "UNDETERMINED";
            adGroupCriterionOps.push({
              create: {
                adGroup: adGroupRef,
                negative: true,
                gender: { type: mappedGender }
              }
            });
          }
        }
      }

      // B. Demographics: Age
      if (demographicsAge && typeof demographicsAge === "object") {
        const ageMap: Record<string, string> = {
          "18 - 24": "AGE_RANGE_18_24",
          "25 - 34": "AGE_RANGE_25_34",
          "35 - 44": "AGE_RANGE_35_44",
          "45 - 54": "AGE_RANGE_45_54",
          "55 - 64": "AGE_RANGE_55_64",
          "65+": "AGE_RANGE_65_UP",
          "Unknown": "AGE_RANGE_UNDETERMINED"
        };
        for (const [ageKey, isIncluded] of Object.entries(demographicsAge)) {
          if (isIncluded === false && ageMap[ageKey]) {
            adGroupCriterionOps.push({
              create: {
                adGroup: adGroupRef,
                negative: true,
                ageRange: { type: ageMap[ageKey] }
              }
            });
          }
        }
      }

      // C. Demographics: Parental Status
      if (demographicsParental && typeof demographicsParental === "object") {
        for (const [pKey, isIncluded] of Object.entries(demographicsParental)) {
          if (isIncluded === false) {
            const mappedParent = pKey === "Parent" ? "PARENT" : pKey === "Not a parent" ? "NOT_A_PARENT" : "UNDETERMINED";
            adGroupCriterionOps.push({
              create: {
                adGroup: adGroupRef,
                negative: true,
                parentalStatus: { type: mappedParent }
              }
            });
          }
        }
      }

      // D. Demographics: Household Income
      if (demographicsIncome && typeof demographicsIncome === "object") {
        for (const [tier, isIncluded] of Object.entries(demographicsIncome)) {
          if (isIncluded === false) {
            const mappedIncome = YoutubeDisplayLocalService.INCOME_RANGE_MAP[tier];
            if (mappedIncome) {
              adGroupCriterionOps.push({
                create: {
                  adGroup: adGroupRef,
                  negative: true,
                  incomeRange: { type: mappedIncome }
                }
              });
            }
          }
        }
      }

      // E. Topics Targeting
      const topicList = (Array.isArray(topics) && topics.length > 0) ? topics : selectedTopics;
      for (const t of topicList) {
        const topicId = typeof t === "object" ? t.id || t.topicId : String(t);
        if (topicId && /^\d+$/.test(String(topicId))) {
          adGroupCriterionOps.push({
            create: {
              adGroup: adGroupRef,
              topic: {
                topicConstant: `topicConstants/${topicId}`
              }
            }
          });
        }
      }

      // F. Placements Targeting
      const placementList = (Array.isArray(placements) && placements.length > 0) ? placements : selectedPlacements;
      for (const p of placementList) {
        const pUrl = typeof p === "object" ? p.url || p.placement : String(p);
        if (pUrl && typeof pUrl === "string" && pUrl.trim()) {
          adGroupCriterionOps.push({
            create: {
              adGroup: adGroupRef,
              placement: {
                url: pUrl.trim()
              }
            }
          });
        }
      }

      // G. Contextual Keywords Targeting
      const kwList = Array.isArray(keywords) && keywords.length > 0
        ? keywords
        : (enteredKeywordsText ? String(enteredKeywordsText).split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean) : []);
      for (const kw of kwList) {
        const kwText = typeof kw === "object" ? kw.text || kw.keyword : String(kw).trim();
        if (kwText) {
          adGroupCriterionOps.push({
            create: {
              adGroup: adGroupRef,
              keyword: {
                text: kwText,
                matchType: "BROAD"
              }
            }
          });
        }
      }

      // H. Audiences / User Lists
      const audList = Array.isArray(audiences) && audiences.length > 0
        ? audiences
        : selectedAudiences;
      for (const aud of audList) {
        const audId = typeof aud === "object" ? aud.id || aud.userListId || aud.resourceName : String(aud);
        if (audId && typeof audId === "string") {
          const userListRef = audId.startsWith("customers/") ? audId : `customers/${cid}/userLists/${audId}`;
          adGroupCriterionOps.push({
            create: {
              adGroup: adGroupRef,
              userList: {
                userList: userListRef
              }
            }
          });
        }
      }

      if (adGroupCriterionOps.length > 0) {
        try {
          const agCritRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`, {
            operations: adGroupCriterionOps
          }, { headers });
          apiResult.adGroupCriteriaResourceNames = (agCritRes.data?.results || []).map((r: any) => r.resourceName);
        } catch (critErr: any) {
          console.warn("[YoutubeDisplayLocalService] adGroupCriteria mutate warning:", critErr?.response?.data || critErr.message);
        }
      }

      // ── 9. UPLOAD AUTHENTIC USER IMAGE AND LOGO ASSETS ──
      const createdAssets: {
        marketingImages: string[];
        squareMarketingImages: string[];
        logoImages: string[];
        youtubeVideos: string[];
      } = {
        marketingImages: [],
        squareMarketingImages: [],
        logoImages: [],
        youtubeVideos: []
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

      const toPollinationsTransform = (url: string, width: number, height: number): string => {
        if (typeof url === "string" && url.includes("image.pollinations.ai")) {
          return url.replace(/width=\d+/, `width=${width}`).replace(/height=\d+/, `height=${height}`);
        }
        return url;
      };

      // Upload dedicated Landscape Images (1.91:1)
      for (const img of rawLandscapeImages) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
        if (!raw) continue;
        let landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
        landscapeUrl = toPollinationsTransform(landscapeUrl, 1200, 628);
        const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Land_${Date.now()}`, landscapeUrl);
        if (landscapeRef && !createdAssets.marketingImages.includes(landscapeRef)) {
          createdAssets.marketingImages.push(landscapeRef);
          createdAssetResources.push(landscapeRef);
        }
      }

      // Upload dedicated Square Images (1:1)
      for (const img of rawSquareImages) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
        if (!raw) continue;
        let squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
        squareUrl = toPollinationsTransform(squareUrl, 1200, 1200);
        const squareRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Sq_${Date.now()}`, squareUrl);
        if (squareRef && !createdAssets.squareMarketingImages.includes(squareRef)) {
          createdAssets.squareMarketingImages.push(squareRef);
          createdAssetResources.push(squareRef);
        }
      }

      // Upload General Images with fieldType handling
      for (const img of rawGeneralImages) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
        if (!raw) continue;
        const fieldType = typeof img === "object" && img?.fieldType ? img.fieldType : null;
        const aspectRatio = typeof img === "object" && img?.aspectRatio ? img.aspectRatio : null;

        if (fieldType === "MARKETING_IMAGE" || aspectRatio === "1.91:1") {
          let landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          landscapeUrl = toPollinationsTransform(landscapeUrl, 1200, 628);
          const ref = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Land_${Date.now()}`, landscapeUrl);
          if (ref && !createdAssets.marketingImages.includes(ref)) {
            createdAssets.marketingImages.push(ref);
            createdAssetResources.push(ref);
          }
        } else if (fieldType === "SQUARE_MARKETING_IMAGE" || aspectRatio === "1:1") {
          let squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          squareUrl = toPollinationsTransform(squareUrl, 1200, 1200);
          const ref = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Sq_${Date.now()}`, squareUrl);
          if (ref && !createdAssets.squareMarketingImages.includes(ref)) {
            createdAssets.squareMarketingImages.push(ref);
            createdAssetResources.push(ref);
          }
        } else if (fieldType === "LOGO") {
          let logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
          logoUrl = toPollinationsTransform(logoUrl, 500, 500);
          if (!raw.startsWith("customers/")) {
            const ref = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Logo_${Date.now()}`, logoUrl);
            if (ref && !createdAssets.logoImages.includes(ref)) {
              createdAssets.logoImages.push(ref);
              createdAssetResources.push(ref);
            }
          }
        } else {
          // If no fieldType, generate both 1.91:1 and 1:1 variants
          let landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          landscapeUrl = toPollinationsTransform(landscapeUrl, 1200, 628);
          const lRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Land_${Date.now()}`, landscapeUrl);
          if (lRef && !createdAssets.marketingImages.includes(lRef)) {
            createdAssets.marketingImages.push(lRef);
            createdAssetResources.push(lRef);
          }

          let squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          squareUrl = toPollinationsTransform(squareUrl, 1200, 1200);
          const sRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Sq_${Date.now()}`, squareUrl);
          if (sRef && !createdAssets.squareMarketingImages.includes(sRef)) {
            createdAssets.squareMarketingImages.push(sRef);
            createdAssetResources.push(sRef);
          }
        }
      }

      // Upload Logos (Strict 1:1 Square)
      for (const logo of rawLogos) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || "";
        if (!raw) continue;
        if (raw.startsWith("customers/") && raw.includes("/assets/")) {
          continue;
        }
        let logoUrl = raw;
        if (typeof raw === "string" && raw.includes("ik.imagekit.io")) {
          logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,fo-auto");
        } else if (typeof logo === "object" && (logo?.aspectRatio === "1:1" || logo?.fieldType === "LOGO")) {
          logoUrl = raw;
        } else {
          logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,fo-auto");
        }
        logoUrl = toPollinationsTransform(logoUrl, 500, 500);
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Logo_${Date.now()}`, logoUrl);
        if (logoRef && !createdAssets.logoImages.includes(logoRef)) {
          createdAssets.logoImages.push(logoRef);
          createdAssetResources.push(logoRef);
        }
      }

      // If no valid marketing images or square marketing images, upload default clean marketing images
      const DEFAULT_DISP_IMAGE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";
      if (createdAssets.marketingImages.length === 0) {
        let landscapeUrl = toImageKitTransform(DEFAULT_DISP_IMAGE, "tr:w-1200,h-628,fo-auto");
        landscapeUrl = toPollinationsTransform(landscapeUrl, 1200, 628);
        const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Land_${Date.now()}`, landscapeUrl);
        if (landscapeRef) {
          createdAssets.marketingImages.push(landscapeRef);
          createdAssetResources.push(landscapeRef);
        }
      }
      if (createdAssets.squareMarketingImages.length === 0) {
        let squareUrl = toImageKitTransform(DEFAULT_DISP_IMAGE, "tr:w-1200,h-1200,fo-auto");
        squareUrl = toPollinationsTransform(squareUrl, 1200, 1200);
        const squareRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Sq_${Date.now()}`, squareUrl);
        if (squareRef) {
          createdAssets.squareMarketingImages.push(squareRef);
          createdAssetResources.push(squareRef);
        }
      }

      // If no valid logo image was created, upload guaranteed 1:1 fallback logo
      if (createdAssets.logoImages.length === 0) {
        const DEFAULT_DISP_LOGO = "https://ik.imagekit.io/automationjds/tr:w-500,h-500,fo-auto/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";
        const fallbackLogoRef = await this.uploadImageAsset(organizationId, customerId, `AwrDisp_Logo_${Date.now()}`, DEFAULT_DISP_LOGO);
        if (fallbackLogoRef) {
          createdAssets.logoImages.push(fallbackLogoRef);
          createdAssetResources.push(fallbackLogoRef);
        }
      }

      // Optional YouTube Video Assets
      const rawVideos = Array.isArray(videos) ? videos.filter(Boolean) : [];
      for (const vid of rawVideos) {
        const vidUrlOrId = typeof vid === "string" ? vid.trim() : vid?.url || vid?.id || "";
        if (!vidUrlOrId) continue;
        const vidMatch = vidUrlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const youtubeVideoId = vidMatch ? vidMatch[1] : (/^[\w-]{11}$/.test(vidUrlOrId) ? vidUrlOrId : null);
        if (youtubeVideoId) {
          try {
            const vidAssetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [{
                create: {
                  name: `Video_${youtubeVideoId}_${Date.now()}`.slice(0, 100),
                  type: "YOUTUBE_VIDEO",
                  youtubeVideoAsset: {
                    youtubeVideoId
                  }
                }
              }]
            }, { headers });
            const vidAssetRef = vidAssetRes.data?.results?.[0]?.resourceName;
            if (vidAssetRef) {
              createdAssets.youtubeVideos.push(vidAssetRef);
              createdAssetResources.push(vidAssetRef);
            }
          } catch (vidErr: any) {
            console.warn("[YoutubeDisplayLocalService] YouTube video asset creation warning:", vidErr?.response?.data || vidErr.message);
          }
        }
      }

      if (createdAssets.marketingImages.length === 0 || createdAssets.squareMarketingImages.length === 0) {
        throw new Error("Failed to process required marketing images (1.91:1 landscape and 1:1 square).");
      }
      if (createdAssets.logoImages.length === 0) {
        throw new Error("Failed to process required logo image (1:1).");
      }

      // ── 10. CLEAN TEXT INPUTS FOR RESPONSIVE DISPLAY AD ──
      const safeHeadlines = rawHeadlines
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 30))
        .filter((text: string) => text.length > 0)
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const safeLongHeadline = GoogleAdsBaseService.cleanAdText(rawLongHeadlines[0], 90);

      const safeDescriptions = rawDescriptions
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
        .filter((text: string) => text.length > 0)
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName, 25);

      // ── 11. BUILD & MUTATE RESPONSIVE DISPLAY AD ──
      const responsiveDisplayAd: any = {
        marketingImages: createdAssets.marketingImages.map((asset: string) => ({ asset })),
        squareMarketingImages: createdAssets.squareMarketingImages.map((asset: string) => ({ asset })),
        logoImages: createdAssets.logoImages.map((asset: string) => ({ asset })),
        headlines: safeHeadlines,
        longHeadline: { text: safeLongHeadline },
        descriptions: safeDescriptions,
        businessName: safeBusinessName
      };

      if (createdAssets.youtubeVideos.length > 0) {
        responsiveDisplayAd.youtubeVideos = createdAssets.youtubeVideos.map((asset: string) => ({ asset }));
      }

      // Call to action text
      const effectiveCta = callToActionText || callToAction;
      const CTA_CANONICAL_MAP: Record<string, string> = {
        "APPLY_NOW": "Apply Now",
        "BOOK_NOW": "Book Now",
        "CONTACT_US": "Contact Us",
        "DOWNLOAD": "Download",
        "LEARN_MORE": "Learn More",
        "INSTALL": "Install",
        "VISIT_SITE": "Visit Site",
        "SHOP_NOW": "Shop Now",
        "SIGN_UP": "Sign Up",
        "GET_QUOTE": "Get Quote",
        "SUBSCRIBE": "Subscribe",
        "SEE_MORE": "See More"
      };
      if (effectiveCta && String(effectiveCta).trim() !== "Automated") {
        const ctaKey = String(effectiveCta).trim().toUpperCase().replace(/[\s-]+/g, "_");
        responsiveDisplayAd.callToActionText = CTA_CANONICAL_MAP[ctaKey] || String(effectiveCta).trim();
      }

      // Custom colors (mainColor & accentColor)
      if (mainCustomColor && typeof mainCustomColor === "string" && /^#[0-9A-Fa-f]{6}$/.test(mainCustomColor)) {
        responsiveDisplayAd.mainColor = mainCustomColor;
      }
      if (accentCustomColor && typeof accentCustomColor === "string" && /^#[0-9A-Fa-f]{6}$/.test(accentCustomColor)) {
        responsiveDisplayAd.accentColor = accentCustomColor;
      }

      // Format setting: ALL_FORMATS or NON_NATIVE
      if (useNativeFormats !== undefined) {
        responsiveDisplayAd.formatSetting = useNativeFormats === false ? "NON_NATIVE" : "ALL_FORMATS";
      }

      // Control spec: enableAssetEnhancements and enableAutogenVideo
      const controlSpec: any = {};
      if (useAssetEnhancements !== undefined) {
        controlSpec.enableAssetEnhancements = Boolean(useAssetEnhancements);
      }
      if (useAutoGeneratedVideo !== undefined) {
        controlSpec.enableAutogenVideo = Boolean(useAutoGeneratedVideo);
      }
      if (Object.keys(controlSpec).length > 0) {
        responsiveDisplayAd.controlSpec = controlSpec;
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

    } catch (apiErr: any) {
      // ── 12. ATOMIC ROLLBACK ON DOWNSTREAM FAILURE ──
      console.error("[Google Ads API Error for Awareness Display]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));

      if (createdCampaignResource) {
        try {
          console.warn(`[Rollback] Removing created campaign ${createdCampaignResource}...`);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{ remove: createdCampaignResource }]
          }, { headers });
        } catch (rollbackErr: any) {
          console.error("[Rollback Failed for Campaign]:", rollbackErr?.message);
        }
      }

      if (createdBudgetResource) {
        try {
          console.warn(`[Rollback] Removing created budget ${createdBudgetResource}...`);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaignBudgets:mutate`, {
            operations: [{ remove: createdBudgetResource }]
          }, { headers });
        } catch (rollbackErr: any) {
          console.error("[Rollback Failed for Budget]:", rollbackErr?.message);
        }
      }

      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      throw new Error(formatted);
    }

    // ── 13. PERSIST COMPLETE CAMPAIGN TO DATABASE ONLY UPON SUCCESS ──
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `awareness-display-${Date.now()}`,
      name: campaignName,
      campaignType: "DISPLAY",
      biddingStrategy: finalBiddingStrategy,
      budget: Number(effectiveBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines: rawHeadlines,
      descriptions: rawDescriptions,
      geoTargets: {
        objective: "Awareness",
        locations,
        languages,
        adSchedule: (Array.isArray(adSchedule) && adSchedule.length > 0) ? adSchedule : adScheduleList,
        deviceTargeting: deviceTargeting || deviceOption,
        devices,
        ipExclusions,
        demographics: {
          gender: demographicsGender,
          age: demographicsAge,
          parentalStatus: demographicsParental,
          income: demographicsIncome
        },
        topics: (Array.isArray(topics) && topics.length > 0) ? topics : selectedTopics,
        placements: (Array.isArray(placements) && placements.length > 0) ? placements : selectedPlacements,
        keywords: (Array.isArray(keywords) && keywords.length > 0) ? keywords : (enteredKeywordsText ? String(enteredKeywordsText).split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean) : []),
        audiences: (Array.isArray(audiences) && audiences.length > 0) ? audiences : selectedAudiences,
        contentLabels,
        sensitiveContent,
        contentTypeExclusions,
        optimizedTargeting: useOptimizedTargeting,
        callToAction: callToActionText || callToAction,
        customColors: { main: mainCustomColor, accent: accentCustomColor }
      },
      advertisingChannelType: "DISPLAY",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Awareness Display Campaign created successfully (Paused)",
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