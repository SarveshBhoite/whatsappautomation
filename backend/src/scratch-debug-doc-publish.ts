import prisma from './utils/prisma';
import { LinkedInService } from './services/linkedinService';
import axios from 'axios';

async function testDocumentUploadAndPublish() {
  console.log("=======================================================");
  console.log("========== FORENSIC LINKEDIN DOCUMENT PUBLISH AUDIT ==========");
  console.log("=======================================================");

  const config = await prisma.linkedInConfig.findUnique({
    where: { organizationId: 'demo-org-123' }
  });

  if (!config || !config.accessToken) {
    console.error("No access token found in database!");
    return;
  }

  // Upload real valid multi-page PDF document to ImageKit
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_Gi4+Y2kzZsDXHRaqfyMtionKNKM=";
  const samplePdfPath = "uploads/linkedin/opencv_python_tutorial-1785478955630.pdf";
  const fs = require("fs");
  const path = require("path");

  const fullPath = path.join(process.cwd(), samplePdfPath);
  if (!fs.existsSync(fullPath)) {
    console.error("Sample PDF not found:", fullPath);
    return;
  }
  const pdfBuffer = fs.readFileSync(fullPath);

  const base64 = pdfBuffer.toString("base64");

  console.log(`Uploading test document (${pdfBuffer.length} bytes) to ImageKit CDN...`);
  const ikFormData = new (require("form-data"))();
  ikFormData.append("file", base64);
  ikFormData.append("fileName", `test_document_${Date.now()}.pdf`);
  ikFormData.append("folder", "/linkedin");

  const auth = Buffer.from(`${privateKey}:`).toString("base64");
  const ikRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", ikFormData, {
    headers: { ...ikFormData.getHeaders(), Authorization: `Basic ${auth}` }
  });

  const docUrl = ikRes.data?.url;
  console.log("ImageKit Document CDN URL:", docUrl);

  console.log("\nTriggering LinkedInService.publishPost with Document CDN URL...");
  const result = await LinkedInService.publishPost("demo-org-123", `Testing native document post ${Date.now()}`, docUrl);
  console.log("Publish Result:", JSON.stringify(result, null, 2));

  console.log("=======================================================");
}

testDocumentUploadAndPublish().catch(err => console.error(err)).finally(() => prisma.$disconnect());
