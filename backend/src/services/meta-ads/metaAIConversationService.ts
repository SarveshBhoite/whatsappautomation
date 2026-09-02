import { MetaAIContextService, MetaAdsContext } from "./metaAIContextService";
import { MetaCampaignDraft, MetaCampaignDraftService } from "./metaCampaignDraftService";
import { MetaCampaignValidationService, DraftValidationResult } from "./metaCampaignValidationService";
import { MetaCampaignExecutionService, ExecutionResult } from "./metaCampaignExecutionService";
import { MetaAIProviderService } from "./metaAIProviderService";
import { MetaAdsCapabilityService } from "./metaAdsCapabilityService";

export type ConversationStatus =
  | "DISCOVERY"
  | "ACCOUNT_SELECTION"
  | "STRATEGY"
  | "DRAFTING"
  | "CREATIVE"
  | "REVIEW"
  | "CONFIRMATION"
  | "PUBLISHING"
  | "COMPLETED"
  | "FAILED";

export interface ConversationMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp: string;
  quickOptions?: Array<{ label: string; value: string; isNotSure?: boolean; icon?: string }>;
  metadata?: any;
}

export interface CampaignConversationState {
  sessionId: string;
  status: ConversationStatus;
  currentQuestionId?: string;
  draft: MetaCampaignDraft;
  validation: DraftValidationResult;
  context: MetaAdsContext;
  conversation: ConversationMessage[];
  executionResult?: ExecutionResult;
  requiresConfirmation: boolean;
}

export class MetaAIConversationService {
  /**
   * Initialize a new conversation session with dynamic Meta context
   */
  static async getInitialSession(organizationId: string): Promise<CampaignConversationState> {
    const sessionId = `meta_ai_session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const context = await MetaAIContextService.loadContext(organizationId);

    const draft = MetaCampaignDraftService.createInitialDraft(
      context.activeAdAccountId || (context.adAccounts.length === 1 ? context.adAccounts[0].adAccountId : null)
    );

    if (context.activePageId || context.pages.length === 1) {
      draft.pageId = context.activePageId || context.pages[0].id;
      draft.pageName = context.pages[0]?.name;
    }

    const validation = MetaCampaignValidationService.validateDraft(draft, context);

    let greetingText = `Hello! I'm your JISNU AI Meta Ads Strategist.`;
    let initialStatus: ConversationStatus = "DISCOVERY";

    if (context.adAccounts.length > 1 && !draft.adAccountId) {
      initialStatus = "ACCOUNT_SELECTION";
      greetingText += ` I see multiple connected ad accounts in your organization. Which Ad Account would you like to create campaigns for?`;
    } else {
      greetingText += ` Tell me about your business and what you'd like your Meta ads to achieve. You can share your goals, budget, or target location all at once or we can work it out step-by-step!`;
    }

    const initialMessage: ConversationMessage = {
      id: `msg_ai_${Date.now()}`,
      sender: "ai",
      text: greetingText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      quickOptions:
        context.adAccounts.length > 1 && !draft.adAccountId
          ? context.adAccounts.map((acc) => ({ label: acc.name, value: `SELECT_ACCOUNT_${acc.adAccountId}` }))
          : undefined,
    };

    return {
      sessionId,
      status: initialStatus,
      draft,
      validation,
      context,
      conversation: [initialMessage],
      requiresConfirmation: false,
    };
  }

