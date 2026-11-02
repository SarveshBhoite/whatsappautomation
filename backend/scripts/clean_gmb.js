const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const deleted = await prisma.googleBusinessConfig.deleteMany({
    where: {
      organizationId: 'a4bc139a-b6b8-4f6d-b50a-4057a2a902df',
      googleRefreshToken: null,
      refreshToken: null
    }
  });
  console.log('Deleted orphaned disconnected rows:', deleted.count);
}
run().finally(() => prisma.$disconnect());

