import { MetaAIConversationService, CampaignConversationState } from "../../src/services/meta-ads/metaAIConversationService";
import { MetaCampaignDraftService } from "../../src/services/meta-ads/metaCampaignDraftService";
import { MetaAIProviderService } from "../../src/services/meta-ads/metaAIProviderService";

describe("Meta Ads AI Assistant - Complete End-to-End User Flow Verification", () => {
  const orgId = "org_verify_123";

  beforeEach(() => {
    jest.spyOn(MetaAIProviderService, "generateStructuredResponse").mockResolvedValue(null as any);
  });

  const createInitialState = (): CampaignConversationState => {
    const draft = MetaCampaignDraftService.createInitialDraft("act_123");
    draft.campaign.name = "AI Meta Campaign Blueprint";
    return {
      sessionId: "session_flow_verify",
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
        pages: [{ id: "page_123", name: "JISNU Page" }],
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

  test("Simulates the exact user session from transcript end-to-end without bugs", async () => {
    let state = createInitialState();

    // Turn 1: User asks consultative goal question
    state = await MetaAIConversationService.processMessage(orgId, state, "muze sales boost karni hai konsa campaign choose karu");
    let aiMsg = state.conversation[state.conversation.length - 1];
    expect(aiMsg.sender).toBe("ai");
    // Verify Senior Media Buyer consultative response
    expect(aiMsg.text).toMatch(/Senior Media Buyer/i);
    expect(aiMsg.text).toMatch(/WhatsApp/i);
    expect(aiMsg.text).toMatch(/business|brand/i);

    // Turn 2: User provides business name and service
    state = await MetaAIConversationService.processMessage(orgId, state, "mere business ka nam jisnu hai or ham software development provide karte hai");
    aiMsg = state.conversation[state.conversation.length - 1];
    expect(state.draft.campaign.name).toMatch(/jisnu/i);
    // Special category prompt should be in Hinglish
    expect(aiMsg.text).toMatch(/Special Ad Category/i);

    // Turn 3: User picks None (Normal Ad)
    state = await MetaAIConversationService.processMessage(orgId, state, "None", "NONE");
    aiMsg = state.conversation[state.conversation.length - 1];
    // Destination question should be in Hinglish, not Marathi
    expect(aiMsg.text).toMatch(/kahan bhejna chahte hain|Ad Destination/i);
    expect(aiMsg.text).not.toMatch(/kuthe pathvayche ahe/i);

    // Turn 4: User picks WhatsApp Chat
    state = await MetaAIConversationService.processMessage(orgId, state, "WhatsApp Chat", "DESTINATION_WHATSAPP");
    aiMsg = state.conversation[state.conversation.length - 1];
    expect(state.draft.destination.type).toBe("WHATSAPP");
    // Should prompt for WhatsApp number with connected number option in Hinglish
    expect(aiMsg.text).toMatch(/WhatsApp number/i);
    expect(aiMsg.quickOptions?.some(opt => opt.value.includes("USE_PHONE_"))).toBe(true);

    // Turn 4: User selects connected phone number
    state = await MetaAIConversationService.processMessage(orgId, state, "+91 98765 43210", "USE_PHONE_919876543210");
    aiMsg = state.conversation[state.conversation.length - 1];
    expect(state.draft.destination.whatsappPhoneNumber).toBe("919876543210");
    // Should be in Latin Hinglish, NOT pure Devanagari!
    expect(aiMsg.text).toMatch(/WhatsApp number.*save ho gaya hai/i);
    expect(aiMsg.text).not.toMatch(/व्हाट्सएप नंबर.*सेव कर लिया गया है/i);
    // Location options must have Latin options
    expect(aiMsg.quickOptions?.some(opt => opt.label.includes("All India (Poora Bharat)"))).toBe(true);

    // Turn 5: User chooses All India
    state = await MetaAIConversationService.processMessage(orgId, state, "📍 All India (Poora Bharat)", "ALL_INDIA");
    aiMsg = state.conversation[state.conversation.length - 1];
    expect(state.draft.targeting.locationDescription).toBe("All India");
    // Demographics prompt in Hinglish
    expect(aiMsg.quickOptions?.some(opt => opt.value === "AGE_18_65_ALL")).toBe(true);

    // Turn 6: User clicks Demographics chip "👥 सभी लिंग (18 से 65 वर्ष)"
    state = await MetaAIConversationService.processMessage(orgId, state, "👥 सभी लिंग (18 से 65 वर्ष)", "AGE_18_65_ALL");
    aiMsg = state.conversation[state.conversation.length - 1];
    // Age & gender correctly saved
    expect(state.draft.targeting.ageMin).toBe(18);
    expect(state.draft.targeting.ageMax).toBe(65);
    expect(state.draft.targeting.gender).toBe("ALL");
    // CRITICAL: Ensure targeting.cities was NOT polluted with "सभी लिंग" or radius 18!
    expect(state.draft.targeting.cities || []).not.toContain("सभी लिंग");
    expect((state.draft.targeting.cityConfigs || []).some(c => c.name.includes("लिंग"))).toBe(false);

    // Turn 7: User selects Advantage+ Audience / Placements
    state = await MetaAIConversationService.processMessage(orgId, state, "💼 Software, IT & Tech Business Owners", "INTEREST_TECH_BUSINESS");
    expect(state.draft.targeting.interests).toBeDefined();

    // Turn 8: User asks for budget advice
    state = await MetaAIConversationService.processMessage(orgId, state, "kitna budget sahi rahega?");
    aiMsg = state.conversation[state.conversation.length - 1];
    expect(aiMsg.text).toMatch(/Senior Media Buyer|500|Budget/i);
    expect(aiMsg.quickOptions?.some(opt => opt.value === "BUDGET_500")).toBe(true);

    // Turn 9: User picks 500 budget
    state = await MetaAIConversationService.processMessage(orgId, state, "₹500 / day (Advantage CBO)", "BUDGET_500");
    expect(state.draft.campaign.dailyBudget).toBe(500);

    // Turn 10: Placements prompt
    const lastMsg = state.conversation[state.conversation.length - 1];
    expect(lastMsg.text).toMatch(/Placements|Ad/i);
  });
});
