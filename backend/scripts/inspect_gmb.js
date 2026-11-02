const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const configs = await prisma.googleBusinessConfig.findMany();
  console.log('TOTAL:', configs.length);
  for (const c of configs) {
    console.log(JSON.stringify({
      id: c.id,
      organizationId: c.organizationId,
      locationName: c.locationName,
      googleLocationId: c.googleLocationId,
      isActive: c.isActive,
      isDefault: c.isDefault,
      hasRefresh: !!c.googleRefreshToken,
      email: c.googleEmail
    }));
  }
}
run().catch(console.error).finally(() => prisma.$disconnect());

