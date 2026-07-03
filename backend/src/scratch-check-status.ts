import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkStatus() {
  console.log("Checking conversation state for +919136870930...");
  
  const conversation = await prisma.conversation.findFirst({
    where: {
      customerPhone: "919136870930"
    }
  });

  if (!conversation) {
    console.log("No conversation record found for this number in the database.");
  } else {
    console.log("Conversation Found:");
    console.log(`- ID: ${conversation.id}`);
    console.log(`- Name: ${conversation.customerName}`);
    console.log(`- Bot Paused: ${conversation.isBotPaused}`);
    console.log(`- Current Node ID: ${conversation.currentNodeId}`);
  }

  // Also verify active flows in DB
  const activeFlows = await prisma.flow.findMany({
    where: {
      organizationId: "demo-org-123",
      isActive: true
    }
  });

  console.log("\nActive Flows for demo-org-123:");
  activeFlows.forEach(f => {
    console.log(`- Flow ID: ${f.id}, Name: ${f.name}, Active: ${f.isActive}, Platform: ${f.platform}`);
  });

  await prisma.$disconnect();
}

checkStatus();
