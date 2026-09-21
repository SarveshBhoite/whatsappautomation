const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function testFull() {
  const c = await p.metaAdConfig.findFirst();
  const accountId = 'act_1454270479625110';
  const pageId = '1062234726963242';
  const token = c.accessToken;

  // 1. Campaign
  const campRes = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/campaigns`, {
    name: 'Urban Threads WhatsApp Launch',
    objective: 'OUTCOME_LEADS',
    status: 'PAUSED',
    special_ad_categories: ['NONE'],
    daily_budget: 50000,
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    access_token: token
  });
  const campId = campRes.data.id;
  console.log('1. Campaign Created:', campId);

  // 2. AdSet (WHATSAPP + CONVERSATIONS)
  const adSetRes = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adsets`, {
    name: 'Urban Threads - Ad Set',
    campaign_id: campId,
    billing_event: 'IMPRESSIONS',
    optimization_goal: 'CONVERSATIONS',
    destination_type: 'WHATSAPP',
    promoted_object: { page_id: pageId },
    targeting: {
      geo_locations: { countries: ['IN'] },
      age_min: 18,
      age_max: 65,
      targeting_automation: { advantage_audience: 1 }
    },
    status: 'PAUSED',
    access_token: token
  });
  const adSetId = adSetRes.data.id;
  console.log('2. AdSet Created:', adSetId);

  // 3. AdCreative
  const creativeRes = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adcreatives`, {
    name: 'Urban Threads Creative',
    object_story_spec: {
      page_id: pageId,
      link_data: {
        message: 'Upgrade your wardrobe with premium urban streetwear at 20% off!',
        name: 'Urban Threads Special Offer',
        link: 'https://jisnudigital.com',
        call_to_action: {
          type: 'WHATSAPP_MESSAGE',
          value: {
            link: 'https://wa.me/919999999999'
          }
        }
      }
    },
    access_token: token
  });
  const creativeId = creativeRes.data.id;
  console.log('3. Creative Created:', creativeId);

  // 4. Ad
  const adRes = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/ads`, {
    name: 'Urban Threads Ad',
    adset_id: adSetId,
    creative: { creative_id: creativeId },
    status: 'PAUSED',
    access_token: token
  });
  console.log('4. Live Ad Created:', adRes.data.id);
  console.log('>>> SUCCESS: ALL 4 STEPS SUCCEEDED ON META GRAPH API!');
}

testFull().catch(err => {
  console.error('FAILED AT STEP:', JSON.stringify(err.response?.data || err.message, null, 2));
}).finally(() => p.$disconnect());
