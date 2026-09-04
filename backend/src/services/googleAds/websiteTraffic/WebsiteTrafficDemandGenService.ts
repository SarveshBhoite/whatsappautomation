import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class WebsiteTrafficDemandGenService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Website Traffic Demand Gen",
      finalUrl = "https://www.example.com",
      campaignGoal = "Website Traffic",
      biddingStrategy = "MAXIMIZE_CONVERSIONS",
      biddingFocus,
      targetCpa,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      images = [],
      logos = [],
      businessName = "",
      dailyBudget,
      budget,
      euPolitical = "NO",
      channels = []
    } = payload;

    const validHeadlines = headlines.filter((h: any) => h && h.trim());
    if (validHeadlines.length < 1) {
      throw new Error("At least 1 headline is required.");
    }
    const validDescriptions = descriptions.filter((d: any) => d && d.trim());
    
    const effectiveBudget = Number(dailyBudget || budget || 1000);
    const amountMicros = Math.round(effectiveBudget * 1_000_000);
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
    let apiResult: any = { campaignId: `webtraffic-demandgen-${Date.now()}` };
    const ADS_BASE = "https://googleads.googleapis.com/v24";

    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: effectiveBudget
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      
      let effectiveCampaignName = campaignName;
      let res;
      try {
        const campaignPayload = {
          operations: [
            {
              create: {
                name: effectiveCampaignName,
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

        res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      } catch (campErr: any) {
        const errMsg = campErr?.response?.data?.error?.message || campErr?.message || "";
        const errDetails = JSON.stringify(campErr?.response?.data || "");
        if (errMsg.includes("already assigned") || errDetails.includes("DUPLICATE_CAMPAIGN_NAME") || errDetails.includes("DUPLICATE_NAME") || errDetails.includes("already assigned")) {
          effectiveCampaignName = `${campaignName} ${Date.now().toString().slice(-4)}`;
          const retryPayload = {
            operations: [
              {
                create: {
                  name: effectiveCampaignName,
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
          res = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, retryPayload, { headers });
        } else {
          throw campErr;
        }
      }

      const campaignRef = res.data?.results?.[0]?.resourceName;
      
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // 2. Create Ad Group
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

      // 3. Create Image and Logo Assets
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

      // Upload marketing images (Landscape 1.91:1 and Square 1:1)
      for (const img of (images || [])) {
        const raw = typeof img === "string" ? img : img?.url || img?.data || "";
        if (!raw) continue;

        const landscapeUrl = toImageKitTransform(raw, "tr:w-1200,h-628,cm-pad_resize,bg-FFFFFF");
        const landscapeRef = await this.uploadImageAsset(organizationId, customerId, `DG_Land_${Date.now()}`, landscapeUrl);
        if (landscapeRef && !createdAssets.marketingImages.includes(landscapeRef)) {
          createdAssets.marketingImages.push(landscapeRef);
        }

        const squareUrl = toImageKitTransform(raw, "tr:w-1200,h-1200,cm-pad_resize,bg-FFFFFF");
        const squareRef = await this.uploadImageAsset(organizationId, customerId, `DG_Sq_${Date.now()}`, squareUrl);
        if (squareRef && !createdAssets.squareMarketingImages.includes(squareRef)) {
          createdAssets.squareMarketingImages.push(squareRef);
        }
      }

      // Upload logos (Square 1:1)
      for (const logo of (logos || [])) {
        const raw = typeof logo === "string" ? logo : logo?.url || logo?.data || "";
        if (!raw) continue;

        const logoUrl = toImageKitTransform(raw, "tr:w-500,h-500,cm-pad_resize,bg-FFFFFF");
        const logoRef = await this.uploadImageAsset(organizationId, customerId, `DG_Logo_${Date.now()}`, logoUrl);
        if (logoRef && !createdAssets.logoImages.includes(logoRef)) {
          createdAssets.logoImages.push(logoRef);
        }
      }

      // Fallback cross-assignments
      if (createdAssets.squareMarketingImages.length > 0 && createdAssets.logoImages.length === 0) {
        createdAssets.logoImages.push(createdAssets.squareMarketingImages[0]);
      }
      if (createdAssets.marketingImages.length === 0 && createdAssets.squareMarketingImages.length > 0) {
        createdAssets.marketingImages.push(createdAssets.squareMarketingImages[0]);
      }

      if (createdAssets.marketingImages.length === 0 || createdAssets.squareMarketingImages.length === 0 || createdAssets.logoImages.length === 0) {
        throw new Error("At least 1 marketing image and 1 logo are required for Demand Gen ads. Please upload an image or logo.");
      }

      // 4. Create Demand Gen Ad and AdGroupAd
      const cleanedHeadlines = validHeadlines
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 40))
        .filter((text: string) => text.length > 0);
      
      const safeHeadlines = (cleanedHeadlines.length > 0 ? cleanedHeadlines : ["Quality Services and Products"])
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const cleanedDescriptions = validDescriptions
        .map((text: string) => GoogleAdsBaseService.cleanAdText(text, 90))
        .filter((text: string) => text.length > 0);

      const safeDescriptions = (cleanedDescriptions.length > 0 ? cleanedDescriptions : ["Discover great offers and premium solutions tailored for you."])
        .slice(0, 5)
        .map((text: string) => ({ text }));

      const safeBusinessName = GoogleAdsBaseService.cleanAdText(businessName || "My Business", 25) || "My Business";

      const demandGenAd = {
        demandGenMultiAssetAd: {
          headlines: safeHeadlines,
          descriptions: safeDescriptions,
          marketingImages: createdAssets.marketingImages.map((asset: string) => ({ asset })),
          squareMarketingImages: createdAssets.squareMarketingImages.map((asset: string) => ({ asset })),
          logoImages: createdAssets.logoImages.map((asset: string) => ({ asset })),
          businessName: safeBusinessName
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

    } catch (apiErr: any) {
      const formatted = GoogleAdsBaseService.formatGoogleAdsError(apiErr);
      console.error("[Google Ads API Error for Website Traffic Demand Gen]:", formatted);
      throw new Error(formatted);
    }

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
        objective: "Website Traffic"
      },
      advertisingChannelType: "DEMAND_GEN",
      amountMicros: BigInt(amountMicros),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Demand Gen Campaign created successfully (Paused)",
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