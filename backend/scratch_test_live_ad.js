const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();

async function testWorkingAd() {
  const config = await prisma.metaAdConfig.findFirst({ where: { organizationId: 'demo-org-123' } });
  const accountId = 'act_1454270479625110';
  const pageId = '1062234726963242';

  // 1. Campaign with CBO
  const camp = await axios.post('https://graph.facebook.com/v26.0/' + accountId + '/campaigns', {
    name: 'Working End-to-End Campaign ' + Date.now(),
    objective: 'OUTCOME_LEADS',
    buying_type: 'AUCTION',
    special_ad_categories: [],
    daily_budget: 50000,
    bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
    status: 'PAUSED',
    access_token: config.accessToken
  });
  console.log('1. Campaign Created:', camp.data.id);

  // 2. AdSet with Advantage+ and Country Geo
  const adset = await axios.post('https://graph.facebook.com/v26.0/' + accountId + '/adsets', {
    name: 'Working End-to-End AdSet',
    campaign_id: camp.data.id,
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
    access_token: config.accessToken
  });
  console.log('2. AdSet Created:', adset.data.id);

  // 3. Creative with Click-to-WhatsApp
  const creative = await axios.post('https://graph.facebook.com/v26.0/' + accountId + '/adcreatives', {
    name: 'Working Creative',
    object_story_spec: {
      page_id: pageId,
      link_data: {
        message: 'Book your service with JISNU Digital Solutions today!',
        name: 'Special Offer',
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
  console.log('3. Creative Created:', creative.data.id);

  // 4. Create Ad
  const ad = await axios.post('https://graph.facebook.com/v26.0/' + accountId + '/ads', {
    name: 'Working Ad',
    adset_id: adset.data.id,
    creative: { creative_id: creative.data.id },
    status: 'PAUSED',
    access_token: config.accessToken
  });
  console.log('4. AD CREATED SUCCESSFULLY:', ad.data.id);
}

testWorkingAd().catch(e => console.error('FAILED:', e.response?.data?.error || e.message)).finally(() => prisma.$disconnect());
