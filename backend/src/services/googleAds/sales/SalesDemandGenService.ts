import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import { GoogleAdsConversionGoalMapper } from "../shared/GoogleAdsConversionGoalMapper";
import axios from "axios";

export class SalesDemandGenService extends GoogleAdsBaseService {
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

    const dayIntervals: Record<string, Array<{ startM: number; endM: number }>> = {
      MONDAY: [],
      TUESDAY: [],
      WEDNESDAY: [],
      THURSDAY: [],
      FRIDAY: [],
      SATURDAY: [],
      SUNDAY: []
    };

    for (const sched of schedules) {
      if (!sched || typeof sched !== "object") continue;
      const rawDay = String(sched.day || sched.dayOfWeek || "All days").trim().toLowerCase();
      const targetDays = dayMap[rawDay] || [rawDay.toUpperCase()];

      const start = String(sched.start || "00:00").trim();
      const end = String(sched.end || "00:00").trim();

      let startM = 0;
      let endM = 1440;

      if ((start === "00:00" || start === "0:00") && (end === "00:00" || end === "0:00" || end === "24:00" || end === "23:45")) {
        startM = 0;
        endM = 1440;
      } else {
        const [sh, sm] = start.split(":").map(v => parseInt(v, 10));
        const [eh, em] = end.split(":").map(v => parseInt(v, 10));

        const sHour = isNaN(sh) ? 0 : Math.max(0, Math.min(23, sh));
        const sMin = isNaN(sm) ? 0 : Math.max(0, Math.min(59, sm));
        const eHour = isNaN(eh) ? 24 : Math.max(0, Math.min(24, eh));
        const eMin = isNaN(em) ? 0 : Math.max(0, Math.min(59, em));

        startM = sHour * 60 + sMin;
        endM = eHour * 60 + eMin;

        if (endM <= startM && eHour !== 24) {
          throw new Error(`Invalid ad schedule: End time (${end}) must be after start time (${start}) for ${sched.day || "day"}.`);
        }
      }

      for (const d of targetDays) {
        if (dayIntervals[d]) {
          dayIntervals[d].push({ startM, endM });
        }
      }
    }

    const allDaysFull = Object.keys(dayIntervals).every(d => {
      const intervals = dayIntervals[d];
      if (intervals.length === 0) return false;
      return intervals.some(inv => inv.startM === 0 && inv.endM >= 1440);
    });

    if (allDaysFull && Object.values(dayIntervals).every(list => list.length <= 1)) {
      return [];
    }

    const criteria: any[] = [];
    for (const [day, intervals] of Object.entries(dayIntervals)) {
      if (intervals.length === 0) continue;
      intervals.sort((a, b) => a.startM - b.startM);

      const merged: Array<{ startM: number; endM: number }> = [];
      let current = { ...intervals[0] };

      for (let i = 1; i < intervals.length; i++) {
        const next = intervals[i];
        if (next.startM <= current.endM) {
          current.endM = Math.max(current.endM, next.endM);
        } else {
          merged.push(current);
          current = { ...next };
        }
      }
      merged.push(current);

      for (const m of merged) {
        const sHour = Math.floor(m.startM / 60);
        const sMin = m.startM % 60;
        const eHour = Math.floor(m.endM / 60);
        const eMin = m.endM % 60;

        criteria.push({
          dayOfWeek: day,
          startHour: sHour,
          startMinute: SalesDemandGenService.mapMinuteToEnum(sMin),
          endHour: eHour,
          endMinute: SalesDemandGenService.mapMinuteToEnum(eMin)
        });
      }
    }

