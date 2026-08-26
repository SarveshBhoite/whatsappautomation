import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function updateJDSKnowledgeBase() {
  console.log("Updating JDS Knowledge Base for Outreach Conversational Strategy...");

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
    console.error("Organization not found!");
    return;
  }

  const orgId = org.id;
  console.log(`Target Organization: "${org.name}" (${orgId})`);

  const jdsItems = [
    {
      category: "OUTREACH_RESPONSE",
      topic: "Response to Web Intro Outreach (universal_b2b_web_v2)",
      keywords: "yes send, send design preview, send preview, web intro, website design preview, design preview, feature plan, yes",
      content: `🎉 Thank you for your interest! Having a fast, modern website gives your business instant credibility and captures 5x more online leads.

To avoid wasting your valuable time and get you the exact design & feature blueprint tailored for your business:
Let's schedule a quick 10-minute online screen share call! We will show you live portfolio samples of websites we built in your industry and demonstrate how WhatsApp lead capture works.

👉 What day and preferred time work best for a quick 10-minute meeting?`,
      mediaUrl: "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
      mediaType: "image",
      mediaTitle: "Ecommerce_Web_Application_Screenshot.png"
    },
    {
      category: "OUTREACH_RESPONSE",
      topic: "Response to SEO Audit Outreach (universal_b2b_seo_intro)",
      keywords: "yes send, competitor keyword analysis, seo audit, rank higher, top 3 spots, google maps ranking, seo intro, yes",
      content: `📊 Excellent decision! Ranking in the top 3 spots on Google Maps brings steady, high-intent client calls every single week without paying for expensive ads.

We would love to walk you through a live competitor ranking audit and show real SEO proof from our existing client accounts!

Let's schedule a quick 10-minute strategy call on Google Meet or Zoom:
👉 What day (e.g. Tomorrow) and time suit you best for a quick call?`,
      mediaUrl: "https://ik.imagekit.io/automationjds/sample_seo_growth.png",
      mediaType: "image",
      mediaTitle: "Google_Search_Console_SEO_Ranking_Proof.png"
    },
    {
      category: "OUTREACH_RESPONSE",
      topic: "Response to CRM Automation Outreach (universal_b2b_crm_intro)",
      keywords: "yes send, 1-minute visual walkthrough, crm walkthrough, whatsapp crm demo, automated customer follow-ups, crm intro, yes",
      content: `🤖 Great! Our WhatsApp CRM & Automation transforms customer inquiries by auto-replying in under 5 seconds and managing multi-agent chats in one inbox so you never lose a lead.

To see it in action live:
Let's schedule a quick 5 to 10-minute live screen share demo at your convenience!

👉 Please let us know your preferred day and time for the demo call!`,
      mediaUrl: "https://ik.imagekit.io/automationjds/jisnu_services_brochure.pdf",
      mediaType: "document",
      mediaTitle: "Jisnu_Digital_Solutions_Official_Brochure.pdf"
    },
    {
      category: "OUTREACH_RESPONSE",
      topic: "Response to Not Interested / Opt Out",
      keywords: "not interested, no, stop, don't message, opt out, unsubscribe, remove me",
      content: `Understood! Thank you for letting us know. We have updated your status and will not send further outreach messages. Have a great day ahead! 🙏`,
      mediaUrl: null,
      mediaType: null,
      mediaTitle: null
    }
  ];

  for (const item of jdsItems) {
    const existing = await prisma.aiKnowledgeItem.findFirst({
      where: {
        organizationId: orgId,
        topic: item.topic
      }
    });

    if (existing) {
      await prisma.aiKnowledgeItem.update({
        where: { id: existing.id },
        data: {
          category: item.category,
          keywords: item.keywords,
          content: item.content,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          mediaTitle: item.mediaTitle,
          isActive: true
        }
      });
      console.log(`✓ Updated Knowledge Item & Proof Attachments: "${item.topic}"`);
    } else {
      await prisma.aiKnowledgeItem.create({
        data: {
          organizationId: orgId,
          category: item.category,
          topic: item.topic,
          keywords: item.keywords,
          content: item.content,
          mediaUrl: item.mediaUrl,
          mediaType: item.mediaType,
          mediaTitle: item.mediaTitle,
          isActive: true
        }
      });
      console.log(`✓ Created Knowledge Item & Proof Attachments: "${item.topic}"`);
    }
  }

  console.log("✅ JDS Conversational Outreach & Proof Attachments Knowledge Base Updated Successfully!");
}

updateJDSKnowledgeBase()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error(err);
    prisma.$disconnect();
  });
