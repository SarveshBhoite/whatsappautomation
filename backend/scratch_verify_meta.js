const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkMeta() {
  const c = await p.metaAdConfig.findFirst();
  const token = c.accessToken;
  const campId = '120250469341420517';
  const adSetId = '120250469341920517';

  const cRes = await axios.get('https://graph.facebook.com/v26.0/' + campId + '?fields=id,name,status,effective_status,account_id&access_token=' + token);
  console.log('Campaign on Meta:', cRes.data);

  const aRes = await axios.get('https://graph.facebook.com/v26.0/' + adSetId + '?fields=id,name,status,effective_status&access_token=' + token);
  console.log('AdSet on Meta:', aRes.data);

  const adsRes = await axios.get('https://graph.facebook.com/v26.0/act_1454270479625110/campaigns?fields=id,name,status,effective_status&access_token=' + token);
  console.log('All campaigns in account:', adsRes.data);
}
checkMeta().catch(e => console.error(e.response?.data || e.message)).finally(() => p.$disconnect());
