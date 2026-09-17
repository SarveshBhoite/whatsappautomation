import {
  MetaAIConversationService,
  CampaignConversationState,
  resolveCampaignFieldStatus,
} from "../../src/services/meta-ads/metaAIConversationService";
import { MetaCampaignDraftService } from "../../src/services/meta-ads/metaCampaignDraftService";
import { MetaAIProviderService } from "../../src/services/meta-ads/metaAIProviderService";

describe("Meta Ads AI Assistant - Context Reuse & Anti-Repetition Test Suite", () => {
  const orgId = "org_test_context_reuse";

  beforeEach(() => {
    jest.spyOn(MetaAIProviderService, "generateStructuredResponse").mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const createTestState = (): CampaignConversationState => {
    const draft = MetaCampaignDraftService.createInitialDraft("act_123456789");
    draft.adAccountId = "act_123456789";
    draft.adAccountName = "JISNU Digital Ads Account";
    draft.pageId = "page_12345";
    draft.pageName = "JISNU Page";

    return {
      sessionId: "session_test_1",
      versionNumber: 1,
      status: "DISCOVERY",
      draft,
      validation: {
        valid: false,
        criticalCount: 0,
        warningCount: 0,
        policyBreaches: [],
        missingRequiredFields: [],
        structuralErrors: [],
        riskScore: 0,
      },
      context: {
        organizationId: orgId,
        isConnected: true,
        activeAdAccountId: "act_123456789",
        activePageId: "page_12345",
        adAccounts: [
          {
            id: "act_123456789",
            adAccountId: "act_123456789",
            name: "JISNU Digital Ads Account",
            accountStatus: 1,
            currency: "INR",
            timezoneName: "Asia/Kolkata",
            isActive: true,
          },
        ],
        pages: [{ id: "page_12345", name: "JISNU Page" }],
        instagramAccounts: [],
        pixels: [],
        whatsAppNumbers: [{ phoneNumber: "919876543210", displayPhoneNumber: "+91 98765 43210", verifiedName: "JISNU Digital" }],
        customAudiences: [],
        recentCampaigns: [],
        accountMetrics: { totalSpend: 50000, avgCpa: 45 },
        currencies: ["INR"],
        timezones: ["Asia/Kolkata"],
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
  };

  test("Test 1: Brand is not repeated after user provides brand name", async () => {
    let state = createTestState();

    // Turn 1: User indicates objective & service
    state = await MetaAIConversationService.processMessage(orgId, state, "sales chahiye website development ke liye");

    // Turn 2: User provides brand name
    state = await MetaAIConversationService.processMessage(orgId, state, "JISNU Digital Solutions Pvt.Ltd");

    expect(state.draft.campaign.name).toBe("JISNU Digital Solutions Pvt.Ltd");

    const fieldStatus = resolveCampaignFieldStatus({
      draft: state.draft,
      conversation: state.conversation,
      context: state.context,
    });
    expect(fieldStatus.brandName).toBe("completed");

    const lastAiMsg = state.conversation[state.conversation.length - 1].text;
    expect(lastAiMsg).not.toMatch(/आपके व्यवसाय, दुकान या ब्रांड का नाम क्या है/i);
    expect(lastAiMsg).not.toMatch(/What is your business, store, or brand name/i);
  });

  test("Test 2: Service is not repeated after user provides service", async () => {
    let state = createTestState();

    state = await MetaAIConversationService.processMessage(orgId, state, "sales chahiye website development ke liye");

    expect(state.draft.campaign.objective).toBe("OUTCOME_SALES");
    expect(state.draft.campaign.promotedService).toMatch(/website development/i);

    const fieldStatus = resolveCampaignFieldStatus({
      draft: state.draft,
      conversation: state.conversation,
      context: state.context,
    });
    expect(fieldStatus.objective).toBe("completed");
    expect(fieldStatus.promotedService).toBe("completed");
  });

  test("Test 3: NONE is treated as completed, not missing", async () => {
    const state = createTestState();
    state.draft.campaign.specialAdCategory = "NONE";
    state.draft.sourceMap["campaign.specialAdCategory"] = {
      value: "NONE",
      source: "USER",
      confidence: 1.0,
      updatedAt: new Date().toISOString(),
    };

    const fieldStatus = resolveCampaignFieldStatus({
      draft: state.draft,
      conversation: state.conversation,
      context: state.context,
    });
    expect(fieldStatus.specialAdCategory).toBe("completed");
  });

  test("Test 4: Multiple values in one compound message are all extracted", async () => {
    let state = createTestState();

    state = await MetaAIConversationService.processMessage(
      orgId,
      state,
      "sales chahiye website development ke liye, Pune target karo, 1500 daily budget"
    );

    expect(state.draft.campaign.objective).toBe("OUTCOME_SALES");
    expect(state.draft.campaign.promotedService).toMatch(/website development/i);
    expect(state.draft.targeting.cities).toContain("Pune");
    expect(state.draft.campaign.dailyBudget).toBe(1500);

    const fieldStatus = resolveCampaignFieldStatus({
      draft: state.draft,
      conversation: state.conversation,
      context: state.context,
    });
    expect(fieldStatus.objective).toBe("completed");
    expect(fieldStatus.promotedService).toBe("completed");
    expect(fieldStatus.location).toBe("completed");
    expect(fieldStatus.budget).toBe("completed");
  });

  test("Test 5: State transitions do not reset accumulated draft data", async () => {
    let state = createTestState();

    state.draft.campaign.name = "JISNU Digital Solutions Pvt.Ltd";
    state.draft.campaign.objective = "OUTCOME_SALES";
    state.draft.campaign.promotedService = "website development";
    state.draft.campaign.specialAdCategory = "NONE";
    state.draft.sourceMap["campaign.name"] = { value: "JISNU Digital Solutions Pvt.Ltd", source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["campaign.specialAdCategory"] = { value: "NONE", source: "USER", confidence: 1.0, updatedAt: "" };

    state.status = "DISCOVERY";
    state.status = "STRATEGY";
    state.status = "DRAFTING";

    const fieldStatus = resolveCampaignFieldStatus({
      draft: state.draft,
      conversation: state.conversation,
      context: state.context,
    });
    expect(fieldStatus.brandName).toBe("completed");
    expect(fieldStatus.objective).toBe("completed");
    expect(fieldStatus.promotedService).toBe("completed");
    expect(fieldStatus.specialAdCategory).toBe("completed");
  });

  test("Test 6: User correction updates only the target field and preserves others", async () => {
    let state = createTestState();

    state.draft.campaign.name = "JISNU Digital Solutions";
    state.draft.campaign.brandName = "JISNU Digital Solutions";
    state.draft.campaign.objective = "OUTCOME_SALES";
    state.draft.campaign.promotedService = "website development";

    state = await MetaAIConversationService.processMessage(orgId, state, "brand name change karo to JISNU AI");

    expect(state.draft.campaign.name).toBe("JISNU AI");
    expect(state.draft.campaign.brandName).toBe("JISNU AI");
    expect(state.draft.campaign.objective).toBe("OUTCOME_SALES");
    expect(state.draft.campaign.promotedService).toBe("website development");
  });

  test("Test 7: Explicit reset clears campaign context", async () => {
    let state = createTestState();

    state.draft.campaign.name = "JISNU Digital Solutions";
    state.draft.campaign.objective = "OUTCOME_SALES";
    state.draft.campaign.dailyBudget = 2000;

    state = await MetaAIConversationService.processMessage(orgId, state, "reset campaign");

    expect(state.draft.campaign.name).toBeUndefined();
    expect(state.draft.campaign.dailyBudget).toBeUndefined();
    expect(state.status).toBe("DISCOVERY");

    const fieldStatus = resolveCampaignFieldStatus({
      draft: state.draft,
      conversation: state.conversation,
      context: state.context,
    });
    expect(fieldStatus.brandName).toBe("missing");
    expect(fieldStatus.budget).toBe("missing");
  });

  test("Test 8: Current real conversation regression simulation", async () => {
    let state = createTestState();

    // Turn 1: User says goal & service
    state = await MetaAIConversationService.processMessage(orgId, state, "bhai muze sales chahiye web site development ke liye");

    // Turn 2: User provides brand name
    state = await MetaAIConversationService.processMessage(orgId, state, "JISNU Digital Solutions Pvt.Ltd");

    // Turn 3: User answers None for Special Ad Category
    state = await MetaAIConversationService.processMessage(orgId, state, "None");

    // Assert: Next assistant message MUST NOT ask for business name, brand name, or service!
    const lastAiMsg = state.conversation[state.conversation.length - 1].text;

    expect(lastAiMsg).not.toMatch(/आपके\s*व्यवसाय|दुकान|ब्रांड\s*का\s*नाम/i);
    expect(lastAiMsg).not.toMatch(/What is your business, store, or brand name/i);
    expect(lastAiMsg).not.toMatch(/कोणते उत्पादन, सेवा किंवा ऑफर/i);
    expect(lastAiMsg).not.toMatch(/किस उत्पाद, सेवा या विशेष ऑफर/i);

    // It should ask for the next genuinely missing parameter (Destination)
    expect(lastAiMsg).toMatch(/Destination|गंतव्य|कुठे পাঠवायचे|kahan bhejna|Ad Destination/i);
  });

  test("Test 9: Hinglish input responds in Latin script Hinglish", async () => {
    let state = createTestState();

    state = await MetaAIConversationService.processMessage(orgId, state, "muze website ke liye sales chahiye");

    const lastAiMsg = state.conversation[state.conversation.length - 1].text;
    // Should NOT be pure Devanagari Hindi or Marathi
    expect(lastAiMsg).not.toMatch(/आपके \*\*व्यवसाय, दुकान या ब्रांड का नाम\*\*/);
    expect(lastAiMsg).not.toMatch(/तुमच्या \*\*व्यवसायाचे, दुकानाचे किंवा ब्रँडचे नाव\*\*/);
    // Should be Latin script Hinglish
    expect(lastAiMsg).toMatch(/Aapke \*\*business, shop ya brand ka naam\*\*/i);
    // Draft brand should not be polluted by goal sentence
    expect(state.draft.campaign.name || "").not.toMatch(/muze website ke liye sales chahiye/i);
  });

  test("Test 10: Advantage+ placement button click does not hijack destination to Instant Form", async () => {
    let state = createTestState();

    // Set up draft up to placements
    state.draft.campaign.name = "Acme Store";
    state.draft.campaign.specialAdCategory = "NONE";
    state.draft.destination = { type: "WEBSITE", destinationUrl: "https://acme.com" };
    state.draft.sourceMap["campaign.name"] = { value: "Acme Store", source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["campaign.specialAdCategory"] = { value: "NONE", source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["destination.type"] = { value: "WEBSITE", source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["destination.destinationUrl"] = { value: "https://acme.com", source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.targeting.cities = ["Mumbai"];
    state.draft.targeting.ageMin = 18;
    state.draft.targeting.ageMax = 65;
    state.draft.targeting.gender = "ALL";
    state.draft.sourceMap["targeting.cities"] = { value: ["Mumbai"], source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["targeting.ageMin"] = { value: 18, source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["targeting.interests"] = { value: ["Shopping"], source: "USER", confidence: 1.0, updatedAt: "" };

    // Simulate clicking Advantage+ placement chip with Devanagari text
    state = await MetaAIConversationService.processMessage(orgId, state, "✨ Advantage+ सभी प्लेटफॉर्म");

    // Placements should be updated
    expect(state.draft.targeting.placements).toBe("ADVANTAGE_PLUS");
    // Destination MUST STILL BE WEBSITE, not changed to INSTANT_FORM
    expect(state.draft.destination.type).toBe("WEBSITE");
    expect(state.draft.destination.leadGenFormFields).toBeUndefined();
  });

  test("Test 11: Website Addon button click sets browserAddOn and keeps destination as WEBSITE", async () => {
    let state = createTestState();

    state.draft.campaign.name = "Tech Corp";
    state.draft.campaign.specialAdCategory = "NONE";
    state.draft.destination = { type: "WEBSITE" };
    state.draft.sourceMap["campaign.name"] = { value: "Tech Corp", source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["campaign.specialAdCategory"] = { value: "NONE", source: "USER", confidence: 1.0, updatedAt: "" };
    state.draft.sourceMap["destination.type"] = { value: "WEBSITE", source: "USER", confidence: 1.0, updatedAt: "" };

    // User clicks WhatsApp Addon button
    state = await MetaAIConversationService.processMessage(orgId, state, "ADDON_WHATSAPP");

    expect(state.draft.destination.type).toBe("WEBSITE");
    expect(state.draft.destination.browserAddOn).toBe("WHATSAPP");
  });
});
