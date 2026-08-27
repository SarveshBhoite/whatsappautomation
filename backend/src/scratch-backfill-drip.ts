import prisma from "./utils/prisma";

async function backfill() {
  const defaultWa = await (prisma as any).whatsAppConfig.findFirst({ where: { isDefault: true } });
  if (defaultWa) {
    const res = await (prisma as any).whatsAppDripCampaign.updateMany({
      where: { whatsappConfigId: null },
      data: {
        whatsappConfigId: defaultWa.id,
        phoneNumberId: defaultWa.phoneNumberId,
        wabaId: defaultWa.wabaId
      }
    });
    console.log(`✅ Updated ${res.count} legacy drip campaigns to default WhatsApp number (${defaultWa.phoneNumber})`);
  }
  await prisma.$disconnect();
}

backfill().catch(console.error);
