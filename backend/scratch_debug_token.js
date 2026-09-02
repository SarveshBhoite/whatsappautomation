const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function inspectToken() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  console.log('Ad Account ID:', config?.adAccountId);
  console.log('Page ID:', config?.pageId);

  // 1. Inspect Token permissions
  try {
    const debugToken = await axios.get('https://graph.facebook.com/v26.0/debug_token', {
      params: { input_token: config.accessToken, access_token: config.accessToken }
    });
    console.log('\n--- TOKEN DEBUG ---');
    console.log('Scopes/Permissions:', debugToken.data?.data?.scopes);
    console.log('Type:', debugToken.data?.data?.type);
    console.log('App ID:', debugToken.data?.data?.app_id);
    console.log('User/Page ID:', debugToken.data?.data?.user_id);
  } catch (e) {
    console.log('Debug token error:', e.response?.data || e.message);
  }

  // 2. Query Page directly
  if (config?.pageId) {
    try {
      const pageInfo = await axios.get(`https://graph.facebook.com/v26.0/${config.pageId}`, {
        params: { access_token: config.accessToken, fields: 'id,name,link,whatsapp_number' }
      });
      console.log('\n--- PAGE INFO ---', pageInfo.data);
    } catch (e) {
      console.log('Page info error:', e.response?.data || e.message);
    }
  }

  // 3. Query Ad Account WhatsApp numbers
  try {
    const adAccWa = await axios.get(`https://graph.facebook.com/v26.0/act_1454270479625110/whatsapp_business_accounts`, {
      params: { access_token: config.accessToken, fields: 'id,name,phone_numbers{id,display_phone_number}' }
    });
    console.log('\n--- AD ACCOUNT WABA ---', adAccWa.data);
  } catch (e) {
    console.log('Ad account WABA error:', e.response?.data || e.message);
  }
}

inspectToken().catch(console.error).finally(() => prisma.$disconnect());
