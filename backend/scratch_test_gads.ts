import prisma from "./src/utils/prisma";
import { GoogleAdsService } from "./src/services/googleAdsService";
import dotenv from "dotenv";

dotenv.config();

async function checkAndFetch() {
  console.log("=== ENV Check ===");
  console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "PRESENT" : "MISSING");
  console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "PRESENT" : "MISSING");
  console.log("GOOGLE_REFRESH_TOKEN:", process.env.GOOGLE_REFRESH_TOKEN ? "PRESENT" : "MISSING");
  console.log("GOOGLE_ADS_DEVELOPER_TOKEN:", process.env.GOOGLE_ADS_DEVELOPER_TOKEN ? "PRESENT" : "MISSING");
  console.log("GOOGLE_ADS_CUSTOMER_ID:", process.env.GOOGLE_ADS_CUSTOMER_ID || "Not set");

  const orgId = "demo-org-123";

  // Check if config exists or needs upsert from ENV
  let config = await prisma.googleBusinessConfig.findUnique({
    where: { organizationId: orgId }
  });

  console.log("\nExisting GoogleBusinessConfig in DB:", config);

  if (process.env.GOOGLE_REFRESH_TOKEN) {
    config = await prisma.googleBusinessConfig.upsert({
      where: { organizationId: orgId },
      update: {
        googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        ...(process.env.GOOGLE_ADS_CUSTOMER_ID ? { googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID } : {})
      },
      create: {
        organizationId: orgId,
        googleRefreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        googleClientId: process.env.GOOGLE_CLIENT_ID,
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
        googleAdsCustomerId: process.env.GOOGLE_ADS_CUSTOMER_ID || "",
        locationName: "",
        autoReplyEnabled: false,
        autoReplyMinRating: 4
      }
    });
    console.log("Updated/created DB config with ENV refresh token.");
  }

  try {
    console.log("\n=== Fetching Accessible Customers from Google Ads API ===");
    const resourceNames = await GoogleAdsService.listAccessibleCustomers(orgId);
    console.log("Accessible Customer Resource Names:", resourceNames);

    const customerIds = resourceNames.map((rn: string) => rn.split("/")[1]);
    console.log("Accessible Customer IDs:", customerIds);

    for (const cid of customerIds) {
      try {
        console.log(`\nTrying sub-account listing / check for customerId: ${cid}`);
        const subAccounts = await GoogleAdsService.listSubAccounts(orgId, cid);
        console.log(`Sub-accounts found under Manager ${cid}:`, JSON.stringify(subAccounts, null, 2));

        // Save into database
        await prisma.googleAdAccount.upsert({
          where: { organizationId_customerId: { organizationId: orgId, customerId: cid } },
          update: { isManager: subAccounts.length > 0 },
          create: { organizationId: orgId, customerId: cid, name: `Account (${cid})`, isManager: subAccounts.length > 0 }
        });

        for (const sub of subAccounts) {
          const subCid = String(sub.customerId);
          await prisma.googleAdAccount.upsert({
            where: { organizationId_customerId: { organizationId: orgId, customerId: subCid } },
            update: { name: sub.name, currencyCode: sub.currencyCode, timeZone: sub.timeZone, isManager: sub.isManager },
            create: { organizationId: orgId, customerId: subCid, name: sub.name, currencyCode: sub.currencyCode, timeZone: sub.timeZone, isManager: sub.isManager }
          });
        }
      } catch (err: any) {
        console.log(`Could not query details/sub-accounts for ${cid}:`, err?.response?.data || err?.message);
      }
    }

    const finalAdAccounts = await prisma.googleAdAccount.findMany({ where: { organizationId: orgId } });
    console.log("\n=== Final Saved Google Ad Accounts in DB ===");
    console.dir(finalAdAccounts, { depth: null });

  } catch (err: any) {
    console.error("Error fetching accessible customers:", err?.response?.data || err?.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkAndFetch();
