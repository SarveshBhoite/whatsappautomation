import { Router, Request, Response } from "express";
import crypto from "crypto";
import prisma from "../utils/prisma";

import { getApiTelemetryLogs } from "./externalApiV1";

const router = Router();

// Helper to get organizationId from headers (ensures organization exists in DB)
const getOrgId = async (req: Request): Promise<string> => {
  const targetOrgId = (req.headers["x-organization-id"] as string) || (req.query.organizationId as string) || "";
  if (!targetOrgId) throw new Error("Organization ID is required. Please log in.");
  let org = await prisma.organization.findUnique({ where: { id: targetOrgId } });
  if (!org) {
    org = await prisma.organization.create({
      data: {
        id: targetOrgId,
        name: "Organization"
      }
    });
  }
  return org.id;
};

// ─── GET /api/api-keys/telemetry ──────────────────────────────────────────────
// Real-time API telemetry audit log stream for Developer Portal
router.get("/telemetry", async (req: Request, res: Response) => {
  try {
    const logs = getApiTelemetryLogs();
    return res.status(200).json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch telemetry logs", details: error.message });
  }
});

// ─── GET /api/api-keys ────────────────────────────────────────────────────────
// List all API keys for the current organization (Full keys are NEVER returned)
router.get("/", async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrgId(req);
    const apiKeys = await (prisma as any).apiKey.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        keyPrefix: true,
        status: true,
        environment: true,
        permissions: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ success: true, apiKeys });
  } catch (error: any) {
    console.error("[API_KEYS_GET_ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to fetch API keys", details: error.message });
  }
});

// ─── POST /api/api-keys ───────────────────────────────────────────────────────
// Generate a new secure API Key with custom permissions
router.post("/", async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrgId(req);
    const { name, description, environment, permissions } = req.body;

    const labelName = (name || "").trim() || "CRM Website Key";
    const keyEnv = (environment || "LIVE").toUpperCase() === "TEST" ? "TEST" : "LIVE";
    const grantedPermissions = Array.isArray(permissions) && permissions.length > 0
      ? permissions
      : ["full_access"];

    // Format: ak_live_<32 random hex characters> or ak_test_<32 random hex characters>
    const randomHex = crypto.randomBytes(16).toString("hex");
    const envPrefix = keyEnv === "TEST" ? "ak_test_" : "ak_live_";
    const rawApiKey = `${envPrefix}${randomHex}`;

    // Store masked prefix for UI display (e.g., ak_live_8f3a...b4c)
    const keyPrefix = `${rawApiKey.substring(0, 12)}...${rawApiKey.slice(-4)}`;

    // Store SHA-256 hashed version securely in DB
    const hashedKey = crypto.createHash("sha256").update(rawApiKey).digest("hex");

    const newKey = await (prisma as any).apiKey.create({
      data: {
        organizationId,
        name: labelName,
        description: (description || "").trim() || null,
        keyPrefix,
        hashedKey,
        status: "ACTIVE",
        environment: keyEnv,
        permissions: grantedPermissions
      },
      select: {
        id: true,
        name: true,
        description: true,
        keyPrefix: true,
        status: true,
        environment: true,
        permissions: true,
        createdAt: true,
        lastUsedAt: true
      }
    });

    // Return full plain-text key ONLY ONCE in this creation response!
    return res.status(201).json({
      success: true,
      rawApiKey, // ONLY TIME FULL KEY IS SENT TO CLIENT
      apiKey: newKey,
      warning: "This API key will only be shown once. Please copy and store it securely."
    });
  } catch (error: any) {
    console.error("[API_KEY_GENERATE_ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to generate API key", details: error.message });
  }
});

// ─── PUT /api/api-keys/:id ───────────────────────────────────────────────────
// Edit API key name, description, environment, and permissions
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrgId(req);
    const { id } = req.params;
    const { name, description, environment, permissions } = req.body;

    const updateData: any = {};
    if (typeof name === "string" && name.trim()) {
      updateData.name = name.trim();
    }
    if (typeof description === "string") {
      updateData.description = description.trim() || null;
    }
    if (typeof environment === "string") {
      updateData.environment = environment.toUpperCase() === "TEST" ? "TEST" : "LIVE";
    }
    if (Array.isArray(permissions) && permissions.length > 0) {
      updateData.permissions = permissions;
    }

    const updated = await (prisma as any).apiKey.updateMany({
      where: { id, organizationId },
      data: updateData
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "API Key not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "API key updated successfully" });
  } catch (error: any) {
    console.error("[API_KEY_UPDATE_ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to update API key", details: error.message });
  }
});

// ─── POST /api/api-keys/:id/revoke ───────────────────────────────────────────
// Revoke an API Key immediately
router.post("/:id/revoke", async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrgId(req);
    const { id } = req.params;

    const updated = await (prisma as any).apiKey.updateMany({
      where: { id, organizationId },
      data: { status: "REVOKED" }
    });

    if (updated.count === 0) {
      return res.status(404).json({ error: "API Key not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "API key revoked successfully" });
  } catch (error: any) {
    console.error("[API_KEY_REVOKE_ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to revoke API key", details: error.message });
  }
});

// ─── DELETE /api/api-keys/:id ────────────────────────────────────────────────
// Permanently delete an API Key
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const organizationId = await getOrgId(req);
    const { id } = req.params;

    const deleted = await (prisma as any).apiKey.deleteMany({
      where: { id, organizationId }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: "API Key not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "API key deleted permanently" });
  } catch (error: any) {
    console.error("[API_KEY_DELETE_ERROR]:", error.message);
    return res.status(500).json({ error: "Failed to delete API key", details: error.message });
  }
});

export default router;
