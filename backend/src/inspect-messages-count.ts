import prisma from "./utils/prisma";

async function inspectDbMessages() {
  const count = await prisma.gmailMessage.count();
  console.log("TOTAL MESSAGES IN DB:", count);
  const sample = await prisma.gmailMessage.findFirst();
  console.log("SAMPLE MESSAGE:", sample);
}

inspectDbMessages().catch(console.error).finally(() => prisma.$disconnect());
