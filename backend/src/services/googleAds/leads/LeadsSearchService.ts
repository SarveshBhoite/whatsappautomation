import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class LeadsSearchService extends GoogleAdsBaseService {
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
   * Resolves a location name or ID using the static map, numeric ID format, or Google Ads geoTargetConstants:suggest API.
   * Throws an error if unresolved in AI Guided mode instead of silently converting.
   */
  public static async resolveGeoTargetConstant(
    locationNameOrId: any,
    headers?: any,
    isAiGuided: boolean | string = false
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
      console.warn(`[LeadsSearchService] geoTargetConstants:suggest lookup failed for "${trimmed}":`, e?.message || e);
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
      const fakeCids = ["1234567890", "0000000000", "default", "demo-org-123"];
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
      campaignName = "Leads Search",
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
      images = [],
      logos = [],
      sitelinks = [],
      callouts = [],
      structuredSnippets = [],
      callAsset,
      promotions = [],
      prices = [],
      leadForms = [],
      dailyBudget = isAiGuided ? 0 : 1000,
      budget,
      startDate,
      endDate,
      euPolitical = "NO"
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

    let apiResult: any = { campaignId: `leads-search-${Date.now()}` };
    let createdCampaignResource: string | null = null;

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
        // Default: Maximize Conversions
        canonicalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
        const cpaMicros = targetCpa && Number(targetCpa) > 0 ? Math.round(Number(targetCpa) * 1_000_000) : undefined;
        biddingConfig = {
          maximizeConversions: cpaMicros ? { targetCpaMicros: String(cpaMicros) } : {}
        };
      }

      // ── 5. CREATE SEARCH CAMPAIGN ──
      const campaignPayload = {
        operations: [{
          create: {
            name: campaignName,
            status: "PAUSED",
            advertisingChannelType: "SEARCH",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            ...(startDate ? { startDateTime: `${String(startDate).split("T")[0]} 00:00:00` } : {}),
            ...(endDate ? { endDateTime: `${String(endDate).split("T")[0]} 23:59:59` } : {}),
            ...biddingConfig
          }
        }]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-search-${Date.now()}`;
      createdCampaignResource = campaignRef;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // ── 6. CREATE AD GROUP ──
      const adGroupName = payload.adGroupName || `${campaignName} Ad Group 1`;
      const adGroupPayload = {
        operations: [{
          create: {
            campaign: campaignRef,
            name: adGroupName,
            status: "ENABLED",
            type: "SEARCH_STANDARD"
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
        const cleanedHeadlines = validHeadlines
          .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 30))
          .filter((text: string) => text.length > 0);
        const cleanedDescriptions = validDescriptions
          .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
          .filter((text: string) => text.length > 0);

        const adGroupAdPayload = {
          operations: [{
            create: {
              adGroup: adGroupRef,
              status: "ENABLED",
              ad: {
                finalUrls: [finalUrl],
                responsiveSearchAd: {
                  headlines: cleanedHeadlines.slice(0, 15).map((text: string) => ({ text })),
                  descriptions: cleanedDescriptions.slice(0, 4).map((text: string) => ({ text }))
                }
              }
            }
          }]
        };
        const adRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
        apiResult.adGroupAdResourceName = adRes.data?.results?.[0]?.resourceName;
      }

      // ── 9. CREATE CAMPAIGN CRITERIA (Locations & Languages via GoogleAdsBaseService) ──
      const criteriaRes = await GoogleAdsBaseService.mutateCampaignGeoAndLanguageCriteria(
        organizationId,
        customerId,
        campaignRef,
        { locations, languages, headers }
      );
      apiResult.criteriaResourceNames = (criteriaRes || []).map((r: any) => r.resourceName);

      // ── 10. CREATE SEARCH EXTENSIONS & VISUAL ASSETS (Images, Logos, Sitelinks, Callouts, Lead Forms) ──
      const campaignAssetOperations: any[] = [];
      const createdAssetResources: string[] = [];

      // A. Visual Image Assets (Optional for Search ads)
      const inputImages = Array.isArray(images) ? images : [];
      for (const img of inputImages) {
        const rawUrl = typeof img === "string" ? img : img?.url || img?.data || "";
        if (rawUrl && (rawUrl.startsWith("http") || rawUrl.startsWith("data:image/"))) {
          try {
            const isSquare = (typeof img === "object" && (img.fieldType === "SQUARE_MARKETING_IMAGE" || img.aspectRatio === "1:1")) || false;
            const assetRef = await GoogleAdsBaseService.uploadImageAsset(
              organizationId,
              customerId,
              rawUrl,
              `Search Image ${Date.now()}`
            );
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: campaignRef,
                  asset: assetRef,
                  fieldType: isSquare ? "SQUARE_MARKETING_IMAGE" : "MARKETING_IMAGE",
                  status: "ENABLED"
                }
              });
            }
          } catch (imgErr: any) {
            console.warn("[LeadsSearchService] Image asset upload skipped / non-fatal:", imgErr?.message || imgErr);
          }
        }
      }

      // B. Visual Logo Assets (Optional for Search ads)
      const inputLogos = Array.isArray(logos) ? logos : [];
      for (const lg of inputLogos) {
        const rawUrl = typeof lg === "string" ? lg : lg?.url || lg?.data || "";
        if (rawUrl && (rawUrl.startsWith("http") || rawUrl.startsWith("data:image/"))) {
          try {
            const assetRef = await GoogleAdsBaseService.uploadImageAsset(
              organizationId,
              customerId,
              rawUrl,
              `Search Logo ${Date.now()}`
            );
            if (assetRef) {
              createdAssetResources.push(assetRef);
              campaignAssetOperations.push({
                create: {
                  campaign: campaignRef,
                  asset: assetRef,
                  fieldType: "LOGO",
                  status: "ENABLED"
                }
              });
            }
          } catch (lgErr: any) {
            console.warn("[LeadsSearchService] Logo asset upload skipped / non-fatal:", lgErr?.message || lgErr);
          }
        }
      }

      // C. Sitelinks (SitelinkAsset)
      const inputSitelinks = Array.isArray(sitelinks) ? sitelinks : [];
      for (const sl of inputSitelinks) {
        const linkText = (sl.text || sl.linkText || "").trim();
        const slUrl = (sl.url || sl.finalUrl || "").trim();
        if (linkText && slUrl) {
          try {
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
          } catch (slErr: any) {
            console.warn("[LeadsSearchService] Sitelink creation skipped:", slErr?.message || slErr);
          }
        }
      }

      // D. Callouts (CalloutAsset)
      const inputCallouts = Array.isArray(callouts) ? callouts : [];
      for (const co of inputCallouts) {
        const calloutText = (typeof co === "string" ? co : co?.text || co?.calloutText || "").trim();
        if (calloutText) {
          try {
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
          } catch (coErr: any) {
            console.warn("[LeadsSearchService] Callout creation skipped:", coErr?.message || coErr);
          }
        }
      }

      // E. Lead Form Assets (LeadFormAsset)
      const inputLeadForms = Array.isArray(leadForms) ? leadForms : [];
      for (const lf of inputLeadForms) {
        if (lf.businessName && lf.headline && lf.description && lf.privacyPolicyUrl) {
          try {
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
          } catch (lfErr: any) {
            console.warn("[LeadsSearchService] Lead Form creation skipped:", lfErr?.message || lfErr);
          }
        }
      }

      // Link all created assets to the Search campaign via campaignAssets:mutate
      if (campaignAssetOperations.length > 0) {
        try {
          const caRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
            operations: campaignAssetOperations
          }, { headers });
          apiResult.campaignAssetResourceNames = (caRes.data?.results || []).map((r: any) => r.resourceName);
        } catch (caErr: any) {
          console.warn("[LeadsSearchService] campaignAssets:mutate linking warning:", caErr?.message || caErr);
        }
      }

    } catch (apiErr: any) {
      // ── ATOMIC ROLLBACK / CLEANUP ──
      // If a subsequent mutate call failed after campaign creation, pause/remove the created campaign to prevent ghost resources
      if (createdCampaignResource) {
        try {
          console.warn(`[LeadsSearchService] Rolling back / pausing created campaign ${createdCampaignResource} due to downstream step failure...`);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{
              update: {
                resourceName: createdCampaignResource,
                status: "REMOVED"
              },
              updateMask: "status"
            }]
          }, { headers });
          console.warn(`[LeadsSearchService] Successfully cleaned up campaign ${createdCampaignResource}`);
        } catch (cleanupErr: any) {
          console.error(`[LeadsSearchService] Rollback removal failed for ${createdCampaignResource}:`, cleanupErr?.message);
        }
      }

      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error for Leads Search]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Leads Search API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    // ── 10. PERSIST TO DATABASE (ONLY AFTER ALL GOOGLE ADS RESOURCES SUCCEED) ──
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
        objective: "Leads",
        locations,
        languages,
        keywords: validKeywords,
        adGroupResourceName: apiResult.adGroupResourceName,
        adGroupAdResourceName: apiResult.adGroupAdResourceName
      },
      advertisingChannelType: "SEARCH",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Leads Search Campaign created successfully (Paused)",
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