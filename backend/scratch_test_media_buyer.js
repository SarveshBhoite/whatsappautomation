const axios = require('axios');

async function testSingleQuestionFlow() {
  try {
    console.log('=== STEP 1: Session Init ===');
    const initRes = await axios.get('http://localhost:5000/api/meta-ads/ai/conversation/init?organizationId=demo-org-123');
    let session = initRes.data.session;
    console.log('AI Initial Greeting:\n', session.conversation[0].text);

    console.log('\n=== STEP 2: User says: "I run a clothing shop" ===');
    const msg1Res = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
      organizationId: 'demo-org-123',
      currentState: session,
      message: 'I run a clothing shop'
    });

    let state1 = msg1Res.data.state;
    console.log('AI Response (Should ask ONLY 1 question):\n', state1.conversation[state1.conversation.length - 1].text);
    console.log('Quick Options:', state1.conversation[state1.conversation.length - 1].quickOptions?.map(o => o.label));

    console.log('\n=== STEP 3: User replies: "Women ethnic wear and sarees with 25% festive discount" ===');
    const msg2Res = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
      organizationId: 'demo-org-123',
      currentState: state1,
      message: 'Women ethnic wear and sarees with 25% festive discount'
    });

    let state2 = msg2Res.data.state;
    console.log('AI Response (Should ask NEXT question - e.g. location):\n', state2.conversation[state2.conversation.length - 1].text);
    console.log('Quick Options:', state2.conversation[state2.conversation.length - 1].quickOptions?.map(o => o.label));

    console.log('\n=== STEP 4: User replies: "Pune city" ===');
    const msg3Res = await axios.post('http://localhost:5000/api/meta-ads/ai/conversation/message', {
      organizationId: 'demo-org-123',
      currentState: state2,
      message: 'Pune city'
    });

    let state3 = msg3Res.data.state;
    console.log('AI Response (Should ask NEXT question - e.g. budget):\n', state3.conversation[state3.conversation.length - 1].text);
    console.log('Quick Options:', state3.conversation[state3.conversation.length - 1].quickOptions?.map(o => o.label));

  } catch (err) {
    console.error('ERROR:', err.response?.data || err.message);
  }
}

testSingleQuestionFlow();
