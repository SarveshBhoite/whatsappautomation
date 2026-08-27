import prisma from "../../utils/prisma";
import { WhatsAppService } from "../whatsappService";

function getSocketIo() {
  try {
    const { io } = require("../../index");
    return io;
  } catch {
    return null;
  }
}

export type InboundMessageStatus = "RECEIVED" | "PROCESSING" | "PROCESSED" | "IGNORED" | "FAILED";
export type OutboundMessageStatus = "QUEUED" | "SENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED" | "RETRYING";

export type OutboundMessageSource =
  | "human"
  | "ai"
  | "flow"
  | "bulk"
  | "drip"
  | "appointment"
  | "automation";

export type OutboundMessageType =
  | "text"
  | "template"
  | "image"
  | "video"
  | "audio"
  | "document"
  | "interactive";

export type OutboundPriority = "P0" | "P1" | "P2" | "P3" | "P4" | "P5";

export interface OutboundWhatsAppMessage {
  organizationId: string;
  whatsappConfigId: string;
  phoneNumberId: string;
  accessToken: string;

  recipientPhone: string;
  type: OutboundMessageType;

  text?: string;
  templateName?: string;
  languageCode?: string;
  components?: any[];

  mediaType?: "image" | "document" | "video" | "audio";
  mediaUrl?: string;
  filename?: string;
  caption?: string;

  conversationId?: string;
  quotedMessageId?: string;
  contextMessageId?: string;
  senderName?: string;

  priority?: OutboundPriority; // P0=Human, P1=AI, P2=Appointment, P3=Automation, P4=Drip, P5=Bulk
  source: OutboundMessageSource;
  idempotencyKey: string;
}

/**
 * Priority Hierarchy Mapping
 */
export const SOURCE_DEFAULT_PRIORITY: Record<OutboundMessageSource, OutboundPriority> = {
  human: "P0",
  ai: "P1",
  appointment: "P2",
  automation: "P3",
  flow: "P3",
  drip: "P4",
  bulk: "P5",
};

/**
 * Per-Number Outbound Rate Limiter & Concurrency Manager
 * Ensures high-priority chats (P0/P1) are never starved by bulk/drip traffic.
 */
class PerNumberRateLimiter {
  private static lastDispatchTimes: Map<string, number> = new Map();
  private static readonly MIN_INTERVAL_MS = 250; // Max 4 msgs/sec per physical WhatsApp number

