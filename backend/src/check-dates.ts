import prisma from "./utils/prisma";

async function main() {
  const sample = await prisma.gmailThread.findFirst({
    include: { messages: true },
    orderBy: { updatedAt: "desc" }
  });

  console.log("=== TIMESTAMP FORMAT VERIFICATION ===");
  console.log("Thread Subject:", sample?.subject);
  console.log("Thread UpdatedAt (Parsed ISO):", sample?.updatedAt);
  console.log("Message Sender:", sample?.messages[0]?.sender);
  console.log("Message CreatedAt (Parsed ISO):", sample?.messages[0]?.createdAt);
}

main().catch(console.error).finally(() => prisma.$disconnect());
