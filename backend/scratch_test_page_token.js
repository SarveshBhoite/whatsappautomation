const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testPageTokenAd() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  const accountId = 'act_1454270479625110';
  const pageId = '1062234726963242';

  // 1. Get Page Access Token
  const pageRes = await axios.get('https://graph.facebook.com/v26.0/' + pageId, {
    params: { fields: 'id,name,access_token', access_token: config.accessToken }
  });
  const pageToken = pageRes.data.access_token || config.accessToken;
  console.log('Page Token present:', !!pageRes.data.access_token);

  // 2. Try creating ad with page token
  try {
    const adRes = await axios.post('https://graph.facebook.com/v26.0/' + accountId + '/ads', {
      name: 'Ad with Page Token',
      adset_id: '120250412281670517',
      creative: { creative_id: '1063681109802643' },
      status: 'PAUSED',
      access_token: pageToken
    });
    console.log('SUCCESS with Page Token! Ad ID:', adRes.data.id);
  } catch (e) {
    console.log('Page Token Ad Result:', e.response?.data?.error?.message || e.message);
  }
}

testPageTokenAd().finally(() => prisma.$disconnect());
