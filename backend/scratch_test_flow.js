const axios = require('axios');

async function testDialogueFlow() {
  console.log('--- TEST: Natural conversation gathering then strategy synthesis ---');
  
  // 1. Init
  const initRes = await axios.get('http://localhost:5000/api/meta-ads/ai/conversation/init?organizationId=demo-org-123');
  let state = initRes.data.session;
  console.log('\n[AI GREETING]:', state.conversation[0].text);

  // 2. User gives initial interest: "i want to promote my car shop"
  console.log('\n[USER]: "i want to promote my car shop"');
  let turn1 = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
    organizationId: 'demo-org-123',
    currentState: state,
    message: 'i want to promote my car shop'
  });
  state = turn1.data.state;
  console.log('[AI RESPONSE (Conversational inquiry)]:\n', state.conversation.slice(-1)[0].text);
  console.log('Confirmation card shown?:', state.requiresConfirmation);

  // 3. User provides details in response: "It is located in Pune. I want WhatsApp inquiries and can spend around 600 per day."
  console.log('\n[USER]: "It is located in Pune. I want WhatsApp inquiries and can spend around 600 per day."');
  let turn2 = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
    organizationId: 'demo-org-123',
    currentState: state,
    message: 'It is located in Pune. I want WhatsApp inquiries and can spend around 600 per day.'
  });
  state = turn2.data.state;
  console.log('\n[AI RESPONSE (Full data-grounded strategy)]:\n', state.conversation.slice(-1)[0].text);
  console.log('\nDraft Created:', {
    name: state.draft.campaign.name,
    objective: state.draft.campaign.objective,
    dailyBudget: state.draft.campaign.dailyBudget,
    city: state.draft.targeting.cities,
    destination: state.draft.destination.type,
    headline: state.draft.creative?.headline
  });
  console.log('Confirmation Ready?:', state.requiresConfirmation);
}

testDialogueFlow().catch(e => console.error(e.response?.data || e.message));
