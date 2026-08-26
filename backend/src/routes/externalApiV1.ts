import { Router, Response } from "express";
import { apiKeyAuth, requirePermission, AuthenticatedApiRequest } from "../middleware/apiKeyAuth";
import { WhatsAppService } from "../services/whatsappService";
import prisma from "../utils/prisma";

const router = Router();

// Telemetry Logs Buffer for Real-time Audit Dashboard
export interface ApiTelemetryLog {
  id: string;
  organizationId?: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  ip: string;
  keyPrefix: string;
  timestamp: string;
}

const telemetryLogs: ApiTelemetryLog[] = [];

export function recordApiTelemetry(req: any, statusCode: number, startTime: number) {
  const latencyMs = Math.max(1, Date.now() - startTime);
  const logEntry: ApiTelemetryLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    organizationId: req.apiKeyRecord?.organizationId || req.organizationId || "",
    method: req.method,
    path: req.originalUrl || req.url,
    statusCode,
    latencyMs,
    ip: (req.headers["x-forwarded-for"] as string) || req.socket?.remoteAddress || "127.0.0.1",
    keyPrefix: req.apiKeyRecord?.keyPrefix || "Anonymous",
    timestamp: new Date().toISOString()
  };

  telemetryLogs.unshift(logEntry);
  if (telemetryLogs.length > 200) {
    telemetryLogs.pop();
  }
}

export function getApiTelemetryLogs(orgId?: string) {
  if (!orgId) return telemetryLogs;
  return telemetryLogs.filter(l => !l.organizationId || l.organizationId === orgId);
}

// Protect ALL v1 external API endpoints with API Key Authentication
router.use(apiKeyAuth);

// Automatic telemetry recording middleware for external API calls
router.use((req: AuthenticatedApiRequest, res: Response, next) => {
  const startTime = Date.now();
  res.on("finish", () => {
    recordApiTelemetry(req, res.statusCode, startTime);
  });
  next();
});

// ─── GET /api/v1/auth/test & GET /api/v1/ping ─────────────────────────────
// External Test Endpoints: Verify API Key validity, status, environment & permissions
const handleAuthTest = async (req: AuthenticatedApiRequest, res: Response) => {
  try {
    const keyRecord = req.apiKeyRecord;
    const organizationId = req.organizationId;

    // Fetch Organization details to populate account_name
    const org = await (prisma as any).organization.findUnique({
      where: { id: organizationId },
      select: { name: true }
    });

    return res.status(200).json({
      success: true,
      message: "API Key is valid and active",
      data: {
        key_name: keyRecord?.name || "API Key",
        status: (keyRecord?.status || "ACTIVE").toLowerCase(),
        environment: keyRecord?.environment || "LIVE",
        permissions: keyRecord?.permissions || ["full_access"],
        account_name: org?.name || "Demo Organization",
        key_prefix: keyRecord?.keyPrefix,
        last_used_at: keyRecord?.lastUsedAt || new Date().toISOString(),
        created_at: keyRecord?.createdAt
      }
    });
  } catch (error: any) {
    return res.status(500).json({
      error: "Internal Server Error",
      message: "Failed to verify API key health",
      details: error.message
    });
  }
};

router.get("/auth/test", handleAuthTest);
router.get("/ping", handleAuthTest);

