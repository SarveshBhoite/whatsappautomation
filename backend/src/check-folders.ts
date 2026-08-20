import prisma from "./utils/prisma";

async function main() {
  const inbox = await prisma.gmailThread.count({ where: { label: "INBOX" } });
  const sent = await prisma.gmailThread.count({ where: { label: "SENT" } });
  const spam = await prisma.gmailThread.count({ where: { label: "SPAM" } });
  const trash = await prisma.gmailThread.count({ where: { label: "TRASH" } });
  const starred = await prisma.gmailThread.count({ where: { isStarred: true } });

  console.log("=== GMAIL FOLDER COUNTS ===");
  console.log({ INBOX: inbox, SENT: sent, SPAM: spam, TRASH: trash, STARRED: starred });
}

main().catch(console.error).finally(() => prisma.$disconnect());
