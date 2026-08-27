import prisma from "./utils/prisma";

async function checkAakashChat() {
  console.log("=== CHECKING CONVERSATIONS AND MESSAGES FOR AAKASH ===");
  const conversations = await (prisma as any).conversation.findMany({
    take: 5,
    orderBy: { updatedAt: "desc" },
    include: {
      messages: {
        take: 10,
        orderBy: { createdAt: "desc" }
      }
    }
  });

  console.log(`Found ${conversations.length} recent conversations:`);
  for (const c of conversations) {
    console.log(`Conversation ID: ${c.id}, Customer Name: ${c.customerName}, Phone: ${c.customerPhone}`);
    console.log("Messages:");
    for (const m of c.messages) {
      console.log(`  [${m.direction}] ${m.content}`);
    }
    console.log("-----------------------------------------");
  }

  const appts = await (prisma as any).appointment.findMany({
    take: 5,
    orderBy: { createdAt: "desc" }
  });
  console.log(`\nAppointments in DB (${appts.length}):`);
  for (const a of appts) {
    console.log({
      id: a.id,
      customerName: a.customerName,
      customerEmail: a.customerEmail,
      startTime: a.startTime,
      googleMeetUrl: a.googleMeetUrl,
      googleSyncStatus: a.googleSyncStatus
    });
  }
}

checkAakashChat()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
