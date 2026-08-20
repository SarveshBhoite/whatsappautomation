import prisma from "./utils/prisma";
import { getGmailAccessToken } from "./services/gmailService";
import axios from "axios";

async function checkRealGmailDates() {
  const token = await getGmailAccessToken("demo-org-123");
  const res = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
    headers: { Authorization: `Bearer ${token}` },
    params: { maxResults: 15, q: "in:inbox" }
  });
  const threads = res.data.threads || [];
  console.log("=== REAL GMAIL API INBOX THREADS ===");
  for (const t of threads) {
    const threadRes = await axios.get(`https://gmail.googleapis.com/gmail/v1/users/me/threads/${t.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const msgs = threadRes.data.messages || [];
    const lastMsg = msgs[msgs.length - 1];
    const headers = lastMsg.payload?.headers || [];
    const subject = headers.find((h: any) => h.name.toLowerCase() === "subject")?.value || "No Subject";
    const dateHeader = headers.find((h: any) => h.name.toLowerCase() === "date")?.value;
    const internalDate = lastMsg.internalDate;
    const d = internalDate ? new Date(Number(internalDate)) : new Date(dateHeader);
    console.log(`[${d.toISOString()}] | rawString: ${internalDate} | ${subject}`);
  }
}

checkRealGmailDates().catch(console.error).finally(() => prisma.$disconnect());
