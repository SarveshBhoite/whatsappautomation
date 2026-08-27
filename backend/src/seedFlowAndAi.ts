import prisma from "./utils/prisma";

async function setupFlowAndAi() {
  console.log("Setting up Flow & AI Agent for connected organization...");

  try {
    const configs = await prisma.whatsAppConfig.findMany({
      include: { organization: true }
    });

    console.log(`Found ${configs.length} WhatsApp configurations:`);
    for (const c of configs) {
      if (!c.phoneNumberId) {
        console.log(`- Skipping empty config for Org: ${c.organization.name}`);
        continue;
      }

      console.log(`- Configuring Org: "${c.organization.name}" (${c.organizationId}), Phone ID: ${c.phoneNumberId}`);

      // 1. Create or activate AI Agent Config
      const aiConfig = await (prisma as any).aiAgentConfig.upsert({
        where: { 
          organizationId_whatsappConfigId: {
            organizationId: c.organizationId,
            whatsappConfigId: c.id
          }
        },
        update: {
          whatsappConfigId: c.id,
          isActive: true,
          whatsappAiEnabled: true,
          agentName: "Jisnu AI Assistant",
          personalityPrompt: `You are a helpful, professional, and friendly WhatsApp AI Assistant for ${c.organization.name}. 
Your goal is to answer customer questions about digital marketing, CRM automation, lead generation, and business solutions.
Be concise, friendly, helpful, and use emojis where appropriate.
If the customer asks to speak to a person, let them know our support team has been notified.`,
          greetingMessage: `👋 Hello! Welcome to ${c.organization.name}.\n\nHow can we help you today? Please feel free to ask any question!`,
          activeMode: "HYBRID",
        },
        create: {
          organizationId: c.organizationId,
          isActive: true,
          whatsappAiEnabled: true,
          agentName: "Jisnu AI Assistant",
          personalityPrompt: `You are a helpful, professional, and friendly WhatsApp AI Assistant for ${c.organization.name}. 
Your goal is to answer customer questions about digital marketing, CRM automation, lead generation, and business solutions.
Be concise, friendly, helpful, and use emojis where appropriate.
If the customer asks to speak to a person, let them know our support team has been notified.`,
          greetingMessage: `👋 Hello! Welcome to ${c.organization.name}.\n\nHow can we help you today? Please feel free to ask any question!`,
          activeMode: "HYBRID",
        },
      });
      console.log(`✓ AI Agent activated for ${c.organization.name} (Mode: ${aiConfig.activeMode})`);

      // 2. Create or activate a Welcome Flow
      const welcomeGraph = {
        nodes: [
          {
            id: "start_1",
            type: "startNode",
            position: { x: 100, y: 100 },
            data: { label: "Welcome Trigger" }
          },
          {
            id: "welcome_msg",
            type: "messageNode",
            position: { x: 350, y: 100 },
            data: {
              label: "Welcome Message",
              text: `👋 Hello! Welcome to ${c.organization.name}.\n\nHow can we help you today? Please feel free to ask any question or tell us what services you are looking for!`
            }
          }
        ],
        edges: [
          {
            id: "e1",
            source: "start_1",
            target: "welcome_msg"
          }
        ]
      };

      const existingFlow = await prisma.flow.findFirst({
        where: {
          organizationId: c.organizationId,
          platform: "whatsapp",
          isActive: true,
        }
      });

      if (!existingFlow) {
        await prisma.flow.create({
          data: {
            organizationId: c.organizationId,
            name: "WhatsApp AI Assistant & Welcome",
            platform: "whatsapp",
            isActive: true,
            graphJson: welcomeGraph,
          }
        });
        console.log(`✓ Default Welcome Flow created for ${c.organization.name}`);
      } else {
        console.log(`✓ Active Flow already exists for ${c.organization.name}: ${existingFlow.name}`);
      }
    }

    console.log("\n=======================================================");
    console.log("SUCCESS: AI Agent & Flow Automations are now LIVE!");
    console.log("=======================================================\n");
  } catch (error) {
    console.error("Error configuring Flow and AI Agent:", error);
  } finally {
    await prisma.$disconnect();
  }
}

setupFlowAndAi();
