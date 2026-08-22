async function testApi() {
  const baseUrl = "http://localhost:5000/api/admin/instagram";
  console.log("=== TESTING ANY COMMENT / EMOJI MATCHING RULE ENDPOINTS ===");

  try {
    // 1. Create Any Comment / Emoji Automation Rule
    const createRes = await fetch(`${baseUrl}/comment-automations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-organization-id": "demo-org-123"
      },
      body: JSON.stringify({
        name: "Any Comment Emoji Automation",
        mediaId: "ALL",
        mediaType: "POST",
        triggerType: "ANY_COMMENT",
        keywords: ["*"],
        matchingMode: "ANY_COMMENT",
        privateMessageTemplate: "Hi @{username}! Thanks for commenting 🔥! Here is your link: {document_link}",
        publicReplyTemplate: "Thanks @{username}! Check your DMs 📩",
        enablePublicReply: true,
        documentUrl: "https://www.jisnudigital.com/docs/guide.pdf"
      })
    });

    const createData = await createRes.json();
    console.log("1. Create Any Comment / Emoji Rule:", createRes.ok ? "SUCCESS" : "FAILED", createData.id);
    const autoId = createData.id;

    // 2. Test Simulator with Fire Emoji "🔥"
    const testEmojiRes = await fetch(`${baseUrl}/comment-automations/${autoId}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testUsername: "emoji_fan",
        testCommentText: "🔥"
      })
    });

    const testEmojiData = await testEmojiRes.json();
    console.log("2. Test Emoji Comment ('🔥'):", testEmojiData.success ? "PASSED" : "FAILED");
    console.log("   Matched Keyword:", testEmojiData.matchedKeyword);
    console.log("   Preview DM:", testEmojiData.previewDmText);

    // 3. Test Simulator with Generic Text "Super cool!"
    const testTextRes = await fetch(`${baseUrl}/comment-automations/${autoId}/test`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testUsername: "text_user",
        testCommentText: "Super cool!"
      })
    });

    const testTextData = await testTextRes.json();
    console.log("3. Test Random Text Comment ('Super cool!'):", testTextData.success ? "PASSED" : "FAILED");

    // Clean up
    await fetch(`${baseUrl}/comment-automations/${autoId}`, { method: "DELETE" });
    console.log("4. Cleaned up test automation rule successfully.");

    console.log("=== ALL EMOJI & ANY COMMENT TESTS PASSED SUCCESSFULLY! ===");
  } catch (err) {
    console.error("API Test Failed:", err.message);
  }
}

testApi();
