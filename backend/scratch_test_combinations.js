const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function testAllGoals() {
  const c = await p.metaAdConfig.findFirst();
  const accountId = 'act_1454270479625110';
  const token = c.accessToken;
  const campId = '120250469298350517';

  const combinations = [
    { dest: 'PHONE_CALL', goal: 'QUALITY_CALL' },
    { dest: 'ON_AD', goal: 'LEAD_GENERATION' }
  ];

  for (const comb of combinations) {
    try {
      const res = await axios.post(`https://graph.facebook.com/v26.0/${accountId}/adsets`, {
        name: `Test ${comb.dest} ${comb.goal}`,
        campaign_id: campId,
        billing_event: 'IMPRESSIONS',
        optimization_goal: comb.goal,
        destination_type: comb.dest,
        promoted_object: { page_id: '1062234726963242' },
        targeting: {
          geo_locations: { countries: ['IN'] },
          age_min: 18,
          age_max: 65,
          targeting_automation: { advantage_audience: 1 }
        },
        status: 'PAUSED',
        access_token: token
      });
      console.log(`>>> SUCCESS: dest=${comb.dest} goal=${comb.goal} -> ID: ${res.data.id}`);
      return;
    } catch (err) {
      const e = err.response?.data?.error || {};
      console.log(`FAILED: dest=${comb.dest} goal=${comb.goal} -> Code: ${e.code} Subcode: ${e.error_subcode} Title: "${e.error_user_title}" Msg: "${e.error_user_msg || e.message}"`);
    }
  }
}
testAllGoals().finally(() => p.$disconnect());
