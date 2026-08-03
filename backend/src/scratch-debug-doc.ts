import prisma from './utils/prisma';
import axios from 'axios';

async function auditDocumentPipeline() {
  console.log("=======================================================");
  console.log("========== FORENSIC LINKEDIN DOCUMENT AUDIT ==========");
  console.log("=======================================================");

  const config = await prisma.linkedInConfig.findUnique({
    where: { organizationId: 'demo-org-123' }
  });

  if (!config || !config.accessToken) {
    console.error("No access token found in database!");
    return;
  }

  const accessToken = config.accessToken;
  const author = `urn:li:person:${config.memberId || "pGQOg3RKWx"}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "LinkedIn-Version": "202607",
    "X-Restli-Protocol-Version": "2.0.0"
  };

  console.log("STEP 1: Testing POST https://api.linkedin.com/rest/documents?action=initializeUpload");
  console.log("Headers:", JSON.stringify(headers, null, 2));

  const samplePdfPath = "public/sample.pdf";
  const fs = require("fs");
  let fileSize = 50000;
  if (fs.existsSync(samplePdfPath)) {
    fileSize = fs.statSync(samplePdfPath).size;
  }

  const initPayload = {
    initializeUploadRequest: {
      owner: author
    }
  };

  console.log("Payload:", JSON.stringify(initPayload, null, 2));

  try {
    const initRes = await axios.post(
      "https://api.linkedin.com/rest/documents?action=initializeUpload",
      initPayload,
      { headers }
    );

    console.log("[STEP 1 SUCCESS] HTTP Status:", initRes.status);
    console.log("Response Body:", JSON.stringify(initRes.data, null, 2));

    const documentUrn = initRes.data?.value?.document;
    const uploadUrl = initRes.data?.value?.uploadUrl;

    console.log("Document URN:", documentUrn);
    console.log("Upload URL:", uploadUrl);

    if (uploadUrl) {
      console.log("\nSTEP 2: Uploading PDF Binary to uploadUrl...");
      const dummyPdfBuffer = Buffer.from("%PDF-1.4 %âãÏÓ 1 0 obj << /Type /Catalog >> endobj xref 0 1 0000000000 65535 f trailer << /Root 1 0 R >> %%EOF");
      const putRes = await axios.put(uploadUrl, dummyPdfBuffer, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/pdf"
        }
      });
      console.log("[STEP 2 SUCCESS] HTTP Status:", putRes.status);
    }

    if (documentUrn) {
      console.log("\nSTEP 4: Polling GET /rest/documents/" + encodeURIComponent(documentUrn));
      const getRes = await axios.get(`https://api.linkedin.com/rest/documents/${encodeURIComponent(documentUrn)}`, { headers });
      console.log("[STEP 4 SUCCESS] HTTP Status:", getRes.status);
      console.log("GET Document Response Body:", JSON.stringify(getRes.data, null, 2));
    }

  } catch (err: any) {
    console.error("\n=======================================================");
    console.error("[DOCUMENT AUDIT ERROR RESPONSE]");
    console.error("HTTP Status:", err?.response?.status);
    console.error("Response Headers:", JSON.stringify(err?.response?.headers, null, 2));
    console.error("Response Body:", JSON.stringify(err?.response?.data || err.message, null, 2));
    console.error("=======================================================");
  }
}

auditDocumentPipeline().catch(err => console.error(err)).finally(() => prisma.$disconnect());
