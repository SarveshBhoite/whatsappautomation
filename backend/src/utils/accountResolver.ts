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
  return (
    (req.query.whatsappConfigId as string) ||
    (req.query.accountId as string) ||
    (req.body?.whatsappConfigId as string) ||
    (req.body?.accountId as string) ||
    (req.headers["x-account-id"] as string) ||
    (req.headers["x-whatsapp-config-id"] as string) ||
    ""
  );
};

/**
 * Resolves and validates an authorized WhatsApp configuration for an organization.
 * Fallbacks cleanly to the default active config if no explicit accountId is specified.
 * Throws or returns null if ownership validation fails.
 */
export async function resolveWhatsAppConfig(
  organizationId: string,
  requestedConfigId?: string | null
) {
  if (!organizationId) return null;

  try {
    // 1. If explicit config ID provided, validate ownership strictly
    if (requestedConfigId && requestedConfigId !== "ALL") {
      const config = await (prisma as any).whatsAppConfig.findFirst({
        where: {
          id: requestedConfigId,
          organizationId,
          isActive: true
        }
      });

      if (config) return config;

      // Cross-organization boundary violation check
      const anyConfig = await (prisma as any).whatsAppConfig.findUnique({
        where: { id: requestedConfigId }
      });
      if (anyConfig && anyConfig.organizationId !== organizationId) {
        console.warn(`[SECURITY] Cross-organization access denied for WhatsApp config ${requestedConfigId} by Org ${organizationId}`);
        return null;
      }
    }

    // 2. Fallback to default configured WhatsApp account for the organization
    const defaultConfig = await (prisma as any).whatsAppConfig.findFirst({
      where: {
        organizationId,
        isActive: true,
        isDefault: true
      }
    });

    if (defaultConfig) return defaultConfig;

    // 3. Fallback to first active account
    return await (prisma as any).whatsAppConfig.findFirst({
      where: {
        organizationId,
        isActive: true
      },
      orderBy: { createdAt: "asc" }
    });
  } catch (err: any) {
    console.error("[ACCOUNT RESOLVER] Database query warning in resolveWhatsAppConfig:", err.message);
    return null;
  }
}

/**
 * Validates that an account/config ID belongs to the requested organization.
 */
export async function validateAccountOwnership(
  organizationId: string,
  platform: PlatformType,
  accountId: string
): Promise<boolean> {
  if (!organizationId || !accountId || accountId === "ALL") return true;

  try {
    switch (platform) {
      case "whatsapp": {
        const config = await (prisma as any).whatsAppConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "instagram": {
        const config = await (prisma as any).instagramConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "gmail": {
        const config = await (prisma as any).gmailConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "youtube": {
        const config = await (prisma as any).youTubeConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "linkedin": {
        const config = await (prisma as any).linkedInConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "gmb": {
        const config = await (prisma as any).googleBusinessConfig.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "google_ads": {
        const config = await (prisma as any).googleAdAccount.findFirst({
          where: { id: accountId, organizationId },
        });
        return !!config;
      }
      case "meta_ads": {
        const config = await (prisma as any).metaAdAccount.findFirst({
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
