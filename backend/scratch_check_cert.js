const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function checkCertification() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  const accountId = 'act_1454270479625110';
  
  try {
    const res = await axios.get('https://graph.facebook.com/v26.0/' + accountId, {
      params: {
        fields: 'id,name,account_status,is_prepay_account,tos_accepted,business',
        access_token: config.accessToken
      }
    });
    console.log('Ad Account Details:', res.data);
  } catch (e) {
    console.log('Account query error:', e.response?.data?.error || e.message);
  }

  // Check what ad parameters are causing the certification requirement
  try {
    const adRes = await axios.post('https://graph.facebook.com/v26.0/' + accountId + '/ads', {
      name: 'Test Ad',
      adset_id: '120250412296850517',
      creative: { creative_id: '28930781343207023' },
      status: 'PAUSED',
      access_token: config.accessToken
    });
    console.log('Ad Created:', adRes.data);
  } catch (e) {
    console.log('Ad error full:', JSON.stringify(e.response?.data, null, 2));
  }
}

checkCertification().finally(() => prisma.$disconnect());
