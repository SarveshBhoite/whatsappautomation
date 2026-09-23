import prisma from "./src/utils/prisma";
import { GoogleAdsBaseService } from "./src/services/googleAds/shared/GoogleAdsBaseService";
import axios from "axios";

async function testMutatePriceAndPromo() {
  const orgId = "demo-org-123";
  const baseService: any = GoogleAdsBaseService;
  const { headers, customerId } = await baseService.getAdsHeaders(orgId);
  const ADS_BASE = "https://googleads.googleapis.com/v24";
  const cid = customerId;

  console.log("Testing Price and Promotion asset creation with exact field length constraints on customer:", cid);

  // 1. Test PriceAsset (header max 25 chars, description max 25 chars)
  console.log("\n--- Testing PriceAsset ---");
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
                header: "Basic SEO",
                description: "Local SEO audit",
                price: {
                  currencyCode: "INR",
                  amountMicros: "5000000000"
                },
                unit: "PER_MONTH",
                finalUrl: "https://www.jisnudigital.com/services"
              },
              {
                header: "Pro SEO Plan",
                description: "Full search growth",
                price: {
                  currencyCode: "INR",
                  amountMicros: "10000000000"
                },
                unit: "PER_MONTH",
                finalUrl: "https://www.jisnudigital.com/services"
              },
              {
                header: "Enterprise Plan",
                description: "Complete digital ads",
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

  // 2. Test PromotionAsset (promotionTarget max 20 chars)
  console.log("\n--- Testing PromotionAsset ---");
  try {
    const promoPayload = {
      operations: [{
        create: {
          name: `Test Promo - ${Date.now()}`,
          promotionAsset: {
            promotionTarget: "Digital Growth",
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

testMutatePriceAndPromo();
