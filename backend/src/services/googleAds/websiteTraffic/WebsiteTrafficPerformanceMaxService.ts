import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class WebsiteTrafficPerformanceMaxService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Website Traffic Performance Max",
      assetGroupName = "Asset Group 1",
      finalUrl,
      amountMicros,
      biddingFocus = "Maximize conversions",
      targetCpaMicros,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      longHeadlines = [],
      descriptions = [],
      images = [],
      dailyBudget = 1000,
      euPolitical = "NO",
      businessName,
      logos = [],
      brandGuidelinesEnabled = false
    } = payload;

    if (!finalUrl) throw new Error("Final URL is required.");

    const validHeadlines = headlines.filter((h: any) => h && h.trim());
    const validLongHeadlines = longHeadlines.filter((h: any) => h && h.trim());
    const validDescriptions = descriptions.filter((h: any) => h && h.trim());

    if (validHeadlines.length < 3) throw new Error("At least 3 headlines are required for Performance Max.");
    if (validLongHeadlines.length < 1) throw new Error("At least 1 long headline is required for Performance Max.");
    if (validDescriptions.length < 2) throw new Error("At least 2 descriptions are required for Performance Max.");
    if (!images || !images.some((i: any) => i.fieldType === "MARKETING_IMAGE")) throw new Error("At least 1 MARKETING_IMAGE is required for Performance Max.");
    if (!images || !images.some((i: any) => i.fieldType === "SQUARE_MARKETING_IMAGE")) throw new Error("At least 1 SQUARE_MARKETING_IMAGE is required for Performance Max.");
    if (!brandGuidelinesEnabled && (!businessName || !businessName.trim())) throw new Error("Business Name is required for Performance Max when Brand Guidelines are disabled.");
    if (!brandGuidelinesEnabled && (!logos || logos.length < 1)) throw new Error("Logo is required for Performance Max when Brand Guidelines are disabled.");

    const cid = (customerId || "").replace(/-/g, "").trim();
    const amountMicrosVal = amountMicros || Math.round(Number(dailyBudget) * 1_000_000);

    let biddingConfig: any = {};
    const normalizedFocus = biddingFocus.trim().toLowerCase();
    if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else {
      biddingConfig = { maximizeConversions: targetCpaMicros ? { targetCpaMicros: String(targetCpaMicros) } : {} };
    }

    let apiResult: any = { campaignId: `web-pmax-${Date.now()}` };
    try {
      const budgetRef = await this.createBudget(organizationId, customerId, {
        name: `${campaignName} Budget - ${Date.now()}`,
        amountPerDay: amountMicrosVal / 1_000_000
      });
      apiResult.budgetResourceName = budgetRef;

      const { headers } = await this.getAdsHeaders(organizationId, customerId);
      const campaignPayload = {
        operations: [{
          create: {
            name: campaignName,
            status: "PAUSED",
            advertisingChannelType: "PERFORMANCE_MAX",
            campaignBudget: budgetRef,
            containsEuPoliticalAdvertising: euPolitical === "YES" ? "CONTAINS_EU_POLITICAL_ADVERTISING" : "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            brandGuidelinesEnabled,
            ...biddingConfig
          }
        }]
      };

      const ADS_BASE = "https://googleads.googleapis.com/v24";
      let campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, campaignPayload, { headers });
      const campaignRef = campaignRes.data?.results?.[0]?.resourceName;
      apiResult.campaignResourceName = campaignRef;
      apiResult.campaignId = campaignRef.split("/").pop();

      // Asset Creation (Business Name and Logo)
      let businessNameAssetResourceName;
      if (businessName) {
        const bnPayload = {
          operations: [{
            create: {
              type: "TEXT",
              textAsset: { text: businessName }
            }
          }]
        };
        const bnRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, bnPayload, { headers });
        businessNameAssetResourceName = bnRes.data.results?.[0]?.resourceName;
      }

      let logoAssetResourceName;
      if (logos && logos.length > 0 && typeof logos[0] === "string" && logos[0].includes("base64,")) {
        const base64Data = logos[0].split("base64,")[1];
        const logoPayload = {
          operations: [{
            create: {
              type: "IMAGE",
              imageAsset: { data: base64Data },
              name: `Logo - ${Date.now()}`
            }
          }]
        };
        const logoRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, logoPayload, { headers });
        logoAssetResourceName = logoRes.data.results?.[0]?.resourceName;
      }

      // Standard Performance Max Assets Creation (Text & Images)
      const createdAssetResourceNames: { headlines: string[], longHeadlines: string[], descriptions: string[], images: { resourceName: string, fieldType: string }[] } = {
        headlines: [],
        longHeadlines: [],
        descriptions: [],
        images: []
      };

      try {
        const textOperations: any[] = [];
        headlines.forEach((text: string) => {
          textOperations.push({ create: { type: "TEXT", textAsset: { text } } });
        });
        longHeadlines.forEach((text: string) => {
          textOperations.push({ create: { type: "TEXT", textAsset: { text } } });
        });
        descriptions.forEach((text: string) => {
          textOperations.push({ create: { type: "TEXT", textAsset: { text } } });
        });

        if (textOperations.length > 0) {
          const textRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, { operations: textOperations }, { headers });
          const results = textRes.data.results || [];
          let idx = 0;
          headlines.forEach(() => createdAssetResourceNames.headlines.push(results[idx++]?.resourceName));
          longHeadlines.forEach(() => createdAssetResourceNames.longHeadlines.push(results[idx++]?.resourceName));
          descriptions.forEach(() => createdAssetResourceNames.descriptions.push(results[idx++]?.resourceName));
        }

        const imageOperations: any[] = [];
        images.forEach((img: any) => {
          const base64Data = typeof img.data === "string" && img.data.includes("base64,") ? img.data.split("base64,")[1] : img.data;
          if (base64Data) {
            imageOperations.push({ create: { type: "IMAGE", imageAsset: { data: base64Data }, name: img.name || `Image - ${Date.now()}` } });
          }
        });

        if (imageOperations.length > 0) {
          const imgRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, { operations: imageOperations }, { headers });
          const results = imgRes.data.results || [];
          let idx = 0;
          images.forEach((img: any) => {
            const resName = results[idx++]?.resourceName;
            if (resName) createdAssetResourceNames.images.push({ resourceName: resName, fieldType: img.fieldType || "MARKETING_IMAGE" });
          });
        }
      } catch (err: any) {
        console.error("[Website Traffic PMax] Text/Image Asset creation failed:", JSON.stringify(err?.response?.data || err.message, null, 2));
        throw err;
      }

      // CampaignAsset Linking (Only if Brand Guidelines are enabled)
      if (brandGuidelinesEnabled && (businessNameAssetResourceName || logoAssetResourceName)) {
        try {
          const caOperations = [];
          if (businessNameAssetResourceName) {
            caOperations.push({
              create: {
                campaign: campaignRef,
                asset: businessNameAssetResourceName,
                fieldType: "BUSINESS_NAME",
                status: "ENABLED"
              }
            });
          }
          if (logoAssetResourceName) {
            caOperations.push({
              create: {
                campaign: campaignRef,
                asset: logoAssetResourceName,
                fieldType: "LOGO",
                status: "ENABLED"
              }
            });
          }
          
          if (caOperations.length > 0) {
            await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
              operations: caOperations
            }, { headers });
          }
        } catch (err: any) {
          console.error(
            "[Website Traffic PMax] CampaignAsset linking failed:",
            JSON.stringify(err?.response?.data || err.message, null, 2)
          );
          throw err;
        }
      }

      // AssetGroup Creation explicitly for Performance Max
      try {
        const finalUrlsArray = finalUrl ? [finalUrl.trim()] : [];
        console.log("[Website Traffic PMax] final_urls before AssetGroup mutate:", JSON.stringify(finalUrlsArray));
        
        const tempAssetGroupResourceName = `customers/${cid}/assetGroups/-1`;
        
        const mutateOperations: any[] = [
          {
            assetGroupOperation: {
              create: {
                resourceName: tempAssetGroupResourceName,
                campaign: campaignRef,
                name: assetGroupName,
                status: "ENABLED",
                finalUrls: finalUrlsArray
              }
            }
          }
        ];
        
        const compactLogs: any[] = [];
        
        if (!brandGuidelinesEnabled) {
          if (businessNameAssetResourceName) {
            mutateOperations.push({ assetGroupAssetOperation: { create: { assetGroup: tempAssetGroupResourceName, asset: businessNameAssetResourceName, fieldType: "BUSINESS_NAME", status: "ENABLED" } } });
            compactLogs.push({ asset: businessNameAssetResourceName, fieldType: "BUSINESS_NAME" });
          }
          if (logoAssetResourceName) {
            mutateOperations.push({ assetGroupAssetOperation: { create: { assetGroup: tempAssetGroupResourceName, asset: logoAssetResourceName, fieldType: "LOGO", status: "ENABLED" } } });
            compactLogs.push({ asset: logoAssetResourceName, fieldType: "LOGO" });
          }
        }

        createdAssetResourceNames.headlines.forEach(resourceName => {
          if (resourceName) {
            mutateOperations.push({ assetGroupAssetOperation: { create: { assetGroup: tempAssetGroupResourceName, asset: resourceName, fieldType: "HEADLINE", status: "ENABLED" } } });
            compactLogs.push({ asset: resourceName, fieldType: "HEADLINE" });
          }
        });
        createdAssetResourceNames.longHeadlines.forEach(resourceName => {
          if (resourceName) {
            mutateOperations.push({ assetGroupAssetOperation: { create: { assetGroup: tempAssetGroupResourceName, asset: resourceName, fieldType: "LONG_HEADLINE", status: "ENABLED" } } });
            compactLogs.push({ asset: resourceName, fieldType: "LONG_HEADLINE" });
          }
        });
        createdAssetResourceNames.descriptions.forEach(resourceName => {
          if (resourceName) {
            mutateOperations.push({ assetGroupAssetOperation: { create: { assetGroup: tempAssetGroupResourceName, asset: resourceName, fieldType: "DESCRIPTION", status: "ENABLED" } } });
            compactLogs.push({ asset: resourceName, fieldType: "DESCRIPTION" });
          }
        });
        createdAssetResourceNames.images.forEach(img => {
          if (img.resourceName) {
            mutateOperations.push({ assetGroupAssetOperation: { create: { assetGroup: tempAssetGroupResourceName, asset: img.resourceName, fieldType: img.fieldType, status: "ENABLED" } } });
            compactLogs.push({ asset: img.resourceName, fieldType: img.fieldType });
          }
        });

        console.log("[Website Traffic PMax] Prepared AssetGroup:", tempAssetGroupResourceName);
        console.log("[Website Traffic PMax] AssetGroupAssets to link:", JSON.stringify(compactLogs, null, 2));

        const mutateRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:mutate`, { mutateOperations }, { headers });
        const results = mutateRes.data.mutateOperationResponses;
        apiResult.assetGroupResourceName = results[0]?.assetGroupResult?.resourceName;
      } catch (err: any) {
        console.error(
          "[Google Ads API error for Website Traffic PMax Asset Group & Assets]:",
          JSON.stringify(err?.response?.data || err.message, null, 2)
        );
        throw err;
      }
    } catch (err: any) {
      console.error(
        "[Google Ads API error for Website Traffic Performance Max]:",
        JSON.stringify(err?.response?.data || err.message, null, 2)
      );
      throw err;
    }

    const localCampaign = await this.saveCampaignToDatabase({
      organizationId,
      customerId,
      googleAdsCampaignId: apiResult.campaignId || `pmax-${Date.now()}`,
      name: campaignName,
      campaignType: "PERFORMANCE_MAX",
      biddingStrategy: normalizedFocus,
      budget: amountMicrosVal / 1_000_000,
      budgetResourceName: apiResult.budgetResourceName || null,
      status: "PAUSED",
      finalUrl,
      headlines,
      descriptions,
      geoTargets: { objective: "Website Traffic", locations, languages },
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicrosVal),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Website Traffic Performance Max Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}