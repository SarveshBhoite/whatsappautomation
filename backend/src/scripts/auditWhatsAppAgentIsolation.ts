import prisma from "../utils/prisma";

async function runAudit() {
  console.log("===============================================================");
  console.log("🔍 RUNNING AUDIT OF ALL WHATSAPP CONFIGS, AGENTS & KNOWLEDGE");
  console.log("===============================================================\n");

  const waConfigs = await (prisma as any).whatsAppConfig.findMany({
    include: {
      organization: true,
      aiAgentConfigs: true,
      aiKnowledgeItems: true,
    }
  });

  console.log(`Found ${waConfigs.length} WhatsApp Config(s) in DB:\n`);

  for (const config of waConfigs) {
    console.log(`---------------------------------------------------------------`);
    console.log(`📱 WHATSAPP ACCOUNT: ${config.phoneNumber || config.accountName || "Unnamed"}`);
    console.log(`   ID: ${config.id}`);
    console.log(`   Org ID: ${config.organizationId} (${config.organization?.name})`);
    console.log(`   Phone Number ID: ${config.phoneNumberId}`);
    console.log(`   WABA ID: ${config.wabaId}`);
    console.log(`   Is Default: ${config.isDefault}`);
    console.log(`   Is Active: ${config.isActive}`);

    // Direct AiAgentConfig bound to this whatsappConfigId
    const boundAgents = await (prisma as any).aiAgentConfig.findMany({
      where: { whatsappConfigId: config.id }
    });
    console.log(`   🤖 Bound AiAgentConfigs (by whatsappConfigId): ${boundAgents.length}`);
    for (const a of boundAgents) {
      console.log(`      -> Agent ID: ${a.id} | Name: "${a.agentName}" | Mode: ${a.activeMode} | Active: ${a.isActive} | WA Enabled: ${a.whatsappAiEnabled}`);
    }

    // Direct Knowledge items bound to this whatsappConfigId
    const boundKnowledge = await (prisma as any).aiKnowledgeItem.findMany({
      where: { whatsappConfigId: config.id }
    });
    console.log(`   📚 Bound Knowledge Items (by whatsappConfigId): ${boundKnowledge.length}`);
    for (const k of boundKnowledge) {
      console.log(`      -> Topic: "${k.topic}" | Category: ${k.category}`);
    }
  }

  // Check for orphan or organization-only AiAgentConfigs (where whatsappConfigId is null or empty)
  console.log(`\n---------------------------------------------------------------`);
  console.log(`🔍 CHECKING FOR UNSCOPED / ORPHAN AI AGENT CONFIGS (NULL whatsappConfigId):`);
  const unscopedAgents = await (prisma as any).aiAgentConfig.findMany({
    where: {
      OR: [
        { whatsappConfigId: null },
        { whatsappConfigId: "" }
      ]
    }
  });
  console.log(`Found ${unscopedAgents.length} unscoped AiAgentConfig(s)`);
  for (const a of unscopedAgents) {
    console.log(`   -> Unscoped Agent ID: ${a.id} | Org: ${a.organizationId} | Name: "${a.agentName}" | Mode: ${a.activeMode} | WA Enabled: ${a.whatsappAiEnabled}`);
  }

  // Check for orphan / unscoped Knowledge Items
  console.log(`\n---------------------------------------------------------------`);
  console.log(`🔍 CHECKING FOR UNSCOPED / ORPHAN KNOWLEDGE ITEMS (NULL whatsappConfigId):`);
  const unscopedKnowledge = await (prisma as any).aiKnowledgeItem.findMany({
    where: {
      OR: [
        { whatsappConfigId: null },
        { whatsappConfigId: "" }
      ]
    }
  });
  console.log(`Found ${unscopedKnowledge.length} unscoped Knowledge Item(s)`);
  for (const k of unscopedKnowledge) {
    console.log(`   -> Unscoped Topic: "${k.topic}" | Org: ${k.organizationId}`);
  }

  console.log("\n===============================================================");
}

runAudit().catch(console.error).finally(() => process.exit(0));
