import prisma from "../../../utils/prisma";
import { GoogleAdsBaseService } from "../shared/GoogleAdsBaseService";

export interface DemandGenMinimumRecord {
  minimumAmount: number;
  minimumMicros: string;
  currencyCode: string;
  source: string;
  lastObservedAt: string;
  expiresAt: string;
  isAuthoritative: boolean;
}

/**
 * Service to manage and persist dynamic Demand Gen minimum daily budget requirements
 * per Google Ads customer and account currency without manual exchange rate calculations.
 *
 * Persisted in the database under `GoogleAdsCustomerProfile.metadata.demandGenMinimum`
 * and cached in memory with a 24-hour TTL for optimal performance.
 */
export class DemandGenMinimumService extends GoogleAdsBaseService {
  // In-memory cache keyed by "customerId_currencyCode"
  private static memoryCache: Map<string, { record: DemandGenMinimumRecord; expiresAtMs: number }> = new Map();
  // 24-hour TTL for memory and DB refresh
  private static CACHE_TTL_MS = 24 * 60 * 60 * 1000;

  /**
   * Record or update an authoritative minimum observed directly from Google Ads API
   * via BudgetPerDayMinimumErrorDetails (e.g. from an actual campaign create error).
   * Persists immediately to the database under GoogleAdsCustomerProfile.metadata.
   */
  public static async recordObservedMinimum(
    organizationId: string,
    customerId: string,
    currencyCode: string,
    minimumMicros: string | number
  ): Promise<void> {
    const cleanCid = (customerId || "").replace(/-/g, "").trim();
    const curr = (currencyCode || "INR").toUpperCase();
    const microsNum = Number(minimumMicros);
    if (!cleanCid || isNaN(microsNum) || microsNum <= 0) return;

    const units = Math.round((microsNum / 1_000_000) * 100) / 100;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.CACHE_TTL_MS);

    const record: DemandGenMinimumRecord = {
      minimumAmount: units,
      minimumMicros: String(minimumMicros),
      currencyCode: curr,
      source: "GOOGLE_ADS_API_ERROR_DETAILS",
      lastObservedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      isAuthoritative: true,
    };

    // 1. Update in-memory cache immediately
    const key = `${cleanCid}_${curr}`;
    this.memoryCache.set(key, {
      record,
      expiresAtMs: expiresAt.getTime(),
    });

    // 2. Persist to database asynchronously
    try {
      const existingProfile = await (prisma as any).googleAdsCustomerProfile.findFirst({
        where: { customerId: cleanCid },
      });

      if (existingProfile) {
        const metadata = (existingProfile.metadata as Record<string, any>) || {};
        metadata.demandGenMinimumByCurrency = metadata.demandGenMinimumByCurrency || {};
        metadata.demandGenMinimumByCurrency[curr] = record;
        metadata.demandGenMinimum = record;

        await (prisma as any).googleAdsCustomerProfile.update({
          where: { id: existingProfile.id },
          data: { metadata },
        });
      } else if (organizationId) {
        // Create profile draft if not yet existing
        const metadata: Record<string, any> = {
          demandGenMinimumByCurrency: {
            [curr]: record,
          },
          demandGenMinimum: record,
        };

        await (prisma as any).googleAdsCustomerProfile.create({
          data: {
            organizationId,
            customerId: cleanCid,
            metadata,
          },
        });
      }
    } catch (err: any) {
      console.warn(`[DemandGenMinimumService] Failed to persist observed minimum to DB:`, err?.message);
    }
  }

  /**
   * Retrieves the current minimum daily budget for a given customer & currency.
   * If a valid authoritative record exists (in memory or in the database),
   * it returns that exact record.
   * If no valid minimum is known yet or it has expired, returns null.
   */
  public static async getMinimumForCustomer(
    organizationId: string,
    customerId: string,
    currencyCode?: string
  ): Promise<DemandGenMinimumRecord | null> {
    const cleanCid = (customerId || "").replace(/-/g, "").trim();
    if (!cleanCid) return null;
    const curr = (currencyCode || "INR").toUpperCase();
    const key = `${cleanCid}_${curr}`;

    // 1. Check in-memory cache
    const inMem = this.memoryCache.get(key);
    if (inMem && Date.now() < inMem.expiresAtMs) {
      return inMem.record;
    }

    // 2. Fallback to database
    try {
      const profile = await (prisma as any).googleAdsCustomerProfile.findFirst({
        where: { customerId: cleanCid },
        select: { metadata: true },
      });

      const metadata = (profile?.metadata as Record<string, any>) || {};
      const byCurrency = metadata.demandGenMinimumByCurrency?.[curr];
      const general = metadata.demandGenMinimum?.currencyCode === curr ? metadata.demandGenMinimum : null;
      const dbRecord = byCurrency || general;

      if (dbRecord && dbRecord.currencyCode === curr && dbRecord.minimumAmount > 0) {
        const expTime = dbRecord.expiresAt ? new Date(dbRecord.expiresAt).getTime() : 0;
        // Verify TTL hasn't expired (or if no expiresAt, allow 24h from lastObservedAt)
        const isValid = expTime > Date.now() || (!expTime && dbRecord.lastObservedAt && Date.now() - new Date(dbRecord.lastObservedAt).getTime() < this.CACHE_TTL_MS);

        if (isValid) {
          // Re-populate in-memory cache
          this.memoryCache.set(key, {
            record: dbRecord,
            expiresAtMs: expTime > Date.now() ? expTime : Date.now() + this.CACHE_TTL_MS,
          });
          return dbRecord;
        }
      }
    } catch (err: any) {
      console.warn(`[DemandGenMinimumService] Error reading persisted minimum from DB:`, err?.message);
    }

    return null;
  }
}
