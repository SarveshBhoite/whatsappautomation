import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create Organization
  const org = await prisma.organization.upsert({
    where: { id: "demo-org-123" },
    update: {},
    create: {
      id: "demo-org-123",
      name: "Default Agency",
    },
  });
  console.log(`Created Organization: ${org.name} (${org.id})`);

  // 2. Create User
  const user = await prisma.user.upsert({
    where: { email: "admin@default.com" },
    update: {},
    create: {
      id: "demo-user-123",
      email: "admin@default.com",
      name: "Admin User",
      passwordHash: "pbkdf2_sha256$passwordhash123", // placeholder hash
      role: "admin",
      organizationId: org.id,
    },
  });
  console.log(`Created User: ${user.name} (${user.email})`);

  // 3. Create WhatsApp Config
  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || "my_secure_verify_token_123";
  const config = await prisma.whatsAppConfig.upsert({
    where: { organizationId: org.id },
    update: {},
    create: {
      organizationId: org.id,
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "100000000000000", // placeholder
      wabaId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "100000000000000", // placeholder
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "EAAG...", // placeholder
      webhookVerifyToken: verifyToken,
    },
  });
  console.log(`Created WhatsAppConfig for Organization.`);

  // 4. Create Default Chatbot Flow
  const flowGraph = {
    nodes: [
      {
        id: "welcome_1",
        type: "welcomeNode",
        position: { x: 250, y: 50 },
        data: { text: "Hello! Welcome to our automated WhatsApp system." }
      },
      {
        id: "buttons_1",
        type: "buttonsNode",
        position: { x: 250, y: 180 },
        data: {
          text: "How can we help you today? Please choose an option below:",
          buttons: [
            { id: "btn_pricing", title: "View Pricing" },
            { id: "btn_support", title: "Support Menu" }
          ]
        }
      },
      {
        id: "pricing_reply",
        type: "textNode",
        position: { x: 100, y: 350 },
        data: { text: "Our subscriptions start at $49/mo for the starter plan and $99/mo for professional. We will notify a rep to reach out to you." }
      },
      {
        id: "support_menu",
        type: "listNode",
        position: { x: 450, y: 350 },
        data: {
          text: "Here is our support menu. Click below to view options:",
          listButtonText: "Select Issue",
          listSections: [
            {
              title: "General Issues",
              rows: [
                { id: "row_billing", title: "Billing Inquiry", description: "Questions about invoices and charges" },
                { id: "row_technical", title: "Technical Support", description: "Report bugs or platform failures" }
              ]
            }
          ]
        }
      },
      {
        id: "billing_reply",
        type: "textNode",
        position: { x: 350, y: 550 },
        data: { text: "For billing questions, please visit our portal at portal.domain.com or email billing@domain.com." }
      },
      {
        id: "technical_reply",
        type: "textNode",
        position: { x: 600, y: 550 },
        data: { text: "Please describe your technical issue in detail. Our team has been alerted and will assist you." }
      }
    ],
    edges: [
      { id: "e1-2", source: "welcome_1", target: "buttons_1" },
      { id: "e2-3", source: "buttons_1", sourceHandle: "btn_pricing", target: "pricing_reply" },
      { id: "e2-4", source: "buttons_1", sourceHandle: "btn_support", target: "support_menu" },
      { id: "e4-5", source: "support_menu", sourceHandle: "row_billing", target: "billing_reply" },
      { id: "e4-6", source: "support_menu", sourceHandle: "row_technical", target: "technical_reply" }
    ]
  };

  const flow = await prisma.flow.upsert({
    where: { id: "default-flow-123" },
    update: {
      graphJson: flowGraph as any,
    },
    create: {
      id: "default-flow-123",
      name: "Default Automated Help Menu",
      description: "Default tree flow to onboard leads and route support requests.",
      graphJson: flowGraph as any,
      isActive: true,
      organizationId: org.id,
    },
  });
  console.log(`Created and Activated Default Chatbot Flow: "${flow.name}"`);

  console.log("Seeding complete successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
