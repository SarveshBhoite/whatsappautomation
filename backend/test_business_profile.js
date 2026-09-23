const assert = require('assert');

async function runTests() {
  const BASE_URL = 'http://localhost:5000';
  const orgId = 'demo-org-123';
  const ownedCid = '6587355041';
  const unownedCid = '7791004787';

  console.log('================================================================');
  console.log('STARTING BUSINESS & MARKETING PROFILE AUTOMATED TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: GET Customer Profile for owned customer
  console.log('--- TEST 1: GET /api/ads/customer-profile (Owned customer) ---');
  const res1 = await fetch(`${BASE_URL}/api/ads/customer-profile?orgId=${orgId}&customerId=${ownedCid}`);
  assert.strictEqual(res1.status, 200, `Expected 200, got ${res1.status}`);
  const data1 = await res1.json();
  assert.strictEqual(data1.success, true);
  assert.strictEqual(data1.customerId, ownedCid);
  assert.strictEqual(typeof data1.hasMerchantAccount, 'boolean');
  assert.strictEqual(typeof data1.hasAppAccount, 'boolean');
  assert.ok(Array.isArray(data1.additionalWebsites));
  assert.ok(Array.isArray(data1.products));
  assert.ok(Array.isArray(data1.services));
  console.log('✓ TEST 1 PASSED: Profile retrieved with all expected capabilities and fields.');

  // TEST 2: POST /api/ads/customer-profile (Save and Approve full profile)
  console.log('\n--- TEST 2: POST /api/ads/customer-profile (Save & Approve Profile) ---');
  const profilePayload = {
    customerId: ownedCid,
    businessName: 'Jisnu Digital Solutions',
    industry: 'Digital Marketing & Growth',
    businessDescription: 'Leading growth marketing and AI automation agency empowering brands worldwide.',
    primaryWebsite: 'https://jisnudigital.com',
    additionalWebsites: [
      {
        url: 'https://shop.jisnudigital.com',
        title: 'Jisnu Online Store',
        subPages: [
          { text: 'Products Catalog', url: 'https://shop.jisnudigital.com/catalog' },
          { text: 'Special Offers', url: 'https://shop.jisnudigital.com/deals' }
        ]
      },
      {
        url: 'https://blog.jisnudigital.com',
        title: 'Jisnu Marketing Blog',
        subPages: [
          { text: 'Case Studies', url: 'https://blog.jisnudigital.com/case-studies' }
        ]
      }
    ],
    products: ['Growth Engine Pro', 'WhatsApp CRM Suite', 'Performance Max Optimizer'],
    services: ['Google Ads Management', 'Conversion Rate Optimization', 'Local SEO Setup'],
    targetAudience: 'High-growth businesses, e-commerce retailers, and local service providers.',
    keyOfferings: ['Same-Day Setup', 'Performance Guarantee', '24/7 Expert Support'],
    locations: ['India', 'Pune', 'Mumbai', 'Bangalore'],
    hasMerchantAccount: true,
    merchantCenterId: '987654321',
    merchantDetails: { storeName: 'Jisnu Digital Store' },
    hasAppAccount: true,
    appDetails: [
      {
        id: 'app-android-1',
        platform: 'ANDROID',
        appId: 'com.jisnudigital.crm',
        appName: 'Jisnu Marketing App',
        appUrl: 'https://play.google.com/store/apps/details?id=com.jisnudigital.crm'
      },
      {
        id: 'app-ios-1',
        platform: 'IOS',
        appId: 'id987654321',
        appName: 'Jisnu Marketing iOS',
        appUrl: 'https://apps.apple.com/app/id987654321'
      }
    ],
    isApproved: true
  };

  const res2 = await fetch(`${BASE_URL}/api/ads/customer-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-organization-id': orgId
    },
    body: JSON.stringify(profilePayload)
  });
  assert.strictEqual(res2.status, 200, `Expected 200, got ${res2.status}`);
  const data2 = await res2.json();
  assert.strictEqual(data2.success, true);
  assert.strictEqual(data2.profile.businessName, 'Jisnu Digital Solutions');
  assert.strictEqual(data2.profile.primaryWebsite, 'https://jisnudigital.com');
  assert.strictEqual(data2.profile.hasMerchantAccount, true);
  assert.strictEqual(data2.profile.merchantCenterId, '987654321');
  assert.strictEqual(data2.profile.hasAppAccount, true);
  assert.strictEqual(data2.profile.appDetails.length, 2);
  assert.strictEqual(data2.profile.isApproved, true);
  assert.ok(data2.profile.approvedAt);
  console.log('✓ TEST 2 PASSED: Complete profile successfully saved, persisted in PostgreSQL, and approved.');

  // TEST 3: Verify GET reflects the saved profile
  console.log('\n--- TEST 3: GET /api/ads/customer-profile (Verify Persisted Data) ---');
  const res3 = await fetch(`${BASE_URL}/api/ads/customer-profile?orgId=${orgId}&customerId=${ownedCid}`);
  assert.strictEqual(res3.status, 200);
  const data3 = await res3.json();
  assert.strictEqual(data3.businessName, 'Jisnu Digital Solutions');
  assert.strictEqual(data3.primaryWebsite, 'https://jisnudigital.com');
  assert.strictEqual(data3.additionalWebsites.length, 2);
  assert.strictEqual(data3.additionalWebsites[0].subPages.length, 2);
  assert.strictEqual(data3.hasMerchantAccount, true);
  assert.strictEqual(data3.merchantCenterId, '987654321');
  assert.strictEqual(data3.hasAppAccount, true);
  assert.strictEqual(data3.appDetails.length, 2);
  assert.strictEqual(data3.isApproved, true);
  console.log('✓ TEST 3 PASSED: Verified persisted customer profile from database.');

  // TEST 4: Enforce max 15 websites limit
  console.log('\n--- TEST 4: Enforce Max 15 Websites Limit ---');
  const excessWebsites = Array.from({ length: 15 }, (_, i) => ({
    url: `https://excess-site-${i + 1}.com`,
    subPages: []
  }));
  const res4 = await fetch(`${BASE_URL}/api/ads/customer-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-organization-id': orgId
    },
    body: JSON.stringify({
      customerId: ownedCid,
      primaryWebsite: 'https://jisnudigital.com',
      additionalWebsites: excessWebsites
    })
  });
  assert.strictEqual(res4.status, 400, `Expected 400 for 16 websites total, got ${res4.status}`);
  const data4 = await res4.json();
  assert.ok(data4.error.includes('Maximum of 14 additional websites permitted'));
  console.log('✓ TEST 4 PASSED: Exceeding 15 total websites is strictly rejected with 400 Bad Request.');

  // TEST 5: Customer Isolation - Unowned Customer ID
  console.log('\n--- TEST 5: Strict Customer Isolation (Unowned Customer) ---');
  const res5 = await fetch(`${BASE_URL}/api/ads/customer-profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-organization-id': orgId
    },
    body: JSON.stringify({
      customerId: unownedCid,
      businessName: 'Hacked Business'
    })
  });
  assert.strictEqual(res5.status, 403, `Expected 403 Forbidden, got ${res5.status}`);
  console.log('✓ TEST 5 PASSED: Unowned customer profile mutation blocked with 403 Forbidden.');

  // TEST 6: AI Guided User Profile Prefill Integration
  console.log('\n--- TEST 6: GET /api/ads/ai-guided/user-profile (AI Campaign Prefill) ---');
  const res6 = await fetch(`${BASE_URL}/api/ads/ai-guided/user-profile?orgId=${orgId}&customerId=${ownedCid}`, {
    headers: { 'x-organization-id': orgId }
  });
  assert.strictEqual(res6.status, 200);
  const data6 = await res6.json();
  assert.strictEqual(data6.businessName, 'Jisnu Digital Solutions');
  assert.strictEqual(data6.primaryWebsite, 'https://jisnudigital.com');
  assert.strictEqual(data6.hasMerchantAccount, true);
  assert.strictEqual(data6.merchantCenterId, '987654321');
  assert.strictEqual(data6.hasAppAccount, true);
  assert.strictEqual(data6.appDetails.length, 2);
  assert.strictEqual(data6.isProfileApproved, true);
  assert.ok(Array.isArray(data6.products) && data6.products.includes('Growth Engine Pro'));
  console.log('✓ TEST 6 PASSED: AI Guided session correctly prefills with approved customer profile.');

  // TEST 7: AI Website Analysis & Sub-Page Discovery Endpoint
  console.log('\n--- TEST 7: POST /api/ads/customer-profile/analyze-website ---');
  const res7 = await fetch(`${BASE_URL}/api/ads/customer-profile/analyze-website`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-organization-id': orgId
    },
    body: JSON.stringify({
      customerId: ownedCid,
      url: 'https://example.com'
    })
  });
  assert.strictEqual(res7.status, 200, `Expected 200, got ${res7.status}`);
  const data7 = await res7.json();
  assert.strictEqual(data7.success, true);
  assert.ok(data7.website);
  assert.strictEqual(data7.website.url, 'https://example.com');
  assert.ok(Array.isArray(data7.website.subPages));
  assert.ok(data7.aiIntelligence);
  console.log('✓ TEST 7 PASSED: Website analyzer and Groq AI intelligence extraction functional.');

  console.log('\n================================================================');
  console.log('✅ ALL 7 AUTOMATED INTEGRATION TESTS PASSED SUCCESSFULLY!');
  console.log('================================================================');
}

runTests().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
