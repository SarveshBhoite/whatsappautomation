"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
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
            graphJson: flowGraph,
        },
        create: {
            id: "default-flow-123",
            name: "Default Automated Help Menu",
            description: "Default tree flow to onboard leads and route support requests.",
            graphJson: flowGraph,
            isActive: true,
            organizationId: org.id,
        },
    });
    console.log(`Created and Activated Default Chatbot Flow: "${flow.name}"`);
    // =============================================================
    // 5. Seed Mock Conversations and Messages for CRM Demo
    // =============================================================
    console.log("Seeding mock conversations and messages...");
    // Conversation 1: Active Bot Flow (Rahul Sharma)
    const conv1 = await prisma.conversation.upsert({
        where: { organizationId_customerPhone: { organizationId: org.id, customerPhone: "+919876543210" } },
        update: {},
        create: {
            organizationId: org.id,
            customerPhone: "+919876543210",
            customerName: "Rahul Sharma",
            isBotPaused: false,
            currentNodeId: "buttons_1",
        },
    });
    await prisma.message.deleteMany({ where: { conversationId: conv1.id } });
    await prisma.message.createMany({
        data: [
            {
                conversationId: conv1.id,
                direction: "inbound",
                messageType: "text",
                content: "Hello there!",
                status: "read",
                createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 mins ago
            },
            {
                conversationId: conv1.id,
                direction: "outbound",
                messageType: "text",
                content: "Hello! Welcome to our automated WhatsApp system.",
                status: "read",
                senderName: "Bot",
                createdAt: new Date(Date.now() - 9.5 * 60 * 1000),
            },
            {
                conversationId: conv1.id,
                direction: "outbound",
                messageType: "buttonsNode",
                content: "How can we help you today? Please choose an option below:|buttons:View Pricing, Support Menu",
                status: "delivered",
                senderName: "Bot",
                createdAt: new Date(Date.now() - 9 * 60 * 1000),
            },
        ],
    });
    // Conversation 2: Manual Control Paused Bot (Priya Patel)
    const conv2 = await prisma.conversation.upsert({
        where: { organizationId_customerPhone: { organizationId: org.id, customerPhone: "+918765432109" } },
        update: {},
        create: {
            organizationId: org.id,
            customerPhone: "+918765432109",
            customerName: "Priya Patel",
            isBotPaused: true,
            botPausedUntil: new Date(Date.now() + 23 * 60 * 60 * 1000), // paused for next 23 hours
            currentNodeId: "pricing_reply",
        },
    });
    await prisma.message.deleteMany({ where: { conversationId: conv2.id } });
    await prisma.message.createMany({
        data: [
            {
                conversationId: conv2.id,
                direction: "inbound",
                messageType: "text",
                content: "Hi, I have a query about the custom app development packages.",
                status: "read",
                createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
            },
            {
                conversationId: conv2.id,
                direction: "outbound",
                messageType: "text",
                content: "Hello! Welcome to our automated WhatsApp system.",
                status: "read",
                senderName: "Bot",
                createdAt: new Date(Date.now() - 59 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "outbound",
                messageType: "text",
                content: "How can we help you today? Please choose an option below:\n- View Pricing\n- Support Menu",
                status: "read",
                senderName: "Bot",
                createdAt: new Date(Date.now() - 58 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "inbound",
                messageType: "interactive",
                content: "View Pricing",
                status: "read",
                createdAt: new Date(Date.now() - 57 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "outbound",
                messageType: "text",
                content: "Our subscriptions start at $49/mo for the starter plan and $99/mo for professional. We will notify a rep to reach out to you.",
                status: "read",
                senderName: "Bot",
                createdAt: new Date(Date.now() - 56 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "inbound",
                messageType: "text",
                content: "Can you build a custom dashboard for real estate listing?",
                status: "read",
                createdAt: new Date(Date.now() - 50 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "outbound",
                messageType: "text",
                content: "Yes, Priya! We specialize in custom real estate dashboards. I have paused our chatbot helper so I can chat with you directly. Here is a PDF brochure of our portfolio.",
                status: "read",
                senderName: "Agent",
                createdAt: new Date(Date.now() - 48 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "outbound",
                messageType: "document",
                content: "Jisnu_Portfolio.pdf|https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
                status: "read",
                senderName: "Agent",
                createdAt: new Date(Date.now() - 47 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "inbound",
                messageType: "text",
                content: "That looks great, thank you. Let's schedule a call tomorrow.",
                status: "read",
                createdAt: new Date(Date.now() - 40 * 60 * 1000),
            },
            {
                conversationId: conv2.id,
                direction: "outbound",
                messageType: "text",
                content: "Awesome! Does tomorrow at 11 AM work for you? I will send a Google Meet invite.",
                status: "delivered", // double ticks
                senderName: "Agent",
                createdAt: new Date(Date.now() - 38 * 60 * 1000),
            },
        ],
    });
    // Conversation 3: SEO Lead (John Smith)
    const conv3 = await prisma.conversation.upsert({
        where: { organizationId_customerPhone: { organizationId: org.id, customerPhone: "+15550199" } },
        update: {},
        create: {
            organizationId: org.id,
            customerPhone: "+15550199",
            customerName: "John Smith",
            isBotPaused: true,
            botPausedUntil: new Date(Date.now() + 12 * 60 * 60 * 1000),
        },
    });
    await prisma.message.deleteMany({ where: { conversationId: conv3.id } });
    await prisma.message.createMany({
        data: [
            {
                conversationId: conv3.id,
                direction: "inbound",
                messageType: "text",
                content: "Hey, interested in your digital marketing SEO campaigns for my store.",
                status: "read",
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
            },
            {
                conversationId: conv3.id,
                direction: "outbound",
                messageType: "text",
                content: "Hello John! I've paused our automation bot. Our SEO packages start from $499/mo. Here is a screenshot of our case study results.",
                status: "read",
                senderName: "Agent",
                createdAt: new Date(Date.now() - 2.8 * 60 * 60 * 1000),
            },
            {
                conversationId: conv3.id,
                direction: "outbound",
                messageType: "image",
                content: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
                status: "read",
                senderName: "Agent",
                createdAt: new Date(Date.now() - 2.7 * 60 * 60 * 1000),
            },
        ],
    });
    // Link a quoted message in Priya Patel's conversation to demonstrate UI
    const parentMsg = await prisma.message.findFirst({
        where: { conversationId: conv2.id, content: "Can you build a custom dashboard for real estate listing?" }
    });
    const childMsg = await prisma.message.findFirst({
        where: { conversationId: conv2.id, content: { startsWith: "Yes, Priya! We specialize" } }
    });
    if (parentMsg && childMsg) {
        await prisma.message.update({
            where: { id: childMsg.id },
            data: { quotedMessageId: parentMsg.id }
        });
        console.log("Linked mock quoted message relation in Priya Patel's conversation.");
    }
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
