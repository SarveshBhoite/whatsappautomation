const { MetaAIConversationService } = require('./dist/services/meta-ads/metaAIConversationService');
const { MetaAIProviderService } = require('./dist/services/meta-ads/metaAIProviderService');

jest = { spyOn: () => ({ mockResolvedValue: () => {} }) };

const orgId = "org_123";
let state = {
  sessionId: "session_test",
  versionNumber: 1,
  status: "DISCOVERY",
  draft: {
    campaign: { name: "AI Meta Campaign Blueprint" },
    destination: {},
    targeting: {},
    creative: {},
    sourceMap: {},
  },
  validation: { isValid: false, issues: [] },
  context: {
    adAccounts: [{ id: "act_123", name: "Test Account", currency: "INR", timezone_name: "Asia/Kolkata" }],
    pages: [{ id: "page_123", name: "JISNU Page" }],
    timezones: ["Asia/Kolkata"],
    whatsAppNumbers: [{ phoneNumber: "+919876543210", displayPhoneNumber: "+91 98765 43210" }],
    pixels: [],
  },
  conversation: [
    {
      id: "msg_init",
      sender: "ai",
      text: "Hello! I'm JISNU AI, your dedicated Senior Media Buyer. How can I help you create your Meta ad campaign today?",
      timestamp: "10:00 AM",
    },
  ],
  requiresConfirmation: false,
};

async function run() {
  state = await MetaAIConversationService.processMessage(orgId, state, "muze sales boost karni hai software development ke liye");
  console.log('Turn 1 AI:', state.conversation[state.conversation.length - 1].text);

  state = await MetaAIConversationService.processMessage(orgId, state, "JISNU Digital");
  console.log('Turn 2 AI:', state.conversation[state.conversation.length - 1].text);

  state = await MetaAIConversationService.processMessage(orgId, state, "None");
  console.log('Turn 3 AI:', state.conversation[state.conversation.length - 1].text);

  state = await MetaAIConversationService.processMessage(orgId, state, "WhatsApp Chat");
  console.log('Turn 4 AI:', state.conversation[state.conversation.length - 1].text);
  console.log('Turn 4 draft dest:', state.draft.destination);

  state = await MetaAIConversationService.processMessage(orgId, state, "+91 98765 43210");
  console.log('Turn 5 AI:', state.conversation[state.conversation.length - 1].text);
  console.log('Turn 5 draft dest:', state.draft.destination);
  console.log('Turn 5 currentQuestionId:', state.currentQuestionId);
}

run().catch(console.error);
