import prisma from "../../utils/prisma";

export type AllowedOutboundMode = "FREE_FORM_ALLOWED" | "TEMPLATE_REQUIRED";

export interface PolicyEvaluationResult {
  allowedMode: AllowedOutboundMode;
  is24HourWindowActive: boolean;
  windowExpiresAt?: Date | null;
  lastCustomerMessageAt?: Date | null;
  recommendedTemplateName?: string;
  reason: string;
}

/**
 * WhatsAppMessagingPolicyService
 * 
 * Centralized Meta 24-Hour Customer Service Window & Messaging Policy Evaluator.
 * 
 * Business Rules:
 * 1. Within 24 hours of the customer's last inbound message: Free-form text, media, interactive messages are permitted.
 * 2. Beyond 24 hours (or if conversation has never had an inbound customer message): Business-initiated messages MUST be approved Meta templates.
 * 3. Marketing/Bulk broadcast messages outside active windows require templates.
 */
export class WhatsAppMessagingPolicyService {
  /**
   * Evaluates the messaging policy for a specific conversation / recipient.
   */
  public static async evaluatePolicy(params: {
    conversationId?: string;
    organizationId: string;
    whatsappConfigId: string;
    customerPhone: string;
  }): Promise<PolicyEvaluationResult> {
    const { conversationId, organizationId, customerPhone } = params;

    let targetConvId = conversationId;

    if (!targetConvId) {
      const conv = await prisma.conversation.findFirst({
        where: {
          organizationId,
          platform: "whatsapp",
          customerPhone: { contains: customerPhone.replace(/\D/g, "").slice(-10) }
        },
        select: { id: true }
      });
      targetConvId = conv?.id;
    }

    if (!targetConvId) {
      return {
        allowedMode: "TEMPLATE_REQUIRED",
        is24HourWindowActive: false,
        reason: "No prior conversation found with customer. Outbound initiation requires an approved Meta Template."
      };
    }

    // Find the latest inbound message from the customer
    const lastInboundMsg = await prisma.message.findFirst({
      where: {
        conversationId: targetConvId,
        direction: "inbound"
      },
      orderBy: { createdAt: "desc" }
    });

    if (!lastInboundMsg) {
      return {
        allowedMode: "TEMPLATE_REQUIRED",
        is24HourWindowActive: false,
        reason: "No inbound messages received from customer in this conversation. Requires approved Meta Template."
      };
    }

    const lastInboundTime = new Date(lastInboundMsg.createdAt).getTime();
    const now = Date.now();
    const twentyFourHoursMs = 24 * 60 * 60 * 1000;
    const windowExpiresAt = new Date(lastInboundTime + twentyFourHoursMs);

    if (now - lastInboundTime <= twentyFourHoursMs) {
      return {
        allowedMode: "FREE_FORM_ALLOWED",
        is24HourWindowActive: true,
        windowExpiresAt,
        lastCustomerMessageAt: new Date(lastInboundTime),
        reason: "24-hour Meta customer service window is ACTIVE. Free-form text and media messages permitted."
      };
    } else {
      return {
        allowedMode: "TEMPLATE_REQUIRED",
        is24HourWindowActive: false,
        windowExpiresAt,
        lastCustomerMessageAt: new Date(lastInboundTime),
        recommendedTemplateName: "welcome_jisnu_marketing",
        reason: `24-hour customer window expired at ${windowExpiresAt.toISOString()}. Standard Meta policy requires an approved Template.`
      };
    }
  }
}
