import prisma from './src/utils/prisma';
import { CustomerBusinessProfileService } from './src/services/googleAds/CustomerBusinessProfileService';

async function main() {
  console.log('Testing CustomerBusinessProfileService...');
  const res = await CustomerBusinessProfileService.getProfile('demo-org-123', '6587355041');
  console.log('Profile result:', res ? res.customerId : 'Not found');
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
