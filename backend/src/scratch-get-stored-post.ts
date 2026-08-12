import prisma from './utils/prisma';
import axios from 'axios';

async function verifyStoredPost() {
  console.log("========== LINKEDIN STORED POST RETRIEVAL INSPECTION ==========");

  const config = await prisma.linkedInConfig.findUnique({
    where: { organizationId: 'demo-org-123' }
  });

  if (!config || !config.accessToken) {
    console.error("No access token found in database!");
    return;
  }

  const token = config.accessToken;
  console.log("OAuth Access Token present (length:", token.length, ")");

  // Fetch the latest published LinkedIn post from CRM DB
  const latestPost = await prisma.linkedInPost.findFirst({
    where: {
      organizationId: 'demo-org-123',
      lifecycleState: 'PUBLISHED'
    },
    orderBy: { publishedAt: 'desc' }
  });

  if (!latestPost || !latestPost.linkedinPostId) {
    console.error("No published post record found in CRM database!");
    return;
  }

  const shareUrn = latestPost.linkedinPostId;
  console.log(`Target Published Share URN: ${shareUrn}`);

  // Test 1: REST Posts API /rest/posts/{id} with Version 202607
  const restPostsUrl = `https://api.linkedin.com/rest/posts/${encodeURIComponent(shareUrn)}`;
  const headersRest = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": "202607",
    "X-Restli-Protocol-Version": "2.0.0"
  };

  console.log("\n-------------------------------------------------------");
  console.log(`[TEST 1] GET ${restPostsUrl}`);
  try {
    const res = await axios.get(restPostsUrl, { headers: headersRest });
    console.log(`HTTP Status: ${res.status}`);
    console.log("FULL REST POSTS JSON RESPONSE:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.warn(`REST Posts API GET Error [HTTP ${err?.response?.status}]:`, JSON.stringify(err?.response?.data || err.message, null, 2));
  }

  // Test 2: Versioned UGC Posts API /v2/ugcPosts/{id}
  const ugcUrl = `https://api.linkedin.com/v2/ugcPosts/${encodeURIComponent(shareUrn)}`;
  const headersV2 = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  console.log("\n-------------------------------------------------------");
  console.log(`[TEST 2] GET ${ugcUrl}`);
  try {
    const res = await axios.get(ugcUrl, { headers: headersV2 });
    console.log(`HTTP Status: ${res.status}`);
    console.log("FULL V2 UGC POSTS JSON RESPONSE:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.warn(`v2 ugcPosts GET Error [HTTP ${err?.response?.status}]:`, JSON.stringify(err?.response?.data || err.message, null, 2));
  }

  // Test 3: Shares API /v2/shares/{id}
  const shareIdOnly = shareUrn.replace("urn:li:share:", "");
  const sharesUrl = `https://api.linkedin.com/v2/shares/${shareIdOnly}`;
  console.log("\n-------------------------------------------------------");
  console.log(`[TEST 3] GET ${sharesUrl}`);
  try {
    const res = await axios.get(sharesUrl, { headers: headersV2 });
    console.log(`HTTP Status: ${res.status}`);
    console.log("FULL V2 SHARES JSON RESPONSE:");
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err: any) {
    console.warn(`v2 shares GET Error [HTTP ${err?.response?.status}]:`, JSON.stringify(err?.response?.data || err.message, null, 2));
  }

  console.log("=======================================================");
}

verifyStoredPost().catch(err => console.error(err)).finally(() => prisma.$disconnect());
