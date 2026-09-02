const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPublishedCampaigns() {
  const camps = await prisma.metaAdCampaign.findMany({
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: { adSets: { include: { ads: true } } }
  });
  console.log('Recent Published Campaigns:\n', JSON.stringify(camps, null, 2));
}

checkPublishedCampaigns().finally(() => prisma.$disconnect());