// ─── POST /api/v1/whatsapp/send-template ──────────────────────────────────────
// External Endpoint: Send WhatsApp Template Message via API Key (Scope: whatsapp_send)
router.post("/whatsapp/send-template", requirePermission("whatsapp_send"), async (req: AuthenticatedApiRequest, res: Response) => {
  try {
    const organizationId = req.organizationId;
    const { to, phone, recipient_phone, templateName, template_name, template, languageCode, language_code, language, components, variables, parameters } = req.body;

    const recipientPhone = phone || to || recipient_phone;
    if (!recipientPhone) {
      return res.status(400).json({ error: "Validation Error", message: "Missing required parameter 'phone' or 'to'." });
    }

    const targetTemplate = template_name || templateName || template;
    if (!targetTemplate) {
      return res.status(400).json({ error: "Validation Error", message: "Missing required parameter 'template_name' or 'templateName'." });
    }

    // Fetch WhatsApp Config for this organization
    const waConfig = await (prisma as any).whatsAppConfig.findFirst({
      where: { organizationId }
    });

    if (!waConfig || !waConfig.phoneNumberId || !waConfig.accessToken) {
      return res.status(400).json({
        error: "Configuration Error",
        message: "WhatsApp Business Account is not connected for this Organization in CRM Settings."
      });
    }

    const formattedTo = WhatsAppService.formatPhoneNumber(recipientPhone);
    const langToUse = language || language_code || languageCode || "en";

    // Flexible components & variables formatting
    let finalComponents: any[] = [];
    const rawVars = variables || parameters || components;

    if (Array.isArray(rawVars) && rawVars.length > 0) {
      if (typeof rawVars[0] === "string" || typeof rawVars[0] === "number") {
        const bodyParams = rawVars.map((val: any) => ({ type: "text", text: String(val) }));
        finalComponents.push({ type: "body", parameters: bodyParams });
      } else if (rawVars[0]?.type) {
        finalComponents = rawVars;
      }
    } else if (rawVars && typeof rawVars === "object") {
      const keys = Object.keys(rawVars);
      if (keys.length > 0) {
        const bodyParams = keys.map(k => ({ type: "text", text: String(rawVars[k]) }));
        finalComponents.push({ type: "body", parameters: bodyParams });
      }
    }

    const result = await WhatsAppService.sendTemplateMessage(
      waConfig.phoneNumberId,
      waConfig.accessToken,
      formattedTo,
      targetTemplate,
      langToUse,
      finalComponents
    );

    const waMsgId = result?.messages?.[0]?.id || `ext_${Date.now()}`;

    // ─── CRM CONVERSATION & CHAT HISTORY AUTO-SYNC ───
    if (organizationId) {
      try {
        let conversation = await prisma.conversation.findFirst({
          where: {
            organizationId,
            platform: "whatsapp",
            customerPhone: formattedTo,
            phoneNumberId: waConfig.phoneNumberId || undefined
          }
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId,
              platform: "whatsapp",
              customerPhone: formattedTo,
              customerName: `Lead (${formattedTo})`,
              phoneNumberId: waConfig.phoneNumberId || null,
              isBotPaused: false
            }
          });
        }

        // Build friendly text content summarizing variables
        const varTexts = (finalComponents?.[0]?.parameters || []).map((p: any) => p.text).filter(Boolean);
        const varSummary = varTexts.length > 0 ? ` [${varTexts.join(", ")}]` : "";
        const displayContent = `📋 Template Sent: ${targetTemplate}${varSummary}`;

        const savedMsg = await prisma.message.create({
          data: {
            conversationId: conversation.id,
            direction: "outbound",
            messageType: "template",
            content: displayContent,
            waMessageId: waMsgId,
            status: "sent"
          }
        });

        // Update conversation lastMessage time
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() }
        });

        // Emit real-time Socket event so CRM chat sidebar updates live!
        const reqApp = req.app;
        const io = reqApp?.get("io");
        if (io) {
          io.to(organizationId).emit("new-message", {
            message: savedMsg,
            conversation: conversation
          });
        }
      } catch (dbErr: any) {
        console.warn("[EXTERNAL_API_SYNC_WARN] Failed to auto-save template message to CRM history:", dbErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: `Template '${targetTemplate}' sent successfully to ${formattedTo}`,
      data: {
        message_id: waMsgId,
        phone: formattedTo,
        template_name: targetTemplate,
        language: langToUse,
        status: "SENT"
      }
    });
  } catch (error: any) {
    console.error("[EXTERNAL_API_SEND_TEMPLATE_ERR]:", error.response?.data || error.message);
    return res.status(500).json({
      error: "WhatsApp Dispatch Failed",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// ─── POST /api/v1/whatsapp/send-message ───────────────────────────────────────
// External Endpoint: Send WhatsApp Text Message via API Key (Scope: whatsapp_send)
router.post("/whatsapp/send-message", requirePermission("whatsapp_send"), async (req: AuthenticatedApiRequest, res: Response) => {
  try {
    const organizationId = req.organizationId;
    const { to, phone, message, text } = req.body;

    const recipientPhone = to || phone;
    const bodyText = message || text;

    if (!recipientPhone) {
      return res.status(400).json({ error: "Validation Error", message: "Missing required parameter 'to' or 'phone'." });
    }

    if (!bodyText) {
      return res.status(400).json({ error: "Validation Error", message: "Missing required parameter 'message' or 'text'." });
    }

    const waConfig = await (prisma as any).whatsAppConfig.findFirst({
      where: { organizationId }
    });

    if (!waConfig || !waConfig.phoneNumberId || !waConfig.accessToken) {
      return res.status(400).json({
        error: "Configuration Error",
        message: "WhatsApp Business Account is not connected for this Organization in CRM Settings."
      });
    }

    const formattedTo = WhatsAppService.formatPhoneNumber(recipientPhone);

    const result = await WhatsAppService.sendTextMessage(
      waConfig.phoneNumberId,
      waConfig.accessToken,
      formattedTo,
      bodyText
    );

    const waMsgId = result?.messages?.[0]?.id || `ext_${Date.now()}`;

    return res.status(200).json({
      success: true,
      message: `WhatsApp message sent successfully to ${formattedTo}`,
      messageId: waMsgId,
      recipient: formattedTo,
      status: "SENT"
    });
  } catch (error: any) {
    console.error("[EXTERNAL_API_SEND_TEXT_ERR]:", error.response?.data || error.message);
    return res.status(500).json({
      error: "WhatsApp Dispatch Failed",
      details: error.response?.data?.error?.message || error.message
    });
  }
});

// ─── GET /api/v1/campaigns ───────────────────────────────────────────────────
// External Endpoint: List Active Drip Campaigns (Scope: campaigns_manage)
router.get("/campaigns", requirePermission("campaigns_manage"), async (req: AuthenticatedApiRequest, res: Response) => {
  try {
    const organizationId = req.organizationId;
    const campaigns = await (prisma as any).whatsAppDripCampaign.findMany({
      where: { organizationId },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        timezone: true,
        createdAt: true,
        steps: {
          select: {
            stepNumber: true,
            stepType: true,
            templateName: true,
            delayUnit: true,
            delayValue: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ success: true, count: campaigns.length, campaigns });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch campaigns", details: error.message });
  }
});

// ─── GET /api/v1/contacts ───────────────────────────────────────────────────
// External Endpoint: List & Search CRM Contacts (Scope: contacts_read)
router.get("/contacts", requirePermission("contacts_read"), async (req: AuthenticatedApiRequest, res: Response) => {
  try {
    const organizationId = req.organizationId;
    const limit = Math.min(100, parseInt(req.query.limit as string) || 50);

    const contacts = await (prisma as any).contact.findMany({
      where: { organizationId },
      take: limit,
      select: {
        id: true,
        name: true,
        phoneNumber: true,
        email: true,
        status: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: "desc" }
    });

    return res.status(200).json({ success: true, count: contacts.length, limit, contacts });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch contacts", details: error.message });
  }
});

// ─── POST /api/v1/contacts ──────────────────────────────────────────────────
// External Endpoint: Create or Update Contact (Scope: contacts_write)
router.post("/contacts", requirePermission("contacts_write"), async (req: AuthenticatedApiRequest, res: Response) => {
  try {
    const organizationId = req.organizationId;
    const { name, phoneNumber, phone, email, status } = req.body;

    const rawPhone = phoneNumber || phone;
    if (!rawPhone) {
      return res.status(400).json({ error: "Validation Error", message: "Missing required parameter 'phoneNumber' or 'phone'." });
    }

    const formattedPhone = WhatsAppService.formatPhoneNumber(rawPhone);

    const contact = await (prisma as any).contact.upsert({
      where: {
        organizationId_phoneNumber: {
          organizationId,
          phoneNumber: formattedPhone
        }
      },
      update: {
        name: name || undefined,
        email: email || undefined,
        status: status || undefined
      },
      create: {
        organizationId,
        phoneNumber: formattedPhone,
        name: name || "API Imported Contact",
        email: email || null,
        status: status || "SUBSCRIBED"
      }
    });

    return res.status(200).json({
      success: true,
      message: "Contact created or updated successfully",
      contact
    });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to create contact", details: error.message });
  }
});

// ─── GET /api/v1/whatsapp/templates ─────────────────────────────────────────
// External Endpoint: List Organization WhatsApp Templates (Scope: whatsapp_templates)
router.get("/whatsapp/templates", requirePermission("whatsapp_templates"), async (req: AuthenticatedApiRequest, res: Response) => {
  try {
    const organizationId = req.organizationId;
    const waConfig = await (prisma as any).whatsAppConfig.findFirst({
      where: { organizationId }
    });

    if (!waConfig || !waConfig.wabaId || !waConfig.accessToken) {
      return res.status(400).json({
        error: "Configuration Error",
        message: "WhatsApp Business Account is not connected for this Organization."
      });
    }

    const templates = await WhatsAppService.getTemplates(waConfig.wabaId, waConfig.accessToken);
    return res.status(200).json({ success: true, count: templates?.data?.length || 0, templates: templates?.data || [] });
  } catch (error: any) {
    return res.status(500).json({ error: "Failed to fetch templates", details: error.message });
  }
});

// Fallback for unmatched v1 routes: ALWAYS return JSON (never HTML)
router.use((req: AuthenticatedApiRequest, res: Response) => {
  return res.status(404).json({
    error: "Not Found",
    message: `API v1 route '${req.method} ${req.originalUrl}' does not exist on this server.`,
    statusCode: 404
  });
});

export default router;
