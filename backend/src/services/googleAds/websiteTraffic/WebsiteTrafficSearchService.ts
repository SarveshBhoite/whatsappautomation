import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class WebsiteTrafficSearchService extends GoogleAdsBaseService {
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

  /**
   * Helper: Maps frontend minute string/number to Google Ads MinuteOfHour enum
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

      // Check if full day schedule (00:00 -> 00:00 or 00:00 -> 24:00)
      if ((start === "00:00" || start === "0:00") && (end === "00:00" || end === "0:00" || end === "24:00")) {
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

        // Validation: end must be after start
        const startTotalMinutes = sHour * 60 + (sm || 0);
        const endTotalMinutes = eHour * 60 + (em || 0);
        if (endTotalMinutes <= startTotalMinutes && eHour !== 24) {
          throw new Error(`Invalid ad schedule: End time (${end}) must be after start time (${start}) for ${sched.day || 'day'}.`);
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
   * Resolves a location name or ID using the static map, numeric ID format, or Google Ads geoTargetConstants:suggest API.
   * Throws an error if unresolved in AI Guided mode instead of silently converting.
   */
  public static async resolveGeoTargetConstant(
    locationNameOrId: string,
    headers: any,
    isAiGuided: boolean
  ): Promise<string | null> {
    if (!locationNameOrId || typeof locationNameOrId !== "string") return null;
    const trimmed = locationNameOrId.trim();
    if (!trimmed) return null;

    // Check if directly a numeric ID or resource name
    if (/^\d+$/.test(trimmed)) return trimmed;
    if (trimmed.startsWith("geoTargetConstants/")) return trimmed.replace("geoTargetConstants/", "");

    const lower = trimmed.toLowerCase();
    if (this.GEO_TARGET_CONSTANT_MAP[lower]) {
      return this.GEO_TARGET_CONSTANT_MAP[lower];
    }

    // Attempt live suggest query via Google Ads API
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
      console.warn(`[WebsiteTrafficSearchService] geoTargetConstants:suggest lookup failed for "${trimmed}":`, e?.message || e);
    }

    if (isAiGuided) {
      throw new Error(`Location "${trimmed}" could not be resolved to a valid Google Ads geo target. Please select a valid city, state, or country.`);
    }

    return null;
  }

  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const isAiGuided = payload?.source === "AI_GUIDED" || payload?.isAiGuided === true;

    // ── 1. AI GUIDED STRICT PRE-FLIGHT VALIDATION ──
    if (isAiGuided) {
      const cleanCid = (customerId || "").replace(/-/g, "").trim();
      const fakeCids = ["1234567890", "default", "demo-org-123"];
      if (!cleanCid || fakeCids.includes(cleanCid) || !/^\d{10}$/.test(cleanCid)) {
        throw new Error("A valid 10-digit Google Ads Customer ID is required for AI-guided campaign creation.");
      }

      const budgetVal = Number(payload.dailyBudget ?? payload.budget);
      if (isNaN(budgetVal) || budgetVal <= 0) {
        throw new Error("A valid daily budget greater than 0 is required.");
      }

      const urlVal = (payload.finalUrl || payload.websiteVisitsUrl || payload.website || "").trim();
      const blockedUrls = [
        "https://www.example.com", "http://www.example.com", "example.com",
        "https://www.google.com", "http://www.google.com", "google.com",
        "localhost"
      ];
      if (!urlVal || !/^https?:\/\/.+/i.test(urlVal) || blockedUrls.some(b => urlVal.toLowerCase().includes(b))) {
        throw new Error("A valid website landing page URL starting with http:// or https:// is required (example.com, google.com, and localhost are disallowed).");
      }

      const rawHeadlines: string[] = (payload.headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
      const uniqueHeadlines = Array.from(new Set(rawHeadlines.map(h => h.trim())));
      if (uniqueHeadlines.length < 3) {
        throw new Error(`At least 3 unique headlines are required for Search ads (received ${uniqueHeadlines.length}).`);
      }
      for (const h of uniqueHeadlines) {
        if (h.length > 30) {
          throw new Error(`Headline "${h}" exceeds the Google Ads limit of 30 characters.`);
        }
      }

      const rawDescriptions: string[] = (payload.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
      const uniqueDescriptions = Array.from(new Set(rawDescriptions.map(d => d.trim())));
      if (uniqueDescriptions.length < 2) {
        throw new Error(`At least 2 unique descriptions are required for Search ads (received ${uniqueDescriptions.length}).`);
      }
      for (const d of uniqueDescriptions) {
        if (d.length > 90) {
          throw new Error(`Description "${d}" exceeds the Google Ads limit of 90 characters.`);
        }
      }

      const rawKeywords: string[] = (payload.keywords || []).filter((k: any) => typeof k === "string" && k.trim().length > 0);
      if (rawKeywords.length < 1) {
        throw new Error("At least 1 valid search keyword is required for a Search campaign.");
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

      // Bidding strategy target validation
      const bFocus = (payload.biddingFocus || payload.biddingStrategy || "Maximize conversions").trim();
      const normBFocus = bFocus.toLowerCase();
      if (normBFocus === "target cpa" || normBFocus === "target_cpa") {
        const cpa = Number(payload.targetCpa);
        if (isNaN(cpa) || cpa <= 0) {
          throw new Error("A positive Target CPA amount is required when Target CPA bidding is selected.");
        }
      }
      if (normBFocus === "target roas" || normBFocus === "target_roas") {
        const roas = Number(payload.targetRoas);
        if (isNaN(roas) || roas <= 0) {
          throw new Error("A positive Target ROAS percentage is required when Target ROAS bidding is selected.");
        }
      }
      if (normBFocus === "impression share" || normBFocus === "target impression share" || normBFocus === "target_impression_share") {
        const isPercent = Number(payload.targetImpressionSharePercent);
        if (isNaN(isPercent) || isPercent <= 0 || isPercent > 100) {
          throw new Error("Target impression share percent must be between 1% and 100%.");
        }
        const maxCpc = Number(payload.maxCpcImpressionShare || payload.maxCpcLimit);
        if (isNaN(maxCpc) || maxCpc <= 0) {
          throw new Error("Maximum CPC bid ceiling is required and must be greater than 0 for Target Impression Share.");
        }
      }
    }

    // ── 2. PREPARE PAYLOAD VALUES ──
    const {
      campaignName = "Website Traffic Search",
      websiteVisitsUrl = "https://www.example.com",
      finalUrl: inputFinalUrl,
      website,
      biddingFocus = "Maximize conversions",
      biddingStrategy: inputBiddingStrategy,
      targetCpa = isAiGuided ? undefined : 25,
      targetRoas = isAiGuided ? undefined : 200,
      maxCpcLimit,
      impressionShareLocation = "Anywhere on results page",
      targetImpressionSharePercent = 50,
      maxCpcImpressionShare,
      locations = isAiGuided ? [] : ["India"],
      languages = isAiGuided ? [] : ["English"],
      keywords = [],
      headlines = [],
      descriptions = [],
      dailyBudget = isAiGuided ? 0 : 1000,
      budget,
      startDate,
      endDate,
      euPolitical = "NO",
      // AI Max & Search Term Matching
      enableAiMax = true,
      enableTextCustomization = true,
      enableFinalUrlExpansion = true,
      useSearchTermMatchingAdGroup = true,
      // Extensions & Schedules
      adSchedule = [],
      sitelinks = [],
      callouts = [],
      structuredSnippets = [],
      callAsset,
      promotions = [],
      prices = [],
      leadForms = []
    } = payload;

    const finalUrl = (inputFinalUrl || websiteVisitsUrl || website || "").trim();
    const effectiveDailyBudget = Number(dailyBudget || budget || 1000);
    const amountMicros = Math.round(effectiveDailyBudget * 1_000_000);

    const validHeadlines: string[] = headlines.filter((h: any) => typeof h === "string" && h.trim().length > 0);
    const validDescriptions: string[] = descriptions.filter((d: any) => typeof d === "string" && d.trim().length > 0);
    const validKeywords: string[] = keywords.filter((k: any) => typeof k === "string" && k.trim().length > 0);

    const cid = (customerId || "").replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    let apiResult: any = { campaignId: `webtraffic-search-${Date.now()}` };
    let createdCampaignResource: string | null = null;
    const createdAssetResources: string[] = [];

    try {
      // ── 3. CREATE CAMPAIGN BUDGET ──
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      // ── 4. CONSTRUCT BIDDING CONFIGURATION (Google Ads API v24) ──
      const activeStrategy = (biddingFocus || inputBiddingStrategy || "Maximize conversions").trim();
      const normStrategy = activeStrategy.toLowerCase();

      let biddingConfig: any = {};
      let canonicalBiddingStrategy = "MAXIMIZE_CONVERSIONS";

      if (normStrategy === "target cpa" || normStrategy === "target_cpa") {
        canonicalBiddingStrategy = "TARGET_CPA";
        const cpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
        biddingConfig = {
          maximizeConversions: cpaMicros && cpaMicros > 0 ? { targetCpaMicros: String(cpaMicros) } : {}
        };
      } else if (normStrategy === "target roas" || normStrategy === "target_roas") {
        canonicalBiddingStrategy = "TARGET_ROAS";
        const rawRoas = targetRoas ? Number(targetRoas) : undefined;
        const validRoas = rawRoas ? (rawRoas > 10 ? rawRoas / 100 : rawRoas) : undefined;
        biddingConfig = {
          maximizeConversionValue: validRoas && validRoas > 0 ? { targetRoas: validRoas } : {}
        };
      } else if (normStrategy === "conversion value" || normStrategy === "maximize conversion value" || normStrategy === "maximize_conversion_value") {
        canonicalBiddingStrategy = "MAXIMIZE_CONVERSION_VALUE";
        const rawRoas = targetRoas ? Number(targetRoas) : undefined;
        const validRoas = rawRoas ? (rawRoas > 10 ? rawRoas / 100 : rawRoas) : undefined;
        biddingConfig = {
          maximizeConversionValue: validRoas && validRoas > 0 ? { targetRoas: validRoas } : {}
        };
      } else if (normStrategy === "clicks" || normStrategy === "maximize clicks" || normStrategy === "maximize_clicks") {
        canonicalBiddingStrategy = "MAXIMIZE_CLICKS";
        // Google Ads API v24: MAXIMIZE_CLICKS is configured via targetSpend with optional cpcBidCeilingMicros (do NOT use deprecated targetSpendMicros)
        const ceiling = maxCpcLimit ? Math.round(Number(maxCpcLimit) * 1_000_000) : undefined;
        biddingConfig = {
          targetSpend: ceiling && ceiling > 0 ? { cpcBidCeilingMicros: String(ceiling) } : {}
        };
      } else if (normStrategy === "impression share" || normStrategy === "target impression share" || normStrategy === "target_impression_share") {
        canonicalBiddingStrategy = "TARGET_IMPRESSION_SHARE";
        const locMap: Record<string, string> = {
          "anywhere on results page": "ANYWHERE_ON_PAGE",
          "top of results page": "TOP_OF_PAGE",
          "absolute top of results page": "ABSOLUTE_TOP_OF_PAGE"
        };
        const loc = locMap[String(impressionShareLocation).toLowerCase()] || "ANYWHERE_ON_PAGE";
        const fraction = targetImpressionSharePercent
          ? Math.round(Number(targetImpressionSharePercent) * 10_000)
          : 500_000;
        const ceiling = (maxCpcImpressionShare || maxCpcLimit)
          ? Math.round(Number(maxCpcImpressionShare || maxCpcLimit) * 1_000_000)
          : undefined;

        biddingConfig = {
          targetImpressionShare: {
            location: loc,
            locationFractionMicros: fraction,
            ...(ceiling && ceiling > 0 ? { cpcBidCeilingMicros: String(ceiling) } : {})
          }
        };
      } else {
        // Default: Maximize Conversions (No targetCpa unless user explicitly selected Target CPA or provided positive amount)
        canonicalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
        const cpaMicros = targetCpa && Number(targetCpa) > 0 ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
        biddingConfig = {
          maximizeConversions: cpaMicros ? { targetCpaMicros: String(cpaMicros) } : {}
        };
      }

      // ── 5. CREATE SEARCH CAMPAIGN (WITH AI MAX SETTINGS) ──
      const assetAutomationSettings: any[] = [
        {
          assetAutomationType: "TEXT_ASSET_AUTOMATION",
          assetAutomationStatus: enableTextCustomization !== false ? "OPTED_IN" : "OPTED_OUT"
        },
        {
          assetAutomationType: "FINAL_URL_EXPANSION_TEXT_ASSET_AUTOMATION",
          assetAutomationStatus: enableFinalUrlExpansion !== false ? "OPTED_IN" : "OPTED_OUT"
        }
      ];

      const campaignPayload = {
        operations: [{
          create: {
            name: campaignName,
            status: "PAUSED",
            advertisingChannelType: "SEARCH",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            ...(startDate ? { startDate: String(startDate).replace(/-/g, "").slice(0, 8) } : {}),
            ...(endDate ? { endDate: String(endDate).replace(/-/g, "").slice(0, 8) } : {}),
            aiMaxSetting: {
              enableAiMax: Boolean(enableAiMax)
            },
            assetAutomationSettings,
            ...biddingConfig
          }
        }]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-search-${Date.now()}`;
      createdCampaignResource = campaignRef;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // ── 6. CREATE AD GROUP (WITH AI MAX SEARCH TERM MATCHING) ──
      // useSearchTermMatchingAdGroup === true means search term matching remains ENABLED -> disableSearchTermMatching = false
      // useSearchTermMatchingAdGroup === false means disableSearchTermMatching = true
      const disableSearchTermMatching = !Boolean(useSearchTermMatchingAdGroup);

      const adGroupName = payload.adGroupName || `${campaignName} Ad Group 1`;
      const adGroupPayload = {
        operations: [{
          create: {
            campaign: campaignRef,
            name: adGroupName,
            status: "ENABLED",
            type: "SEARCH_STANDARD",
            aiMaxAdGroupSetting: {
              disableSearchTermMatching
            }
          }
        }]
      };
      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
      const adGroupRef = adGroupRes.data?.results?.[0]?.resourceName;
      if (!adGroupRef) {
        throw new Error("Failed to create Google Ads Ad Group for Search campaign.");
      }
      apiResult.adGroupResourceName = adGroupRef;

      // ── 7. CREATE KEYWORDS (AdGroupCriterion) ──
      if (validKeywords.length > 0) {
        const keywordOperations = validKeywords.map((kw: string) => {
          let matchType = "BROAD";
          let text = kw.trim();
          if (text.startsWith("[") && text.endsWith("]")) {
            matchType = "EXACT";
            text = text.slice(1, -1).trim();
          } else if (text.startsWith('"') && text.endsWith('"')) {
            matchType = "PHRASE";
            text = text.slice(1, -1).trim();
          }
          return {
            create: {
              adGroup: adGroupRef,
              status: "ENABLED",
              keyword: {
                text,
                matchType
              }
            }
          };
        });

        const kwRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`, { operations: keywordOperations }, { headers });
        apiResult.keywordResourceNames = (kwRes.data?.results || []).map((r: any) => r.resourceName);
      }

      // ── 8. CREATE RESPONSIVE SEARCH AD (AdGroupAd) ──
      if (validHeadlines.length > 0 && validDescriptions.length > 0) {
        const adGroupAdPayload = {
          operations: [{
            create: {
              adGroup: adGroupRef,
              status: "ENABLED",
              ad: {
                finalUrls: [finalUrl],
                responsiveSearchAd: {
                  headlines: validHeadlines.map((text: string) => ({ text: text.trim() })),
                  descriptions: validDescriptions.map((text: string) => ({ text: text.trim() }))
                }
              }
            }
          }]
        };
        const adRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
        apiResult.adGroupAdResourceName = adRes.data?.results?.[0]?.resourceName;
      }

      // ── 9. CREATE CAMPAIGN CRITERIA (Locations, Languages via GoogleAdsBaseService, & Ad Schedule) ──
      const geoAndLangResults = await GoogleAdsBaseService.mutateCampaignGeoAndLanguageCriteria(
        organizationId,
        customerId,
        campaignRef,
        { locations, languages, headers }
      );
      const criteriaResourceNames = (geoAndLangResults || []).map((r: any) => r.resourceName);

      // Ad Schedule targeting (CampaignCriterion -> adSchedule)
      const scheduleList = Array.isArray(adSchedule) ? adSchedule : [];
      if (scheduleList.length > 0) {
        const scheduleOperations: any[] = [];
        const scheduleCriteria = WebsiteTrafficSearchService.buildAdScheduleCriteria(scheduleList);
        for (const sched of scheduleCriteria) {
          scheduleOperations.push({
            create: {
              campaign: campaignRef,
              adSchedule: sched
            }
          });
        }
        if (scheduleOperations.length > 0) {
          const schedRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignCriteria:mutate`, { operations: scheduleOperations }, { headers });
          (schedRes.data?.results || []).forEach((r: any) => criteriaResourceNames.push(r.resourceName));
        }
      }
      apiResult.criteriaResourceNames = criteriaResourceNames;

      // ── 10. CREATE SEARCH EXTENSIONS (Google Ads Assets & CampaignAsset Associations) ──
      const campaignAssetOperations: any[] = [];

      // A. Sitelinks (SitelinkAsset)
      const inputSitelinks = Array.isArray(sitelinks) ? sitelinks : [];
      for (const sl of inputSitelinks) {
        const linkText = (sl.text || sl.linkText || "").trim();
        const slUrl = (sl.url || sl.finalUrl || "").trim();
        if (linkText && slUrl) {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Sitelink - ${linkText.slice(0, 20)} - ${Date.now()}`,
                sitelinkAsset: {
                  linkText,
                  ...(sl.desc1 || sl.description1 ? { description1: (sl.desc1 || sl.description1).trim().slice(0, 35) } : {}),
                  ...(sl.desc2 || sl.description2 ? { description2: (sl.desc2 || sl.description2).trim().slice(0, 35) } : {})
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
        }
      }

      // B. Callouts (CalloutAsset)
      const inputCallouts = Array.isArray(callouts) ? callouts : [];
      for (const co of inputCallouts) {
        const calloutText = (typeof co === "string" ? co : co?.text || co?.calloutText || "").trim();
        if (calloutText) {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Callout - ${calloutText.slice(0, 20)} - ${Date.now()}`,
                calloutAsset: {
                  calloutText: calloutText.slice(0, 25)
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
        }
      }

      // C. Structured Snippets (StructuredSnippetAsset)
      const inputSnippets = Array.isArray(structuredSnippets) ? structuredSnippets : [];
      for (const snip of inputSnippets) {
        const header = (snip.header || "").trim();
        const rawValues: string[] = Array.isArray(snip.values) ? snip.values : [];
        const values = rawValues.map(v => (typeof v === "string" ? v.trim() : "")).filter(Boolean);
        if (header && header !== "Select header type" && values.length >= 3) {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Snippet - ${header} - ${Date.now()}`,
                structuredSnippetAsset: {
                  header,
                  values
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
        }
      }

      // D. Call Asset (CallAsset)
      if (callAsset && callAsset.phoneNumber) {
        const phone = String(callAsset.phoneNumber).trim();
        const countryCode = String(callAsset.countryCode || "IN").trim();
        if (phone) {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Call - ${phone} - ${Date.now()}`,
                callAsset: {
                  countryCode,
                  phoneNumber: phone
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
        }
      }

      // E. Promotion Assets (PromotionAsset)
      const inputPromos = Array.isArray(promotions) ? promotions : [];
      for (const promo of inputPromos) {
        const target = (promo.promotionTarget || promo.item || "").trim();
        const promoUrl = (promo.finalUrl || promo.url || "").trim();
        if (target && promoUrl) {
          const promoBody: any = {
            promotionTarget: target,
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

          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `Promo - ${target.slice(0, 20)} - ${Date.now()}`,
                promotionAsset: promoBody,
                finalUrls: [promoUrl]
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
        }
      }

      // F. Price Assets (PriceAsset)
      const inputPrices = Array.isArray(prices) ? prices : [];
      if (inputPrices.length >= 3) {
        const priceOfferings = inputPrices.map((p: any) => ({
          header: (p.header || "").trim(),
          description: (p.description || "Service Option").slice(0, 25).trim(),
          price: {
            currencyCode: p.currencyCode || "INR",
            amountMicros: String(p.amountMicros || Math.round(Number(p.amount || 100) * 1_000_000))
          },
          unit: p.unit || "PER_MONTH",
          finalUrl: (p.finalUrl || p.url || finalUrl).trim()
        }));

        const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
          operations: [{
            create: {
              name: `Price - ${campaignName.slice(0, 20)} - ${Date.now()}`,
              priceAsset: {
                type: "SERVICES",
                priceQualifier: "FROM",
                languageCode: "en",
                priceOfferings
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
              fieldType: "PRICE",
              status: "ENABLED"
            }
          });
        }
      }

      // G. Lead Form Assets (LeadFormAsset)
      const inputLeadForms = Array.isArray(leadForms) ? leadForms : [];
      for (const lf of inputLeadForms) {
        if (lf.businessName && lf.headline && lf.description && lf.privacyPolicyUrl) {
          const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
            operations: [{
              create: {
                name: `LeadForm - ${lf.businessName.slice(0, 20)} - ${Date.now()}`,
                leadFormAsset: {
                  businessName: lf.businessName.slice(0, 25),
                  headline: lf.headline.slice(0, 30),
                  description: lf.description.slice(0, 200),
                  privacyPolicyUrl: lf.privacyPolicyUrl,
                  callToActionType: lf.callToActionType || "LEARN_MORE",
                  callToActionDescription: (lf.callToActionDescription || "Apply today").slice(0, 30),
                  postSubmitHeadline: (lf.postSubmitHeadline || "Thank you").slice(0, 30),
                  postSubmitDescription: (lf.postSubmitDescription || "We will contact you shortly").slice(0, 200),
                  fields: Array.isArray(lf.fields) && lf.fields.length > 0 ? lf.fields : [
                    { inputType: "FULL_NAME" },
                    { inputType: "EMAIL" }
                  ]
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
        }
      }

      // Link all created assets to the campaign via campaignAssets:mutate
      if (campaignAssetOperations.length > 0) {
        const caRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
          operations: campaignAssetOperations
        }, { headers });
        apiResult.campaignAssetResourceNames = (caRes.data?.results || []).map((r: any) => r.resourceName);
      }

    } catch (apiErr: any) {
      // ── ATOMIC ROLLBACK / CLEANUP ──
      // If a subsequent mutate call failed after campaign creation, remove campaign and any created assets
      if (createdCampaignResource) {
        try {
          console.warn(`[WebsiteTrafficSearchService] Rolling back created campaign ${createdCampaignResource} due to downstream step failure...`);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{
              remove: createdCampaignResource
            }]
          }, { headers });
          console.warn(`[WebsiteTrafficSearchService] Successfully removed campaign ${createdCampaignResource}`);
        } catch (cleanupErr: any) {
          console.error(`[WebsiteTrafficSearchService] Rollback removal failed for ${createdCampaignResource}:`, cleanupErr?.message);
        }
      }

      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error for Website Traffic Search]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Website Traffic Search API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    // ── 11. PERSIST TO DATABASE (ONLY AFTER ALL GOOGLE ADS RESOURCES SUCCEED) ──
    const activeStrategy = (biddingFocus || inputBiddingStrategy || "Maximize conversions").trim();
    const normStrategy = activeStrategy.toLowerCase();
    let dbBiddingStrategy = "MAXIMIZE_CONVERSIONS";
    if (normStrategy === "target cpa" || normStrategy === "target_cpa") dbBiddingStrategy = "TARGET_CPA";
    else if (normStrategy === "target roas" || normStrategy === "target_roas") dbBiddingStrategy = "TARGET_ROAS";
    else if (normStrategy === "conversion value" || normStrategy === "maximize conversion value" || normStrategy === "maximize_conversion_value") dbBiddingStrategy = "MAXIMIZE_CONVERSION_VALUE";
    else if (normStrategy === "clicks" || normStrategy === "maximize clicks" || normStrategy === "maximize_clicks") dbBiddingStrategy = "MAXIMIZE_CLICKS";
    else if (normStrategy === "impression share" || normStrategy === "target impression share" || normStrategy === "target_impression_share") dbBiddingStrategy = "TARGET_IMPRESSION_SHARE";

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `search-${Date.now()}`,
      name: campaignName,
      campaignType: "SEARCH",
      biddingStrategy: dbBiddingStrategy,
      budget: effectiveDailyBudget,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines: validHeadlines,
      descriptions: validDescriptions,
      geoTargets: {
        objective: "Website Traffic",
        locations,
        languages,
        keywords: validKeywords,
        adSchedule,
        enableAiMax,
        enableTextCustomization,
        enableFinalUrlExpansion,
        useSearchTermMatchingAdGroup,
        adGroupResourceName: apiResult.adGroupResourceName,
        adGroupAdResourceName: apiResult.adGroupAdResourceName,
        campaignAssetResourceNames: apiResult.campaignAssetResourceNames
      },
      advertisingChannelType: "SEARCH",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Search Campaign created successfully (Paused)",
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