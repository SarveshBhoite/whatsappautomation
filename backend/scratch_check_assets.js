const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function checkAccountAssets() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  console.log('Ad Account ID:', config?.adAccountId);
  console.log('Page ID:', config?.pageId);
  console.log('Has Token:', !!config?.accessToken);

  if (config?.accessToken) {
    try {
      const pagesRes = await axios.get('https://graph.facebook.com/v26.0/me/accounts', {
        params: { access_token: config.accessToken, fields: 'id,name,access_token' }
      });
      console.log('\n--- PAGES ---');
      for (const p of pagesRes.data.data) {
        console.log('Page:', p.name, p.id);
        try {
          const waRes = await axios.get('https://graph.facebook.com/v26.0/' + p.id, {
            params: { access_token: p.access_token || config.accessToken, fields: 'whatsapp_number,page_whatsapp_number,whatsapp_business_account{id,phone_numbers{id,display_phone_number}}' }
          });
          console.log('  Page WhatsApp Data:', JSON.stringify(waRes.data));
        } catch (e) {
          console.log('  Page WhatsApp Error:', e.response?.data?.error?.message || e.message);
        }
      }
    } catch (err) {
      console.error('Meta API Query Error:', err.response?.data?.error || err.message);
    }
  }
}

checkAccountAssets().catch(console.error).finally(() => prisma.$disconnect());
