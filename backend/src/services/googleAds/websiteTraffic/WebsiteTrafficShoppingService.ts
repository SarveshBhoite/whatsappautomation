import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import { GoogleAdsConversionGoalMapper } from "../shared/GoogleAdsConversionGoalMapper";
import axios from "axios";

export class WebsiteTrafficShoppingService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Website Traffic Shopping",
      merchantCenterId,
      salesCountry = "IN",
      feedLabel,
      locations = ["India"],
      targetRoas = 200,
      dailyBudget = 1000,
      budget,
      euPolitical = "NO",
      shoppingSetting,
      conversionGoals
    } = payload;

    const rawBudget = dailyBudget !== undefined && dailyBudget !== null && dailyBudget !== ""
      ? dailyBudget
      : (budget !== undefined && budget !== null && budget !== "" ? budget : null);

    const effectiveBudget = Number(rawBudget);
    if (!rawBudget || isNaN(effectiveBudget) || effectiveBudget <= 0) {
      throw new Error("A valid daily budget greater than 0 is required for Shopping campaigns.");
    }
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
    const cid = (customerId || "").replace(/-/g, "").trim();

    const mId = merchantCenterId || shoppingSetting?.merchantId;
    if (!mId || !String(mId).trim()) {
      throw new Error("Merchant Center ID is required before this Shopping campaign can be published.");
    }

    const country = salesCountry || shoppingSetting?.salesCountry || payload.WebsiteTrafficCountry || shoppingSetting?.WebsiteTrafficCountry || "IN";
    const label = feedLabel || shoppingSetting?.feedLabel || country;

    let apiResult: any = { campaignId: `webtraffic-shopping-${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      
      const normStrategy = (payload.biddingStrategy || payload.biddingFocus || "MAXIMIZE_CONVERSION_VALUE")
        .toUpperCase()
        .replace(/\s+/g, "_");

      let biddingConfig: any = {};

      if (normStrategy === "TARGET_ROAS") {
        const roasNum = Number(targetRoas);
        if (!targetRoas || isNaN(roasNum) || roasNum <= 0) {
          throw new Error("Target ROAS is required and must be greater than 0% when Target ROAS bidding is selected.");
        }
        biddingConfig = {
          targetRoas: {
            targetRoas: roasNum / 100
          }
        };
      } else if (normStrategy === "MAXIMIZE_CLICKS" || normStrategy === "CLICKS") {
        const maxCpc = payload.maxCpcLimit ? Number(payload.maxCpcLimit) : undefined;
        biddingConfig = {
          maximizeClicks: maxCpc && maxCpc > 0
            ? { cpcBidCeilingMicros: String(Math.round(maxCpc * 1_000_000)) }
            : {}
        };
      } else if (normStrategy === "MANUAL_CPC") {
        biddingConfig = {
          manualCpc: {
            enhancedCpcEnabled: false
          }
        };
      } else {
        biddingConfig = {
          maximizeConversionValue: {}
        };
      }

      const priorityMap: Record<string, number> = {
        LOW: 0,
        MEDIUM: 1,
        HIGH: 2
      };
      const rawPriority = String(payload.campaignPriority || shoppingSetting?.campaignPriority || "LOW").toUpperCase();
      const numPriority = priorityMap[rawPriority] ?? 0;

      const baseCampaignObj: any = {
        name: campaignName,
        status: "PAUSED",
        advertisingChannelType: "SHOPPING",
        campaignBudget: budgetRef,
        containsEuPoliticalAdvertising: (euPolitical === "YES" || payload.euPoliticalAds?.startsWith("Yes")) ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
        shoppingSetting: {
          merchantId: String(mId),
          campaignPriority: numPriority,
          feedLabel: label,
          enableLocal: Boolean(payload.localProducts || shoppingSetting?.enableLocalProducts)
        },
        ...biddingConfig
      };

      if (payload.startDate) {
        baseCampaignObj.startDateTime = `${String(payload.startDate).split("T")[0]} 00:00:00`;
      }
      if (payload.endDate) {
        baseCampaignObj.endDateTime = `${String(payload.endDate).split("T")[0]} 23:59:59`;
      }

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      let res;
      try {
        const campaignPayload = {
          operations: [{ create: baseCampaignObj }]
        };
        res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME")) {
          const uniqueName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          baseCampaignObj.name = uniqueName;
          const retryPayload = {
            operations: [{ create: baseCampaignObj }]
          };
          res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, retryPayload, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = res.data?.results?.[0]?.resourceName;
      if (campaignRef) {
        apiResult.campaignResourceName = campaignRef;
        apiResult.campaignId = campaignRef.split("/").pop();

        // Mutate Campaign Geo Locations and Language Criteria in Google Ads API
        try {
          await this.mutateCampaignGeoAndLanguageCriteria(organizationId, customerId, campaignRef, {
            locations: Array.isArray(locations) ? locations : [locations].filter(Boolean),
            languages: Array.isArray(payload.languages) ? payload.languages : [payload.languages].filter(Boolean),
            headers
          });
        } catch (geoLangErr: any) {
          console.warn("[WebsiteTrafficShoppingService] Geo/Language criteria warning:", geoLangErr.message);
        }

        // Campaign Conversion Goals Configuration (campaignConversionGoals:mutate)
        if (conversionGoals && (Array.isArray(conversionGoals) ? conversionGoals.length > 0 : true)) {
          await GoogleAdsConversionGoalMapper.applyCampaignConversionGoals(
            organizationId,
            customerId,
            campaignRef,
            conversionGoals,
            headers,
            "WebsiteTrafficShoppingService"
          );
        }
      }
    } catch (apiErr: any) {
      console.error("[Google Ads API Error for Website Traffic Shopping]:", GoogleAdsBaseService.formatGoogleAdsError(apiErr));
      console.error("[Google Ads API Raw Error Data]:", JSON.stringify(apiErr?.response?.data || apiErr.message, null, 2));
      throw new Error(GoogleAdsBaseService.formatGoogleAdsError(apiErr));
    }

    const normStrategy = (payload.biddingStrategy || payload.biddingFocus || "MAXIMIZE_CONVERSION_VALUE")
      .toUpperCase()
      .replace(/\s+/g, "_");

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `shopping-${Date.now()}`,
      name: campaignName,
      campaignType: "SHOPPING",
      biddingStrategy: normStrategy,
      budget: effectiveBudget,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl: payload.finalUrl || payload.website || null,
      headlines: Array.isArray(payload.headlines) ? payload.headlines : [],
      descriptions: Array.isArray(payload.descriptions) ? payload.descriptions : [],
      startDate: payload.startDate ? new Date(payload.startDate) : undefined,
      endDate: payload.endDate ? new Date(payload.endDate) : undefined,
      keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
      languages: Array.isArray(payload.languages) ? payload.languages : ["All languages"],
      searchThemes: Array.isArray(payload.searchThemes) ? payload.searchThemes : [],
      audienceSignal: payload.audienceSignal || payload.audienceSignals || payload.audience || null,
      adSchedule: Array.isArray(payload.adSchedule) ? payload.adSchedule : [],
      geoTargets: {
        objective: "Website Traffic",
        locations,
        languages: Array.isArray(payload.languages) ? payload.languages : ["All languages"],
        keywords: Array.isArray(payload.keywords) ? payload.keywords : [],
        searchThemes: Array.isArray(payload.searchThemes) ? payload.searchThemes : [],
        audienceSignal: payload.audienceSignal || payload.audienceSignals || payload.audience || null,
        endDate: payload.endDate || null,
        merchantCenterId: String(mId),
        salesCountry: country,
        feedLabel: label,
        campaignPriority: payload.campaignPriority || "LOW",
        localProducts: Boolean(payload.localProducts || shoppingSetting?.enableLocalProducts),
        productGroupFilter: payload.productGroupFilter || "Use all products",
        productGroupSelectBy: payload.productGroupSelectBy,
        adSchedule: Array.isArray(payload.adSchedule) ? payload.adSchedule : []
      },
      advertisingChannelType: "SHOPPING",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Shopping Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}