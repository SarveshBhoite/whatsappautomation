const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const orgs = await prisma.organization.findMany();
  console.log('ORGS:', orgs.map(o => ({ id: o.id, name: o.name })));
}
run().finally(() => prisma.$disconnect());

