import dotenv from "dotenv";
dotenv.config();
import { GoogleAdsBaseService } from "../src/services/googleAds/shared/GoogleAdsBaseService";
import axios from "axios";
import prisma from "../src/utils/prisma";

async function verifyLeadFormOnly() {
  console.log("==================================================");
  console.log("CHECKING LEAD FORM LIVE STATUS (Google Ads API v24)");
  console.log("==================================================");

  const orgId = "demo-org-123";
  const { headers, customerId } = await (GoogleAdsBaseService as any).getAdsHeaders(orgId);
  const cid = customerId.replace(/-/g, "");
  const ADS_BASE = "https://googleads.googleapis.com/v24";

  console.log(`Using real authenticated customer ID: ${cid}`);

  let tempCampaignResource: string | null = null;
  let tempBudgetResource: string | null = null;
  let leadFormAssetResource: string | null = null;

  try {
    // 1. Create temporary budget and PAUSED campaign
    console.log("\n1. Creating temporary PAUSED Search campaign...");
    const budgetRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignBudgets:mutate`, {
      operations: [{
        create: {
          name: `Temp Budget LF Check ${Date.now()}`,
          amountMicros: "100000000",
          deliveryMethod: "STANDARD",
          explicitlyShared: false
        }
      }]
    }, { headers });
    tempBudgetResource = budgetRes.data.results[0].resourceName;

    const campaignRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaigns:mutate`, {
      operations: [{
        create: {
          name: `Temp WT Search LF Check ${Date.now()}`,
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
    tempCampaignResource = campaignRes.data.results[0].resourceName;
    console.log(`Campaign created successfully: ${tempCampaignResource}`);

    // 2. Attempt LeadFormAsset mutation
    console.log("\n2. Attempting LeadFormAsset live mutation...");
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

      leadFormAssetResource = lfAssetRes.data.results[0].resourceName;
      console.log(`>>> Lead Form Asset MUTATE SUCCESS: ${leadFormAssetResource}`);

      // 3. Attach CampaignAsset
      console.log("\n3. Attaching CampaignAsset (LEAD_FORM)...");
      const lfCaRes = await axios.post(`${ADS_BASE}/customers/${cid}/campaignAssets:mutate`, {
        operations: [{
          create: {
            campaign: tempCampaignResource,
            asset: leadFormAssetResource,
            fieldType: "LEAD_FORM",
            status: "ENABLED"
          }
        }]
      }, { headers });
      const caResource = lfCaRes.data.results[0].resourceName;
      console.log(`>>> CampaignAsset (LEAD_FORM) ATTACH SUCCESS: ${caResource}`);

      // 4. GAQL Read Verification
      console.log("\n4. Running GAQL Read Verification...");
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
      for (const row of rows) {
        console.log(` - FieldType: ${row.campaignAsset?.fieldType}, Asset: ${row.campaignAsset?.asset}, AssetType: ${row.asset?.type}, Status: ${row.campaignAsset?.status}`);
      }

      console.log("\nSTATUS: PASS - LEAD FORM FULLY LIVE VERIFIED");
    } catch (lfErr: any) {
      const errDetail = lfErr?.response?.data?.error?.details?.[0]?.errors?.[0];
      const errorMsg = errDetail?.message || lfErr?.response?.data?.error?.message || lfErr.message;
      const errorCode = errDetail?.errorCode ? JSON.stringify(errDetail.errorCode) : "UNKNOWN";
      console.log(`\nSTATUS: BLOCKED`);
      console.log(`Exact error code: ${errorCode}`);
      console.log(`Exact error message: ${errorMsg}`);
    }

  } finally {
    // 5. Cleanup temporary campaign
    if (tempCampaignResource) {
      console.log(`\n5. Safely removing temporary test campaign: ${tempCampaignResource}...`);
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

verifyLeadFormOnly().catch(err => {
  console.error("Execution error:", err);
  process.exit(1);
});
