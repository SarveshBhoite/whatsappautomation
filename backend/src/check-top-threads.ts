import prisma from "./utils/prisma";

async function checkTodayThreads() {
  const threads = await prisma.gmailThread.findMany({
    where: { label: "INBOX" },
    orderBy: { updatedAt: "desc" },
    take: 15,
    select: { subject: true, updatedAt: true, sender: true }
  });
  console.log("=== MOST RECENT INBOX THREADS IN DB ===");
  threads.forEach((t, i) => {
    console.log(`${i + 1}. [${t.updatedAt.toISOString()}] ${t.subject}`);
  });
}

checkTodayThreads().catch(console.error).finally(() => prisma.$disconnect());
