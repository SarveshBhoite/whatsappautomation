import prisma from "./utils/prisma";

async function main() {
  const sample = await prisma.gmailMessage.findFirst({
    where: {
      OR: [
        { htmlContent: { not: null } },
        { content: { not: "" } }
      ]
    }
  });

  console.log("=== SAMPLE MESSAGE BODY CHECK ===");
  console.log("Message ID:", sample?.messageId);
  console.log("HTML Content Length:", sample?.htmlContent?.length || 0);
  console.log("Text Content Snippet:", sample?.content?.slice(0, 300));
}

main().catch(console.error).finally(() => prisma.$disconnect());
