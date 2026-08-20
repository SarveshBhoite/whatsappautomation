import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../.env") });
import { generateGmailAiDraft } from "./services/gmailService";

async function testAiReply() {
  console.log("Testing generateGmailAiDraft...");
  const reply = await generateGmailAiDraft(
    "demo-org-123",
    "Hi team, I would like to know more about your digital marketing packages.",
    "Inquiry regarding services",
    "John Doe <john@example.com>"
  );
  console.log("\n=== GENERATED AI DRAFT REPLY ===");
  console.log(reply);
}

testAiReply().catch(console.error);
