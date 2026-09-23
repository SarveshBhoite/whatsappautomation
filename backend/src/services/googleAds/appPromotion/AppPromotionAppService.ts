import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class AppPromotionAppService extends GoogleAdsBaseService {
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
      console.warn(`[AppPromotionAppService] geoTargetConstants:suggest failed for "${trimmed}":`, e?.message || e);
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
    // ── 1. STRICT PREFLIGHT VALIDATION ──
    if (!organizationId || organizationId.trim().length === 0 || organizationId === "demo-org-123") {
      throw new Error("A valid Organization ID is required. Demo organization IDs are not allowed.");
    }

    if (!customerId || customerId.trim().length === 0) {
      throw new Error("Customer ID is required for App campaign creation.");
    }

    const {
      campaignName = "App promotion – App 1",
      platform = "ANDROID",
      appId,
      appName,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      targetCpa,
      dailyBudget,
      budget,
      businessName,
      euPolitical = "NO",
      images = [],
      marketingImages = [],
      squareMarketingImages = [],
      videos = [],
      youtubeVideos = [],
      startDate,
      endDate,
      adGroupName
    } = payload;

    const trimmedCampaignName = (campaignName || "").trim();
    if (!trimmedCampaignName) {
      throw new Error("Campaign name is required.");
    }

    const trimmedAppId = (appId || "").trim();
    if (!trimmedAppId) {
      throw new Error("Mobile App package name (Android) or App Store ID (iOS) is required before this App campaign can be published.");
    }

    const rawBudget = dailyBudget !== undefined && dailyBudget !== null && dailyBudget !== ""
      ? dailyBudget
      : (budget !== undefined && budget !== null && budget !== "" ? budget : null);

    const effectiveBudget = Number(rawBudget);
    if (!rawBudget || isNaN(effectiveBudget) || effectiveBudget <= 0) {
      throw new Error("A valid daily budget greater than ₹0 is required for App campaigns.");
    }

    const rawTargetCpa = targetCpa !== undefined && targetCpa !== null && targetCpa !== "" ? Number(targetCpa) : null;
    if (rawTargetCpa === null || isNaN(rawTargetCpa) || rawTargetCpa <= 0) {
      throw new Error("A valid positive Target CPA is required for App install campaigns. Fallback or zero CPA is prohibited.");
    }

    const validHeadlines = (Array.isArray(headlines) ? headlines : [headlines])
      .map((h: any) => typeof h === "string" ? h.trim() : (h?.text ? String(h.text).trim() : ""))
      .filter((h: string) => h.length > 0)
      .slice(0, 5);

    if (validHeadlines.length === 0) {
      throw new Error("At least 1 headline is required for App promotion (max 5, 30 chars each).");
    }

    const validDescriptions = (Array.isArray(descriptions) ? descriptions : [descriptions])
      .map((d: any) => typeof d === "string" ? d.trim() : (d?.text ? String(d.text).trim() : ""))
      .filter((d: string) => d.length > 0)
      .slice(0, 5);

    if (validDescriptions.length === 0) {
      throw new Error("At least 1 description is required for App promotion (max 5, 90 chars each).");
    }

    // Validate dates if present
    if (startDate && endDate && endDate < startDate) {
      throw new Error(`Campaign end date (${endDate}) cannot be earlier than start date (${startDate}).`);
    }

    const normPlatform = String(platform).toUpperCase().includes("IOS") ? "IOS" : "ANDROID";
    const appStore = normPlatform === "IOS" ? "APPLE_APP_STORE" : "GOOGLE_APP_STORE";

    if (normPlatform === "ANDROID") {
      if (!trimmedAppId.includes(".")) {
        throw new Error(`Invalid Android package name: "${trimmedAppId}". Real Google Play packages contain domain format (e.g. 'com.whatsapp.w4b').`);
      }
    }

    const biddingStrategyGoalType = "OPTIMIZE_INSTALLS_TARGET_INSTALL_COST";
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const targetCpaMicros = Math.round(rawTargetCpa * 1_000_000);
    const cid = (customerId || "").replace(/-/g, "").trim();
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    let createdBudgetResource: string | null = null;
    let createdCampaignResource: string | null = null;
    let createdAdGroupResource: string | null = null;
    const createdAssetResources: string[] = [];

    const apiResult: any = {
      campaignId: null,
      campaignResourceName: null,
      budgetResourceName: null,
      adGroupResourceName: null,
      adGroupAdResourceName: null,
      campaignCriteriaResourceNames: []
    };

    let effectiveCampaignName = trimmedCampaignName;
    const campaignObj: any = {
      name: effectiveCampaignName,
      status: "PAUSED",
      advertisingChannelType: "MULTI_CHANNEL",
      advertisingChannelSubType: "APP_CAMPAIGN",
      appCampaignSetting: {
        appId: trimmedAppId,
        appStore: appStore,
        biddingStrategyGoalType
      },
      targetCpa: {
        targetCpaMicros: String(targetCpaMicros)
      },
      containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
      campaignBudget: null
    };

    if (startDate) {
      const startStr = String(startDate).split("T")[0];
      campaignObj.startDateTime = `${startStr} 00:00:00`;
    }
    if (endDate) {
      const endStr = String(endDate).split("T")[0];
      campaignObj.endDateTime = `${endStr} 23:59:59`;
    }

    try {
      const { headers } = await this.getAdsHeaders(organizationId, customerId);

      // ── 2. CREATE CAMPAIGN BUDGET ──
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${trimmedCampaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget
      });
      if (!budgetRef) {
        throw new Error("Failed to create CampaignBudget in Google Ads API.");
      }
      createdBudgetResource = budgetRef;
      apiResult.budgetResourceName = budgetRef;
      campaignObj.campaignBudget = budgetRef;

      // ── 3. CREATE APP CAMPAIGN ──

      let campRes;
      try {
        campRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
          operations: [{ create: campaignObj }]
        }, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME")) {
          effectiveCampaignName = `${trimmedCampaignName} ${Date.now().toString().slice(-4)}`;
          campaignObj.name = effectiveCampaignName;
          campRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{ create: campaignObj }]
          }, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = campRes.data?.results?.[0]?.resourceName;
      if (!campaignRef) {
        throw new Error("Failed to create App Campaign in Google Ads API.");
      }
      createdCampaignResource = campaignRef;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // ── 4. CAMPAIGN CRITERIA: LOCATIONS, RADIUS & LANGUAGES ──
      const criteriaResults = await GoogleAdsBaseService.mutateCampaignGeoAndLanguageCriteria(
        organizationId,
        customerId,
        campaignRef,
        { locations, languages, headers }
      );
      apiResult.campaignCriteriaResourceNames = (criteriaResults || []).map((r: any) => r.resourceName);

      // ── 5. CREATE APP CAMPAIGN AD GROUP (NO TYPE PROPERTY!) ──
      const effectiveAdGroupName = (adGroupName || "").trim() || `${effectiveCampaignName} Ad Group 1`;
      const adGroupCreate: any = {
        campaign: campaignRef,
        name: effectiveAdGroupName,
        status: "ENABLED"
      };

      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, {
        operations: [{ create: adGroupCreate }]
      }, { headers });

      const adGroupRef = adGroupRes.data?.results?.[0]?.resourceName;
      if (!adGroupRef) {
        throw new Error("Failed to create AdGroup for App Campaign.");
      }
      createdAdGroupResource = adGroupRef;
      apiResult.adGroupResourceName = adGroupRef;

      // ── 6. UPLOAD APP ASSETS (IMAGES & YOUTUBE VIDEOS) ──
      const imageAssetRefs: string[] = [];
      const videoAssetRefs: string[] = [];

      const allRawImages = [
        ...(Array.isArray(images) ? images : []),
        ...(Array.isArray(marketingImages) ? marketingImages : []),
        ...(Array.isArray(squareMarketingImages) ? squareMarketingImages : [])
      ];

      for (const img of allRawImages) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
        if (!raw || !raw.trim()) continue;
        const imgRef = await this.uploadImageAsset(organizationId, customerId, `AppImg_${Date.now()}`, raw);
        if (imgRef && !imageAssetRefs.includes(imgRef)) {
          imageAssetRefs.push(imgRef);
          createdAssetResources.push(imgRef);
        }
      }

      const allRawVideos = [
        ...(Array.isArray(videos) ? videos : []),
        ...(Array.isArray(youtubeVideos) ? youtubeVideos : [])
      ];

      for (const vid of allRawVideos) {
        const vidUrlOrId = typeof vid === "string" ? vid : vid?.url || vid?.id || vid?.youtubeVideoId || "";
        if (!vidUrlOrId) continue;
        const vidMatch = vidUrlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
        const youtubeVideoId = vidMatch ? vidMatch[1] : (/^[\w-]{11}$/.test(vidUrlOrId) ? vidUrlOrId : null);
        if (youtubeVideoId) {
          try {
            const vidAssetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
              operations: [{
                create: {
                  name: `AppVideo_${youtubeVideoId}_${Date.now()}`.slice(0, 100),
                  type: "YOUTUBE_VIDEO",
                  youtubeVideoAsset: {
                    youtubeVideoId
                  }
                }
              }]
            }, { headers });
            const vidAssetRef = vidAssetRes.data?.results?.[0]?.resourceName;
            if (vidAssetRef && !videoAssetRefs.includes(vidAssetRef)) {
              videoAssetRefs.push(vidAssetRef);
              createdAssetResources.push(vidAssetRef);
            }
          } catch (vidErr: any) {
            console.warn("[AppPromotionAppService] YouTube video asset creation warning:", vidErr?.response?.data || vidErr.message);
          }
        }
      }

      // ── 7. BUILD APP AD (AdGroupAd with AppAdInfo) ──
      const safeHeadlines = validHeadlines.map(h => ({ text: GoogleAdsBaseService.cleanAdText(h, 30) }));
      const safeDescriptions = validDescriptions.map(d => ({ text: GoogleAdsBaseService.cleanAdText(d, 90) }));

      const appAd: any = {
        headlines: safeHeadlines,
        descriptions: safeDescriptions
      };

      if (imageAssetRefs.length > 0) {
        appAd.images = imageAssetRefs.map(asset => ({ asset }));
      }
      if (videoAssetRefs.length > 0) {
        appAd.youtubeVideos = videoAssetRefs.map(asset => ({ asset }));
      }

      const adGroupAdPayload = {
        operations: [{
          create: {
            adGroup: adGroupRef,
            status: "ENABLED",
            ad: {
              appAd
            }
          }
        }]
      };

      const adGroupAdRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
      const adGroupAdRef = adGroupAdRes.data?.results?.[0]?.resourceName;
      if (!adGroupAdRef) {
        throw new Error("Failed to create AppAd (AdGroupAd) in Google Ads API.");
      }
      apiResult.adGroupAdResourceName = adGroupAdRef;

    } catch (apiErr: any) {
      // ── 8. ATOMIC ROLLBACK ON DOWNSTREAM FAILURE ──
      console.error("[Google Ads API Error for App Promotion]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
      console.error("[Google Ads API Raw Error Data]:", JSON.stringify(apiErr?.response?.data || apiErr.message, null, 2));

      if (createdCampaignResource) {
        try {
          console.warn(`[Rollback] Removing created App Campaign ${createdCampaignResource}...`);
          const { headers } = await this.getAdsHeaders(organizationId, customerId);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
            operations: [{ remove: createdCampaignResource }]
          }, { headers });
        } catch (rollbackErr: any) {
          console.error("[Rollback Failed for Campaign]:", rollbackErr?.message);
        }
      }

      if (createdBudgetResource) {
        try {
          console.warn(`[Rollback] Removing created Campaign Budget ${createdBudgetResource}...`);
          const { headers } = await this.getAdsHeaders(organizationId, customerId);
          await axios.post(`${ADS_BASE}/customers/${cid}/campaignBudgets:mutate`, {
            operations: [{ remove: createdBudgetResource }]
          }, { headers });
        } catch (rollbackErr: any) {
          console.error("[Rollback Failed for Budget]:", rollbackErr?.message);
        }
      }

      throw new Error(GoogleAdsBaseService.formatGoogleAdsError(apiErr));
    }

    // ── 9. PERSIST TO DATABASE ONLY UPON COMPLETE SUCCESS ──
    const appStoreUrl = normPlatform === "IOS"
      ? `https://apps.apple.com/app/id${trimmedAppId}`
      : `https://play.google.com/store/apps/details?id=${trimmedAppId}`;

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `app-${Date.now()}`,
      name: campaignObj.name,
      campaignType: "MULTI_CHANNEL",
      biddingStrategy: biddingStrategyGoalType,
      budget: effectiveBudget,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      headlines: validHeadlines,
      descriptions: validDescriptions,
      finalUrl: payload.finalUrl || appStoreUrl,
      geoTargets: {
        locations,
        languages,
        objective: "App Promotion",
        platform: normPlatform,
        appId: trimmedAppId,
        appName: appName || undefined,
        businessName: businessName || undefined,
        targetCpa: rawTargetCpa,
        campaignResourceName: apiResult.campaignResourceName,
        adGroupResourceName: apiResult.adGroupResourceName,
        adGroupAdResourceName: apiResult.adGroupAdResourceName
      },
      advertisingChannelType: "MULTI_CHANNEL",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "App Promotion Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      },
      apiResult,
      backendMapping: {
        app_store: appStore,
        app_id: trimmedAppId,
        target_cpa: rawTargetCpa,
        "CampaignBudget.amount_micros": amountMicros,
        "Campaign.advertising_channel_type": "MULTI_CHANNEL",
        "Campaign.advertising_channel_sub_type": "APP_CAMPAIGN",
        "AdGroupAd.ad.app_ad": {
          headlines_count: validHeadlines.length,
          descriptions_count: validDescriptions.length
        }
      }
    };
  }
}