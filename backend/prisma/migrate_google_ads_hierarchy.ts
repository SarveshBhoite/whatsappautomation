import prisma from '../src/utils/prisma';

async function migrateGoogleAdsHierarchy() {
  console.log("Starting Google Ads Campaign Hierarchy DB migration...");

  const ddlStatements = [
    // 1. GoogleAdGroup enhancements
    `ALTER TABLE "GoogleAdGroup" ADD COLUMN IF NOT EXISTS "cpcBidMicros" BIGINT;`,
    `ALTER TABLE "GoogleAdGroup" ADD COLUMN IF NOT EXISTS "cpcBid" DOUBLE PRECISION;`,

    // 2. GoogleAd enhancements
    `ALTER TABLE "GoogleAd" ADD COLUMN IF NOT EXISTS "name" TEXT;`,
    `ALTER TABLE "GoogleAd" ADD COLUMN IF NOT EXISTS "adType" TEXT DEFAULT 'RESPONSIVE_SEARCH_AD';`,
    `ALTER TABLE "GoogleAd" ADD COLUMN IF NOT EXISTS "adStrength" TEXT;`,

    // 3. GoogleAdKeyword enhancements
    `ALTER TABLE "GoogleAdKeyword" ADD COLUMN IF NOT EXISTS "cpcBidMicros" BIGINT;`,

    // 4. Create GoogleAdAsset table if not exists
    `CREATE TABLE IF NOT EXISTS "GoogleAdAsset" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "customerId" TEXT,
      "assetType" TEXT NOT NULL,
      "name" TEXT,
      "source" TEXT,
      "mimeType" TEXT,
      "url" TEXT,
      "storageKey" TEXT,
      "googleAdsAssetId" TEXT,
      "googleAdsAssetResourceName" TEXT,
      "metadata" JSONB,
      "status" TEXT NOT NULL DEFAULT 'ENABLED',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "GoogleAdAsset_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    // 5. Create GoogleAdAssetLinkage table if not exists
    `CREATE TABLE IF NOT EXISTS "GoogleAdAssetLinkage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "organizationId" TEXT NOT NULL,
      "customerId" TEXT,
      "assetId" TEXT NOT NULL,
      "campaignId" TEXT,
      "adGroupId" TEXT,
      "adId" TEXT,
      "assetFieldType" TEXT NOT NULL,
      "googleAdsFieldType" TEXT,
      "googleAdsLinkResourceName" TEXT,
      "status" TEXT NOT NULL DEFAULT 'ENABLED',
      "metadata" JSONB,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "GoogleAdAssetLinkage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "GoogleAdAssetLinkage_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "GoogleAdAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "GoogleAdAssetLinkage_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "GoogleAdCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "GoogleAdAssetLinkage_adGroupId_fkey" FOREIGN KEY ("adGroupId") REFERENCES "GoogleAdGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "GoogleAdAssetLinkage_adId_fkey" FOREIGN KEY ("adId") REFERENCES "GoogleAd"("id") ON DELETE CASCADE ON UPDATE CASCADE
    );`,

    // 6. Safe Indexes
    `CREATE INDEX IF NOT EXISTS "GoogleAdCampaign_organizationId_customerId_idx" ON "GoogleAdCampaign"("organizationId", "customerId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdCampaign_googleAdsCampaignId_idx" ON "GoogleAdCampaign"("googleAdsCampaignId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdGroup_organizationId_customerId_idx" ON "GoogleAdGroup"("organizationId", "customerId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdGroup_campaignId_idx" ON "GoogleAdGroup"("campaignId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdGroup_googleAdGroupId_idx" ON "GoogleAdGroup"("googleAdGroupId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAd_organizationId_customerId_idx" ON "GoogleAd"("organizationId", "customerId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAd_adGroupId_idx" ON "GoogleAd"("adGroupId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAd_googleAdId_idx" ON "GoogleAd"("googleAdId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdKeyword_organizationId_customerId_idx" ON "GoogleAdKeyword"("organizationId", "customerId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdKeyword_adGroupId_idx" ON "GoogleAdKeyword"("adGroupId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdKeyword_googleKeywordId_idx" ON "GoogleAdKeyword"("googleKeywordId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAsset_organizationId_idx" ON "GoogleAdAsset"("organizationId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAsset_organizationId_customerId_idx" ON "GoogleAdAsset"("organizationId", "customerId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAsset_googleAdsAssetId_idx" ON "GoogleAdAsset"("googleAdsAssetId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAssetLinkage_organizationId_idx" ON "GoogleAdAssetLinkage"("organizationId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAssetLinkage_assetId_idx" ON "GoogleAdAssetLinkage"("assetId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAssetLinkage_campaignId_idx" ON "GoogleAdAssetLinkage"("campaignId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAssetLinkage_adGroupId_idx" ON "GoogleAdAssetLinkage"("adGroupId");`,
    `CREATE INDEX IF NOT EXISTS "GoogleAdAssetLinkage_adId_idx" ON "GoogleAdAssetLinkage"("adId");`,

    // 7. Partial Unique Indexes for Concurrency & Deduplication Protection
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_google_ad_asset_org_url" ON "GoogleAdAsset"("organizationId", "url") WHERE "url" IS NOT NULL;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_google_ad_asset_linkage_campaign" ON "GoogleAdAssetLinkage"("organizationId", "campaignId", "assetId", "assetFieldType") WHERE "campaignId" IS NOT NULL;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_google_ad_asset_linkage_adgroup" ON "GoogleAdAssetLinkage"("organizationId", "adGroupId", "assetId", "assetFieldType") WHERE "adGroupId" IS NOT NULL;`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "uq_google_ad_asset_linkage_ad" ON "GoogleAdAssetLinkage"("organizationId", "adId", "assetId", "assetFieldType") WHERE "adId" IS NOT NULL;`
  ];

  for (const sql of ddlStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("Executed SQL successfully:", sql.split("\n")[0].slice(0, 60));
    } catch (err: any) {
      console.warn("SQL warning/skip:", err.message);
    }
  }

  console.log("Google Ads hierarchy migration complete!");
  (globalThis as any).process?.exit(0);
}

migrateGoogleAdsHierarchy().catch((e) => {
  console.error("Migration failed:", e);
  (globalThis as any).process?.exit(1);
});
