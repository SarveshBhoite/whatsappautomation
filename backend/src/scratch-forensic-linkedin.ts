import prisma from './utils/prisma';
import axios from 'axios';

async function forensicInspection() {
  console.log("=======================================================");
  console.log("========== FORENSIC LINKEDIN MEDIA & POST AUDIT ==========");
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
  const author = memberId.startsWith("urn:li:person:") ? memberId : `urn:li:person:${memberId}`;
  
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": "202607",
    "X-Restli-Protocol-Version": "2.0.0"
  };

  // 1. Step 1 & 2: Initialize & Binary Upload
  console.log("\n[FORENSIC 1/5] Initializing Image Upload via POST /rest/images?action=initializeUpload");
  const initRes = await axios.post(
    "https://api.linkedin.com/rest/images?action=initializeUpload",
    {
      initializeUploadRequest: {
        owner: author
      }
    },
    { headers }
  );

  console.log("Initialize Response JSON:");
  console.log(JSON.stringify(initRes.data, null, 2));

  const uploadUrl = initRes.data?.value?.uploadUrl;
  const imageUrn = initRes.data?.value?.image;

  console.log(`Upload URL: ${uploadUrl}`);
  console.log(`Image URN: ${imageUrn}`);

  // Fetch sample ImageKit image buffer
  const sampleUrl = "https://ik.imagekit.io/automationjds/linkedin/jisnu-test-1785740744215_ccJVlOFdzg.jpg";
  const imageBufRes = await axios.get(sampleUrl, { responseType: "arraybuffer" });
  const imageBuffer = Buffer.from(imageBufRes.data);

  console.log(`\n[FORENSIC 2/5] Uploading binary buffer (${imageBuffer.length} bytes) via PUT uploadUrl...`);
  const putRes = await axios.put(uploadUrl, imageBuffer, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/octet-stream"
    }
  });

  console.log(`PUT Status: ${putRes.status}`);
  console.log("PUT Response Headers:", JSON.stringify(putRes.headers, null, 2));

  // 2. Step 7, 8, 9, 10: GET /rest/images/{urn}
  console.log(`\n[FORENSIC 3/5] Querying GET /rest/images/${encodeURIComponent(imageUrn)}...`);
  try {
    const imageMetadataRes = await axios.get(`https://api.linkedin.com/rest/images/${encodeURIComponent(imageUrn)}`, { headers });
    console.log(`GET /rest/images Status: ${imageMetadataRes.status}`);
    console.log("COMPLETE GET /rest/images RESPONSE JSON:");
    console.log(JSON.stringify(imageMetadataRes.data, null, 2));
  } catch (imgErr: any) {
    console.warn("GET /rest/images Error:", JSON.stringify(imgErr?.response?.data || imgErr.message, null, 2));
  }

  // 3. Step 5 & 6: POST /rest/posts Raw Payload & Response
  const restPostsUrl = "https://api.linkedin.com/rest/posts";
  const restPayload = {
    author,
    commentary: `Forensic Verification Post ${Date.now()}`,
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
        id: imageUrn
      }
    }
  };

  console.log("\n[FORENSIC 4/5] COMPLETE RAW HTTP REQUEST SENT TO POST /rest/posts:");
  console.log("URL:", restPostsUrl);
  console.log("Headers:", JSON.stringify({ ...headers, Authorization: "Bearer [REDACTED]" }, null, 2));
  console.log("Payload Body JSON:\n", JSON.stringify(restPayload, null, 2));

  console.log("\n[FORENSIC 5/5] Executing POST /rest/posts...");
  const postRes = await axios.post(restPostsUrl, restPayload, { headers });

  console.log(`HTTP Status: ${postRes.status}`);
  console.log("Response Headers:\n", JSON.stringify(postRes.headers, null, 2));
  console.log("Location Header:", postRes.headers["location"]);
  console.log("x-restli-id Header:", postRes.headers["x-restli-id"]);
  console.log("Response Body (Raw):", JSON.stringify(postRes.data, null, 2));

  console.log("\n=======================================================");
  console.log("========== FORENSIC INSPECTION COMPLETE ==========");
  console.log("=======================================================");
}

forensicInspection().catch(err => console.error(err)).finally(() => prisma.$disconnect());
