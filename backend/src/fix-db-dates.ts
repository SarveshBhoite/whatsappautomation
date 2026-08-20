import prisma from "./utils/prisma";
import { syncGmailThreads } from "./services/gmailService";

async function fixAllDbDates() {
  console.log("Resetting local database threads...");
  await prisma.gmailAttachment.deleteMany({});
  await prisma.gmailMessage.deleteMany({});
  await prisma.gmailThread.deleteMany({});

  console.log("Syncing INBOX with raw Gmail internalDate timestamps...");
  await syncGmailThreads("demo-org-123", undefined, "INBOX");

  const threads = await prisma.gmailThread.findMany({
    where: { label: "INBOX" },
    orderBy: { updatedAt: "desc" }
  });

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);

  let todayCount = 0;
  let yesterdayCount = 0;
  let olderCount = 0;

  threads.forEach(t => {
    const time = new Date(t.updatedAt).getTime();
    if (time >= todayStart) todayCount++;
    else if (time >= yesterdayStart) yesterdayCount++;
    else olderCount++;
  });

  console.log("\n=== REAL GMAIL DATE BREAKDOWN IN DB ===");
  console.log({ Today: todayCount, Yesterday: yesterdayCount, Older: olderCount });
  console.log("Top 5 Latest Threads in DB:");
  threads.slice(0, 5).forEach((t, i) => {
    console.log(`${i + 1}. [${t.updatedAt.toISOString()}] ${t.subject}`);
  });
}

fixAllDbDates().catch(console.error).finally(() => prisma.$disconnect());
