import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import dotenv from 'dotenv';

dotenv.config();

const PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || 'private_Gi4+Y2kzZsDXHRaqfyMtionKNKM=';
const URL_ENDPOINT = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/automationjds';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

async function uploadAllImagesToImageKit() {
  console.log('🚀 Starting ImageKit Upload for local proof & CRM images...');
  console.log(`Target Endpoint: ${URL_ENDPOINT}\n`);

  if (!fs.existsSync(UPLOADS_DIR)) {
    console.error(`Uploads directory not found at: ${UPLOADS_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(UPLOADS_DIR).filter((f) => f.match(/\.(jpg|jpeg|png|webp|gif)$/i));

  if (files.length === 0) {
    console.warn('No image files found in public/uploads');
    process.exit(0);
  }

  const results: { file: string; url: string; success: boolean }[] = [];

  for (const filename of files) {
    const filePath = path.join(UPLOADS_DIR, filename);
    console.log(`Uploading [${filename}] (${(fs.statSync(filePath).size / 1024).toFixed(1)} KB)...`);

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(filePath));
      form.append('fileName', filename);
      form.append('useUniqueFileName', 'false');
      form.append('folder', '/');

      const authHeader = `Basic ${Buffer.from(`${PRIVATE_KEY}:`).toString('base64')}`;

      const response = await axios.post('https://upload.imagekit.io/api/v1/files/upload', form, {
        headers: {
          ...form.getHeaders(),
          Authorization: authHeader,
        },
      });

      const publicUrl = response.data.url;
      results.push({ file: filename, url: publicUrl, success: true });
      console.log(`  ✅ Successfully uploaded to ImageKit: ${publicUrl}`);
    } catch (err: any) {
      console.error(`  ❌ Failed to upload [${filename}]:`, err.response?.data || err.message);
      results.push({ file: filename, url: `${URL_ENDPOINT}/${filename}`, success: false });
    }
  }

  console.log('\n========================================');
  console.log('SUMMARY: ImageKit Media Upload Complete');
  console.log('========================================');
  results.forEach((r) => {
    console.log(`${r.success ? '🟢' : '🔴'} ${r.file} -> ${r.url}`);
  });

  process.exit(0);
}

uploadAllImagesToImageKit().catch((err) => {
  console.error('Fatal Error during ImageKit upload:', err);
  process.exit(1);
});
