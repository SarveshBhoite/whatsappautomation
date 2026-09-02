const axios = require('axios');

async function testCarShop() {
  const initRes = await axios.get('http://localhost:5000/api/meta-ads/ai/conversation/init?organizationId=demo-org-123');
  const session = initRes.data.session;
  console.log('--- Initial Greeting ---');
  console.log(session.conversation[0].text);

  console.log('\n--- User: "i want to promote my car shop" ---');
  const res = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
    organizationId: 'demo-org-123',
    currentState: session,
    message: 'i want to promote my car shop'
  });

  const state = res.data.state;
  console.log('\n--- AI Conversational Response ---');
  console.log(state.conversation.slice(-1)[0].text);
  console.log('\nQuick Options attached:', state.conversation.slice(-1)[0].quickOptions || 'NONE (pure chat)');
  console.log('Requires Confirmation Card:', state.requiresConfirmation);
  console.log('Status:', state.status);
}

testCarShop().catch(e => console.error(e.response?.data || e.message));
