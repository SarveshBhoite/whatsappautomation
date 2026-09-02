import { MetaAIConversationService, CampaignConversationState } from "./metaAIConversationService";

/**
 * AICampaignConversationEngine
 * Facade delegating to the modular MetaAIConversationService and Meta AI architecture
 */
export class AICampaignConversationEngine {
  static async getInitialSession(organizationId: string): Promise<CampaignConversationState> {
    return MetaAIConversationService.getInitialSession(organizationId);
  }

  static async processMessage(
    organizationId: string,
    currentState: CampaignConversationState,
    userText: string,
    selectedOptionValue?: string
  ): Promise<CampaignConversationState> {
    return MetaAIConversationService.processMessage(
      organizationId,
      currentState,
      userText,
      selectedOptionValue
    );
  }
}
