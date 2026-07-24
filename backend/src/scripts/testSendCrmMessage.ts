import prisma from "../utils/prisma";
import { WhatsAppService } from "../services/whatsappService";

async function main() {
  const customerPhone = "919136870930";
  const textBody = "Hello from AutomationCRM! Your live approved WhatsApp number is now fully connected!";

  // 1. Get default Organization & Config
  const org = await prisma.organization.findFirst({
    include: { waConfig: true }
  });

  if (!org || !org.waConfig) {
    console.error("No organization or WhatsApp config found in DB.");
    return;
  }

  const { phoneNumberId, accessToken } = org.waConfig;
  if (!phoneNumberId || !accessToken) {
    console.error("Missing WhatsApp credentials in DB.");
    return;
  }

  // 2. Send via Meta API
  console.log(`Sending live WhatsApp message to ${customerPhone}...`);
  const responseData = await WhatsAppService.sendTextMessage(
    phoneNumberId,
    accessToken,
    customerPhone,
    textBody
  );

  const waMessageId = responseData?.messages?.[0]?.id || null;
  console.log("Meta API Response Message ID:", waMessageId);

  // 3. Find or Create Conversation in DB
  let conversation = await prisma.conversation.findUnique({
    where: {
      organizationId_platform_customerPhone: {
        organizationId: org.id,
        platform: "whatsapp",
        customerPhone,
      },
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        organizationId: org.id,
        platform: "whatsapp",
        customerPhone,
        customerName: "Sarvesh (Verified)",
        isBotPaused: false,
      },
    });
  }

  // 4. Save Message to Database
  const savedMsg = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "outbound",
      messageType: "text",
      content: textBody,
      waMessageId,
      status: "sent",
      senderName: "AutomationCRM Agent"
    }
  });

  console.log("✅ Message saved to CRM database with ID:", savedMsg.id);
  console.log("Refresh http://localhost:3000/whatsapp to see your updated chat history!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
