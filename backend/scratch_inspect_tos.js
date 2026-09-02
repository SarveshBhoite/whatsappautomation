const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function inspectAdAccountTos() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  const accountId = 'act_1454270479625110';
  
  try {
    const res = await axios.get('https://graph.facebook.com/v26.0/' + accountId, {
      params: {
        fields: 'id,name,tos_accepted,user_tos_accepted,capabilities,business{id,name}',
        access_token: config.accessToken
      }
    });
    console.log('Ad Account TOS Details:', JSON.stringify(res.data, null, 2));
  } catch (e) {
    console.log('Error:', e.response?.data || e.message);
  }
}

inspectAdAccountTos().finally(() => prisma.$disconnect());
