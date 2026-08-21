import prisma from "c:/Users/ADMIN/whatsappautomation/backend/src/utils/prisma";
import { WhatsAppDripEngine } from "c:/Users/ADMIN/whatsappautomation/backend/src/services/whatsappDripService";

async function testEngine() {
  console.log("Testing WhatsAppDripEngine.processPendingQueue()...");
  await WhatsAppDripEngine.processPendingQueue();
  console.log("Engine tick executed cleanly.");
}

testEngine().catch(console.error).finally(() => prisma.$disconnect());
