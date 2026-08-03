const http = require('http');

const postData = JSON.stringify({
  organizationId: "demo-org-123",
  name: "Summer WhatsApp Special Promo",
  objective: "MESSAGES",
  dailyBudget: 25.0,
  destinationType: "WHATSAPP",
  creativeHeadline: "Get 25% Off - Chat with Us Now!",
  creativeBody: "Special summer discount on all services. Click to open a direct WhatsApp chat with our sales team.",
  creativeMediaUrl: "https://images.unsplash.com/photo-1557804506-669a67965ba0",
  whatsappNumber: "+14155552671",
  targeting: {
    countries: ["US", "IN"],
    ageMin: 21,
    ageMax: 55
  }
});

const req = http.request('http://localhost:5000/api/meta-ads/campaigns', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log("POST /api/meta-ads/campaigns response:", JSON.stringify(JSON.parse(data), null, 2));
  });
});

req.on('error', (e) => console.error(e));
req.write(postData);
req.end();
