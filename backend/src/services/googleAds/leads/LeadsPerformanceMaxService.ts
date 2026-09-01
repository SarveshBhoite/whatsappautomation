import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";
import axios from "axios";

export class LeadsPerformanceMaxService extends GoogleAdsBaseService {
  public static async createCampaign(organizationId: string, customerId: string, payload: any) {
    const {
      campaignName = "Leads Performance Max",
      assetGroupName = "Asset Group 1",
      finalUrl,
      amountMicros,
      biddingFocus = "Maximize conversions",
      targetCpaMicros,
      targetRoas,
      locations = ["India"],
      languages = ["English"],
      headlines = [],
      descriptions = [],
      dailyBudget = 1000,
      euPolitical = "NO",
      businessName,
      logos = []
    } = payload;

    if (!finalUrl) throw new Error("Final URL is required.");

    const cid = (customerId || "").replace(/-/g, "").trim();
    const amountMicrosVal = amountMicros || Math.round(Number(dailyBudget) * 1_000_000);

    let biddingConfig: any = {};
    const normalizedFocus = biddingFocus.trim().toLowerCase();
    if (normalizedFocus === "maximize conversion value" || normalizedFocus === "target roas") {
      biddingConfig = { maximizeConversionValue: targetRoas ? { targetRoas: Number(targetRoas) } : {} };
    } else {
      biddingConfig = { maximizeConversions: targetCpaMicros ? { targetCpaMicros: String(targetCpaMicros) } : {} };
    }

    let apiResult: any = { campaignId: `leads-pmax-${Date.now()}` };
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
        try {
          const bnPayload = {
            operations: [{
              create: {
                type: "TEXT",
                textAsset: { text: businessName },
                name: `Business Name: ${businessName.substring(0, 50)}`
              }
            }]
          };
          const bnRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, bnPayload, { headers });
          businessNameAssetResourceName = bnRes.data.results?.[0]?.resourceName;
        } catch (err: any) {
          console.error("[Leads PMax] Failed to create Business Name asset:", err?.response?.data || err.message);
        }
      }

      let logoAssetResourceName;
      if (logos && logos.length > 0 && typeof logos[0] === "string" && logos[0].includes("base64,")) {
        try {
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
        } catch (err: any) {
          console.error("[Leads PMax] Failed to create Logo asset:", err?.response?.data || err.message);
        }
      }

      // CampaignAsset Linking
      if (businessNameAssetResourceName || logoAssetResourceName) {
        try {
          const caOperations = [];
          if (businessNameAssetResourceName) {
            caOperations.push({
              create: {
                campaign: campaignRef,
                asset: businessNameAssetResourceName,
                fieldType: "BUSINESS_NAME"
              }
            });
          }
          if (logoAssetResourceName) {
            caOperations.push({
              create: {
                campaign: campaignRef,
                asset: logoAssetResourceName,
                fieldType: "LOGO"
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
            "[Leads PMax] CampaignAsset linking failed:",
            JSON.stringify(err?.response?.data || err.message, null, 2)
          );
          throw err;
        }
      }

      // AssetGroup Creation
      try {
        const assetGroupPayload = {
          operations: [{
            create: {
              campaign: campaignRef,
              name: assetGroupName,
              status: "ENABLED"
            }
          }]
        };
        const assetGroupRes = await axios.post(`${ADS_BASE}/customers/${cid}/assetGroups:mutate`, assetGroupPayload, { headers });
        const assetGroupRef = assetGroupRes.data.results?.[0]?.resourceName;
        apiResult.assetGroupResourceName = assetGroupRef;
      } catch (err: any) {
        console.error(
          "[Google Ads API error for Leads Performance Max Asset Group]:",
          JSON.stringify(err?.response?.data || err.message, null, 2)
        );
        throw err;
      }
    } catch (err: any) {
      console.error(
        "[Google Ads API error for Leads Performance Max]:",
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
      geoTargets: { objective: "Leads", locations, languages },
      advertisingChannelType: "PERFORMANCE_MAX",
      amountMicros: BigInt(amountMicrosVal),
      costMicros: BigInt(0),
      impressions: BigInt(0),
      clicks: BigInt(0)
    });

    return {
      message: "Leads Performance Max Campaign created successfully (Paused)",
      campaign: { ...localCampaign, amountMicros: Number(localCampaign.amountMicros), costMicros: Number(localCampaign.costMicros), impressions: Number(localCampaign.impressions), clicks: Number(localCampaign.clicks) },
      apiResult
    };
  }
}