import dotenv from "dotenv";
dotenv.config();
import { GoogleAdsBaseService } from "../src/services/googleAds/shared/GoogleAdsBaseService";
import axios from "axios";
import prisma from "../src/utils/prisma";

async function liveVerifyExtensions() {
  console.log("==================================================");
  console.log("LIVE GOOGLE ADS API EXTENSION VERIFICATION");
  console.log("==================================================");

  const orgId = "demo-org-123";
  const { headers, customerId } = await (GoogleAdsBaseService as any).getAdsHeaders(orgId);
  const cid = customerId.replace(/-/g, "");
  const ADS_BASE = "https://googleads.googleapis.com/v24";

  console.log(`Using real authenticated customer ID: ${cid}`);

  let tempCampaignResource: string | null = null;
  let tempBudgetResource: string | null = null;
  const createdAssets: Array<{ type: string; resourceName: string; fieldType: string }> = [];

  try {
    // 1. Create a temporary Budget and PAUSED Campaign for Website Traffic Search
    console.log("\n1. Creating temporary PAUSED Website Traffic Search campaign...");
    const budgetRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignBudgets:mutate`, {
      operations: [{
        create: {
          name: `Temp Budget Live Verify ${Date.now()}`,
          amountMicros: "100000000",
          deliveryMethod: "STANDARD",
          explicitlyShared: false
        }
      }]
    }, { headers });
    tempBudgetResource = budgetRes.data.results[0].resourceName;

    let campaignRes: any;
    try {
      campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
        operations: [{
          create: {
            name: `Temp WT Search Live Verify ${Date.now()}`,
            status: "PAUSED",
            advertisingChannelType: "SEARCH",
            campaignBudget: tempBudgetResource,
            containsEuPoliticalAdvertising: "DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING",
            networkSettings: {
              targetGoogleSearch: true,
              targetSearchNetwork: true
            },
            maximizeConversions: {}
          }
        }]
      }, { headers });
    } catch (cErr: any) {
      console.error("Campaign creation error message:", cErr?.response?.data?.error?.message);
      console.error("Campaign creation error details:", JSON.stringify(cErr?.response?.data?.error?.details, null, 2));
      throw cErr;
    }
    tempCampaignResource = campaignRes.data.results[0].resourceName;
    console.log(`Campaign created successfully: ${tempCampaignResource}`);

    // 2. Test Price Asset Mutation & Attachment
    console.log("\n2. Testing PriceAsset Live Mutation & Attachment...");
    try {
      const priceAssetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
        operations: [{
          create: {
            name: `Price LiveTest ${Date.now()}`,
            priceAsset: {
              type: "SERVICES",
              priceQualifier: "FROM",
              languageCode: "en",
              priceOfferings: [
                {
                  header: "SEO Audit",
                  description: "Full site technical audit",
                  price: { currencyCode: "INR", amountMicros: "5000000000" },
                  unit: "PER_MONTH",
                  finalUrl: "https://jisnu.in/services/seo"
                },
                {
                  header: "PPC Management",
                  description: "Google ads management",
                  price: { currencyCode: "INR", amountMicros: "7500000000" },
                  unit: "PER_MONTH",
                  finalUrl: "https://jisnu.in/services/ppc"
                },
                {
                  header: "Web Development",
                  description: "Custom web app build",
                  price: { currencyCode: "INR", amountMicros: "15000000000" },
                  unit: "PER_MONTH",
                  finalUrl: "https://jisnu.in/services/web"
                }
              ]
            }
          }
        }]
      }, { headers });
      const priceAssetResource = priceAssetRes.data.results[0].resourceName;
      console.log(`Price Asset created: ${priceAssetResource}`);
      createdAssets.push({ type: "PRICE", resourceName: priceAssetResource, fieldType: "PRICE" });

      const priceCaRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
        operations: [{
          create: {
            campaign: tempCampaignResource,
            asset: priceAssetResource,
            fieldType: "PRICE",
            status: "ENABLED"
          }
        }]
      }, { headers });
      console.log(`CampaignAsset (PRICE) attached: ${priceCaRes.data.results[0].resourceName}`);
    } catch (priceErr: any) {
      console.error("Price Asset error:", JSON.stringify(priceErr?.response?.data || priceErr.message));
    }

    // 3. Test Promotion Asset Mutation & Attachment
    console.log("\n3. Testing PromotionAsset Live Mutation & Attachment...");
    try {
      const promoAssetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
        operations: [{
          create: {
            name: `Promo LiveTest ${Date.now()}`,
            promotionAsset: {
              promotionTarget: "Digital Growth",
              languageCode: "en",
              percentOff: 200000
            },
            finalUrls: ["https://jisnu.in/offers"]
          }
        }]
      }, { headers });
      const promoAssetResource = promoAssetRes.data.results[0].resourceName;
      console.log(`Promotion Asset created: ${promoAssetResource}`);
      createdAssets.push({ type: "PROMOTION", resourceName: promoAssetResource, fieldType: "PROMOTION" });

      const promoCaRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
        operations: [{
          create: {
            campaign: tempCampaignResource,
            asset: promoAssetResource,
            fieldType: "PROMOTION",
            status: "ENABLED"
          }
        }]
      }, { headers });
      console.log(`CampaignAsset (PROMOTION) attached: ${promoCaRes.data.results[0].resourceName}`);
    } catch (promoErr: any) {
      console.error("Promotion Asset error:", JSON.stringify(promoErr?.response?.data || promoErr.message));
    }

    // 4. Test Lead Form Asset Mutation & Attachment
    console.log("\n4. Testing LeadFormAsset Live Mutation & Attachment...");
    try {
      const lfAssetRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, {
        operations: [{
          create: {
            name: `LeadForm LiveTest ${Date.now()}`,
            leadFormAsset: {
              businessName: "JISNU Digital",
              headline: "Get Free Consultation",
              description: "Connect with our growth experts to accelerate your digital presence.",
              privacyPolicyUrl: "https://jisnu.in/privacy",
              callToActionType: "LEARN_MORE",
              callToActionDescription: "Book now",
              postSubmitHeadline: "Thank you",
              postSubmitDescription: "We will contact you shortly.",
              fields: [
                { inputType: "FULL_NAME" },
                { inputType: "EMAIL" }
              ]
            }
          }
        }]
      }, { headers });
      const lfAssetResource = lfAssetRes.data.results[0].resourceName;
      console.log(`Lead Form Asset created: ${lfAssetResource}`);
      createdAssets.push({ type: "LEAD_FORM", resourceName: lfAssetResource, fieldType: "LEAD_FORM" });

      const lfCaRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
        operations: [{
          create: {
            campaign: tempCampaignResource,
            asset: lfAssetResource,
            fieldType: "LEAD_FORM",
            status: "ENABLED"
          }
        }]
      }, { headers });
      console.log(`CampaignAsset (LEAD_FORM) attached: ${lfCaRes.data.results[0].resourceName}`);
    } catch (lfErr: any) {
      const errDetail = lfErr?.response?.data?.error?.details?.[0]?.errors?.[0];
      const errorMsg = errDetail?.message || lfErr?.response?.data?.error?.message || lfErr.message;
      const errorCode = errDetail?.errorCode ? JSON.stringify(errDetail.errorCode) : "UNKNOWN";
      console.log(`Lead Form Asset live mutation response: BLOCKED (${errorCode} - ${errorMsg})`);
    }

    // 5. GAQL Read Verification
    if (tempCampaignResource) {
      console.log("\n5. GAQL Read Verification for Created Assets & CampaignAsset Associations...");
      const campaignId = (tempCampaignResource as string).split("/").pop();
      const gaqlQuery = `
        SELECT
          campaign.id,
          campaign_asset.campaign,
          campaign_asset.asset,
          campaign_asset.field_type,
          campaign_asset.status,
          asset.id,
          asset.name,
          asset.type
        FROM campaign_asset
        WHERE campaign.id = ${campaignId}
      `;

      const searchRes = await axios.post(`${ADS_BASE}/customers/${cid}/googleAds:search`, {
        query: gaqlQuery
      }, { headers });

      console.log("GAQL Query Results:");
      const rows = searchRes.data.results || [];
      if (rows.length === 0) {
        console.log("No campaign_asset records returned by GAQL.");
      } else {
        for (const row of rows) {
          console.log(` - FieldType: ${row.campaignAsset?.fieldType}, Asset: ${row.campaignAsset?.asset}, AssetType: ${row.asset?.type}, Status: ${row.campaignAsset?.status}`);
        }
      }
    }

  } finally {
    // 6. Cleanup / Safe Removal of Temporary Campaign
    if (tempCampaignResource) {
      console.log(`\n6. Safely removing temporary test campaign: ${tempCampaignResource}...`);
      try {
        await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
          operations: [{
            remove: tempCampaignResource
          }]
        }, { headers });
        console.log(`Temporary campaign ${tempCampaignResource} successfully removed.`);
      } catch (removeErr: any) {
        console.error("Failed to remove test campaign:", removeErr?.response?.data || removeErr.message);
      }
    }
    await (prisma as any).$disconnect();
  }
}

liveVerifyExtensions().catch(err => {
  console.error("Script execution failed:", err);
  process.exit(1);
});
