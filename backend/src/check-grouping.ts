import prisma from "./utils/prisma";

async function testGrouping() {
  const threads = await prisma.gmailThread.findMany({
    where: { label: "INBOX" },
    orderBy: { updatedAt: "desc" }
  });

  const groups: { [key: string]: number } = { Today: 0, Yesterday: 0, Earlier: 0 };
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - (24 * 60 * 60 * 1000);

  threads.forEach(t => {
    const time = new Date(t.updatedAt).getTime();
    if (time >= todayStart) {
      groups.Today++;
    } else if (time >= yesterdayStart) {
      groups.Yesterday++;
    } else {
      groups.Earlier++;
    }
  });

  console.log("CHRONOLOGICAL GROUP COUNTS FOR INBOX:");
  console.log(groups);
  console.log("TOTAL INBOX THREADS:", threads.length);
}

testGrouping().catch(console.error).finally(() => prisma.$disconnect());
