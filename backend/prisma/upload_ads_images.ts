import { WhatsAppService } from '../src/services/whatsappService';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function uploadAdsImages() {
  const waConfig = await prisma.whatsAppConfig.findFirst();
  if (!waConfig?.phoneNumberId || !waConfig?.accessToken) {
    console.error('No WhatsApp config found');
    process.exit(1);
  }

  const images = [
    { file: '/uploads/ads_result_1.jpg', caption: '📊 Live Meta Ads Dashboard - Solar Ads campaigns with 72 messaging conversations' },
    { file: '/uploads/ads_result_2.jpg', caption: '🏠 Proof 2: Real Estate (Saffron Realty) - 15 Day Campaign: 85 leads at ₹5.98/lead' },
    { file: '/uploads/ads_result_3.jpg', caption: '🚗 Proof 3: Car Rental - 60 Day Campaign: 267+ leads, 22,052 reach at ₹15.86/lead' },
    { file: '/uploads/ads_result_4.jpg', caption: '💻 Proof 4: Data Engineering Courses - 20 Day Campaign: High quality leads, 87,849 reach' },
    { file: '/uploads/ads_result_5.jpg', caption: '🏗️ Proof 5: Real Estate Saffron Realty - 264 results across 3 campaigns, ₹6.11/result' },
  ];

  const results: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`Uploading ads image ${i + 1}/${images.length}: ${img.file}`);
    const mediaId = await WhatsAppService.uploadMedia(waConfig.phoneNumberId, waConfig.accessToken, img.file, 'image/jpeg');
    if (mediaId) {
      results.push(mediaId);
      console.log(`  ✅ ads_result_${i + 1} -> Meta ID: ${mediaId}`);
    } else {
      console.error(`  ❌ Failed to upload ${img.file}`);
      results.push('');
    }
  }

  console.log('\n=== UPLOAD RESULTS ===');
  results.forEach((id, i) => console.log(`ads_result_media_${i + 1}: ${id}`));

  await prisma.$disconnect();
  process.exit(0);
}

uploadAdsImages().catch(err => { console.error(err); process.exit(1); });