  /**
   * Process incoming user message / selection with multi-entity extraction and state machine
   */
  static async processMessage(
    organizationId: string,
    currentState: CampaignConversationState,
    userText: string,
    selectedOptionValue?: string
  ): Promise<CampaignConversationState> {
    const state: CampaignConversationState = JSON.parse(JSON.stringify(currentState));
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    // 1. Append User Message
    state.conversation.push({
      id: `msg_user_${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: now,
    });

    // 2. Handle Explicit Account Selection Chip
    if (selectedOptionValue?.startsWith("SELECT_ACCOUNT_")) {
      const selectedId = selectedOptionValue.replace("SELECT_ACCOUNT_", "");
      const matched = state.context.adAccounts.find((a) => a.adAccountId === selectedId || a.id === selectedId);
      if (matched) {
        state.draft.adAccountId = matched.adAccountId;
        state.draft.adAccountName = matched.name;
        state.status = "DISCOVERY";

        state.conversation.push({
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: `Selected Ad Account: **${matched.name}** (${matched.adAccountId}). Now, please describe your business, goal, budget, and location.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });

        state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);
        return state;
      }
    }

    // 3. Handle Explicit Confirmation Flow
    const isAffirmativeConfirmation =
      /^(yes|publish|create it|go ahead|launch it|confirm|ready|looks good launch)/i.test(userText.trim());

    if ((state.status === "CONFIRMATION" || state.status === "REVIEW") && isAffirmativeConfirmation) {
      state.status = "PUBLISHING";
      state.conversation.push({
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: `🚀 Publishing your campaign to Meta Graph API v26.0... Creating campaign, ad set, creative, and ad...`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });

      const execResult = await MetaCampaignExecutionService.publishCampaign(
        organizationId,
        state.draft,
        `exec_${state.sessionId}_${Date.now()}`
      );

      state.executionResult = execResult;

      if (execResult.status === "SUCCESS") {
        state.status = "COMPLETED";
        state.requiresConfirmation = false;
        state.conversation.push({
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: `🎉 **Campaign Successfully Created End-to-End on Meta!**\n\n- 📁 **Campaign ID**: \`${execResult.metaCampaignId}\`\n- 🎯 **Ad Set ID**: \`${execResult.metaAdSetId}\`\n- 🎨 **Creative ID**: \`${execResult.creativeId}\`\n- ⚙️ **Status**: **PAUSED** (Draft Ready in Meta Ads Manager)\n\n👉 [Open in Meta Ads Manager](https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${state.draft.adAccountId || state.context.activeAdAccountId || '1454270479625110'}) to review your ad creative and activate it with 1-click!`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      } else if (execResult.status === "PARTIAL_FAILURE") {
        state.status = "COMPLETED";
        state.requiresConfirmation = false;
        state.conversation.push({
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: `✅ **Campaign & Ad Set Created on Meta!**\n\n- 📁 **Campaign ID**: \`${execResult.metaCampaignId}\`\n- 🎯 **Ad Set ID**: \`${execResult.metaAdSetId}\`\n- ⚙️ **Status**: **PAUSED**\n\n👉 [Open in Meta Ads Manager](https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${state.draft.adAccountId || state.context.activeAdAccountId || '1454270479625110'}) to review and publish.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      } else {
        state.status = "FAILED";
        state.conversation.push({
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: `❌ **Failed to create campaign on Meta**: ${execResult.errorMessage || "Meta Graph API error"}. Please check your account permissions or budget settings.`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        });
      }

      state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);
      return state;
    }

    // 4. Structured AI Intelligence Call with Planner-Executor model & Lens Framework
    const avgAccountCpa = state.context.accountMetrics?.avgCpa || 72.20;
    const systemPrompt = `You are a Senior Meta Ads Strategist & Media Buyer inside JISNU Marketing Automation.
Your goal is to help advertisers build high-performing, policy-compliant campaigns through a structured, data-driven dialogue following the Planner-Executor model.

AUTHENTICATED META ACCOUNT CONTEXT:
- Organization ID: ${state.context.organizationId}
- Connected Status: ${state.context.isConnected ? "CONNECTED" : "DISCONNECTED"}
- Active Ad Account: ${state.draft.adAccountName || state.context.adAccounts[0]?.name || "None"} (${state.draft.adAccountId || state.context.adAccounts[0]?.adAccountId || "None"})
- Connected Facebook Page: ${state.draft.pageName || state.context.pages[0]?.name || "None"}
- Instagram Accounts: ${state.context.instagramAccounts.map(i => i.username).join(", ") || "None"}
- Pixels: ${state.context.pixels.map(p => `${p.name} (${p.id})`).join(", ") || "No active purchase pixel"}
- Connected WhatsApp Numbers: ${state.context.whatsAppNumbers.map(w => w.displayPhoneNumber || w.phoneNumber).join(", ") || "None"}
- Recent Campaigns & Historical CPA Baseline:
${state.context.recentCampaigns?.length > 0
  ? state.context.recentCampaigns.map(c => `  • "${c.name}" | ${c.objective} | Status: ${c.status || c.effectiveStatus} | Daily Budget: ₹${c.dailyBudget || 'N/A'} | Spend: ₹${c.spend || 0} | Results: ${c.results || 0} ${c.resultType || ''} | CPA: ${c.costPerResult ? '₹' + c.costPerResult : 'N/A'}`).join("\n")
  : `  • Baseline Benchmark: Average CPA is ~₹${avgAccountCpa.toFixed(2)} per conversion.`}

OPERATIONAL LOGIC (PLANNER-EXECUTOR MODEL):
1. IDENTIFY INTENT & CALIBRATE LANGUAGE:
   - Identify the user's business goal (Sales, Leads, Traffic) and their experience level.
   - For beginners, avoid complex jargon (e.g. CAPI, ROAS) and explain in clear, actionable business terms.

2. DATA-GROUNDED RECOMMENDATIONS (THE LENS FRAMEWORK):
   Always justify budget, placement, and audience suggestions using the 3 Lenses:
   - Lens 1 (Foundations): Meta best practices (e.g., Advantage+ Placements, CBO).
   - Lens 2 (Account Intelligence): The user's own historical CPA (e.g., ₹${avgAccountCpa}/conversion).
   - Lens 3 (Peer Benchmarks): Vertical industry benchmarks.

3. CONVERSION VOLUME MATH (THE 50-CONVERSION LEARNING PHASE RULE):
   - For any budget recommendation, evaluate: Weekly Volume = (Daily Budget / CPA) * 7.
   - If Weekly Volume >= 50: "Your budget is sufficient to exit the learning phase (~X conversions/week)."
   - If 10 <= Weekly Volume < 50: "You may struggle to exit the learning phase (~X/week vs 50 needed). Consider a 20% budget increase."
   - If Weekly Volume < 10: "Volume is too low (~X/week). To hit ~50/week, target ~₹${Math.ceil((avgAccountCpa * 50) / 7)}/day."

5. CONVERSATIONAL GATHERING & AUDIENCE STRATEGY:
   - When the user shares initial incomplete information (e.g. "i want to promote my car shop"):
     • Keep your response ULTRA SHORT (1 to 2 sentences maximum).
     • Acknowledge their business in 1 line and ask 1 natural question about location or goal (e.g., "Awesome! Which city is your shop in, and are you aiming for direct WhatsApp service bookings?").
     • NEVER dump long numbered questionnaires or button forms.
   - When presenting the strategy (or if user shares location/goal):
     • Proactively suggest the full **Target Audience** (e.g., "Age 22–55, All Genders, interested in Vehicle Maintenance & Car Enthusiasts in Pune").
     • Present a concise 2-3 sentence recommended plan: Goal, Daily Budget (with learning phase estimate), and Suggested Audience Demographics.
     • Ask: "Shall I build the draft for this strategy?"

OUTPUT FORMAT (Valid JSON):
{
  "extractedFacts": {
    "businessName": string or null,
    "industry": string or null,
    "goal": "LEADS" | "SALES" | "TRAFFIC" | "MESSAGES" | "AWARENESS" | null,
    "destinationType": "WHATSAPP" | "WEBSITE" | "INSTANT_FORM" | "PHONE_CALL" | null,
    "websiteUrl": string or null,
    "cities": string[] or null,
    "locationDescription": string or null,
    "budgetDaily": number or null,
    "gender": "ALL" | "MEN" | "WOMEN" | null,
    "ageMin": number or null,
    "ageMax": number or null,
    "interests": string[] or null,
    "placements": "ADVANTAGE_PLUS" | "MANUAL" | null,
    "bidStrategy": "LOWEST_COST_WITHOUT_CAP" | "COST_CAP" | "BID_CAP" | null
  },
  "aiRecommendations": [
    { "field": string, "recommendedValue": any, "rationale": string }
  ],
  "creativeProposal": {
    "headline": string or null,
    "primaryText": string or null,
    "description": string or null,
    "callToAction": string or null
  },
  "isReadyForReview": boolean,
  "responseMessage": string,
  "quickChips": []
}`;

    const userPrompt = `Current Draft:\n${JSON.stringify(state.draft, null, 2)}\n\nConversation History:\n${state.conversation.map(m => `${m.sender.toUpperCase()}: ${m.text}`).join("\n")}\n\nLatest User Input: "${userText}"`;

    try {
      const aiResponse = await MetaAIProviderService.generateStructuredResponse(systemPrompt, userPrompt);

      if (aiResponse) {
        const facts = aiResponse.extractedFacts || {};

        // Apply USER extracted facts
        if (facts.businessName || facts.industry) {
          MetaCampaignDraftService.setField(state.draft, "campaign.name", facts.businessName || `${facts.industry} Campaign`, "USER");
        }
        if (facts.goal) {
          const resolvedObj = MetaAdsCapabilityService.resolveObjectiveFromGoal(facts.goal, facts.destinationType);
          MetaCampaignDraftService.setField(state.draft, "campaign.objective", resolvedObj, "USER");
        }
        if (facts.destinationType) {
          MetaCampaignDraftService.setField(state.draft, "destination.type", facts.destinationType, "USER");
        }
        if (facts.websiteUrl) {
          MetaCampaignDraftService.setField(state.draft, "destination.destinationUrl", facts.websiteUrl, "USER");
        }
        if (facts.budgetDaily && facts.budgetDaily > 0) {
          MetaCampaignDraftService.setField(state.draft, "campaign.dailyBudget", facts.budgetDaily, "USER");
        }
        if (facts.cities && facts.cities.length > 0) {
          MetaCampaignDraftService.setField(state.draft, "targeting.cities", facts.cities, "USER");
          MetaCampaignDraftService.setField(state.draft, "targeting.locationDescription", facts.cities.join(", "), "USER");
        } else if (facts.locationDescription) {
          MetaCampaignDraftService.setField(state.draft, "targeting.locationDescription", facts.locationDescription, "USER");
        }
        if (facts.gender) {
          MetaCampaignDraftService.setField(state.draft, "targeting.gender", facts.gender, "USER");
        }
        if (facts.ageMin || facts.ageMax) {
          if (facts.ageMin) MetaCampaignDraftService.setField(state.draft, "targeting.ageMin", facts.ageMin, "USER");
          if (facts.ageMax) MetaCampaignDraftService.setField(state.draft, "targeting.ageMax", facts.ageMax, "USER");
        }

        if (facts.interests && facts.interests.length > 0) {
          MetaCampaignDraftService.setField(state.draft, "targeting.interests", facts.interests, "USER");
        }
        if (facts.placements) {
          MetaCampaignDraftService.setField(state.draft, "targeting.placements", facts.placements, "USER");
        }
        if (facts.bidStrategy) {
          MetaCampaignDraftService.setField(state.draft, "campaign.bidStrategy", facts.bidStrategy, "USER");
        }

        // Apply AI Recommendations
        if (Array.isArray(aiResponse.aiRecommendations)) {
          state.draft.recommendations = aiResponse.aiRecommendations;
          for (const rec of aiResponse.aiRecommendations) {
            MetaCampaignDraftService.setField(
              state.draft,
              rec.field,
              rec.recommendedValue,
              "AI_RECOMMENDATION",
              0.85,
              rec.rationale
            );
          }
        }

        // Apply Creative Proposal if ready
        if (aiResponse.creativeProposal) {
          if (aiResponse.creativeProposal.headline) {
            MetaCampaignDraftService.setField(state.draft, "creative.headline", aiResponse.creativeProposal.headline, "AI_RECOMMENDATION");
          }
          if (aiResponse.creativeProposal.primaryText) {
            MetaCampaignDraftService.setField(state.draft, "creative.primaryText", aiResponse.creativeProposal.primaryText, "AI_RECOMMENDATION");
          }
          if (aiResponse.creativeProposal.description) {
            MetaCampaignDraftService.setField(state.draft, "creative.description", aiResponse.creativeProposal.description, "AI_RECOMMENDATION");
          }
          if (aiResponse.creativeProposal.callToAction) {
            MetaCampaignDraftService.setField(state.draft, "creative.callToAction", aiResponse.creativeProposal.callToAction, "AI_RECOMMENDATION");
          }
        }

        // Check Validation
        state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);

        if (aiResponse.isReadyForReview && state.validation.valid) {
          state.status = "CONFIRMATION";
          state.requiresConfirmation = true;
        } else {
          state.status = "DRAFTING";
          state.requiresConfirmation = false;
        }

        state.conversation.push({
          id: `msg_ai_${Date.now()}`,
          sender: "ai",
          text: aiResponse.responseMessage || "I have updated your campaign plan. Please review the details.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          quickOptions: Array.isArray(aiResponse.quickChips) && aiResponse.quickChips.length > 0 ? aiResponse.quickChips : undefined,
        });
      }
    } catch (err: any) {
      console.error("[MetaAIConversationService] AI reasoning error:", err.message);
      state.conversation.push({
        id: `msg_ai_${Date.now()}`,
        sender: "ai",
        text: `I understood your message. However, our AI reasoning service encountered a temporary notice: ${err.message}. Your draft remains intact.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      });
    }

    state.validation = MetaCampaignValidationService.validateDraft(state.draft, state.context);
    return state;
  }
}
