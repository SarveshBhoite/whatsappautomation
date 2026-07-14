import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function showIgConfig() {
  console.log("Checking Instagram configuration in DB...");
  const config = await prisma.instagramConfig.findFirst({
    where: {
      organizationId: "demo-org-123"
    }
  });

  if (!config) {
    console.log("No Instagram configuration found in the database.");
  } else {
    console.log("Instagram Config in Database:");
    console.log(`- Page ID: ${config.pageId}`);
    console.log(`- Instagram Account ID: ${config.instagramAccountId}`);
    console.log(`- Page Access Token (Prefix): ${config.pageAccessToken?.substring(0, 30)}...`);
    console.log(`- Verify Token: ${config.webhookVerifyToken}`);
  }

  await prisma.$disconnect();
}

showIgConfig();
