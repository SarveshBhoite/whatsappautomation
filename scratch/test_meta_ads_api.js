const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch (e) { resolve(data); }
      });
    }).on('error', reject);
  });
}

async function testApi() {
  console.log("--- Testing Meta Ads API ---");
  try {
    const configRes = await get('/api/meta-ads/config?organizationId=demo-org-123');
    console.log("GET /api/meta-ads/config:", JSON.stringify(configRes, null, 2));

    const diagRes = await get('/api/meta-ads/connectivity-check?organizationId=demo-org-123');
    console.log("GET /api/meta-ads/connectivity-check:", JSON.stringify(diagRes, null, 2));

    const campRes = await get('/api/meta-ads/campaigns?organizationId=demo-org-123');
    console.log("GET /api/meta-ads/campaigns:", JSON.stringify(campRes, null, 2));

    const appRes = await get('/api/meta-ads/approvals?organizationId=demo-org-123');
    console.log("GET /api/meta-ads/approvals:", JSON.stringify(appRes, null, 2));
  } catch (err) {
    console.error("API test error:", err.message);
  }
}

testApi();