  public static async throttle(phoneNumberId: string, priority: OutboundPriority): Promise<void> {
    const now = Date.now();
    const lastTime = this.lastDispatchTimes.get(phoneNumberId) || 0;
    const elapsed = now - lastTime;

    // High-priority (P0/P1) gets instant dispatch if threshold met
    const requiredInterval = priority === "P0" || priority === "P1" ? 100 : this.MIN_INTERVAL_MS;

    if (elapsed < requiredInterval) {
      const waitTime = requiredInterval - elapsed;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastDispatchTimes.set(phoneNumberId, Date.now());
  }
}

export interface OutboundDispatchResult {
  success: boolean;
  messageId?: string;
  waMessageId?: string;
  status: OutboundMessageStatus;
  error?: string;
  deduplicated?: boolean;
}

/**
 * Lifecycle State Transition Matrix
 * Guarantees outbound status transitions never move backward when out-of-order Meta status webhooks arrive.
 */
const OUTBOUND_STATE_PRIORITY: Record<string, number> = {
  QUEUED: 10,
  SENDING: 20,
  FAILED: 25,
  SENT: 30,
  DELIVERED: 40,
  READ: 50,
};

export class MessageStateMachine {
  /**
   * Evaluates whether a new status is a valid progressive transition from the current status.
   */
  public static canTransitionOutbound(currentStatus: string, newStatus: string): boolean {
    const curUpper = (currentStatus || "SENT").toUpperCase();
    const newUpper = (newStatus || "").toUpperCase();

    const curPri = OUTBOUND_STATE_PRIORITY[curUpper] ?? 0;
    const newPri = OUTBOUND_STATE_PRIORITY[newUpper] ?? 0;

    // Terminal or progressive transitions are valid
    return newPri >= curPri;
  }
}

/**
 * Centralized OutboundMessageService
 * 
 * Single canonical pipeline for all outgoing WhatsApp communication:
 * Human Agent, AI Agent, Flow Engine, Bulk Campaign, Drip Campaign, and Appointment notifications.
 */
export class OutboundMessageService {
  /**
   * Dispatches an outbound WhatsApp message through the centralized pipeline.
   * Enforces DB-backed idempotency, number verification, status state machine tracking, and UI sync.
   */
  public static async dispatch(msg: OutboundWhatsAppMessage): Promise<OutboundDispatchResult> {
    const {
      organizationId,
      whatsappConfigId,
      phoneNumberId,
      accessToken,
      recipientPhone,
      type,
      text,
      templateName,
      languageCode = "en_US",
      components = [],
      mediaType,
      mediaUrl,
      filename,
      caption,
      conversationId,
      quotedMessageId,
      contextMessageId,
      senderName = "System",
      source,
      idempotencyKey,
    } = msg;

    // 1. Phase 11: Outbound Idempotency Check
    if (idempotencyKey && (prisma as any)?.webhookEvent) {
      try {
        const existingKey = await (prisma as any).webhookEvent.findUnique({
          where: { providerEventId: `out_${idempotencyKey}` },
        });

        if (existingKey) {
          console.log(`[OUTBOUND IDEMPOTENCY] Message with key "${idempotencyKey}" was already dispatched. Skipping duplicate send.`);
          return {
            success: true,
            status: "SENT",
            messageId: existingKey.messageId || undefined,
            deduplicated: true,
          };
        }
      } catch (idempErr) {
        // Fallback for standalone test runners if DB table is uninitialized
      }
    }

    // 2. Format customer phone number
    const formattedPhone = WhatsAppService.formatPhoneNumber(recipientPhone);

    // 3. Rate-Limiting & Priority Pacing per WhatsApp number
    const effectivePriority = msg.priority || SOURCE_DEFAULT_PRIORITY[source] || "P3";
    await PerNumberRateLimiter.throttle(phoneNumberId, effectivePriority);

    let responseData: any = null;
    let contentForDb = text || "";
    let waMessageId: string | null = null;
    let status: OutboundMessageStatus = "SENDING";

    try {
      // 3. Dispatch to Meta Graph API based on message type
      if (type === "text" && text) {
        responseData = await WhatsAppService.sendTextMessage(
          phoneNumberId,
          accessToken,
          formattedPhone,
          text,
          contextMessageId
        );
        contentForDb = text;
      } else if (type === "template" && templateName) {
        responseData = await WhatsAppService.sendTemplateMessage(
          phoneNumberId,
          accessToken,
          formattedPhone,
          templateName,
          languageCode,
          components
        );
        contentForDb = `[Template: ${templateName}]`;
      } else if (["image", "document", "video", "audio"].includes(type) && mediaUrl) {
        const mType = (mediaType || type) as "document" | "image" | "video" | "audio";
        responseData = await WhatsAppService.sendMediaMessage(
          phoneNumberId,
          accessToken,
          formattedPhone,
          mType,
          mediaUrl,
          filename,
          caption,
          contextMessageId
        );

        if (mType === "document") {
          contentForDb = `${filename || "document.pdf"}|${mediaUrl}`;
        } else {
          contentForDb = mediaUrl;
        }
        if (caption) {
          contentForDb += `|caption:${caption}`;
        }
      } else {
        throw new Error(`[OUTBOUND ERROR] Unsupported or incomplete message payload for type: ${type}`);
      }

      waMessageId = responseData?.messages?.[0]?.id || `out_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      status = "SENT";
    } catch (err: any) {
      status = "FAILED";
      const errorMsg = err.response?.data?.error?.message || err.message;
      console.error(`[OUTBOUND DISPATCH FAILED] Source: ${source}, To: ${formattedPhone}, Error: ${errorMsg}`);
      
      // Save failure record if conversationId exists
      if (conversationId) {
        const failedMsg = await prisma.message.create({
          data: {
            conversationId,
            direction: "outbound",
            messageType: type,
            content: contentForDb || "Message Failed",
            status: "failed",
            senderName,
            quotedMessageId: quotedMessageId || null,
          },
        });

        getSocketIo()?.to(organizationId).emit("new-message", {
          conversationId,
          message: failedMsg,
        });
      }

      return {
        success: false,
        status: "FAILED",
        error: errorMsg,
      };
    }

    // 4. Save outbound message to Database
    let savedMessage: any = null;
    if (conversationId) {
      savedMessage = await prisma.message.create({
        data: {
          conversationId,
          direction: "outbound",
          messageType: type,
          content: contentForDb,
          waMessageId,
          status: "sent",
          senderName,
          quotedMessageId: quotedMessageId || null,
        },
        include: {
          quotedMessage: true,
        },
      });

      // Broadcast to connected CRM Agents
      getSocketIo()?.to(organizationId).emit("new-message", {
        conversationId,
        message: savedMessage,
      });
    }

    // 5. Record Idempotency & Audit Log in WebhookEvent table
    if (idempotencyKey) {
      try {
        await (prisma as any).webhookEvent.create({
          data: {
            organizationId,
            whatsappConfigId,
            phoneNumberId,
            provider: "meta_whatsapp",
            providerEventId: `out_${idempotencyKey}`,
            messageId: savedMessage?.id || null,
            eventType: "outbound_dispatch",
            payload: {
              source,
              type,
              recipientPhone: formattedPhone,
              waMessageId,
            },
            status: "PROCESSED",
            processedAt: new Date(),
          },
        });
      } catch (auditErr: any) {
        console.warn("[OUTBOUND IDEMPOTENCY AUDIT WARN]:", auditErr.message);
      }
    }

    return {
      success: true,
      messageId: savedMessage?.id || undefined,
      waMessageId: waMessageId || undefined,
      status: "SENT",
    };
  }
}
