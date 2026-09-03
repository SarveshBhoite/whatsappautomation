import prisma from '../src/utils/prisma';

async function addMissingColumn() {
  try {
    await prisma.$executeRawUnsafe('ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "mediaMimeType" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "channelName" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "channelHandle" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "channelThumbnail" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "YouTubeConfig" ADD COLUMN IF NOT EXISTS "subscriberCount" INTEGER DEFAULT 0;');
    await prisma.$executeRawUnsafe('ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "impressions" INTEGER DEFAULT 0;');
    await prisma.$executeRawUnsafe('ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "clicks" INTEGER DEFAULT 0;');
    await prisma.$executeRawUnsafe('ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "spend" DOUBLE PRECISION DEFAULT 0;');
    await prisma.$executeRawUnsafe('ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "conversions" INTEGER DEFAULT 0;');
    await prisma.$executeRawUnsafe('ALTER TABLE "MetaAdCampaign" ADD COLUMN IF NOT EXISTS "reach" INTEGER DEFAULT 0;');
    
    // WhatsAppConfig missing columns
    await prisma.$executeRawUnsafe('ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "accountName" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false;');
    await prisma.$executeRawUnsafe('ALTER TABLE "WhatsAppConfig" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;');

    // InstagramConfig missing columns
    await prisma.$executeRawUnsafe('ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "username" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "name" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "profilePic" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false;');
    await prisma.$executeRawUnsafe('ALTER TABLE "InstagramConfig" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;');

    // GmailConfig missing columns
    await prisma.$executeRawUnsafe('ALTER TABLE "GmailConfig" ADD COLUMN IF NOT EXISTS "displayName" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "GmailConfig" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN DEFAULT false;');
    await prisma.$executeRawUnsafe('ALTER TABLE "GmailConfig" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;');

    // Conversation missing columns for multi-account routing
    await prisma.$executeRawUnsafe('ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "phoneNumberId" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "accountHandle" TEXT;');

    // GoogleBusinessConfig missing columns
    await prisma.$executeRawUnsafe('ALTER TABLE "GoogleBusinessConfig" ADD COLUMN IF NOT EXISTS "googleEmail" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "GoogleBusinessConfig" ADD COLUMN IF NOT EXISTS "googleName" TEXT;');
    await prisma.$executeRawUnsafe('ALTER TABLE "GoogleBusinessConfig" ADD COLUMN IF NOT EXISTS "googlePicture" TEXT;');

    // Drop legacy single-account unique constraints if present in old PostgreSQL DB
    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS "WhatsAppConfig_organizationId_key" CASCADE;');
    await prisma.$executeRawUnsafe('DROP INDEX IF EXISTS "InstagramConfig_organizationId_key" CASCADE;');

    // Backfill legacy NULL phoneNumberId conversations to default WhatsApp number
    await prisma.$executeRawUnsafe(`
      UPDATE "Conversation" 
      SET "phoneNumberId" = '1192785647248309' 
      WHERE "platform" = 'whatsapp' AND "phoneNumberId" IS NULL;
    `);

    console.log('✅ Database columns & multi-tenant indexes confirmed to exist in PostgreSQL!');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumn();
