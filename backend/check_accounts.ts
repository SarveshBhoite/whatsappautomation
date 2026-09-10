import prisma from "./src/utils/prisma";

async function main() {
  const configs = await prisma.googleBusinessConfig.findMany();
  console.log("googleBusinessConfig count:", configs.length);
  for (const c of configs) {
    console.log("orgId:", c.organizationId, "hasRefreshToken:", Boolean(c.googleRefreshToken), "savedCid:", c.googleAdsCustomerId);
  }
  const accounts = await prisma.googleAdAccount.findMany();
  console.log("googleAdAccount count:", accounts.length);
  for (const a of accounts) {
    console.log("account orgId:", a.organizationId, "cid:", a.customerId, "descriptiveName:", a.descriptiveName, "isManager:", a.isManager);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
