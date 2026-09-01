import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class SalesDemandGenService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Sales Demand Gen",
      finalUrl = "https://www.example.com",
      campaignGoal = "Sales",
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      biddingFocus, // fallback
      targetCpa,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      images = [],
      logos = [],
      businessName = "",
      dailyBudget = 1000,
      euPolitical = "NO",
      channels = []
    } = payload;

    const validHeadlines = headlines.filter((h: any) => h && h.trim());
    if (validHeadlines.length < 1) {
      throw new Error("At least 1 headline is required.");
    }
    const validDescriptions = descriptions.filter((d: any) => d && d.trim());
    
    const amountMicros = Math.round(Number(dailyBudget) * 1_000_000);
    const targetCpaMicros = targetCpa ? Math.round(Number(targetCpa) * 1_000_000) : undefined;

    const finalBiddingStrategy = biddingStrategy || (biddingFocus === "Target CPA" ? "TARGET_CPA" : biddingFocus === "Target ROAS" ? "TARGET_ROAS" : "MAXIMIZE_CONVERSIONS");

    let biddingConfig: any = {};
    if (finalBiddingStrategy === "MAXIMIZE_CONVERSION_VALUE" || finalBiddingStrategy === "TARGET_ROAS") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else if (finalBiddingStrategy === "TARGET_CPA" && targetCpaMicros) {
      biddingConfig = { maximizeConversions: { targetCpaMicros: String(targetCpaMicros) } };
    } else {
      biddingConfig = { maximizeConversions: {} };
    }

    const cid = (customerId || "").replace(/-/g, "").trim();
    let apiResult: any = { campaignId: `demandgen-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicros / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      
      const campaignPayload = {
        operations: [
          {
            create: {
              name: campaignName,
              status: "PAUSED",
              advertisingChannelType: "DEMAND_GEN",
              campaignBudget: budgetRef,
              containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
              demandGenCampaignSettings: {
                 upgradedTargeting: true
              },
              ...biddingConfig
            }
          }
        ]
      };

      const res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = res.data?.results?.[0]?.resourceName;
      
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // 2. Create Ad Group without a type for Demand Gen
      const adGroupCreate: any = {
        campaign: campaignRef,
        name: `${campaignName} Ad Group 1`,
        status: "ENABLED"
      };

      if (channels && channels.length > 0) {
        const selectedChannels = {
          youtubeInStream: channels.includes("YouTube in-stream") || channels.includes("YouTube"),
          youtubeInFeed: channels.includes("YouTube in-feed") || channels.includes("YouTube"),
          youtubeShorts: channels.includes("YouTube Shorts") || channels.includes("YouTube"),
          discover: channels.includes("Discover"),
          gmail: channels.includes("Gmail"),
          display: channels.includes("Google Display Network"),
          maps: channels.includes("Maps New")
        };
          
        adGroupCreate.demandGenAdGroupSettings = {
          channelControls: {
            selectedChannels
          }
        };
      }

      const adGroupPayload = {
        operations: [{ create: adGroupCreate }]
      };
      
      const adGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroups:mutate`, adGroupPayload, { headers });
      const adGroupRef = adGroupRes.data.results?.[0]?.resourceName;
      apiResult.adGroupResourceName = adGroupRef;

      // 3. (Optional) AdGroup criteria can be added here if needed in the future


      // 4. Create Assets
      const createdAssets: { headlines: string[], descriptions: string[], images: string[], logos: string[] } = {
        headlines: [],
        descriptions: [],
        images: [],
        logos: []
      };

      const assetOperations: any[] = [];

      // We do not create TEXT assets for headlines/descriptions in Demand Gen; they use AdTextAsset directly.
      images.forEach((img: any) => {
        const base64Data = typeof img.data === "string" && img.data.includes("base64,") ? img.data.split("base64,")[1] : typeof img === "string" && img.includes("base64,") ? img.split("base64,")[1] : null;
        if (base64Data) {
          assetOperations.push({ create: { type: "IMAGE", imageAsset: { data: base64Data }, name: img.name || `Image - ${Date.now()}` } });
        }
      });
      
      logos.forEach((logo: any) => {
        const base64Data = typeof logo.data === "string" && logo.data.includes("base64,") ? logo.data.split("base64,")[1] : typeof logo === "string" && logo.includes("base64,") ? logo.split("base64,")[1] : null;
        if (base64Data) {
          assetOperations.push({ create: { type: "IMAGE", imageAsset: { data: base64Data }, name: logo.name || `Logo - ${Date.now()}` } });
        }
      });

      if (assetOperations.length > 0) {
        const assetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, { operations: assetOperations }, { headers });
        const results = assetRes.data.results || [];
        let idx = 0;
        
        images.forEach((img: any) => {
          const base64Data = typeof img.data === "string" && img.data.includes("base64,") ? img.data.split("base64,")[1] : typeof img === "string" && img.includes("base64,") ? img.split("base64,")[1] : null;
          if (base64Data) createdAssets.images.push(results[idx++]?.resourceName);
        });
        logos.forEach((logo: any) => {
          const base64Data = typeof logo.data === "string" && logo.data.includes("base64,") ? logo.data.split("base64,")[1] : typeof logo === "string" && logo.includes("base64,") ? logo.split("base64,")[1] : null;
          if (base64Data) createdAssets.logos.push(results[idx++]?.resourceName);
        });
      }

      // 5. Create Demand Gen Ad and AdGroupAd
      if (validHeadlines.length > 0) {
         const demandGenAd = {
           demandGenMultiAssetAd: {
             headlines: validHeadlines.map((text: string) => ({ text })),
             descriptions: validDescriptions.map((text: string) => ({ text })),
             marketingImages: createdAssets.images.map((asset: string) => ({ asset })),
             squareMarketingImages: createdAssets.images.length > 0 ? [{ asset: createdAssets.images[0] }] : [], 
             logoImages: createdAssets.logos.map((asset: string) => ({ asset })),
             businessName: businessName || "My Business"
           },
           finalUrls: [finalUrl]
         };

         const adGroupAdPayload = {
           operations: [
             {
               create: {
                 adGroup: adGroupRef,
                 status: "ENABLED",
                 ad: demandGenAd
               }
             }
           ]
         };

         const adGroupAdRes = await axios.post(`${ADS_BASE}/customers/${cid}/adGroupAds:mutate`, adGroupAdPayload, { headers });
         apiResult.adGroupAdResourceName = adGroupAdRes.data.results?.[0]?.resourceName;
      }

    } catch (apiErr: any) {
      if (apiErr?.response?.data) {
        console.error(
          "[Google Ads API Error for Sales Demand Gen]:",
          JSON.stringify(apiErr.response.data, null, 2)
        );
      } else {
        console.error("[Sales Demand Gen API Error]:", apiErr.message);
      }
      throw apiErr;
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `demandgen-${Date.now()}`,
      name: campaignName,
      campaignType: "DEMAND_GEN",
      biddingStrategy: finalBiddingStrategy,
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