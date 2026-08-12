import prisma from "./utils/prisma";

async function main() {
  console.log("Testing Prisma DB Connection & LinkedIn Tables...");
  try {
    const config = await prisma.linkedInConfig.findUnique({
      where: { organizationId: "demo-org-123" }
    });
    console.log("findUnique linkedInConfig success:", config);

    const log = await prisma.linkedInSyncLog.create({
      data: {
        organizationId: "demo-org-123",
        event: "Verification Test",
        status: "SUCCESS",
        details: "Testing database connection and model",
        timestamp: new Date()
      }
    });
    console.log("create linkedInSyncLog success:", log);

    const logs = await prisma.linkedInSyncLog.findMany({
      where: { organizationId: "demo-org-123" }
    });
    console.log("findMany linkedInSyncLog count:", logs.length);

    console.log("ALL PRISMA LINKEDIN VERIFICATIONS PASSED SUCCESSFULLY!");
  } catch (err: any) {
    console.error("Prisma verification error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
