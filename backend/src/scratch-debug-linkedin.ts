import prisma from './utils/prisma';
import { LinkedInService } from './services/linkedinService';
import fs from 'fs';
import path from 'path';

async function main() {
  const config = await prisma.linkedInConfig.findUnique({ where: { organizationId: 'demo-org-123' } });
  console.log('Target Organization Member ID:', config?.memberId);
  const testDir = path.join(process.cwd(), 'uploads', 'linkedin');
  const files = fs.readdirSync(testDir);
  console.log('Available uploads:', files);
  const fileUrl = 'https://ik.imagekit.io/automationjds/linkedin/jisnu-test-1785740744215_ccJVlOFdzg.jpg';
  console.log('Selected Test File URL:', fileUrl);
  const res = await LinkedInService.publishPost('demo-org-123', 'Testing native image post ' + Date.now(), fileUrl);
  console.log('Final Publish Result:', res);
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
