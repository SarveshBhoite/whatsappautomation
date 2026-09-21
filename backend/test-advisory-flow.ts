import { MetaAIConversationService, CampaignConversationState } from "./src/services/meta-ads/metaAIConversationService";
import { MetaCampaignDraftService } from "./src/services/meta-ads/metaCampaignDraftService";

async function runTest() {
  const initialDraft = MetaCampaignDraftService.createInitialDraft("test-org-123");
  let state: CampaignConversationState = {
    sessionId: "test-sess-1",
    versionNumber: 1,
    status: "DISCOVERY",
    draft: initialDraft,
    validation: { isValid: false, issues: [], completenessScore: 0 } as any,
    context: {
      organizationId: "test-org-123",
      adAccounts: [],
      pages: [],
      whatsAppNumbers: [],
      researchAudit: {
        accountName: "Aj Creation",
        campaignCount: 5,
        totalSpend: 25000,
        totalResults: 1470,
        avgCpa: 17,
        avgCtr: 2.1,
        avgCpc: 4.5,
        topCities: ["Pune", "Mumbai", "Pimpri-Chinchwad"],
        keyInsights: ["Advantage+ placement delivered 35% lower CPA"],
        budgetLeakages: [],
        recommendedStrategy: {
          objective: "OUTCOME_LEADS",
          destination: "WHATSAPP",
          dailyBudget: 500,
          targetCities: ["Pune", "Mumbai", "Pimpri-Chinchwad"],
          ageMin: 18,
          ageMax: 45,
          gender: "ALL",
          suggestedInterests: ["Shopping & fashion", "Festive clothing"],
          advantagePlusAudience: true,
          suggestedHeadline: "Diwali Special Offer - Aj Creation",
          suggestedPrimaryText: "Celebrate this Diwali with our exclusive festive collection!",
          suggestedDescription: "Rated 4.9/5 by 10,000+ Happy Shoppers",
          suggestedCta: "ORDER_NOW",
          expectedMonthlyLeads: 875,
          expectedCpa: 17
        }
      } as any
    } as any,
    conversation: [
      {
        id: "msg_1",
        sender: "ai",
        text: "Hello! I'm JISNU AI, your dedicated Senior Media Buyer. How can I help you create your Meta ad campaign today?",
        timestamp: "01:14 pm"
      }
    ],
    requiresConfirmation: false
  };

  console.log("=== Step 1: User asks 'i want promote my clothing brand so which type of campaign should i run' ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "i want promote my clothing brand so which type of campaign should i run");
  console.log("AI reply:\n", state.conversation[state.conversation.length - 1].text);
  console.log("AI options:\n", state.conversation[state.conversation.length - 1].quickOptions);

  console.log("\n=== Step 2: User selects '💬 WhatsApp Inquiries (⭐ Recommended for Fashion)' ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "💬 WhatsApp Inquiries (⭐ Recommended for Fashion)", "GOAL_WHATSAPP");
  console.log("AI reply:", state.conversation[state.conversation.length - 1].text.slice(0, 150));

  console.log("\n=== Step 3: User selects None (Standard Ad) ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "None", "NONE");
  console.log("AI reply:", state.conversation[state.conversation.length - 1].text.slice(0, 150));

  console.log("\n=== Step 4: User asks 'which city should i target for this to get more sales and leads' ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "which city should i target for this to get more sales and leads");
  const lastMsg = state.conversation[state.conversation.length - 1];
  console.log("AI reply:", lastMsg.text.slice(0, 150));

  console.log("\n=== Step 5: User selects city ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "Pune, Mumbai", "Pune, Mumbai");
  console.log("AI reply:", state.conversation[state.conversation.length - 1].text.slice(0, 150));

  console.log("\n=== Step 6: User selects demographics ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "18-45 All", "AGE_18_45_ALL");
  console.log("AI reply:", state.conversation[state.conversation.length - 1].text.slice(0, 150));

  console.log("\n=== Step 7: User asks for Detailed Targeting suggestions ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "can you suggest detailed targeting for my clothing shop?");
  const targetMsg = state.conversation[state.conversation.length - 1];
  console.log("AI reply on Detailed Targeting:\n", targetMsg.text);
  console.log("AI options:", targetMsg.quickOptions);

  console.log("\n=== Step 8: User clicks Browse ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "Browse", "BROWSE_TARGETING_CATEGORIES");
  const browseMsg = state.conversation[state.conversation.length - 1];
  console.log("AI reply on Browse:\n", browseMsg.text);
  console.log("AI options on Browse:", browseMsg.quickOptions);

  console.log("\n=== Step 9: User selects 'Demographics > Work > Job titles > Small business' ===");
  state = await MetaAIConversationService.processMessage("test-org-123", state, "Demographics > Work > Job titles > Small business", "TARGETING_DEMO_SMALL_BUSINESS");
  console.log("Saved targeting interests:", state.draft.targeting.interests);
}

runTest().catch(console.error);
