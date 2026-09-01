import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class SalesSearchService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Sales Search",
      websiteVisitsUrl = "https://www.example.com",
      biddingFocus = "Maximize conversions",
      targetCpa = 25,
      targetRoas = 200,
      locations = ["India"],
      languages = ["English"],
      keywords = [],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000,
      euPolitical = "NO"
    } = payload;

    const finalUrl = websiteVisitsUrl;
    if (!headlines || headlines.length === 0 || !headlines[0]) {
      throw new Error("At least 1 headline is required.");
    }

    const advertisingChannelType = "SEARCH";
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    let apiResult: any = { campaignId: `search-${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const campaignPayload = {
        operations: [
          {
            create: {
              name: campaignName,
              status: "PAUSED",
              advertisingChannelType: "SEARCH",
              campaignBudget: budgetRef,
              containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
              ...(targetCpaMicros ? { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } } : {})
            }
          }
        ]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName || `customers/${cid}/campaigns/mock-search-${Date.now()}`;
      
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();
    } catch (apiErr: any) {
      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error for Sales Search]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Sales Search API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    // Validation
    const validHeadlines = headlines.filter((h: any) => h && h.trim());
    const validDescriptions = descriptions.filter((d: any) => d && d.trim());
    if (validHeadlines.length < 3) throw new Error("At least 3 headlines are required for Responsive Search Ads.");
    if (validDescriptions.length < 2) throw new Error("At least 2 descriptions are required for Responsive Search Ads.");
    if (!keywords || keywords.length === 0) throw new Error("At least 1 valid keyword is required.");

    try {
      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const cid = (customerId || "").replace(/-/g, "").trim();
      const ADS_BASE = "https://googleads.googleapis.com/v24";

      // 1. Create AdGroup
      const adGroupPayload = {
        operations: [{
          create: {
            campaign: apiResult.campaignResourceName,
            name: `${campaignName} - AdGroup 1`,
            status: "ENABLED",
            type: "SEARCH_STANDARD"
          }
        }]
      };
      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
      const adGroupRef = adGroupRes.data.results?.[0]?.resourceName;
      apiResult.adGroupResourceName = adGroupRef;

      // 2. Create Keywords (AdGroupCriterion)
      const keywordOperations = keywords.map((kw: string) => {
        let matchType = "BROAD";
        let text = kw.trim();
        if (text.startsWith("[") && text.endsWith("]")) {
          matchType = "EXACT";
          text = text.slice(1, -1);
        } else if (text.startsWith('"') && text.endsWith('"')) {
          matchType = "PHRASE";
          text = text.slice(1, -1);
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
      if (keywordOperations.length > 0) {
        await axios.post(`${ADS_BASE}/customers/${cid}/adGroupCriteria:mutate`, { operations: keywordOperations }, { headers });
      }

      // 3. Create Responsive Search Ad (AdGroupAd)
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
      await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });

      // 4. Create Campaign Criteria (Locations and Languages)
      const campaignCriteriaOperations: any[] = [];
      
      // Locations
      if (locations && locations.length > 0) {
        locations.forEach((loc: string) => {
          if (loc !== "All countries" && loc !== "All") {
            const locLower = loc.toLowerCase();
            let geoId = "2840"; // US default fallback
            if (locLower === "india") geoId = "2356";
            
            campaignCriteriaOperations.push({
              create: {
                campaign: apiResult.campaignResourceName,
                location: { geoTargetConstant: `geoTargetConstants/${geoId}` }
              }
            });
          }
        });
      }

      // Languages
      if (languages && languages.length > 0) {
        languages.forEach((lang: string) => {
          const langLower = lang.toLowerCase();
          let langId = "1000"; // English
          if (langLower === "spanish") langId = "1003";
          
          campaignCriteriaOperations.push({
            create: {
              campaign: apiResult.campaignResourceName,
              language: { languageConstant: `languageConstants/${langId}` }
            }
          });
        });
      }

      if (campaignCriteriaOperations.length > 0) {
        await axios.post(`${ADS_BASE}/customers/${cid}/campaignCriteria:mutate`, { operations: campaignCriteriaOperations }, { headers });
      }

    } catch (apiErr: any) {
      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error in Sales Search Post-Campaign Flow]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Sales Search Post-Campaign API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `search-${Date.now()}`,
      name: campaignName,
      campaignType: "SEARCH",
      biddingStrategy: biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS",
      budget: Number(dailyBudget),
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: {
        locations,
        languages,
        objective: "Sales"
      },
      advertisingChannelType: "SEARCH",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Sales Search Campaign created successfully (Paused)",
      campaign: {
        ...localCampaign,
        amountMicros: Number(localCampaign.amountMicros),
        costMicros: Number(localCampaign.costMicros),
        impressions: Number(localCampaign.impressions),
        clicks: Number(localCampaign.clicks)
      }
    };
  }
}