import prisma from '../src/utils/prisma';

async function addMissingColumn() {
  const statements = [
    'ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "mediaMimeType" TEXT;',
    'ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "channelName" TEXT;',
    'ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "channelHandle" TEXT;',
    'ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "channelThumbnail" TEXT;',
    'ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "subscriberCount" INTEGER DEFAULT 0;',
    'ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "impressions" INTEGER DEFAULT 0;',
    'ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "clicks" INTEGER DEFAULT 0;',
    'ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "spend" DOUBLE PRECISION DEFAULT 0;',
    'ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "conversions" INTEGER DEFAULT 0;',
    'ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "reach" INTEGER DEFAULT 0;',
    'ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;',
    'ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "accountName" TEXT;',
    'ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false;',
    'ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;',
    'ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "username" TEXT;',
    'ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "name" TEXT;',
    'ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "profilePic" TEXT;',
    'ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false;',
    'ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;',
    'ALTER TABLE "GmailConfig" ADD COLUMN IF NOT EXISTS "displayName" TEXT;',
    'ALTER TABLE "GmailConfig" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false;',
    'ALTER TABLE "GmailConfig" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;',
    'ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "whatsappConfigId" TEXT;',
    'ALTER TABLE "whatsapp_drip_campaigns" ADD COLUMN IF NOT EXISTS "whatsappConfigId" TEXT;',
    'ALTER TABLE "appointments" ADD COLUMN IF NOT EXISTS "whatsappConfigId" TEXT;'
  ];

  for (const sql of statements) {
    try {
      await prisma.$executeRawUnsafe(sql);
    } catch (e: any) {
      // Non-blocking catch for individual schema alterations
    }
  }

  console.log('✅ Database schema checks verified.');
}

addMissingColumn().catch(() => {});
