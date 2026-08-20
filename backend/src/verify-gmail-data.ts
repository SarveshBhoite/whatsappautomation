import prisma from "./utils/prisma";

async function main() {
  const threadsCount = await prisma.gmailThread.count();
  const messagesCount = await prisma.gmailMessage.count();
  const rulesCount = await prisma.gmailAutoReplyRule.count();
  console.log(`\n========================================`);
  console.log(`GMAIL REAL DATA ACCESS VERIFICATION:`);
  console.log(`- Connected Email Threads: ${threadsCount}`);
  console.log(`- Real Messages Synced: ${messagesCount}`);
  console.log(`- Auto Reply Rules: ${rulesCount}`);
  console.log(`========================================\n`);

  const sampleThread = await prisma.gmailThread.findFirst({
    include: {
      messages: {
        include: { attachments: true }
      }
    }
  });

  console.log("SAMPLE REAL EMAIL THREAD IN DATABASE:");
  console.log(JSON.stringify(sampleThread, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
