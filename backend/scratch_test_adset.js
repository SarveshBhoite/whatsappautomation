const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function test() {
  const c = await p.metaAdConfig.findFirst();
  if (!c) return console.log('No config');
  const accountId = 'act_1454270479625110';
  const token = c.accessToken;

  let campId;
  try {
    const cRes = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/campaigns`, {
      name: 'Diagnostic Test Campaign',
      objective: 'OUTCOME_LEADS',
      status: 'PAUSED',
      special_ad_categories: ['NONE'],
      daily_budget: 50000,
      bid_strategy: 'LOWEST_COST_WITHOUT_CAP',
      access_token: token
    });
    campId = cRes.data.id;
    console.log('Campaign created:', campId);
  } catch (err) {
    return console.error('Campaign error:', err.response?.data || err.message);
  }

  try {
    const aRes = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adsets`, {
      name: 'Diagnostic Test Ad Set',
      campaign_id: campId,
      billing_event: 'IMPRESSIONS',
      optimization_goal: 'LINK_CLICKS',
      destination_type: 'ON_AD',
      promoted_object: { page_id: '1062234726963242' },
      targeting: {
        geo_locations: { countries: ['IN'] },
        age_min: 18,
        age_max: 65
      },
      daily_budget: 50000,
      status: 'PAUSED',
      access_token: token
    });
    console.log('AdSet created successfully:', aRes.data);
  } catch (err) {
    console.error('AdSet error:', JSON.stringify(err.response?.data || err.message, null, 2));
  }
}

test().finally(() => p.$disconnect());
