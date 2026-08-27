import prisma from "../../utils/prisma";

export interface WhatsAppRuntimeContext {
  organizationId: string;
  whatsappConfigId: string;
  phoneNumberId: string;
  wabaId: string;
  accessToken: string;
  displayPhoneNumber?: string;
  accountName?: string;
  isActive: boolean;
  isDefault: boolean;

  // Optional contextual bindings (populated if resolved from a conversation or appointment)
  agentConfigId?: string;
  conversationId?: string;
  contactId?: string;
  calendarConnectionId?: string;
}

export interface ResolveContextParams {
  organizationId?: string | null;
  whatsappConfigId?: string | null;
  phoneNumberId?: string | null;
  conversationId?: string | null;
  wabaId?: string | null;
  strict?: boolean; // If true, throws error or returns null when explicit parameters don't resolve
}

/**
 * WhatsAppRuntimeContextResolver
 * 
 * Canonical centralized resolver ensuring EVERY WhatsApp runtime operation
 * is strictly scoped, isolated, and ownership-validated.
 * 
 * Guarantees:
 * 1. An organization can never access another organization's WhatsApp configuration.
 * 2. A WhatsApp configuration is never assumed or shared across unconfigured numbers.
 * 3. AI Agent, Flow, Template, Drip, and Appointment operations resolve the exact number-bound context.
 */
