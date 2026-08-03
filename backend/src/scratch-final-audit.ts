import prisma from './utils/prisma';
import axios from 'axios';

async function finalForensicScopeAudit() {
  console.log("=======================================================");
  console.log("========== FINAL FORENSIC SCOPE & PAYLOAD AUDIT ==========");
  console.log("=======================================================");

  const config = await prisma.linkedInConfig.findUnique({
    where: { organizationId: 'demo-org-123' }
  });

  if (!config || !config.accessToken) {
    console.error("No access token found in database!");
    return;
  }

  const token = config.accessToken;
  const memberId = config.memberId || "pGQOg3RKWx";
  const authorUrn = memberId.startsWith("urn:li:person:") ? memberId : `urn:li:person:${memberId}`;

  console.log("\n[AUDIT STEP 1] Inspecting OAuth Access Token details...");
  console.log(`Access Token Length: ${token.length}`);
  console.log(`Stored Member ID in DB: ${config.memberId}`);
  console.log(`Computed Author URN: ${authorUrn}`);

  // Test 1: Query GET /v2/userinfo to verify granted OpenID Connect scopes
  console.log("\n[AUDIT STEP 1.1] Querying GET https://api.linkedin.com/v2/userinfo...");
  try {
    const userinfoRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("GET /v2/userinfo HTTP Status:", userinfoRes.status);
    console.log("Userinfo Response Body:\n", JSON.stringify(userinfoRes.data, null, 2));
  } catch (err: any) {
    console.warn("GET /v2/userinfo Error:", JSON.stringify(err?.response?.data || err.message, null, 2));
  }

  // Test 2: Perform Image Upload & Detailed Asset Field Audit
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": "202607",
    "X-Restli-Protocol-Version": "2.0.0"
  };

  console.log("\n[AUDIT STEP 2 & 3 & 4] Initializing and Uploading Image Asset...");
  const initRes = await axios.post(
    "https://api.linkedin.com/rest/images?action=initializeUpload",
    {
      initializeUploadRequest: {
        owner: authorUrn
      }
    },
    { headers }
  );

  const uploadUrl = initRes.data?.value?.uploadUrl;
  const imageUrn = initRes.data?.value?.image;

  console.log(`Generated Image URN: ${imageUrn}`);

  const sampleUrl = "https://ik.imagekit.io/automationjds/linkedin/jisnu-test-1785740744215_ccJVlOFdzg.jpg";
  const downloadRes = await axios.get(sampleUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(downloadRes.data);

  await axios.put(uploadUrl, imageBuffer, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream"
    }
  });

  // Query GET /rest/images/{urn}
  console.log(`\n[AUDIT STEP 3 & 4] Complete GET /rest/images/${encodeURIComponent(imageUrn)} Response:`);
  const imageMetaRes = await axios.get(`https://api.linkedin.com/rest/images/${encodeURIComponent(imageUrn)}`, { headers });
  console.log("HTTP Status:", imageMetaRes.status);
  console.log("FULL JSON DATA:\n", JSON.stringify(imageMetaRes.data, null, 2));

  console.log("\n[AUDIT STEP 2 VERIFICATION]:");
  console.log(`image.owner = "${imageMetaRes.data?.owner}"`);
  console.log(`post.author = "${authorUrn}"`);
  console.log(`Match Result: ${imageMetaRes.data?.owner === authorUrn ? "EXACT MATCH (TRUE)" : "MISMATCH (FALSE)"}`);

  // Test 3: Test optional media properties (title, altText) in POST /rest/posts
  const restPostsUrl = "https://api.linkedin.com/rest/posts";
  const fullPayload = {
    author: authorUrn,
    commentary: `Testing payload with optional media fields ${Date.now()}`,
    visibility: "PUBLIC",
    distribution: {
      feedDistribution: "MAIN_FEED",
      targetEntities: [],
      thirdPartyDistributionChannels: []
    },
    lifecycleState: "PUBLISHED",
    isReshareDisabledByAuthor: false,
    content: {
      media: {
        id: imageUrn,
        title: "Uploaded Image Title",
        altText: "Image description text"
      }
    }
  };

  console.log("\n[AUDIT STEP 5 & 6 & 7] Testing POST /rest/posts with optional media properties (title, altText):");
  console.log("Payload Body JSON:\n", JSON.stringify(fullPayload, null, 2));

  try {
    const postRes = await axios.post(restPostsUrl, fullPayload, { headers });
    console.log("HTTP Status:", postRes.status);
    console.log("Location Header:", postRes.headers["location"]);
    console.log("x-restli-id Header:", postRes.headers["x-restli-id"]);
  } catch (postErr: any) {
    console.error("POST /rest/posts Error:", JSON.stringify(postErr?.response?.data || postErr.message, null, 2));
  }

  console.log("\n=======================================================");
  console.log("========== FINAL FORENSIC AUDIT COMPLETE ==========");
  console.log("=======================================================");
}

finalForensicScopeAudit().catch(err => console.error(err)).finally(() => prisma.$disconnect());