    return criteria;
  }

  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const isAiGuided = Boolean(payload.isAiGuided || payload.source === "AI_GUIDED");

    const {
      campaignName = "Sales Demand Gen",
      finalUrl: inputFinalUrl,
      website,
      mobileFinalUrl,
      campaignGoal = "Sales",
      biddingStrategy: inputBiddingStrategy,
      biddingFocus,
      targetCpa,
      targetRoas,
      startDate,
      endDate,
      locations = isAiGuided ? [] : ["India"],
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
      totalBudget: inputTotalBudget,
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
      adGroups: inputAdGroups,
      conversionGoals
    } = payload;

    const finalUrl = (inputFinalUrl || website || (isAiGuided ? "" : "https://www.example.com")).trim();
    const isCampaignTotal = String(demandGenBudgetType).toLowerCase().includes("total") || String(payload.budgetType).toUpperCase() === "TOTAL";
    const effectiveBudget = Number(
      isCampaignTotal
        ? (inputTotalBudget !== undefined && inputTotalBudget !== "" ? inputTotalBudget : (payload.budget !== undefined && payload.budget !== "" ? payload.budget : (dailyBudget || 1000)))
        : (dailyBudget !== undefined && dailyBudget !== "" ? dailyBudget : budget || 1000)
    );

    const validHeadlines = (headlines || []).filter((h: any) => typeof h === "string" && h.trim().length > 0);
    const validLongHeadlines = (longHeadlines || []).filter((lh: any) => typeof lh === "string" && lh.trim().length > 0);
    const validDescriptions = (descriptions || []).filter((d: any) => typeof d === "string" && d.trim().length > 0);

    if (validHeadlines.length < 1) {
      throw new Error("At least 1 headline is required for Demand Gen ads.");
    }
    if (validDescriptions.length < 1) {
      throw new Error("At least 1 description is required for Demand Gen ads.");
    }

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

    let apiResult: any = { campaignId: `sales-demandgen-${Date.now()}` };
    let createdCampaignResource: string | null = null;
    let createdBudgetResource: string | null = null;

    try {
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
        demandGenCampaignSettings: {
          upgradedTargeting: Boolean(optimizedTargeting)
        },
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

      const campaignCriterionOps: any[] = [];

      if (Array.isArray(adSchedule) && adSchedule.length > 0) {
        const scheduleCriteria = SalesDemandGenService.buildAdScheduleCriteria(adSchedule);
        for (const sched of scheduleCriteria) {
          campaignCriterionOps.push({
            create: {
              campaign: campaignRef,
              adSchedule: sched
            }
          });
        }
      }

      if (deviceTargeting === "SPECIFIC" && Array.isArray((payload as any).devices) && (payload as any).devices.length > 0) {
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
        for (const dev of (payload as any).devices) {
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

      if (campaignCriterionOps.length > 0) {
        try {
          const critRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignCriteria:mutate`, {
            operations: campaignCriterionOps
          }, { headers });
          apiResult.campaignCriteriaResourceNames = (critRes.data?.results || []).map((r: any) => r.resourceName);
        } catch (campCritErr: any) {
          console.warn("[SalesDemandGenService] campaignCriteria mutate warning:", campCritErr?.response?.data || campCritErr.message);
        }
      }

      if (conversionGoals && (Array.isArray(conversionGoals) ? conversionGoals.length > 0 : true)) {
        await GoogleAdsConversionGoalMapper.applyCampaignConversionGoals(
          organizationId,
          customerId,
          campaignRef,
          conversionGoals,
          headers,
          "SalesDemandGenService"
        );
      }

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

      if (createdAdGroupRefs.length > 0) {
        await GoogleAdsBaseService.mutateAdGroupGeoAndLanguageCriteria(organizationId, customerId, createdAdGroupRefs, {
          locations,
          languages,
          headers
        });
      }

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

      const format = (adFormat || "SINGLE_IMAGE").toUpperCase();

      const safeHeadlines = (validHeadlines.length > 0 ? validHeadlines : ["Quality Services and Products"])
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 40) }));

      const safeDescriptions = (validDescriptions.length > 0 ? validDescriptions : ["Discover great offers and premium solutions tailored for you."])
        .slice(0, 5)
        .map((text: string) => ({ text: GoogleAdsBaseService.cleanAdText(text, 90) }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName || "My Business", 25) || "My Business";

      const DEFAULT_DG_LOGO = "https://ik.imagekit.io/automationjds/gads_dg_logo_1788441370183_icon_YO0jo1MbJ.jpeg";
      const DEFAULT_DG_LANDSCAPE = "https://ik.imagekit.io/automationjds/gads_dg_image_1788441362828_images_RKjVY-rHB.png";

      let resolvedLogoAsset: string | null = null;
      const logoList = (logos && logos.length > 0) ? logos : [DEFAULT_DG_LOGO];
      for (const logo of logoList) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || logo?.asset || "";
        if (!raw) continue;
        if (raw.startsWith("customers/") && raw.includes("/assets/")) {
          resolvedLogoAsset = raw;
          break;
        }
        let logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        logoUrl = toPollinationsTransform(logoUrl, 500, 500);
        const uploaded = await this.uploadImageAsset(organizationId, customerId, `DG_Logo_${Date.now()}`, logoUrl);
        if (uploaded) {
          resolvedLogoAsset = uploaded;
          break;
        }
      }

      if (!resolvedLogoAsset) {
        let fallbackLogoUrl = toImageKitTransform(DEFAULT_DG_LOGO, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        resolvedLogoAsset = await this.uploadImageAsset(organizationId, customerId, `DG_Logo_${Date.now()}`, fallbackLogoUrl);
      }

      const adGroupAdOps: any[] = [];
      const primaryAdGroup = createdAdGroupRefs[0];

      if (format === "VIDEO") {
        const allVideos = [...(videos || []), ...(youtubeVideos || [])];
        let resolvedVideoAsset: string | null = null;
        for (const v of allVideos) {
          const raw = typeof v === "string" ? v : v?.asset || v?.videoId || v?.url || v?.id || "";
          if (raw.startsWith("customers/") && raw.includes("/assets/")) {
            resolvedVideoAsset = raw;
            break;
          }
          if (raw) {
            const uploaded = await GoogleAdsBaseService.uploadYouTubeVideoAsset(organizationId, customerId, raw);
            if (uploaded) {
              resolvedVideoAsset = uploaded;
              break;
            }
          }
        }

        if (!resolvedVideoAsset) {
          try {
            const vRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:searchStream`, {
              query: "SELECT asset.resource_name FROM asset WHERE asset.type = 'YOUTUBE_VIDEO' LIMIT 1"
            }, { headers });
            resolvedVideoAsset = vRes.data?.[0]?.results?.[0]?.asset?.resourceName || null;
          } catch (e) {}
        }

        if (!resolvedVideoAsset) {
          throw new Error("A valid YouTube video asset is required for Video Demand Gen ads. Please provide a valid YouTube video URL or ID.");
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
        const marketingImages: string[] = [];
        const squareMarketingImages: string[] = [];

        const allImagesList = Array.isArray(payload.marketingImages) ? payload.marketingImages : (Array.isArray(images) ? images : []);

        for (const img of allImagesList) {
          const raw = typeof img === "string" ? img : img?.url || img?.data || img?.asset || "";
          if (!raw) continue;

          const fieldType = typeof img === "object" && img?.fieldType ? img.fieldType : null;
          const aspectRatio = typeof img === "object" && img?.aspectRatio ? img.aspectRatio : null;

          if (raw.startsWith("customers/") && raw.includes("/assets/")) {
            if (fieldType === "SQUARE_MARKETING_IMAGE" || aspectRatio === "1:1") {
              if (!squareMarketingImages.includes(raw)) squareMarketingImages.push(raw);
            } else {
              if (!marketingImages.includes(raw)) marketingImages.push(raw);
            }
            continue;
          }

          if (fieldType === "MARKETING_IMAGE" || aspectRatio === "1.91:1") {
            let landUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
            landUrl = toPollinationsTransform(landUrl, 1200, 628);
            const uploaded = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, landUrl);
            if (uploaded && !marketingImages.includes(uploaded)) marketingImages.push(uploaded);
          } else if (fieldType === "SQUARE_MARKETING_IMAGE" || aspectRatio === "1:1") {
            let sqUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
            sqUrl = toPollinationsTransform(sqUrl, 1200, 1200);
            const uploaded = await this.uploadImageAsset(organizationId, customerId, `DG_Sq_${Date.now()}`, sqUrl);
            if (uploaded && !squareMarketingImages.includes(uploaded)) squareMarketingImages.push(uploaded);
          } else {
            let landUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
            landUrl = toPollinationsTransform(landUrl, 1200, 628);
            const landRef = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, landUrl);
            if (landRef && !marketingImages.includes(landRef)) marketingImages.push(landRef);

            let sqUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
            sqUrl = toPollinationsTransform(sqUrl, 1200, 1200);
            const sqRef = await this.uploadImageAsset(organizationId, customerId, `DG_Sq_${Date.now()}`, sqUrl);
            if (sqRef && !squareMarketingImages.includes(sqRef)) squareMarketingImages.push(sqRef);
          }
        }

        if (squareMarketingImages.length === 0 && resolvedLogoAsset) {
          squareMarketingImages.push(resolvedLogoAsset);
        }

        if (marketingImages.length === 0) {
          let landUrl = toImageKitTransform(DEFAULT_DG_LANDSCAPE, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
          const landRef = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, landUrl);
          if (landRef) marketingImages.push(landRef);
        }

        const uniqueMarketingImages = Array.from(new Set(marketingImages));
        const uniqueSquareImages = Array.from(new Set(squareMarketingImages));

        if (uniqueMarketingImages.length === 0 || !resolvedLogoAsset) {
          throw new Error("At least 1 landscape marketing image (1.91:1) and 1 logo (1:1) are required for Demand Gen Single Image ads.");
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
                marketingImages: uniqueMarketingImages.map(asset => ({ asset })),
                squareMarketingImages: uniqueSquareImages.map(asset => ({ asset })),
                logoImages: [{ asset: resolvedLogoAsset }],
                businessName: safeBusinessName
              }
            }
          }
        });
      }

      const adRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, {
        operations: adGroupAdOps
      }, { headers });

      apiResult.adGroupAdResourceName = adRes.data?.results?.[0]?.resourceName;

    } catch (apiErr: any) {
      const errContext = { organizationId, customerId: cid, currencyCode: (payload as any)?.currencyCode || "INR" };
      console.error("[Google Ads API Error for Sales Demand Gen]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr, errContext));
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
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr, errContext);
      throw new Error(formatted);
    }

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
      startDate: startDate ? new Date(String(startDate).split("T")[0]) : null,
      endDate: endDate ? new Date(String(endDate).split("T")[0]) : null,
      finalUrl,
      headlines,
      descriptions,
      languages: (Array.isArray(languages) && languages.length > 0) ? languages : ["All languages"],
      geoTargets: {
        locations,
        languages: (Array.isArray(languages) && languages.length > 0) ? languages : ["All languages"],
        channels,
        audience,
        searchThemes: Array.isArray(payload.searchThemes) ? payload.searchThemes : [],
        audienceSignals: Array.isArray(payload.audienceSignals) ? payload.audienceSignals : (Array.isArray(payload.audienceSignal) ? payload.audienceSignal : (payload.audience ? [payload.audience] : [])),
        demandGenBudgetType: isCampaignTotal ? "Total" : "Daily",
        callPhoneNumber: payload.callPhoneNumber || null,
        adName: payload.adName || null,
        displayPath1: payload.displayPath1 || null,
        displayPath2: payload.displayPath2 || null,
        brandGuidelines: {
          mainBrandColor: payload.brandGuidelines?.mainBrandColor || payload.mainBrandColor || null,
          accentBrandColor: payload.brandGuidelines?.accentBrandColor || payload.accentBrandColor || null,
          brandFont: payload.brandGuidelines?.brandFont || payload.brandFont || null
        },
        creativeEnhancements: {
          optAdaptiveLayouts: payload.optAdaptiveLayouts !== false,
          optAnimatedImages: payload.optAnimatedImages !== false,
          optGeneratedVideos: payload.optGeneratedVideos !== false,
          optShorterVideos: Boolean(payload.optShorterVideos),
          optResizedVideos: payload.optResizedVideos !== false,
          optLandingPagePreviews: payload.optLandingPagePreviews !== false
        },
        includeViewThrough: payload.includeViewThrough !== false,
        keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
        callToAction: payload.callToAction || "Automated",
        demographicExclusions: payload.demographicExclusions || null,
        brandExclusions: payload.brandExclusions || null,
        brandInclusions: payload.brandInclusions || null,
        valueRules: payload.valueRules || null,
        merchantCenterId: payload.merchantCenterId || payload.merchantId || null,
        deviceTargeting,
        devices: payload.devices || { computers: true, mobile: true, tablets: true, tv: true },
        adSchedule,
        objective: payload.campaignGoal || payload.objective || "Sales"
      },
      advertisingChannelType: "DEMAND_GEN",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Demand Gen Campaign created successfully (Paused)",
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