const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspect() {
  const targetOrgId = 'a4bc139a-b6b8-4f6d-b50a-4057a2a902df';
  const threads = await prisma.gmailThread.findMany({
    where: { organizationId: targetOrgId },
    select: { id: true, threadId: true, subject: true, sender: true, label: true, isStarred: true, isSpam: true, createdAt: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' }
  });
  console.log('TOTAL THREADS FOR JDS:', threads.length);
  threads.forEach((t, i) => {
    console.log(`${i + 1} | ${t.updatedAt.toISOString().substring(0, 10)} | Label:${t.label} | Sender:${t.sender} | Subject:${t.subject}`);
  });
}
inspect().then(() => prisma.$disconnect()).catch(console.error);
