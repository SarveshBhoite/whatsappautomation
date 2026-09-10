import prisma from "./src/utils/prisma";

async function main() {
  const campaigns = await prisma.googleAdCampaign.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });
  console.log("Recent campaigns count:", campaigns.length);
  for (const c of campaigns) {
    console.log("ID:", c.id, "Name:", c.name, "Type:", c.campaignType);
    console.log("geoTargets:", JSON.stringify(c.geoTargets).slice(0, 300));
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
