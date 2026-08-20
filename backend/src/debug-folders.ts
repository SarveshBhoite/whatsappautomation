import prisma from "./utils/prisma";
import { getGmailAccessToken } from "./services/gmailService";
import axios from "axios";

async function debugFolderFetch() {
  const token = await getGmailAccessToken("demo-org-123");

  for (const label of ["SENT", "SPAM", "TRASH", "STARRED"]) {
    const query = label === "STARRED" ? "is:starred" : `in:${label.toLowerCase()}`;
    try {
      const res = await axios.get("https://gmail.googleapis.com/gmail/v1/users/me/threads", {
        headers: { Authorization: `Bearer ${token}` },
        params: { maxResults: 10, q: query, includeSpamTrash: true }
      });
      console.log(`[DEBUG] Label ${label} API response count:`, res.data.threads?.length || 0);
      if (res.data.threads && res.data.threads.length > 0) {
        console.log(`[DEBUG] Sample thread ID for ${label}:`, res.data.threads[0].id);
      }
    } catch (err: any) {
      console.error(`[DEBUG] Label ${label} fetch error:`, err?.response?.data || err.message);
    }
  }
}

debugFolderFetch().catch(console.error).finally(() => prisma.$disconnect());
