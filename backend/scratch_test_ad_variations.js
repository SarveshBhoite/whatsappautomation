const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testAdVariations() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  const accountId = 'act_1454270479625110';
  const pageId = '1062234726963242';

  // 1. Create a fresh Campaign with explicit special_ad_categories = ['NONE']
  const camp1 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/campaigns`, {
    name: 'End-to-End Test Campaign',
    objective: 'OUTCOME_LEADS',
    buying_type: 'AUCTION',
    special_ad_categories: ['NONE'],
    status: 'PAUSED',
    access_token: config.accessToken
  });
  console.log('Campaign 1 (special_ad_categories: [NONE]):', camp1.data.id);

  // 2. Create AdSet
  const adset1 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adsets`, {
    name: 'End-to-End Test AdSet',
    campaign_id: camp1.data.id,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'CONVERSATIONS',
    destination_type: 'WHATSAPP',
    promoted_object: { page_id: pageId },
    daily_budget: 50000,
    targeting: {
      geo_locations: { countries: ['IN'] },
      age_min: 18,
      age_max: 65,
      targeting_automation: { advantage_audience: 1 }
    },
    status: 'PAUSED',
    access_token: config.accessToken
  });
  console.log('AdSet 1:', adset1.data.id);

  // 3. Create Creative
  const creative1 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adcreatives`, {
    name: 'End-to-End Test Creative',
    object_story_spec: {
      page_id: pageId,
      link_data: {
        message: 'Inquire today about our automotive repair and service offerings.',
        name: 'Auto Service Specials',
        link: 'https://api.whatsapp.com/send',
        call_to_action: {
          type: 'WHATSAPP_MESSAGE',
          value: {
            link: 'https://api.whatsapp.com/send',
            app_destination: 'WHATSAPP'
          }
        }
      }
    },
    access_token: config.accessToken
  });
  console.log('Creative 1:', creative1.data.id);

  // 4. Try Ad with Page Access Token vs User Token
  try {
    const ad1 = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/ads`, {
      name: 'End-to-End Test Ad',
      adset_id: adset1.data.id,
      creative: { creative_id: creative1.data.id },
      status: 'PAUSED',
      access_token: config.accessToken
    });
    console.log('SUCCESS! Ad Created ID:', ad1.data.id);
  } catch (e) {
    console.log('Ad Creation Failed:', e.response?.data?.error || e.message);
  }
}

testAdVariations().finally(() => prisma.$disconnect());
