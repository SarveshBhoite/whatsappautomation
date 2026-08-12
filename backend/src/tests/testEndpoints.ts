import http from 'http';

const endpoints = [
  '/api/linkedin/config',
  '/api/linkedin/profile',
  '/api/linkedin/posts',
  '/api/linkedin/drafts',
  '/api/linkedin/scheduled',
  '/api/admin/config',
  '/api/gmb/config?orgId=demo-org-123'
];

async function testAll() {
  console.log("=== TESTING ALL CRM ENDPOINTS AGAINST EXPRESS BACKEND ===");
  for (const ep of endpoints) {
    await new Promise((resolve) => {
      const req = http.request('http://localhost:5000' + ep, { headers: { 'x-organization-id': 'demo-org-123' } }, (res) => {
        console.log(`[SUCCESS] ${ep} -> HTTP ${res.statusCode}`);
        resolve(null);
      });
      req.on('error', (err) => {
        console.error(`[FAILED] ${ep} -> Error: ${err.message}`);
        resolve(null);
      });
      req.end();
    });
  }
}

testAll();
