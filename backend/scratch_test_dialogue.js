const axios = require('axios');

async function testFullDialogue() {
  console.log('=== STEP 1: Initial Greeting / Discovery ===');
  const initRes = await axios.get('http://localhost:5000/api/meta-ads/ai/conversation/init?organizationId=demo-org-123');
  let state = initRes.data.session;
  console.log('AI Greeting:', state.conversation[0].text);
  console.log('Initial Buttons:', state.conversation[0].quickOptions || 'None (Clean text chat)');

  console.log('\n=== STEP 2: User talks freely (Multi-fact) ===');
  const turn1 = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
    organizationId: 'demo-org-123',
    currentState: state,
    message: 'I run a dental clinic in Pune. I want more appointment bookings through WhatsApp. Budget is 500 per day.'
  });
  state = turn1.data.state;
  console.log('AI Response:\n', state.conversation.slice(-1)[0].text);
  console.log('Extracted Draft Campaign:', state.draft.campaign);
  console.log('Extracted Draft Targeting:', state.draft.targeting);

  console.log('\n=== STEP 3: User asks a strategy question without clicking buttons ===');
  const turn2 = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
    organizationId: 'demo-org-123',
    currentState: state,
    message: 'Why do you recommend Leads instead of Traffic for this?'
  });
  state = turn2.data.state;
  console.log('AI Response to Strategy Question:\n', state.conversation.slice(-1)[0].text);

  console.log('\n=== STEP 4: User updates budget and targeting conversationally ===');
  const turn3 = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
    organizationId: 'demo-org-123',
    currentState: state,
    message: 'Okay got it. Let us increase the daily budget to 800 and also target Mumbai.'
  });
  state = turn3.data.state;
  console.log('AI Response to Update:\n', state.conversation.slice(-1)[0].text);
  console.log('Updated Daily Budget:', state.draft.campaign.dailyBudget);
  console.log('Updated Cities:', state.draft.targeting.cities);

  console.log('\n=== STEP 5: User says "You decide the creative headline and copy" ===');
  const turn4 = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
    organizationId: 'demo-org-123',
    currentState: state,
    message: 'You decide the creative headline and copy for premium dental treatments.'
  });
  state = turn4.data.state;
  console.log('AI Response to Creative Direction:\n', state.conversation.slice(-1)[0].text);
  console.log('Proposed Creative Copy:', {
    headline: state.draft.creative?.headline,
    primaryText: state.draft.creative?.primaryText,
    cta: state.draft.creative?.callToAction
  });
}

testFullDialogue().catch(e => console.error(e.response?.data || e.message));
