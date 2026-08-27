import prisma from "../../utils/prisma";

export interface LogContext {
  traceId: string;
  organizationId?: string;
  whatsappConfigId?: string;
  phoneNumberId?: string;
  conversationId?: string;
  contactPhone?: string;
  messageId?: string;
  agentConfigId?: string;
  flowExecutionId?: string;
  campaignId?: string;
  appointmentId?: string;
}

/**
 * Structured Logger with Automatic Credential/Token Redaction
 */
export class StructuredLogger {
  private static readonly REDACTED_KEYS = new Set([
    "accesstoken",
    "access_token",
    "token",
    "authorization",
    "password",
    "secret",
    "apikey",
    "api_key",
    "refreshtoken",
    "refresh_token",
  ]);

  /**
   * Sanitizes object payloads to automatically redact secrets
   */
  public static sanitize(data: any): any {
    if (!data || typeof data !== "object") return data;

    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }

    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (this.REDACTED_KEYS.has(lowerKey) || lowerKey.includes("token") || lowerKey.includes("secret") || lowerKey.includes("password")) {
        sanitized[key] = "[REDACTED]";
      } else if (typeof value === "object") {
        sanitized[key] = this.sanitize(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  public static info(stage: string, context: LogContext, message: string, extra?: any): void {
    const meta = {
      timestamp: new Date().toISOString(),
      level: "INFO",
      stage,
      ...context,
      message,
      ...(extra ? { data: this.sanitize(extra) } : {}),
    };
    console.log(`[${stage}] traceId=${context.traceId || "none"} orgId=${context.organizationId || "none"} phoneId=${context.phoneNumberId || "none"} - ${message}`);
  }

  public static error(stage: string, context: LogContext, message: string, error?: any): void {
    console.error(`❌ [${stage}_ERROR] traceId=${context.traceId || "none"} orgId=${context.organizationId || "none"} - ${message}:`, error?.message || error);
  }
}

/**
 * MessageTraceRecorder
 * Persists granular end-to-end execution milestones for inbound and outbound messages.
 */
export class MessageTraceRecorder {
  public static async recordStage(params: {
    traceId: string;
    organizationId: string;
    whatsappConfigId?: string;
    phoneNumberId?: string;
    conversationId?: string;
    waMessageId?: string;
    stage: string;
    status: "SUCCESS" | "PROCESSING" | "FAILED" | "SKIPPED";
    durationMs?: number;
    error?: string;
  }): Promise<void> {
    const {
      traceId,
      organizationId,
      whatsappConfigId,
      phoneNumberId,
      conversationId,
      waMessageId,
      stage,
      status,
      durationMs,
      error
    } = params;

    try {
      const newStageEntry = {
        stage,
        timestamp: new Date().toISOString(),
        status,
        durationMs: durationMs || 0,
        error: error || null,
      };

      const existing = await (prisma as any).messageTrace.findUnique({
        where: { traceId }
      });

      if (existing) {
        const currentStages = Array.isArray(existing.stages) ? existing.stages : [];
        await (prisma as any).messageTrace.update({
          where: { traceId },
          data: {
            stages: [...currentStages, newStageEntry],
            waMessageId: waMessageId || existing.waMessageId,
            conversationId: conversationId || existing.conversationId,
          }
        });
      } else {
        await (prisma as any).messageTrace.create({
          data: {
            traceId,
            organizationId,
            whatsappConfigId: whatsappConfigId || null,
            phoneNumberId: phoneNumberId || null,
            conversationId: conversationId || null,
            waMessageId: waMessageId || null,
            stages: [newStageEntry],
          }
        });
      }
    } catch (err: any) {
      console.warn("[MESSAGE TRACE RECORDER WARN]:", err.message);
    }
  }
}
