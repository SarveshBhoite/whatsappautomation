import prisma from "./utils/prisma";
import { syncGmailThreads } from "./services/gmailService";

async function runTest() {
  const akashConfig = await prisma.gmailConfig.findFirst({
    where: { emailAddress: "akash.jadhav.connect@gmail.com" }
  });

  console.log("Akash Config:", akashConfig);

  if (!akashConfig) {
    console.error("Akash config not found!");
    return;
  }

  console.log("Starting sync for Akash account:", akashConfig.id);
  const result = await syncGmailThreads(akashConfig.organizationId, undefined, "INBOX", akashConfig.id);
  console.log("Sync result for Akash:", result);

  const threadsAfter = await prisma.gmailThread.findMany({
    where: { gmailConfigId: akashConfig.id },
    select: { id: true, threadId: true, subject: true, sender: true, gmailConfigId: true }
  });

  console.log(`Threads for Akash (${threadsAfter.length}):`);
  console.log(JSON.stringify(threadsAfter, null, 2));
}

runTest().catch(console.error);
