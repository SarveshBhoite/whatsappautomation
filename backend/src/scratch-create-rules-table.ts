import prisma from "./utils/prisma";

async function main() {
  try {
    console.log("Creating tables using raw SQL...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "GmailAutoReplyRule" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "keyword" TEXT NOT NULL,
        "replyText" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "GmailAutoReplyRule_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "gmail_auto_reply_rules" (
        "id" TEXT NOT NULL,
        "organizationId" TEXT NOT NULL,
        "keyword" TEXT NOT NULL,
        "replyText" TEXT NOT NULL,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "gmail_auto_reply_rules_pkey" PRIMARY KEY ("id")
      );
    `);

    console.log("SQL Tables successfully created on PostgreSQL!");
  } catch (err) {
    console.error("SQL creation error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
