import prisma from "./utils/prisma";
import { syncGmailThreads } from "./services/gmailService";

async function main() {
  console.log("=== CLEANING & RE-SYNCING GMAIL ACCOUNTS ===");

  const configs = await prisma.gmailConfig.findMany({});
  console.log("Found Gmail Configs:", configs.map(c => ({ id: c.id, email: c.emailAddress, isDefault: c.isDefault })));

  // Clear existing threads and messages so each account syncs fresh, clean, account-isolated threads
  console.log("Deleting existing Gmail attachments, messages, and threads...");
  await prisma.gmailAttachment.deleteMany({});
  await prisma.gmailMessage.deleteMany({});
  await prisma.gmailThread.deleteMany({});
  console.log("Database cleared successfully.");

  // Re-sync each account independently
  for (const cfg of configs) {
    if (cfg.accessToken || cfg.refreshToken) {
      console.log(`Syncing inbox for account: ${cfg.emailAddress} (${cfg.id})...`);
      try {
        const res = await syncGmailThreads(cfg.organizationId, undefined, "INBOX", cfg.id);
        console.log(`Synced ${res.syncedCount} threads for ${cfg.emailAddress}.`);
      } catch (err: any) {
        console.error(`Failed to sync ${cfg.emailAddress}:`, err.message);
      }
    }
  }

  // Count threads per account
  for (const cfg of configs) {
    const count = await prisma.gmailThread.count({
      where: { gmailConfigId: cfg.id }
    });
    console.log(`Account ${cfg.emailAddress} (${cfg.id}) has ${count} threads in database.`);
  }
}

main().catch(console.error);
