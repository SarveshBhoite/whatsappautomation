const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testAllAdCombinations() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  const accountId = 'act_1454270479625110';
  const pageId = '1062234726963242';

  console.log('Testing Creative 1 (Click-to-WhatsApp: 1063681109802643)');
  try {
    const res1 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/ads`, {
      name: 'Ad Format 1',
      adset_id: '120250412296850517',
      creative: { creative_id: '1063681109802643' },
      status: 'PAUSED',
      access_token: config.accessToken
    });
    console.log('SUCCESS with Creative 1:', res1.data);
  } catch (e) {
    console.log('FAIL Creative 1:', e.response?.data?.error?.error_user_title || e.response?.data?.error?.message);
  }

  console.log('Testing Creative 3 (Standard Link to WhatsApp: 917295861449001)');
  try {
    const res3 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/ads`, {
      name: 'Ad Format 3',
      adset_id: '120250412296850517',
      creative: { creative_id: '917295861449001' },
      status: 'PAUSED',
      access_token: config.accessToken
    });
    console.log('SUCCESS with Creative 3:', res3.data);
  } catch (e) {
    console.log('FAIL Creative 3:', e.response?.data?.error?.error_user_title || e.response?.data?.error?.message);
  }

  console.log('Testing Creative 4 (Website: 1433831381893799)');
  try {
    const res4 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/ads`, {
      name: 'Ad Format 4',
      adset_id: '120250412296850517',
      creative: { creative_id: '1433831381893799' },
      status: 'PAUSED',
      access_token: config.accessToken
    });
    console.log('SUCCESS with Creative 4:', res4.data);
  } catch (e) {
    console.log('FAIL Creative 4:', e.response?.data?.error?.error_user_title || e.response?.data?.error?.message);
  }
}

testAllAdCombinations().finally(() => prisma.$disconnect());
