import prisma from "./utils/prisma";

async function printAllThreads() {
  const threads = await prisma.gmailThread.findMany({
    where: { label: "INBOX" },
    orderBy: { updatedAt: "desc" },
    select: { subject: true, updatedAt: true }
  });
  console.log("=== ALL INBOX THREADS IN DB ===");
  threads.forEach((t, i) => {
    console.log(`${i + 1}. [${t.updatedAt.toISOString()}] ${t.subject}`);
  });
}

printAllThreads().catch(console.error).finally(() => prisma.$disconnect());
