import prisma from "./utils/prisma";
import { getGmailAccessToken } from "./services/gmailService";
import axios from "axios";

async function inspectGmailApiDate() {
  const token = await getGmailAccessToken("demo-org-123");
  const res = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
    headers: { Authorization: `Bearer ${token}` },
    params: { maxResults: 3, q: "in:inbox" }
  });
  const threads = res.data.threads || [];
  for (const t of threads) {
    const threadRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const msgs = threadRes.data.messages || [];
    const lastMsg = msgs[msgs.length - 1];
    const headers = lastMsg.payload?.headers || [];
    const dateHeader = headers.find((h: any) => h.name.toLowerCase() === "date")?.value;
    const internalDate = lastMsg.internalDate;
    console.log("\n--- THREAD ID:", t.id);
    console.log("Header Date string:", dateHeader);
    console.log("internalDate string:", internalDate);
    console.log("Parsed Date from Header:", dateHeader ? new Date(dateHeader).toISOString() : "N/A");
    console.log("Parsed Date from internalDate:", internalDate ? new Date(parseInt(internalDate, 10)).toISOString() : "N/A");
  }
}

inspectGmailApiDate().catch(console.error).finally(() => prisma.$disconnect());
