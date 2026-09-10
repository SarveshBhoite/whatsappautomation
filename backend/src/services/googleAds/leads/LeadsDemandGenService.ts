import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class LeadsDemandGenService extends GoogleAdsBaseService {
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
      console.warn(`[LeadsDemandGenService] geoTargetConstants:suggest failed for "${trimmed}":`, e?.message || e);
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

    // ── 1. STRICT PRE-FLIGHT VALIDATION FOR AI GUIDED MODE ──
    if (isAiGuided) {
      if (!customerId || customerId.trim().length === 0) {
        throw new Error("Customer ID is required for AI Guided campaign creation.");
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

      const rawBudget = payload.dailyBudget !== undefined ? payload.dailyBudget : payload.budget;
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
        throw new Error(`At least 1 headline is required for Demand Gen ads.`);
      }
      for (const h of rawHeadlines) {
        if (h.length > 40) {
          throw new Error(`Headline "${h}" exceeds the Google Ads limit of 40 characters.`);
        }
      }

      const rawDescriptions: string[] = (payload.descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);
      if (rawDescriptions.length < 1) {
        throw new Error(`At least 1 description is required for Demand Gen ads.`);
      }
      for (const d of rawDescriptions) {
        if (d.length > 90) {
          throw new Error(`Description "${d}" exceeds the Google Ads limit of 90 characters.`);
        }
      }

      if (format === "SINGLE_IMAGE") {
        const rawImages = (payload.images || []).filter((img: any) => img && (typeof img === "string" ? img.trim() : img.url || img.data));
        if (rawImages.length < 1) {
          throw new Error("At least 1 marketing image is required for Single Image Demand Gen ads.");
        }
        const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data));
        if (rawLogos.length < 1) {
          throw new Error("At least 1 logo is required for Demand Gen ads.");
        }
      } else if (format === "VIDEO") {
        const rawVideos = (payload.videos || payload.youtubeVideos || []).filter((v: any) => v && (typeof v === "string" ? v.trim() : v.asset || v.videoId));
        if (rawVideos.length < 1) {
          throw new Error("At least 1 YouTube video is required for Video Demand Gen ads.");
        }
        const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data));
        if (rawLogos.length < 1) {
          throw new Error("At least 1 logo is required for Video Demand Gen ads.");
        }
      } else if (format === "CAROUSEL") {
        const rawCards = (payload.carouselCards || []).filter((c: any) => c && c.image && c.headline);
        if (rawCards.length < 2) {
          throw new Error(`At least 2 carousel cards with an image and headline are required for Carousel Demand Gen ads (received ${rawCards.length}).`);
        }
        const rawLogos = (payload.logos || []).filter((lg: any) => lg && (typeof lg === "string" ? lg.trim() : lg.url || lg.data));
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
        throw new Error("YouTube engagements bidding is not supported for Demand Gen Lead campaigns.");
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
    }

    // ── 2. PREPARE PARAMETERS ──
    const {
      campaignName = "Leads Demand Gen",
      finalUrl: inputFinalUrl,
      website,
      mobileFinalUrl,
      campaignGoal = "Leads",
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
      businessName = isAiGuided ? "" : "My Business",
      dailyBudget,
      budget,
      demandGenBudgetType = "Daily",
      euPolitical = "NO",
      channels = [],
      channelTargeting = "ALL",
      deviceTargeting = "ALL",
      audience,
      optimizedTargeting = true,
      customerAcquisitionMode,
      trackingTemplate,
      finalUrlSuffix,
      customParameters = [],
      ipExclusions,
      adSchedule = [],
      adGroups: inputAdGroups
    } = payload;

    const finalUrl = (inputFinalUrl || website || (isAiGuided ? "" : "https://www.example.com")).trim();
    const effectiveBudget = Number(dailyBudget !== undefined && dailyBudget !== "" ? dailyBudget : budget || (isAiGuided ? 0 : 1000));
    const isCampaignTotal = String(demandGenBudgetType).toLowerCase().includes("total");

    // ── 3. RESOLVE BIDDING CONFIGURATION ──
    const rawBStrat = (inputBiddingStrategy || (biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : biddingFocus === "Clicks" ? "MAXIMIZE_CLICKS" : "MAXIMIZE_CONVERSIONS")).trim().toUpperCase();

    let biddingConfig: any = {};
    let finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";

    if (rawBStrat === "MAXIMIZE_CLICKS" || rawBStrat === "CLICKS") {
      finalBiddingStrategy = "MAXIMIZE_CLICKS";
      biddingConfig = { targetSpend: {} };
    } else if (rawBStrat === "TARGET_CPA") {
      finalBiddingStrategy = "TARGET_CPA";
      const cpaVal = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : (isAiGuided ? undefined : 25_000_000);
      biddingConfig = cpaVal ? { targetCpa: { targetCpaMicros: String(cpaVal) } } : { maximizeConversions: {} };
    } else if (rawBStrat === "TARGET_ROAS") {
      finalBiddingStrategy = "TARGET_ROAS";
      const roasVal = targetRoas ? Number(targetRoas) : (isAiGuided ? undefined : 200);
      biddingConfig = roasVal ? { maximizeConversionValue: { targetRoas: roasVal } } : { maximizeConversionValue: {} };
    } else if (rawBStrat === "MAXIMIZE_CONVERSION_VALUE" || rawBStrat === "CONVERSION VALUE") {
      finalBiddingStrategy = "MAXIMIZE_CONVERSION_VALUE";
      biddingConfig = targetRoas ? { maximizeConversionValue: { targetRoas: Number(targetRoas) } } : { maximizeConversionValue: {} };
    } else {
      finalBiddingStrategy = "MAXIMIZE_CONVERSIONS";
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = (customerId || "").replace(/-/g, "").trim();
    const { headers } = await this.getAdsHeaders(organizationId, customerId);
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    let apiResult: any = { campaignId: `leads-demandgen-${Date.now()}` };
    let createdCampaignResource: string | null = null;
    let createdBudgetResource: string | null = null;

    try {
      // ── 4. CREATE BUDGET (CampaignBudget) ──
      // In Google Ads API v24, Demand Gen budgets MUST NOT be explicitlyShared: true (causes BIDDING_STRATEGY_TYPE_INCOMPATIBLE_WITH_SHARED_BUDGET).
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
      const todayStr = new Date().toISOString().split("T")[0];
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

      // ── 6. CREATE AD GROUPS & CHANNEL CONTROLS ──
      const adGroupList = (Array.isArray(inputAdGroups) && inputAdGroups.length > 0)
        ? inputAdGroups
        : [{ name: `${effectiveCampaignName} Ad Group 1`, status: "ENABLED" }];

      const createdAdGroupRefs: string[] = [];

      for (let i = 0; i < adGroupList.length; i++) {
        const agItem = adGroupList[i];
        const agName = agItem.name || `${effectiveCampaignName} Ad Group ${i + 1}`;
        const agCreate: any = {
          campaign: campaignRef,
          name: agName,
          status: agItem.status || "ENABLED"
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

        const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, {
          operations: [{ create: agCreate }]
        }, { headers });

        const adGroupRef = adGroupRes.data.results?.[0]?.resourceName;
        if (adGroupRef) {
          createdAdGroupRefs.push(adGroupRef);
        }
      }

      apiResult.adGroupResourceNames = createdAdGroupRefs;
      apiResult.adGroupResourceName = createdAdGroupRefs[0];

      // ── 7. ATTACH LOCATION & LANGUAGE CRITERIA TO AD GROUPS ──
      // In Google Ads API v24 for Demand Gen, locations (including radius) and languages MUST be attached via adGroupCriteria!
      if (createdAdGroupRefs.length > 0) {
        await GoogleAdsBaseService.mutateAdGroupGeoAndLanguageCriteria(organizationId, customerId, createdAdGroupRefs, {
          locations,
          languages,
          headers
        });
      }

      // ── 8. UPLOAD ASSETS & PREPARE FORMAT-SPECIFIC AD ──
      const format = (adFormat || "SINGLE_IMAGE").toUpperCase();
      const validHeadlines = (headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
      const validLongHeadlines = (longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
      const validDescriptions = (descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);

      const safeHeadlines = (validHeadlines.length > 0 ? validHeadlines : ["Quality Services and Products"])
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 40) }));

      const safeDescriptions = (validDescriptions.length > 0 ? validDescriptions : ["Discover great offers and premium solutions tailored for you."])
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 90) }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName || "My Business", 25) || "My Business";

      // Upload or find Logos
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

      const adGroupAdOps: any[] = [];
      const primaryAdGroup = createdAdGroupRefs[0];

      if (format === "VIDEO") {
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
          // Fallback query for existing video asset in account
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
        if (!resolvedLogoAsset) {
          throw new Error("A logo image asset is required for Video Demand Gen ads.");
        }

        const safeLongHeadlines = (validLongHeadlines.length > 0 ? validLongHeadlines : [validHeadlines[0] || "Quality Video Showcase"])
          .slice(0, 5)
          .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 90) }));

        adGroupAdOps.push({
          create: {
            adGroup: primaryAdGroup,
            status: "ENABLED",
            ad: {
              name: adName ? `${adName} - Video` : `Video Ad ${Date.now()}`,
              finalUrls: [finalUrl],
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

      } else if (format === "CAROUSEL") {
        // CAROUSEL AD
        if (!resolvedLogoAsset) {
          throw new Error("A logo image asset is required for Carousel Demand Gen ads.");
        }

        // Upload and create DEMAND_GEN_CAROUSEL_CARD assets
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
                    demandGenCarouselCardAsset: {
                      marketingImageAsset: cardImgAsset,
                      headline: GoogleAdsBaseService.cleanAdText(card.headline || `Explore Item ${idx + 1}`, 40)
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

        // If no explicit square images were provided but resolvedLogoAsset exists, or if square images were empty, fallback to square marketing image
        if (squareMarketingImages.length === 0 && resolvedLogoAsset) {
          squareMarketingImages.push(resolvedLogoAsset);
        }

        if (marketingImages.length === 0 || !resolvedLogoAsset) {
          throw new Error("At least 1 marketing image and 1 logo are required for Demand Gen Single Image ads.");
        }

        adGroupAdOps.push({
          create: {
            adGroup: primaryAdGroup,
            status: "ENABLED",
            ad: {
              name: adName ? `${adName} - Single` : `Single Image Ad ${Date.now()}`,
              finalUrls: [finalUrl],
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
      // ── 9. ATOMIC ROLLBACK ON ERROR ──
      console.error("[Google Ads API Error for Leads Demand Gen]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
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

    // ── 10. PERSIST TO DATABASE ONLY ON SUCCESS ──
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `demandgen-${Date.now()}`,
      name: campaignName,
      campaignType: "DEMAND_GEN",
      biddingStrategy: finalBiddingStrategy,
      budget: Number(effectiveBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
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
        adSchedule,
        objective: "Leads"
      },
      advertisingChannelType: "DEMAND_GEN",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Leads Demand Gen Campaign created successfully (Paused)",
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