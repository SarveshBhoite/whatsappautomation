import prisma from "./utils/prisma";
import { getGmailAccessToken } from "./services/gmailService";
import axios from "axios";

async function testLabels() {
  const token = await getGmailAccessToken("demo-org-123");
  for (const label of ["SENT", "SPAM", "TRASH", "STARRED"]) {
    const query = label === "STARRED" ? "is:starred" : `in:${label.toLowerCase()}`;
    const res = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
      headers: { Authorization: `Bearer ${token}` },
      params: { maxResults: 10, q: query, includeSpamTrash: true }
    });
    console.log(`Label ${label} threads count:`, res.data.threads?.length || 0);
  }
}

testLabels().catch(console.error).finally(() => prisma.$disconnect());
