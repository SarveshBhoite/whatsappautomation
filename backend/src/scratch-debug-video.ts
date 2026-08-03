import prisma from './utils/prisma';
import { LinkedInService } from './services/linkedinService';
import axios from 'axios';

async function testVideoUpload() {
  console.log("=======================================================");
  console.log("========== FORENSIC LINKEDIN VIDEO UPLOAD AUDIT ==========");
  console.log("=======================================================");

  const config = await prisma.linkedInConfig.findUnique({
    where: { organizationId: 'demo-org-123' }
  });

  if (!config || !config.accessToken) {
    console.error("No access token found in database!");
    return;
  }

  // Upload a sample video to ImageKit first to ensure valid ImageKit video CDN URL
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_Gi4+Y2kzZsDXHRaqfyMtionKNKM=";
  const sampleVideoPath = "uploads/linkedin/center_1576_VIDEO_c762ab25-6cf7-4a0f-9013-de0205600b73-1785477765399.mp4";
  const fs = require("fs");
  const path = require("path");

  const fullPath = path.join(process.cwd(), sampleVideoPath);
  if (!fs.existsSync(fullPath)) {
    console.error("Sample video file not found locally:", fullPath);
    return;
  }

  const videoBuffer = fs.readFileSync(fullPath);
  const base64 = videoBuffer.toString("base64");

  console.log(`Uploading test video (${videoBuffer.length} bytes) to ImageKit CDN...`);
  const ikFormData = new (require("form-data"))();
  ikFormData.append("file", base64);
  ikFormData.append("fileName", `test_video_${Date.now()}.mp4`);
  ikFormData.append("folder", "/linkedin");

  const auth = Buffer.from(`${privateKey}:`).toString("base64");
  const ikRes = await axios.post("https://upload.imagekit.io/api/v1/files/upload", ikFormData, {
    headers: { ...ikFormData.getHeaders(), Authorization: `Basic ${auth}` }
  });

  const videoUrl = ikRes.data?.url;
  console.log("ImageKit Video CDN URL:", videoUrl);

  console.log("\nTriggering LinkedInService.publishPost with Video CDN URL...");
  const result = await LinkedInService.publishPost("demo-org-123", `Testing native video post ${Date.now()}`, videoUrl);
  console.log("Publish Result:", JSON.stringify(result, null, 2));

  console.log("=======================================================");
}

testVideoUpload().catch(err => console.error(err)).finally(() => prisma.$disconnect());
