import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import prisma from "../utils/prisma";

export interface AuthenticatedApiRequest extends Request {
  apiKeyRecord?: any;
  organizationId?: string;
}

export async function apiKeyAuth(
  req: AuthenticatedApiRequest,
  res: Response,
  next: NextFunction
) {
  try {
    let keyHeader = req.headers["x-api-key"] as string;

    if (!keyHeader) {
      const authHeader = req.headers["authorization"];
      if (authHeader && authHeader.startsWith("Bearer ")) {
        keyHeader = authHeader.substring(7).trim();
      }
    }

    if (!keyHeader) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Missing API key header. Please provide your API key via 'x-api-key' header or 'Authorization: Bearer <key>'."
      });
    }

    // Hash the incoming key to match with database
    const hashedKey = crypto.createHash("sha256").update(keyHeader).digest("hex");

    const apiKeyRecord = await (prisma as any).apiKey.findUnique({
      where: { hashedKey }
    });

    if (!apiKeyRecord) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Invalid API key provided."
      });
    }

    if (apiKeyRecord.status !== "ACTIVE") {
      return res.status(403).json({
        error: "Forbidden",
        message: "This API key has been revoked and can no longer be used."
      });
    }

    // Update lastUsedAt asynchronously without blocking request
    (prisma as any).apiKey.update({
      where: { id: apiKeyRecord.id },
      data: { lastUsedAt: new Date() }
    }).catch((err: any) => {
      console.error("[API_KEY_LAST_USED_UPDATE_ERR]:", err.message);
    });

    req.apiKeyRecord = apiKeyRecord;
    req.organizationId = apiKeyRecord.organizationId;

    next();
  } catch (err: any) {
    console.error("[API_KEY_AUTH_ERR]:", err.message);
    return res.status(500).json({ error: "Internal Authentication Error", details: err.message });
  }
}

export function requirePermission(requiredScope: string) {
  return (req: AuthenticatedApiRequest, res: Response, next: NextFunction) => {
    const grantedPermissions: string[] = req.apiKeyRecord?.permissions || ["full_access"];

    if (grantedPermissions.includes("full_access") || grantedPermissions.includes(requiredScope)) {
      return next();
    }

    return res.status(403).json({
      error: "Permission Denied",
      message: `This API key does not have the required scope '${requiredScope}' for this action.`,
      requiredPermission: requiredScope,
      grantedPermissions
    });
  };
}
