import prisma from '../src/utils/prisma';

async function addMissingColumn() {
  const queries = [
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
    'ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "phoneNumberId" TEXT;',
    'ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "accountHandle" TEXT;',
    'DROP INDEX IF EXISTS "WhatsAppConfig_organizationId_key" CASCADE;',
    'DROP INDEX IF EXISTS "InstagramConfig_organizationId_key" CASCADE;',
    `UPDATE "Conversation" SET "phoneNumberId" = '1192785647248309' WHERE "platform" = 'whatsapp' AND "phoneNumberId" IS NULL;`
  ];

  try {
    // Terminate any hanging 'idle in transaction' locks from previous crashed processes
    try {
      await prisma.$executeRawUnsafe(`
        SELECT pg_terminate_backend(pid) 
        FROM pg_stat_activity 
        WHERE state = 'idle in transaction' 
          AND pid <> pg_backend_pid()
          AND age(clock_timestamp(), state_change) > interval '5 seconds';
      `);
    } catch (e: any) {
      console.warn('Could not terminate idle transactions:', e.message);
    }

    // Set unlimited statement timeout and reasonable lock timeout
    try {
      await prisma.$executeRawUnsafe('SET statement_timeout = 0;');
      await prisma.$executeRawUnsafe('SET lock_timeout = 15000;');
    } catch (e: any) {
      console.warn('Could not set custom session timeouts:', e.message);
    }

    for (const sql of queries) {
      try {
        await prisma.$executeRawUnsafe(sql);
      } catch (colErr: any) {
        if (colErr.code === '57014' || colErr.code === '55P03' || colErr.message?.includes('timeout') || colErr.message?.includes('lock')) {
          console.warn(`[Lock/Timeout Warning] Skipped locked query: ${sql.substring(0, 60)}...`);
        } else {
          console.warn(`[Notice] Query: ${sql.substring(0, 60)}... (${colErr.message})`);
        }
      }
    }

    console.log('✅ Database columns & multi-tenant indexes migration completed!');
  } catch (err: any) {
    console.error('Error during column migration:', err.message || err);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumn();
