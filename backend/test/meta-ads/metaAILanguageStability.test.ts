import { MetaAIConversationService, CampaignConversationState, MetaLanguageAnalyzerService } from "../../src/services/meta-ads/metaAIConversationService";
import { MetaCampaignDraftService } from "../../src/services/meta-ads/metaCampaignDraftService";
import { MetaAIProviderService } from "../../src/services/meta-ads/metaAIProviderService";

describe("Meta Ads AI Assistant - Language Stability & Anti-Jumping Suite", () => {
  const orgId = "org_test";

  beforeEach(() => {
    jest.spyOn(MetaAIProviderService, "generateStructuredResponse").mockResolvedValue(null as any);
  });

  const createTestState = (): CampaignConversationState => {
    const draft = MetaCampaignDraftService.createInitialDraft("act_123");
    draft.campaign.name = "AI Meta Campaign Blueprint";
    return {
      sessionId: "session_test",
      versionNumber: 1,
      status: "DISCOVERY",
      draft,
      validation: { valid: false, errors: [], warnings: [], info: [], blockingCount: 0 },
      context: {
        adAccounts: [
          {
            id: "act_123",
            adAccountId: "act_123",
            name: "Test Account",
            currency: "INR",
            timezoneName: "Asia/Kolkata",
            accountStatus: 1,
            isActive: true,
          },
        ],
        pages: [{ id: "page_123", name: "Test Page" }],
        timezones: ["Asia/Kolkata"],
        whatsAppNumbers: [{ phoneNumber: "+919876543210", displayPhoneNumber: "+91 98765 43210" }],
        pixels: [],
        instagramAccounts: [],
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

  test("User Hinglish input does not erroneously flip to Marathi when verbs like 'karte' or 'ham' appear", () => {
    // 1. Initial Hinglish request
    const lang1 = MetaLanguageAnalyzerService.analyzeUserLanguage("muze sales ke liye ad run karna hai");
    expect(lang1.code).toBe("hi");
    expect(lang1.variant).toBe("hinglish");

    // 2. Second turn with 'jisnu or ham software development provide karte hai'
    const lang2 = MetaLanguageAnalyzerService.analyzeUserLanguage("jisnu or ham software development provide karte hai", lang1);
    expect(lang2.code).toBe("hi");
    expect(lang2.variant).toBe("hinglish");

    const style = MetaLanguageAnalyzerService.getLanguageStyle(lang2);
    expect(style.isHinglish).toBe(true);
    expect(style.isMarathlish).toBe(false);
    expect(style.isMarathi).toBe(false);
  });

  test("Short parameter inputs preserve active session language (Hinglish)", () => {
    const hinglishSession = {
      code: "hi",
      name: "Hindi (Hinglish)",
      nativeName: "Hinglish",
      metaLocaleKey: 20,
      localeCode: "hi_IN",
      script: "Latin",
      confidence: 0.98,
      variant: "hinglish" as const,
    };

    const inputs = [
      "JISNU Digital Solutions",
      "software development",
      "500 rs per day",
      "pune 25km",
      "None",
    ];

    inputs.forEach((input) => {
      const result = MetaLanguageAnalyzerService.analyzeUserLanguage(input, hinglishSession);
      expect(result.code).toBe("hi");
      expect(result.variant).toBe("hinglish");
    });
  });

  test("Clear Marathi transliterated input correctly detects Marathlish", () => {
    const lang = MetaLanguageAnalyzerService.analyzeUserLanguage("aamhi pune madhe ad run karaychi ahe, customers pahijet");
    expect(lang.code).toBe("mr");
    expect(lang.variant).toBe("marathlish");

    const style = MetaLanguageAnalyzerService.getLanguageStyle(lang);
    expect(style.isMarathlish).toBe(true);
    expect(style.isHinglish).toBe(false);
  });

  test("Explicit language override commands work immediately", () => {
    const toMarathi = MetaLanguageAnalyzerService.analyzeUserLanguage("marathi madhe bola");
    expect(toMarathi.code).toBe("mr");

    const toHindi = MetaLanguageAnalyzerService.analyzeUserLanguage("hindi me bolo");
    expect(toHindi.code).toBe("hi");

    const toEnglish = MetaLanguageAnalyzerService.analyzeUserLanguage("speak in english please");
    expect(toEnglish.code).toBe("en");

    const switchEnglish = MetaLanguageAnalyzerService.analyzeUserLanguage("switch to english");
    expect(switchEnglish.code).toBe("en");
  });

  test("Dynamically switches when user naturally transitions language in conversation", () => {
    // Starts in Hinglish
    let session = MetaLanguageAnalyzerService.analyzeUserLanguage("muze sales ke liye ad run karna hai");
    expect(session.code).toBe("hi");
    expect(session.variant).toBe("hinglish");

    // Natural switch to Marathi in Roman script
    session = MetaLanguageAnalyzerService.analyzeUserLanguage("mala ad pune madhe run karaychi ahe, customers pahijet", session);
    expect(session.code).toBe("mr");
    expect(session.variant).toBe("marathlish");

    // Natural switch to English
    session = MetaLanguageAnalyzerService.analyzeUserLanguage("I want to target people in Mumbai with a daily budget of 1000", session);
    expect(session.code).toBe("en");

    // Natural switch from English back to Hinglish
    session = MetaLanguageAnalyzerService.analyzeUserLanguage("bhai daily budget 500 rs karna hai", session);
    expect(session.code).toBe("hi");
    expect(session.variant).toBe("hinglish");
  });

  test("When user asks 'best approach ky rahega destination', AI suggests WhatsApp and Instant Form without jumping to Location", async () => {
    let state = createTestState();
    // Step 1: User indicates goal
    state = await MetaAIConversationService.processMessage(orgId, state, "muze sales ke liye ad karana hai");

    // Step 2: User provides business name and service
    state = await MetaAIConversationService.processMessage(orgId, state, "mere business ka nam jisnu hai or ham software development provide karte hai");
    expect(state.draft.campaign.name).toBe("Jisnu");

    // Step 3: User asks for recommendation: 'best approach ky rahega destination'
    state = await MetaAIConversationService.processMessage(orgId, state, "best approach ky rahega destination");

    const lastAiMsg = state.conversation[state.conversation.length - 1];
    expect(lastAiMsg.sender).toBe("ai");
    // Should NOT jump to Location!
    expect(lastAiMsg.text).not.toContain("Target Location");
    expect(lastAiMsg.text).not.toContain("kis city ya area");
    // Should suggest WhatsApp & Instant Form
    expect(lastAiMsg.text).toMatch(/WhatsApp|Instant Lead Form/i);
    expect(lastAiMsg.text).toMatch(/Senior Media Buyer/i);
    // Destination should NOT be falsely set to APP!
    expect(state.draft.destination.type).not.toBe("APP");
    // Quick options should have WhatsApp Chat Recommended
    expect(lastAiMsg.quickOptions?.some(opt => opt.value === "DESTINATION_WHATSAPP")).toBe(true);
  });

  test("When user asks for budget suggestion, AI explains sweet spot without jumping to copy or creative", async () => {
    let state = createTestState();
    // Provide brand & destination
    state.draft.campaign.name = "Jisnu";
    state.draft.destination.type = "WHATSAPP";
    state.draft.targeting.cities = ["Pune"];
    state.draft.targeting.ageMin = 18;
    state.draft.targeting.ageMax = 65;
    state.conversation.push({
      id: "msg_ai_budget",
      sender: "ai",
      text: "Aap is campaign ke liye daily kitna budget spend karna chahte hain?",
      timestamp: "11:00 AM",
    });

    state = await MetaAIConversationService.processMessage(orgId, state, "kitna budget sahi rahega?");
    const lastAiMsg = state.conversation[state.conversation.length - 1];
    expect(lastAiMsg.sender).toBe("ai");
    expect(lastAiMsg.text).toMatch(/500|Senior Media Buyer|बजट|Budget/i);
    expect(lastAiMsg.quickOptions?.some(opt => opt.value === "BUDGET_500")).toBe(true);
  });

  test("Demographic selection '👥 सभी लिंग (18 से 65 वर्ष)' does not get falsely parsed as a city location", () => {
    const bulkCheck = MetaAIConversationService.parseBulkLocationInput("👥 सभी लिंग (18 से 65 वर्ष)");
    expect(bulkCheck.hasBulkData).toBe(false);
    expect(bulkCheck.cityConfigs.some(c => /सभी लिंग|लिंग|वर्ष/i.test(c.name))).toBe(false);
  });

  test("Selecting connected phone number preserves active Latin Hinglish script without flipping to Devanagari", async () => {
    let state = createTestState();
    // Simulate Hinglish conversation up to phone selection
    state = await MetaAIConversationService.processMessage(orgId, state, "muze sales boost karni hai software development ke liye");
    state = await MetaAIConversationService.processMessage(orgId, state, "JISNU Digital");
    state = await MetaAIConversationService.processMessage(orgId, state, "None");
    state = await MetaAIConversationService.processMessage(orgId, state, "WhatsApp Chat");

    // User selects connected phone number
    state = await MetaAIConversationService.processMessage(orgId, state, "+91 98765 43210");

    const lastAiMsg = state.conversation[state.conversation.length - 1];
    expect(lastAiMsg.sender).toBe("ai");
    // Must be Latin Hinglish, NOT pure Devanagari!
    expect(lastAiMsg.text).toMatch(/WhatsApp number.*save ho gaya hai/i);
    expect(lastAiMsg.text).not.toMatch(/व्हाट्सएप नंबर.*सेव कर लिया गया है/i);
    // Chips should also be Latin Hinglish
    expect(lastAiMsg.quickOptions?.some(o => o.label.includes("All India (Poora Bharat)"))).toBe(true);
  });

  test("Turn 1 goal question 'muze sales boost karni hai konsa campaign choose karu' provides consultative Senior Media Buyer guidance", async () => {
    let state = createTestState();
    state = await MetaAIConversationService.processMessage(orgId, state, "muze sales boost karni hai konsa campaign choose karu");

    const lastAiMsg = state.conversation[state.conversation.length - 1];
    expect(lastAiMsg.sender).toBe("ai");
    expect(lastAiMsg.text).toMatch(/Senior Media Buyer/i);
    expect(lastAiMsg.text).toMatch(/WhatsApp/i);
    expect(lastAiMsg.text).toMatch(/business.*naam|brand/i);
    expect(lastAiMsg.quickOptions?.some(o => o.value === "GOAL_WHATSAPP")).toBe(true);
  });
});
