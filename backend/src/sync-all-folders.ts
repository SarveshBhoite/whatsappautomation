import prisma from "./utils/prisma";
import { syncGmailThreads } from "./services/gmailService";

async function syncAllFolders() {
  console.log("Starting full multi-folder sync...");
  for (const label of ["INBOX", "SENT", "SPAM", "TRASH", "STARRED"]) {
    console.log(`Syncing folder ${label}...`);
    try {
      const res = await syncGmailThreads("demo-org-123", undefined, label);
      console.log(`Folder ${label} synced ${res.syncedCount} new messages.`);
    } catch (err: any) {
      console.error(`Folder ${label} sync error:`, err.message);
    }
  }

  const inbox = await prisma.gmailThread.count({ where: { label: "INBOX" } });
  const sent = await prisma.gmailThread.count({ where: { label: "SENT" } });
  const spam = await prisma.gmailThread.count({ where: { label: "SPAM" } });
  const trash = await prisma.gmailThread.count({ where: { label: "TRASH" } });
  const starred = await prisma.gmailThread.count({ where: { isStarred: true } });

  console.log("\n=== FINAL ALL-FOLDERS DB STATS ===");
  console.log({ INBOX: inbox, SENT: sent, SPAM: spam, TRASH: trash, STARRED: starred });
}

syncAllFolders().catch(console.error).finally(() => prisma.$disconnect());
