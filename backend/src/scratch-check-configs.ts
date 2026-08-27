import prisma from "./utils/prisma";

async function main() {
  const configs = await (prisma as any).whatsAppConfig.findMany();
  console.log("=== WhatsApp Configs in DB ===");
  console.log(JSON.stringify(configs, null, 2));

  const campaigns = await (prisma as any).whatsAppDripCampaign.findMany();
  console.log("=== WhatsApp Drip Campaigns in DB ===");
  console.log(JSON.stringify(campaigns.map((c: any) => ({
    id: c.id,
    name: c.name,
    organizationId: c.organizationId,
    whatsappConfigId: c.whatsappConfigId,
    phoneNumberId: c.phoneNumberId,
    wabaId: c.wabaId
  })), null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
