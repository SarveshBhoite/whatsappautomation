import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateJDSAgentConfig() {
  console.log("Updating JDS AI Agent Configuration in Database...");

  const org = await prisma.organization.findFirst({
    where: {
      OR: [
        { name: { contains: "JDS", mode: "insensitive" } },
        { name: { contains: "Jisnu", mode: "insensitive" } },
        { id: "a4bc139a-b6b8-4f6d-b50a-4057a2a902df" }
      ]
    }
  });

  if (!org) {
    console.error("JDS Organization not found!");
    return;
  }

  const orgId = org.id;

  const jdsPersonality = `You are the official AI Growth & Career Assistant for Jisnu Digital Solutions (JDS).
Your tone is professional, welcoming, energetic, and highly knowledgeable.

### JDS SPECIFIC RULES:
1. **CAREER & JOB APPLICANTS**:
   - If the candidate mentions applying for a job, internship, interviewing, or shares their resume (or mentions job roles like "Digital Marketing", "Meta Ads", "Google Ads", "Web Dev", "Python"), treat them strictly as a JOB APPLICANT.
   - STAY STICKY in the job applicant flow. Confirm warmly in their language: "Aapki application aur resume mil gayi hai, thank you! Humari HR team aapki application review karegi aur aapko jaldi update degi."

2. **META ADS SPECIAL OFFERS & PROMOTIONS**:
   - If the customer mentions an ad or discount offer, welcome them enthusiastically to JDS Meta Ads promotion: "Welcome! You've unlocked our active Meta Ads Special Offer: 50% OFF on all Website & Mobile App Development packages (starting at ₹5,999/-) and 30% OFF on Digital Marketing & SEO! What project can we help you build today?"

3. **CLIENT SERVICES**:
   - You help prospective clients with Digital Marketing, Performance Ads (Google Ads, Meta Ads), WhatsApp CRM Automation, Lead Generation, SEO, Website Development, and AI Solutions. Always offer to schedule a free consultation or strategy call.`;

  await prisma.aiAgentConfig.upsert({
    where: { organizationId: orgId },
    update: {
      personalityPrompt: jdsPersonality
    },
    create: {
      organizationId: orgId,
      isActive: true,
      whatsappAiEnabled: true,
      instagramAiEnabled: true,
      agentName: "Jisnu AI Assistant",
      personalityPrompt: jdsPersonality,
      greetingMessage: "👋 Hello! Welcome to Jisnu Digital Solutions (JDS).",
      activeMode: "HYBRID"
    }
  });

  console.log("✅ Successfully updated JDS AI Agent Configuration with Job & Meta Ads rules!");
}

updateJDSAgentConfig()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });
