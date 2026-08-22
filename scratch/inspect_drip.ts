import prisma from "c:/Users/ADMIN/whatsappautomation/backend/src/utils/prisma";

async function main() {
  const enrollments = await (prisma as any).whatsAppDripEnrollment.findMany({
    include: {
      campaign: {
        include: { steps: true }
      },
      queueItems: true,
    },
    orderBy: { enrolledAt: "desc" },
    take: 10
  });

  console.log("=== ENROLLMENTS ===");
  for (const e of enrollments) {
    console.log(`ID: ${e.id} | Phone: ${e.customerPhone} | Status: ${e.status} | StepNo: ${e.currentStepNo} | NextExec: ${e.nextExecutionAt}`);
    console.log(`Campaign: ${e.campaign?.name} (${e.campaign?.id})`);
    console.log(`Steps (${e.campaign?.steps?.length}):`, e.campaign?.steps?.map((s: any) => `${s.stepNumber}:${s.stepType}:${s.templateName}`));
    console.log(`Queue Items (${e.queueItems?.length}):`);
    for (const q of e.queueItems) {
      console.log(`  - Queue ID: ${q.id} | StepId: ${q.stepId} | Status: ${q.status} | SchedFor: ${q.scheduledFor} | Error: ${q.lastError}`);
    }
    console.log("-----------------------------------");
  }

  const activityLogs = await (prisma as any).whatsAppDripActivityLog.findMany({
    take: 10
  });
  console.log("=== RECENT ACTIVITY LOGS ===");
  for (const l of activityLogs) {
    console.log(`Log [${l.action}]: ${l.details} (${l.customerPhone}) at ${l.createdAt}`);
  await (prisma as any).whatsAppDripEnrollment.updateMany({
    where: { status: "COMPLETED", nextExecutionAt: { not: null } },
    data: { nextExecutionAt: null }
  });
  console.log("Cleaned up stale nextExecutionAt timestamps for completed enrollments.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
