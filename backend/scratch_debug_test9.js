const { MetaAIConversationService, MetaAIProviderService } = require('./src/services/meta-ads/metaAIConversationService');

const orgId = "org_test";
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
    pages: [{ id: "page_123", name: "Test Page" }],
    timezones: ["Asia/Kolkata"],
    whatsAppNumbers: [{ phoneNumber: "+919876543210", displayPhoneNumber: "+91 98765 43210" }],
    pixels: [],
  },
  conversation: [
    {
      id: "msg_init",
      sender: "ai",
      text: "Hello! I'm JISNU AI, your Senior Media Buyer. How can I help you create your Meta ad campaign today?",
      timestamp: "10:00 AM",
    },
  ],
  requiresConfirmation: false,
};

async function testTrace() {
  state = await MetaAIConversationService.processMessage(orgId, state, "muze sales boost karni hai software development ke liye");
  state = await MetaAIConversationService.processMessage(orgId, state, "JISNU Digital");
  state = await MetaAIConversationService.processMessage(orgId, state, "None");
  state = await MetaAIConversationService.processMessage(orgId, state, "WhatsApp Chat");
  console.log('Before Turn 5 - draft dest:', state.draft.destination);
  state = await MetaAIConversationService.processMessage(orgId, state, "+91 98765 43210");
  console.log('After Turn 5 - last msg:', state.conversation[state.conversation.length - 1].text);
  console.log('After Turn 5 - draft dest:', state.draft.destination);
}

testTrace().catch(console.error);
