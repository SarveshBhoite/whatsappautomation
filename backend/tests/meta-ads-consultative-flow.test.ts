import { MetaAIConversationService } from "../src/services/meta-ads/metaAIConversationService";

async function runTest() {
  console.log("=== STARTING CONSULTATIVE & MICRO-QUESTION TEST ===");

  const orgId = "demo-org-123";
  // Step 0: Initialize session
  let state = await MetaAIConversationService.getInitialSession(orgId);

  // Step 1: User says "create a new campaign"
  console.log("\n--- Turn 1: User starts new campaign ---");
  state = await MetaAIConversationService.processMessage(
    orgId,
    state,
    "create a new campaign"
  );
  let lastAiMsg = state.conversation[state.conversation.length - 1];
  console.log("AI Message:", lastAiMsg.text);
  console.log("Options:", lastAiMsg.quickOptions?.map((o: any) => o.label));

  if (!lastAiMsg.text.includes("name of your business") && !lastAiMsg.text.includes("व्यवसायाचे") && !lastAiMsg.text.includes("व्यवसाय")) {
    throw new Error("Turn 1 failed: Did not ask for business name as first micro question!");
  }
  if (!lastAiMsg.quickOptions?.some((o: any) => o.value === "GUIDE_ME_ON_CURRENT_STEP")) {
    throw new Error("Turn 1 failed: Missing '💡 Suggest for me' pill!");
  }

  // Step 2: User asks for suggestion ("suggest me")
  console.log("\n--- Turn 2: User asks 'suggest me' ---");
  state = await MetaAIConversationService.processMessage(
    orgId,
    state,
    "suggest me"
  );
  lastAiMsg = state.conversation[state.conversation.length - 1];
  console.log("AI Message:\n", lastAiMsg.text);
  console.log("Options:", lastAiMsg.quickOptions?.map((o: any) => o.label));

  if (!lastAiMsg.text.includes("Senior Media Buyer") && !lastAiMsg.text.includes("Recommendation")) {
    throw new Error("Turn 2 failed: Did not provide Senior Media Buyer consultative guidance!");
  }

  // Step 3: User chooses "Ak Cars"
  console.log("\n--- Turn 3: User selects 'Ak Cars' ---");
  state = await MetaAIConversationService.processMessage(
    orgId,
    state,
    "Ak Cars",
    "Ak Cars"
  );
  lastAiMsg = state.conversation[state.conversation.length - 1];
  console.log("AI Message:\n", lastAiMsg.text);
  console.log("Options:", lastAiMsg.quickOptions?.map((o: any) => o.label));

  if (!lastAiMsg.text.includes("Ak Cars") || !/products?.*services?/i.test(lastAiMsg.text)) {
    throw new Error("Turn 3 failed: Did not ask for products/services as micro question 2!");
  }

  // Step 4: User selects a car rental service
  console.log("\n--- Turn 4: User selects 'Car Rental & Outstation Cabs' ---");
  state = await MetaAIConversationService.processMessage(
    orgId,
    state,
    "Car Rental & Outstation Cabs"
  );
  lastAiMsg = state.conversation[state.conversation.length - 1];
  console.log("AI Message:\n", lastAiMsg.text);
  console.log("Options:", lastAiMsg.quickOptions?.map((o: any) => o.label));

  // Should ask for Special Ad Category
  if (!lastAiMsg.text.includes("Special Ad Category") && !lastAiMsg.text.includes("विशेष जाहिरात श्रेणी")) {
    throw new Error("Turn 4 failed: Did not ask for Special Ad Category as micro question 3!");
  }

  // Step 5: User clicks "GUIDE_ME_ON_CURRENT_STEP" on Special Ad Category
  console.log("\n--- Turn 5: User clicks 'GUIDE_ME_ON_CURRENT_STEP' on Special Category ---");
  state = await MetaAIConversationService.processMessage(
    orgId,
    state,
    "",
    "GUIDE_ME_ON_CURRENT_STEP"
  );
  lastAiMsg = state.conversation[state.conversation.length - 1];
  console.log("AI Message:\n", lastAiMsg.text);
  console.log("Options:", lastAiMsg.quickOptions?.map((o: any) => o.label));

  if (!lastAiMsg.text.includes("Special Ad Category") || !lastAiMsg.quickOptions?.some((o: any) => o.value === "NONE")) {
    throw new Error("Turn 5 failed: Did not give guidance on Special Ad Category!");
  }

  // Step 6: User selects NONE
  console.log("\n--- Turn 6: User selects 'NONE' ---");
  state = await MetaAIConversationService.processMessage(
    orgId,
    state,
    "NONE",
    "NONE"
  );
  lastAiMsg = state.conversation[state.conversation.length - 1];
  console.log("AI Message:\n", lastAiMsg.text);
  console.log("Options:", lastAiMsg.quickOptions?.map((o: any) => o.label));

  // Should ask for Destination
  if (!lastAiMsg.text.includes("Destination") && !lastAiMsg.text.includes("गंतव्य")) {
    throw new Error("Turn 6 failed: Did not ask for Destination as micro question 4!");
  }

  // Step 7: User asks "which destination is better"
  console.log("\n--- Turn 7: User asks 'which destination is better' ---");
  state = await MetaAIConversationService.processMessage(
    orgId,
    state,
    "which destination is better"
  );
  lastAiMsg = state.conversation[state.conversation.length - 1];
  console.log("AI Message:\n", lastAiMsg.text);
  console.log("Options:", lastAiMsg.quickOptions?.map((o: any) => o.label));

  if (!lastAiMsg.text.includes("WhatsApp") || !lastAiMsg.quickOptions?.some((o: any) => o.value === "DESTINATION_WHATSAPP")) {
    throw new Error("Turn 7 failed: Did not provide consultative advice on destination!");
  }

  console.log("\n✅ ALL CONSULTATIVE GUIDANCE & SEQUENTIAL MICRO-QUESTION TESTS PASSED!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