export class WhatsAppRuntimeContextResolver {
  /**
   * Resolves the canonical WhatsApp runtime context from provided identifiers with strict security validation.
   */
  public static async resolveContext(params: ResolveContextParams): Promise<WhatsAppRuntimeContext | null> {
    const {
      organizationId,
      whatsappConfigId,
      phoneNumberId,
      conversationId,
      wabaId,
      strict = false,
    } = params;

    let resolvedConfig: any = null;
    let resolvedConversation: any = null;

    // 1. If conversationId is provided, look up the conversation first
    if (conversationId) {
      resolvedConversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          whatsappConfig: true,
        },
      });

      if (!resolvedConversation) {
        if (strict) throw new Error(`[WHATSAPP RUNTIME] Conversation "${conversationId}" not found.`);
        return null;
      }

      // Security check: if organizationId was also supplied, verify conversation belongs to organization
      if (organizationId && resolvedConversation.organizationId !== organizationId) {
        throw new Error(
          `[SECURITY VIOLATION] Conversation "${conversationId}" does not belong to Organization "${organizationId}".`
        );
      }

      if (resolvedConversation.whatsappConfig && resolvedConversation.whatsappConfig.isActive) {
        resolvedConfig = resolvedConversation.whatsappConfig;
      } else if (resolvedConversation.phoneNumberId) {
        resolvedConfig = await (prisma as any).whatsAppConfig.findFirst({
          where: {
            organizationId: resolvedConversation.organizationId,
            phoneNumberId: resolvedConversation.phoneNumberId,
            isActive: true,
          },
        });
      }
    }

    const effectiveOrgId = organizationId || resolvedConversation?.organizationId;
    if (!effectiveOrgId && !phoneNumberId && !whatsappConfigId) {
      if (strict) throw new Error("[WHATSAPP RUNTIME] Cannot resolve context without organizationId, phoneNumberId, or whatsappConfigId.");
      return null;
    }

    // 2. If explicit whatsappConfigId is provided, resolve and validate ownership
    if (!resolvedConfig && whatsappConfigId && whatsappConfigId !== "ALL") {
      const queryWhere: any = { id: whatsappConfigId, isActive: true };
      if (effectiveOrgId) {
        queryWhere.organizationId = effectiveOrgId;
      }

      resolvedConfig = await (prisma as any).whatsAppConfig.findFirst({
        where: queryWhere,
      });

      // Strict boundary check: If config exists under another organization, reject immediately
      if (!resolvedConfig && effectiveOrgId) {
        const anyOrgConfig = await (prisma as any).whatsAppConfig.findUnique({
          where: { id: whatsappConfigId },
        });
        if (anyOrgConfig && anyOrgConfig.organizationId !== effectiveOrgId) {
          throw new Error(
            `[SECURITY VIOLATION] WhatsAppConfig "${whatsappConfigId}" belongs to Organization "${anyOrgConfig.organizationId}", NOT "${effectiveOrgId}".`
          );
        }
      }
    }

    // 3. If phoneNumberId is provided (e.g. from Webhook metadata or API payload)
    if (!resolvedConfig && phoneNumberId) {
      const queryWhere: any = { phoneNumberId, isActive: true };
      if (effectiveOrgId) {
        queryWhere.organizationId = effectiveOrgId;
      }

      resolvedConfig = await (prisma as any).whatsAppConfig.findFirst({
        where: queryWhere,
      });

      if (!resolvedConfig && effectiveOrgId) {
        const anyOrgConfig = await (prisma as any).whatsAppConfig.findFirst({
          where: { phoneNumberId },
        });
        if (anyOrgConfig && anyOrgConfig.organizationId !== effectiveOrgId) {
          throw new Error(
            `[SECURITY VIOLATION] PhoneNumberId "${phoneNumberId}" belongs to Organization "${anyOrgConfig.organizationId}", NOT "${effectiveOrgId}".`
          );
        }
      }
    }

    // 4. If wabaId is provided
    if (!resolvedConfig && wabaId && effectiveOrgId) {
      resolvedConfig = await (prisma as any).whatsAppConfig.findFirst({
        where: {
          organizationId: effectiveOrgId,
          wabaId,
          isActive: true,
        },
      });
    }

    // 5. Fallback ONLY if not in strict mode and organizationId is present
    if (!resolvedConfig && effectiveOrgId && !strict && !whatsappConfigId && !phoneNumberId) {
      // Find default config for this organization
      resolvedConfig = await (prisma as any).whatsAppConfig.findFirst({
        where: {
          organizationId: effectiveOrgId,
          isActive: true,
          isDefault: true,
        },
      });

      // If no default config, find the oldest active config strictly for this organization
      if (!resolvedConfig) {
        resolvedConfig = await (prisma as any).whatsAppConfig.findFirst({
          where: {
            organizationId: effectiveOrgId,
            isActive: true,
          },
          orderBy: { createdAt: "asc" },
        });
      }
    }

    if (!resolvedConfig) {
      if (strict) {
        throw new Error(
          `[WHATSAPP RUNTIME] No active WhatsApp account configuration found for params: ${JSON.stringify(params)}`
        );
      }
      return null;
    }

    // 6. Resolve associated AI Agent Config strictly tied to this WhatsAppConfig and Organization
    let agentConfigId: string | undefined = undefined;
    const aiConfig = await (prisma as any).aiAgentConfig.findFirst({
      where: {
        organizationId: resolvedConfig.organizationId,
        whatsappConfigId: resolvedConfig.id,
        isActive: true,
      },
    });
    if (aiConfig) {
      agentConfigId = aiConfig.id;
    }

    return {
      organizationId: resolvedConfig.organizationId,
      whatsappConfigId: resolvedConfig.id,
      phoneNumberId: resolvedConfig.phoneNumberId,
      wabaId: resolvedConfig.wabaId,
      accessToken: resolvedConfig.accessToken,
      displayPhoneNumber: resolvedConfig.phoneNumber || undefined,
      accountName: resolvedConfig.accountName || undefined,
      isActive: resolvedConfig.isActive,
      isDefault: resolvedConfig.isDefault,
      agentConfigId,
      conversationId: resolvedConversation?.id || conversationId || undefined,
    };
  }

  /**
   * Helper to ensure context resolution or throw descriptive Error
   */
  public static async getRequiredContext(params: ResolveContextParams): Promise<WhatsAppRuntimeContext> {
    const ctx = await this.resolveContext({ ...params, strict: true });
    if (!ctx) {
      throw new Error(`[WHATSAPP RUNTIME ERROR] Could not resolve required WhatsApp runtime context for ${JSON.stringify(params)}`);
    }
    return ctx;
  }
}
