import prisma from "./utils/prisma";

async function main() {
  const configs = await prisma.gmailConfig.findMany({});
  console.log("=== GMAIL CONFIGS ===");
  console.log(JSON.stringify(configs, null, 2));

  const threads = await prisma.gmailThread.findMany({
    select: {
      id: true,
      threadId: true,
      subject: true,
      sender: true,
      gmailConfigId: true,
      organizationId: true
    }
  });
  console.log("=== GMAIL THREADS ===");
  console.log(JSON.stringify(threads, null, 2));
}

main().catch(console.error);
