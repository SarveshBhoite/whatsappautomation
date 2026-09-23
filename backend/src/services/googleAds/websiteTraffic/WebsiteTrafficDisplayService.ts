import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class WebsiteTrafficDisplayService extends GoogleAdsBaseService {
  // Known canonical mapping for instant resolution
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
    locationNameOrId: any,
    headers?: any,
    isAiGuided: boolean | string = false
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
      console.warn(`[WebsiteTrafficDisplayService] geoTargetConstants:suggest failed for "${trimmed}":`, e?.message || e);
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

    const lower = trimmed.toLowerCase();
    if (lower === "all languages" || lower === "all" || lower === "any" || lower === "all_languages") {
      return null;
    }

    if (/^\d+$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("languageConstants/")) return trimmed.replace("languageConstants/", "");

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

    // ── 1. STRICT PRE-FLIGHT VALIDATION (NO FAKES / PLACEHOLDERS) ──
    if (!customerId || customerId.trim().length === 0) {
      throw new Error("Customer ID is required for Display campaign creation.");
    }
    const cleanCid = customerId.replace(/-/g, "").trim();
    const fakeCids = ["1234567890", "0000000000", "default", "demo-org-123"];
    if (!cleanCid || fakeCids.includes(cleanCid) || !/^\d{10}$/.test(cleanCid)) {
      throw new Error(`A valid 10-digit Google Ads Customer ID is required (received: "${customerId}").`);
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
      const blockedDomains = ["example.com", "google.com", "localhost", "127.0.0.1"];
      if (blockedDomains.some(b => host === b || host.endsWith(`.${b}`))) {
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
        if (["example.com", "google.com", "localhost", "127.0.0.1"].some(b => mHost === b || mHost.endsWith(`.${b}`))) {
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
      throw new Error("Business name is required for Display ads.");
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

    const rawDescriptions: string[] = (payload.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
    if (rawDescriptions.length < 1) {
      throw new Error("At least 1 description is required for Responsive Display ads.");
    }
    for (const d of rawDescriptions) {
      if (d.length > 90) {
        throw new Error(`Description "${d}" exceeds the Google Ads limit of 90 characters for Display ads.`);
      }
    }

    const rawLongHeadlines: string[] = (payload.longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
    if (rawLongHeadlines.length < 1 && rawHeadlines.length > 0) {
      // Allowed: use primary headline if long headline not distinct
    } else if (rawLongHeadlines.length > 0 && rawLongHeadlines[0].length > 90) {
      throw new Error(`Long headline "${rawLongHeadlines[0]}" exceeds the Google Ads limit of 90 characters.`);
    }

    // Media assets validation (at least 1 landscape/marketing image, 1 square image, and 1 logo)
    const rawImages = (payload.images || payload.marketingImages || []).filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data || img.asset));
    if (rawImages.length < 1) {
      throw new Error("At least 1 marketing image is required for Responsive Display ads.");
    }
    const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data || lg.asset));
    if (rawLogos.length < 1) {
      throw new Error("At least 1 logo is required for Responsive Display ads.");
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
      campaignName = "Website Traffic Display",
      finalUrl: inputFinalUrl,
      website,
      mobileFinalUrl,
      biddingStrategy: inputBiddingStrategy,
      biddingFocus,
      targetCpa,
      targetRoas,
      targetCpc,
      maxCpc,
      cpcBid,
      viewableCpmBid,
      startDate,
      endDate,
      locations = isAiGuided ? [] : ["India"],
      languages = isAiGuided ? [] : ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      logos = [],
      callToAction = "Automated",
      businessName,
      dailyBudget,
      budget,
      euPolitical = "NO",
      deviceTargeting = "ALL",
      devices = [],
      audience,
      audiences = [],
      selectedAudiences = [],
      demographics,
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
      ipExclusions,
      adSchedule = [],
      adRotation = "OPTIMIZE",
      adRotationOption,
      useAssetEnhancements,
      useAutoGeneratedVideo,
      useNativeFormats,
      useDynamicFeed,
      sitelinks = [],
      callouts = [],
      structuredSnippets = [],
      promotions = [],
      callAsset,
      leadFormAsset,
      conversionGoals = []
    } = payload;

    const finalUrl = (inputFinalUrl || website).trim();
    const resolvedMobileFinalUrl = (mobileFinalUrl && typeof mobileFinalUrl === "string" && mobileFinalUrl.trim()) ? mobileFinalUrl.trim() : null;
    const effectiveBudget = Number(dailyBudget !== undefined && dailyBudget !== "" ? dailyBudget : budget);

    // ── 3. RESOLVE BIDDING STRATEGY OBJECT (OFFICIAL v24) ──
    const rawBStrat = (inputBiddingStrategy || (biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : biddingFocus === "Impressions" || biddingFocus === "Viewable CPM" ? "VIEWABLE_CPM" : biddingFocus === "Clicks" || biddingFocus === "Maximize Clicks" ? "MAXIMIZE_CLICKS" : biddingFocus === "Manual CPC" ? "MANUAL_CPC" : "MAXIMIZE_CONVERSIONS")).trim().toUpperCase();

    let biddingConfig: any = {};
    let finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";

    if (rawBStrat === "TARGET_CPA") {
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
    } else if (rawBStrat === "MAXIMIZE_CLICKS" || rawBStrat === "CLICKS" || rawBStrat === "TARGET_SPEND") {
      finalBiddingStrategy = "MAXIMIZE_CLICKS";
      const cpcVal = (targetCpc || maxCpc) ? Math.round(Number(targetCpc || maxCpc) * 1_000_000) : undefined;
      biddingConfig = cpcVal ? { targetSpend: { cpcBidCeilingMicros: String(cpcVal) } } : { targetSpend: {} };
    } else if (rawBStrat === "MANUAL_CPC") {
      finalBiddingStrategy = "MANUAL_CPC";
      biddingConfig = { manualCpc: { enhancedCpcEnabled: false } };
    } else if (rawBStrat === "VIEWABLE_CPM") {
      finalBiddingStrategy = "MANUAL_CPM";
      biddingConfig = { manualCpm: {} };
    } else {
      finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = (customerId || "").replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    let apiResult: any = { campaignId: `webtraffic-display-${Date.now()}` };
    let createdCampaignResource: string | null = null;
    let createdBudgetResource: string | null = null;
    const createdAssetResources: string[] = [];

    try {
      // ── 4. CREATE BUDGET (CampaignBudget) ──
      const budgetAmountMicros = Math.round(effectiveBudget * 1_000_000);
      const budgetPayload: any = {
        name: `${campaignName} Budget ${Date.now()}`.slice(0, 100),
        amountMicros: String(budgetAmountMicros),
        deliveryMethod: payload.deliveryMethod || "STANDARD",
        explicitlyShared: Boolean(payload.explicitlyShared || false)
      };

      const budgetRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignBudgets:mutate`, {
        operations: [{ create: budgetPayload }]
      }, { headers });

      const budgetRef = budgetRes.data?.results?.[0]?.resourceName;
      if (!budgetRef) {
        throw new Error("Failed to create CampaignBudget for Display.");
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
        advertisingChannelType: "DISPLAY",
        campaignBudget: budgetRef,
        containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        startDateTime: `${startStr} 00:00:00`,
        ...biddingConfig
      };

      if (endStr) {
        campaignPayloadCreate.endDateTime = `${endStr} 23:59:59`;
      }

      // URL options
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
        throw new Error("Failed to create Display Campaign.");
      }
      createdCampaignResource = campaignRef;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // ── 6. ATTACH CAMPAIGN-LEVEL CRITERIA (LOCATIONS, LANGUAGES, AD SCHEDULE, DEVICES, IP BLOCK, CONTENT LABELS) ──
      const campaignCriterionOps: any[] = [];

      // A. Location Criteria (Campaign Level)
      const rawLocs = Array.isArray(locations) ? locations : [locations];
      for (const loc of rawLocs) {
        if (!loc || loc === "ALL" || loc === "All countries and territories") continue;
        const geoId = await this.resolveGeoTargetConstant(loc, headers, isAiGuided);
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

      // B. Language Criteria (Campaign Level)
      const rawLangs = Array.isArray(languages) ? languages : [languages];
      for (const lang of rawLangs) {
        const langId = this.resolveLanguageConstant(lang, isAiGuided);
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
      if (Array.isArray(adSchedule) && adSchedule.length > 0) {
        const scheduleCriteria = WebsiteTrafficDisplayService.buildAdScheduleCriteria(adSchedule);
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
      const isSpecificDevices = (deviceTargeting === "SPECIFIC" || payload.deviceOption === "SPECIFIC") && Array.isArray(devices) && devices.length > 0;
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

      // D. Content Label Exclusions (Strict Official ContentLabelTypeEnum Mapping)
      // Note: "Sensational and shocking", "Games", and "G-mob mobile app non interstitial" are CRM/DB metadata only.
      const allContentExclusionSources: Record<string, boolean>[] = [];
      if (contentLabels && typeof contentLabels === "object") allContentExclusionSources.push(contentLabels);
      if (sensitiveContent && typeof sensitiveContent === "object") allContentExclusionSources.push(sensitiveContent);
      if (contentTypeExclusions && typeof contentTypeExclusions === "object") allContentExclusionSources.push(contentTypeExclusions);

      const processedLabels = new Set<string>();

      for (const source of allContentExclusionSources) {
        for (const [label, isExcluded] of Object.entries(source)) {
          if (isExcluded) {
            const mappedLabelEnum = WebsiteTrafficDisplayService.CONTENT_LABEL_MAP[label];
            if (mappedLabelEnum) {
              if (!processedLabels.has(mappedLabelEnum)) {
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
      }

      if (campaignCriterionOps.length > 0) {
        try {
          const critRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignCriteria:mutate`, {
            operations: campaignCriterionOps
          }, { headers });
          apiResult.campaignCriteriaResourceNames = (critRes.data?.results || []).map((r: any) => r.resourceName);
        } catch (campCritErr: any) {
          console.warn("[WebsiteTrafficDisplayService] campaignCriteria mutate warning:", campCritErr?.response?.data || campCritErr.message);
          if (isAiGuided) throw campCritErr;
        }
      }

      // ── 7. CREATE DISPLAY AD GROUP ──
      const isOptimized = optimizedTargeting !== undefined ? Boolean(optimizedTargeting) : (useOptimizedTargeting !== undefined ? Boolean(useOptimizedTargeting) : true);
      const agCreate: any = {
        campaign: campaignRef,
        name: `${effectiveCampaignName} Ad Group 1`,
        status: "ENABLED",
        type: "DISPLAY_STANDARD",
        optimizedTargetingEnabled: isOptimized
      };

      if (finalBiddingStrategy === "MANUAL_CPC" && (cpcBid || maxCpc || targetCpc)) {
        agCreate.cpcBidMicros = String(Math.round(Number(cpcBid || maxCpc || targetCpc) * 1_000_000));
      } else if (finalBiddingStrategy === "MANUAL_CPM" && viewableCpmBid) {
        agCreate.cpmBidMicros = String(Math.round(Number(viewableCpmBid) * 1_000_000));
      }

      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, {
        operations: [{ create: agCreate }]
      }, { headers });

      const adGroupRef = adGroupRes.data?.results?.[0]?.resourceName;
      if (!adGroupRef) {
        throw new Error("Failed to create AdGroup for Display.");
      }
      apiResult.adGroupResourceName = adGroupRef;

      // ── 8. ATTACH AD GROUP TARGETING CRITERIA (DEMOGRAPHICS, TOPICS, PLACEMENTS, KEYWORDS, AUDIENCES) ──
      const adGroupCriterionOps: any[] = [];

      // A. Demographics (Gender, Age, Parental Status, Household Income)
      const genderSettings = demographicsGender || demographics?.gender;
      if (genderSettings && typeof genderSettings === "object") {
        for (const [genderKey, isIncluded] of Object.entries(genderSettings)) {
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

      const ageSettings = demographicsAge || demographics?.age;
      if (ageSettings && typeof ageSettings === "object") {
        const ageMap: Record<string, string> = {
          "18 - 24": "AGE_RANGE_18_24",
          "25 - 34": "AGE_RANGE_25_34",
          "35 - 44": "AGE_RANGE_35_44",
          "45 - 54": "AGE_RANGE_45_54",
          "55 - 64": "AGE_RANGE_55_64",
          "65+": "AGE_RANGE_65_UP",
          "Unknown": "AGE_RANGE_UNDETERMINED"
        };
        for (const [ageKey, isIncluded] of Object.entries(ageSettings)) {
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

      const parentalSettings = demographicsParental || demographics?.parentalStatus;
      if (parentalSettings && typeof parentalSettings === "object") {
        for (const [pKey, isIncluded] of Object.entries(parentalSettings)) {
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

      const incomeSettings = demographicsIncome || demographics?.income;
      if (incomeSettings && typeof incomeSettings === "object") {
        for (const [tier, isIncluded] of Object.entries(incomeSettings)) {
          if (isIncluded === false) {
            const mappedIncome = WebsiteTrafficDisplayService.INCOME_RANGE_MAP[tier];
            if (!mappedIncome) {
              throw new Error(`Unsupported household income tier: "${tier}". Only official Google Ads IncomeRangeTypeEnum values are allowed.`);
            }
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

      // D. Content Targeting: Topics
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

      // E. Content Targeting: Placements
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

      // F. Content Targeting: Keywords
      const kwList = Array.isArray(keywords) && keywords.length > 0
        ? keywords
        : (enteredKeywordsText ? enteredKeywordsText.split(/[\n,]+/).map((s: string) => s.trim()).filter(Boolean) : []);
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

      // G. User Lists / Custom Audiences
      const audList = Array.isArray(audiences) && audiences.length > 0
        ? audiences
        : (Array.isArray(selectedAudiences) && selectedAudiences.length > 0 ? selectedAudiences : (audience?.userLists || []));
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
          console.warn("[WebsiteTrafficDisplayService] adGroupCriteria mutate warning:", critErr?.response?.data || critErr.message);
          if (isAiGuided) throw critErr;
        }
      }

      // ── 9. EXTENSIONS (ASSETS + CAMPAIGN ASSETS) ──
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
              console.warn("[WebsiteTrafficDisplayService] Sitelink asset creation warning:", slErr?.response?.data || slErr.message);
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
              console.warn("[WebsiteTrafficDisplayService] Callout asset warning:", e?.response?.data || e.message);
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
              console.warn("[WebsiteTrafficDisplayService] Structured snippet asset warning:", e?.response?.data || e.message);
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
              console.warn("[WebsiteTrafficDisplayService] Promotion asset warning:", e?.response?.data || e.message);
            }
          }
        }
      }

      // Call Asset
      if (callAsset && callAsset.phoneNumber) {
        try {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Call Asset - ${Date.now()}`,
                callAsset: {
                  countryCode: callAsset.countryCode || "IN",
                  phoneNumber: callAsset.phoneNumber
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
                fieldType: "CALL",
                status: "ENABLED"
              }
            });
          }
        } catch (e: any) {
          console.warn("[WebsiteTrafficDisplayService] Call asset warning:", e?.response?.data || e.message);
        }
      }

      // Lead Form Asset (Optional on Website Traffic)
      if (leadFormAsset && leadFormAsset.businessName) {
        try {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Lead Form - ${Date.now()}`,
                leadFormAsset: {
                  businessName: GoogleAdsBaseService.cleanAdText(leadFormAsset.businessName, 25),
                  headline: GoogleAdsBaseService.cleanAdText(leadFormAsset.headline || "Contact Us", 30),
                  description: GoogleAdsBaseService.cleanAdText(leadFormAsset.description || "Submit your details", 200),
                  privacyPolicyUrl: leadFormAsset.privacyPolicyUrl || finalUrl,
                  callToActionType: "GET_QUOTE"
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
                fieldType: "LEAD_FORM",
                status: "ENABLED"
              }
            });
          }
        } catch (e: any) {
          console.warn("[WebsiteTrafficDisplayService] Lead form asset warning:", e?.response?.data || e.message);
        }
      }

      if (campaignAssetOperations.length > 0) {
        try {
          await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
            operations: campaignAssetOperations
          }, { headers });
        } catch (caErr: any) {
          console.warn("[WebsiteTrafficDisplayService] campaignAssets mutate warning:", caErr?.response?.data || caErr.message);
        }
      }

      // ── 10. CONVERSION GOALS (campaignConversionGoals:mutate) ──
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
          console.warn("[WebsiteTrafficDisplayService] campaignConversionGoals mutate warning:", cgErr?.response?.data || cgErr.message);
        }
      }

      // ── 11. UPLOAD IMAGE & LOGO ASSETS & ATTACH RESPONSIVE DISPLAY AD ──
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

      const toPollinationsTransform = (url: string, width: number, height: number): string => {
        if (typeof url === "string" && url.includes("image.pollinations.ai")) {
          return url.replace(/width=\d+/, `width=${width}`).replace(/height=\d+/, `height=${height}`);
        }
        return url;
      };

      // Upload marketing images (landscape & square)
      for (const img of rawImages) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || img?.asset || "";
        if (!raw) continue;
        if (raw.startsWith("customers/") && raw.includes("/assets/")) {
          if (!createdAssets.marketingImages.includes(raw)) createdAssets.marketingImages.push(raw);
          continue;
        }

        const fieldType = typeof img === "object" && img?.fieldType ? img.fieldType : null;
        const aspectRatio = typeof img === "object" && img?.aspectRatio ? img.aspectRatio : null;

        if (fieldType === "MARKETING_IMAGE" || aspectRatio === "1.91:1") {
          let landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          landscapeUrl = toPollinationsTransform(landscapeUrl, 1200, 628);
          const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Land_${Date.now()}`, landscapeUrl);
          if (landscapeRef && !createdAssets.marketingImages.includes(landscapeRef)) {
            createdAssets.marketingImages.push(landscapeRef);
          }
        } else if (fieldType === "SQUARE_MARKETING_IMAGE" || aspectRatio === "1:1") {
          let squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          squareUrl = toPollinationsTransform(squareUrl, 1200, 1200);
          const squareRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Sq_${Date.now()}`, squareUrl);
          if (squareRef && !createdAssets.squareMarketingImages.includes(squareRef)) {
            createdAssets.squareMarketingImages.push(squareRef);
          }
        } else if (fieldType === "LOGO") {
          // 1:1 Logo (min 128x128, recommend 1200x1200)
          let logoUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          logoUrl = toPollinationsTransform(logoUrl, 1200, 1200);
          if (!raw.startsWith("customers/")) {
            const logoRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Logo_${Date.now()}`, logoUrl);
            if (logoRef && !createdAssets.logoImages.includes(logoRef)) {
              createdAssets.logoImages.push(logoRef);
            }
          }
        } else {
          let landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          landscapeUrl = toPollinationsTransform(landscapeUrl, 1200, 628);
          const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Land_${Date.now()}`, landscapeUrl);
          if (landscapeRef && !createdAssets.marketingImages.includes(landscapeRef)) {
            createdAssets.marketingImages.push(landscapeRef);
          }

          let squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
          squareUrl = toPollinationsTransform(squareUrl, 1200, 1200);
          const squareRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Sq_${Date.now()}`, squareUrl);
          if (squareRef && !createdAssets.squareMarketingImages.includes(squareRef)) {
            createdAssets.squareMarketingImages.push(squareRef);
          }
        }
      }

      // Upload logos (Strict 1:1 Square: min 128x128, recommended 1200x1200)
      for (const logo of rawLogos) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || "";
        if (!raw) continue;
        if (raw.startsWith("customers/") && raw.includes("/assets/")) {
          // Cross-campaign / pre-existing asset IDs from other campaign types (e.g. DG_Logo) cannot be assumed to match Display Ad 1:1 spec
          continue;
        }

        let logoUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
        logoUrl = toPollinationsTransform(logoUrl, 1200, 1200);
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Logo_${Date.now()}`, logoUrl);
        if (logoRef && !createdAssets.logoImages.includes(logoRef)) {
          createdAssets.logoImages.push(logoRef);
        }
      }

      // If no valid marketing images or square marketing images, upload default clean marketing images
      const DEFAULT_DISP_IMAGE = "https://ik.imagekit.io/automationjds/tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF/gads_dg_image_1788441362828_images_RKjVY-rHB.png";
      if (createdAssets.marketingImages.length === 0) {
        let landscapeUrl = toImageKitTransform(DEFAULT_DISP_IMAGE, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
        landscapeUrl = toPollinationsTransform(landscapeUrl, 1200, 628);
        const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Land_${Date.now()}`, landscapeUrl);
        if (landscapeRef) {
          createdAssets.marketingImages.push(landscapeRef);
        }
      }
      if (createdAssets.squareMarketingImages.length === 0) {
        let squareUrl = toImageKitTransform(DEFAULT_DISP_IMAGE, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
        squareUrl = toPollinationsTransform(squareUrl, 1200, 1200);
        const squareRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Sq_${Date.now()}`, squareUrl);
        if (squareRef) {
          createdAssets.squareMarketingImages.push(squareRef);
        }
      }

      // If no valid logo image was created, upload guaranteed 1:1 fallback logo
      if (createdAssets.logoImages.length === 0) {
        const DEFAULT_DISP_LOGO = "https://ik.imagekit.io/automationjds/tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";
        const fallbackLogoRef = await this.uploadImageAsset(organizationId, customerId, `WT_Disp_Logo_${Date.now()}`, DEFAULT_DISP_LOGO);
        if (fallbackLogoRef) {
          createdAssets.logoImages.push(fallbackLogoRef);
        }
      }

      const uniqueMarketingImages = Array.from(new Set(createdAssets.marketingImages));
      const uniqueSquareImages = Array.from(new Set(createdAssets.squareMarketingImages));
      const uniqueLogoImages = Array.from(new Set(createdAssets.logoImages));

      if (uniqueMarketingImages.length === 0 || uniqueSquareImages.length === 0) {
        throw new Error("At least 1 landscape marketing image (1.91:1) and 1 square marketing image (1:1) are required for Responsive Display ads.");
      }
      if (uniqueLogoImages.length === 0) {
        throw new Error("At least 1 logo asset (1:1) is required for Responsive Display ads.");
      }

      const safeHeadlines = rawHeadlines
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 30) }));

      const safeLongHeadline = rawLongHeadlines.length > 0
        ? GoogleAdsBaseService.cleanAdText(rawLongHeadlines[0], 90)
        : GoogleAdsBaseService.cleanAdText(rawHeadlines[0], 90);

      const safeDescriptions = rawDescriptions
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 90) }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName, 25);

      const responsiveDisplayAd: any = {
        marketingImages: createdAssets.marketingImages.map((asset: string) => ({ asset })),
        squareMarketingImages: createdAssets.squareMarketingImages.map((asset: string) => ({ asset })),
        logoImages: createdAssets.logoImages.map((asset: string) => ({ asset })),
        headlines: safeHeadlines,
        longHeadline: { text: safeLongHeadline },
        descriptions: safeDescriptions,
        businessName: safeBusinessName
      };

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

      if (callToAction && String(callToAction).trim() !== "Automated") {
        const ctaKey = String(callToAction).trim().toUpperCase().replace(/[\s-]+/g, "_");
        const canonicalCta = CTA_CANONICAL_MAP[ctaKey] || String(callToAction).trim();
        responsiveDisplayAd.callToActionText = canonicalCta;
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
                finalUrls: [finalUrl],
                ...(resolvedMobileFinalUrl ? { finalMobileUrls: [resolvedMobileFinalUrl] } : {})
              }
            }
          }
        ]
      };

      const adGroupAdRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
      apiResult.adGroupAdResourceName = adGroupAdRes.data?.results?.[0]?.resourceName;

    } catch (apiErr: any) {
      // ── 12. ATOMIC ROLLBACK ON DOWNSTREAM FAILURE ──
      console.error("[Google Ads API Error for Website Traffic Display]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
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
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      throw new Error(formatted);
    }

    // ── 13. PERSIST COMPLETE CAMPAIGN CONFIGURATION ONLY ON SUCCESS ──
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `webtraffic-display-${Date.now()}`,
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
        mobileFinalUrl: resolvedMobileFinalUrl,
        locations,
        languages,
        deviceTargeting,
        devices,
        adSchedule,
        adRotation: adRotationOption || adRotation,
        ipExclusions,
        demographics: {
          gender: demographicsGender,
          age: demographicsAge,
          parentalStatus: demographicsParental,
          income: demographicsIncome
        },
        topics,
        placements,
        keywords,
        contentLabels,
        sensitiveContent,
        contentTypeExclusions,
        optimizedTargeting: useOptimizedTargeting,
        useAssetEnhancements,
        useAutoGeneratedVideo,
        useNativeFormats,
        useDynamicFeed,
        sitelinks,
        callouts,
        structuredSnippets,
        promotions,
        conversionGoals,
        objective: "Website Traffic"
      },
      advertisingChannelType: "DISPLAY",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Display Campaign created successfully (Paused)",
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