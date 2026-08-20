import prisma from "./utils/prisma";

async function testSendReplyMock() {
  const sampleThread = await prisma.gmailThread.findFirst({
    where: { label: "INBOX" }
  });
  console.log("=== THREAD MAPPING VERIFICATION ===");
  console.log("Gmail API Thread ID:", sampleThread?.threadId);
  console.log("Database Primary Key (UUID):", sampleThread?.id);
}

testSendReplyMock().catch(console.error).finally(() => prisma.$disconnect());
