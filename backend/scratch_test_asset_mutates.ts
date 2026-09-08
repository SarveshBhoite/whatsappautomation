import prisma from "./src/utils/prisma";
import { GoogleAdsBaseService } from "./src/services/googleAds/shared/GoogleAdsBaseService";
import axios from "axios";

async function testMutateExtensions() {
  const orgId = "demo-org-123";
  const baseService: any = GoogleAdsBaseService;
  const { headers, customerId } = await baseService.getAdsHeaders(orgId);
  const ADS_BASE = "https://googleads.googleapis.com/v24";
  const cid = customerId;

  console.log("Testing LeadForm, Price, and Promotion asset creation on customer:", cid);

  // 1. Test LeadFormAsset
  console.log("\n--- 1. Testing LeadFormAsset ---");
  try {
    const lfPayload = {
      operations: [{
        create: {
          name: `Test LeadForm - ${Date.now()}`,
          leadFormAsset: {
            businessName: "JISNU Digital",
            headline: "Get Free Digital Consultation",
            description: "Contact our team to get personalized growth advice.",
            privacyPolicyUrl: "https://www.jisnudigital.com/privacy",
            callToActionType: "LEARN_MORE",
            callToActionDescription: "Apply today",
            postSubmitHeadline: "Thank you",
            postSubmitDescription: "We will contact you shortly",
            fields: [
              { inputType: "FULL_NAME" },
              { inputType: "EMAIL" },
              { inputType: "PHONE_NUMBER" }
            ]
          }
        }
      }]
    };
    const lfRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, lfPayload, { headers });
    console.log("LeadFormAsset SUCCESS:", JSON.stringify(lfRes.data));
  } catch (err: any) {
    console.error("LeadFormAsset FAILED:", JSON.stringify(err?.response?.data || err.message, null, 2));
  }

  // 2. Test PriceAsset
  console.log("\n--- 2. Testing PriceAsset ---");
  try {
    const pricePayload = {
      operations: [{
        create: {
          name: `Test Price - ${Date.now()}`,
          priceAsset: {
            type: "SERVICES",
            priceQualifier: "FROM",
            languageCode: "en",
            priceOfferings: [
              {
                header: "Basic SEO Plan",
                description: "Local SEO optimization",
                price: {
                  currencyCode: "INR",
                  amountMicros: "5000000000"
                },
                unit: "PER_MONTH",
                finalUrl: "https://www.jisnudigital.com/services"
              },
              {
                header: "Pro Growth Plan",
                description: "Full search engine marketing",
                price: {
                  currencyCode: "INR",
                  amountMicros: "10000000000"
                },
                unit: "PER_MONTH",
                finalUrl: "https://www.jisnudigital.com/services"
              },
              {
                header: "Enterprise Plan",
                description: "Complete digital growth suite",
                price: {
                  currencyCode: "INR",
                  amountMicros: "25000000000"
                },
                unit: "PER_MONTH",
                finalUrl: "https://www.jisnudigital.com/services"
              }
            ]
          }
        }
      }]
    };
    const priceRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, pricePayload, { headers });
    console.log("PriceAsset SUCCESS:", JSON.stringify(priceRes.data));
  } catch (err: any) {
    console.error("PriceAsset FAILED:", JSON.stringify(err?.response?.data || err.message, null, 2));
  }

  // 3. Test PromotionAsset
  console.log("\n--- 3. Testing PromotionAsset ---");
  try {
    const promoPayload = {
      operations: [{
        create: {
          name: `Test Promo - ${Date.now()}`,
          promotionAsset: {
            promotionTarget: "Digital Marketing Audit",
            discountModifier: "UP_TO",
            percentOff: 200000, // 20%
            languageCode: "en"
          },
          finalUrls: ["https://www.jisnudigital.com"]
        }
      }]
    };
    const promoRes = await axios.post(`${ADS_BASE}/customers/${cid}/assets:mutate`, promoPayload, { headers });
    console.log("PromotionAsset SUCCESS:", JSON.stringify(promoRes.data));
  } catch (err: any) {
    console.error("PromotionAsset FAILED:", JSON.stringify(err?.response?.data || err.message, null, 2));
  }

  await (prisma as any).$disconnect();
}

testMutateExtensions();
