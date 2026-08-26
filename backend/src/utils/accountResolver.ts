import { Request, Response } from "express";
import prisma from "./prisma";

export type PlatformType = 
  | "whatsapp" 
  | "instagram" 
  | "gmail" 
  | "youtube" 
  | "linkedin" 
  | "gmb" 
  | "meta_ads" 
  | "google_ads";

export const getOrgId = (req: Request): string => {
  const headerVal = req.headers["x-organization-id"];
  if (Array.isArray(headerVal)) return headerVal[0] || "";
  return (headerVal as string) || (req.query.orgId as string) || "";
};

export const getAccountIdFromReq = (req: Request): string => {
  return (req.query.accountId as string) || (req.body.accountId as string) || "";
};

/**
 * Validates that an account/config ID belongs to the requested organization.
 * Throws an error or returns false if unauthorized.
 */
export async function validateAccountOwnership(
  organizationId: string,
  platform: PlatformType,
  accountId: string
): Promise<boolean> {
  if (!organizationId || !accountId) return false;

  try {
    switch (platform) {
      case "whatsapp": {
        const config = await prisma.whatsAppConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "instagram": {
        const config = await prisma.instagramConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "gmail": {
        const config = await prisma.gmailConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "youtube": {
        const config = await prisma.youTubeConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "linkedin": {
        const config = await prisma.linkedInConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "gmb": {
        const config = await prisma.googleBusinessConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "google_ads": {
        const config = await prisma.googleAdAccount.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "meta_ads": {
        const config = await prisma.metaAdAccount.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      default:
        return true;
    }
  } catch (err) {
    console.error(`[ACCOUNT RESOLVER] Error validating ownership for ${platform}:`, err);
    return false;
  }
}
