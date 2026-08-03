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
    console.log('✅ Database columns confirmed to exist in PostgreSQL!');
  } catch (err) {
    console.error('Error adding column:', err);
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumn();
