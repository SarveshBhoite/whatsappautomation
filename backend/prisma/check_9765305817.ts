import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixBrochureSync() {
  console.log("Checking conversations and messages for phone ending in 9765305817...");

  const conversations = await prisma.conversation.findMany({
    where: {
      customerPhone: { contains: "9765305817" }
    },
    include: {
      messages: {
        orderBy: { createdAt: "desc" },
        take: 5
      }
    }
  });

  console.log(`Found ${conversations.length} conversation(s):`);
  for (const conv of conversations) {
    console.log(`Conv ID: ${conv.id} | Platform: ${conv.platform} | PhoneId: ${conv.phoneNumberId}`);
    for (const msg of conv.messages) {
      console.log(` - Msg [${msg.direction}] (${msg.messageType}): ${msg.content.slice(0, 60)} | MediaUrl: ${msg.mediaUrl}`);
    }
  }
}

fixBrochureSync()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });
