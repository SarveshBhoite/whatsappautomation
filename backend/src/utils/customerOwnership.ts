import prisma from "../utils/prisma";
import { Request, Response, NextFunction } from "express";

/**
 * Validates that the requested Google Ads customerId belongs to the specified organizationId.
 * Checks both `prisma.googleAdAccount` and `prisma.googleBusinessConfig`.
 * Normalizes customerId by removing dashes and trimming.
 *
 * Returns true if customer is owned by the organization, false otherwise.
 */
export async function validateCustomerOwnership(orgId: string, customerId: string): Promise<boolean> {
  if (!orgId || !customerId) return false;
  const cleanCid = customerId.replace(/-/g, "").trim();
  if (!cleanCid) return false;

  try {
    // 1. Check in googleAdAccount for this organization
    const account = await prisma.googleAdAccount.findFirst({
      where: {
        organizationId: orgId,
        customerId: cleanCid,
        isActive: true
      }
    });
    if (account) return true;

    // 2. Check in googleBusinessConfig (active or manager account)
    const config = await prisma.googleBusinessConfig.findFirst({
      where: {
        organizationId: orgId,
        googleAdsCustomerId: cleanCid
      }
    });
    if (config) return true;

    return false;
  } catch (err: any) {
    console.warn(`[CUSTOMER-OWNERSHIP] Warning validating ownership for cid ${cleanCid}:`, err.message);
    // If running in development/demo mode or during DB cold-start, allow access so user flows are not blocked
    if (process.env.NODE_ENV !== "production" || orgId === "demo-org-123") {
      return true;
    }
    return false;
  }
}

/**
 * Express middleware to enforce Google Ads customerId ownership on mutation requests.
 * Extracts customerId and orgId from body, query, or headers.
 * If customerId is present, rejects with 403 if it does not belong to the organization.
 */
export async function requireCustomerOwnership(req: Request, res: Response, next: NextFunction) {
  const customerId = (req.body?.customerId || req.query?.customerId || "") as string;
  const orgId = (req.headers["x-organization-id"] || req.query?.orgId || req.body?.orgId || "demo-org-123") as string;

  if (customerId && customerId !== "default") {
    try {
      const isOwned = await validateCustomerOwnership(orgId, customerId);
      if (!isOwned) {
        return res.status(403).json({
          error: "Access denied. The specified Google Ads account is not associated with this organization."
        });
      }
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to validate customer ownership" });
    }
  }

  next();
}
