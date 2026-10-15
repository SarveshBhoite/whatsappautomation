const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const u = new URL(url);
    const req = http.request(
      {
        hostname: u.hostname,
        port: u.port,
        path: u.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(body) });
          } catch (e) {
            resolve({ status: res.statusCode, body });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  const timestamp = Date.now();
  console.log('1. Testing /api/subscription/create-order for Annual Plan...');
  const orderRes = await post('http://localhost:5000/api/subscription/create-order', {
    planCode: 'annual',
    extraChannels: 2,
    email: `org_${timestamp}@jisnutest.com`,
    name: 'Jisnu Enterprise',
    phone: '9876543210',
  });
  console.log('Create order status:', orderRes.status);
  console.log('Order ID:', orderRes.data.orderId);
  console.log('Grand Total:', orderRes.data.amount);
  console.log('Calculated Base:', orderRes.data.calculation.basePrice);
  console.log('Extra Channels Cost:', orderRes.data.calculation.extraChannelsCost);
  console.log('GST:', orderRes.data.calculation.gstAmount);

  console.log('\n2. Testing /api/subscription/verify-and-register...');
  const verifyRes = await post('http://localhost:5000/api/subscription/verify-and-register', {
    razorpayOrderId: orderRes.data.orderId,
    razorpayPaymentId: `pay_mock_${timestamp}`,
    razorpaySignature: 'mock_signature_approved',
    email: `org_${timestamp}@jisnutest.com`,
    password: 'securePassword123!',
    organizationName: `Jisnu Test Org ${timestamp}`,
    fullName: 'Jisnu Admin',
    phone: '9876543210',
    planCode: 'annual',
    extraChannels: 2,
  });
  console.log('Verify status:', verifyRes.status);
  console.log('User created:', verifyRes.data.user?.email);
  console.log('Org created:', verifyRes.data.user?.organizationName);
  console.log('Subscription plan:', verifyRes.data.subscription?.planCode);
  console.log('Subscription duration:', verifyRes.data.subscription?.durationMonths, 'months');
  console.log('Subscription start:', verifyRes.data.subscription?.startDate);
  console.log('Subscription end:', verifyRes.data.subscription?.endDate);
}

run().catch(console.error);
