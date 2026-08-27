import prisma from "./utils/prisma";

async function seedJDSKnowledge() {
  console.log("Seeding AI Knowledge Base for JDS (info.jdsolutions2018@gmail.com)...");

  try {
    // 1. Find User & Organization by email
    const user = await prisma.user.findFirst({
      where: { email: { contains: "info.jdsolutions2018@gmail.com", mode: "insensitive" } },
      include: { organization: true }
    });

    let orgId = user?.organizationId;
    let orgName = user?.organization?.name || "Jisnu Digital Solutions";

    if (!orgId) {
      // Look for organization named JDS or Jisnu
      const org = await prisma.organization.findFirst({
        where: {
          OR: [
            { name: { contains: "JDS", mode: "insensitive" } },
            { name: { contains: "Jisnu", mode: "insensitive" } },
            { id: "a4bc139a-b6b8-4f6d-b50a-4057a2a902df" }
          ]
        }
      });
      if (org) {
        orgId = org.id;
        orgName = org.name;
      }
    }

    if (!orgId) {
      console.error("Could not find target organization!");
      return;
    }

    console.log(`Target Organization: "${orgName}" (${orgId})`);

    const jdsPrompt = `You are the official AI Growth & Career Assistant for Jisnu Digital Solutions (JDS).
Your tone is professional, welcoming, energetic, and highly knowledgeable.

### JDS SPECIFIC RULES:
1. **CAREER & JOB APPLICANTS**:
   - If the candidate mentions applying for a job, internship, interviewing, or shares their resume (or mentions job roles like "Digital Marketing", "Meta Ads", "Google Ads", "Web Dev", "Python"), treat them strictly as a JOB APPLICANT.
   - STAY STICKY in the job applicant flow. Confirm warmly in their language: "Aapki application aur resume mil gayi hai, thank you! Humari HR team aapki application review karegi aur aapko jaldi update degi."

2. **META ADS SPECIAL OFFERS & PROMOTIONS**:
   - If the customer mentions an ad or discount offer, welcome them enthusiastically to JDS Meta Ads promotion: "Welcome! You've unlocked our active Meta Ads Special Offer: 50% OFF on all Website & Mobile App Development packages (starting at ₹5,999/-) and 30% OFF on Digital Marketing & SEO! What project can we help you build today?"

3. **OUTBOUND META TEMPLATES & CAMPAIGN CONTINUITY**:
   - When a lead responds to our outbound templates (such as universal_b2b_web_intro offering a 2-page website preview / brochure) with "Yes send", "Sure", "Okay", or "Send it", immediately send our PDF brochure/rate card asset and introduce it warmly with core benefits: "A fast, modern website gives your business 24/7 credibility, ranks on Google, and converts visitors directly into qualified WhatsApp leads!"
   - If a lead asks "Why are you messaging me?" or "Who is this?" right after an outreach template, explain naturally: "We reached out from Jisnu Digital Solutions because we noticed your Google Profile and built a custom digital growth plan to help you capture more local clients online!"

4. **CLIENT SERVICES & BUSINESS BENEFITS**:
   - Communicate clear high-value benefits when explaining services:
     • **Web Development**: Ultra-fast Next.js websites that turn visitors directly into WhatsApp inquiries.
     • **Meta & Google Ads**: Targeted high-ROI campaigns generating guaranteed verified customer leads.
     • **WhatsApp CRM & Automation**: Anti-ban official Cloud API, multi-agent shared inbox, auto-replies in <5s.
     • **Local SEO & GMB**: Top 3 Google Maps ranking & automated 5-star review collection.
   - Always close by offering a quick free 10-minute strategy call to audit their business and show live portfolio samples!`;

    // 2. Setup AI Agent Configuration
    const existingAiConfig = await (prisma as any).aiAgentConfig.findFirst({
      where: { organizationId: orgId }
    });
    let aiConfig;
    if (existingAiConfig) {
      aiConfig = await (prisma as any).aiAgentConfig.update({
        where: { id: existingAiConfig.id },
        data: {
          isActive: true,
          whatsappAiEnabled: true,
          instagramAiEnabled: true,
          agentName: "Jisnu AI Assistant",
          personalityPrompt: jdsPrompt,
          greetingMessage: `👋 Hello! Welcome to Jisnu Digital Solutions (JDS).\n\nHow can we help scale your business today? Please ask about our services, pricing, or request a free consultation!`,
          activeMode: "HYBRID",
          autoSendMedia: true,
        }
      });
    } else {
      aiConfig = await (prisma as any).aiAgentConfig.create({
        data: {
          organizationId: orgId,
          isActive: true,
          whatsappAiEnabled: true,
          instagramAiEnabled: true,
          agentName: "Jisnu AI Assistant",
          personalityPrompt: jdsPrompt,
          greetingMessage: `👋 Hello! Welcome to Jisnu Digital Solutions (JDS).\n\nHow can we help scale your business today? Please ask about our services, pricing, or request a free consultation!`,
          activeMode: "HYBRID",
          autoSendMedia: true,
        }
      });
    }

    console.log(`✓ AI Agent Config verified (Mode: ${aiConfig.activeMode})`);

    // 3. Define Knowledge Base Items
    const knowledgeItems = [
      {
        category: "SERVICES",
        topic: "Overview of Core Services",
        keywords: "services, what do you do, offerings, marketing, digital marketing, features, help",
        content: `🚀 *Jisnu Digital Solutions (JDS) Core Offerings:*

1. 📱 *WhatsApp & Instagram CRM Automation*:
   - Multi-agent shared inbox
   - AI Chatbot & interactive workflows
   - Official Meta Cloud API verified green tick support
   - Bulk broadcast campaigns & auto-replies

2. 📈 *Performance Marketing & Paid Ads*:
   - Meta Ads (Facebook & Instagram High-ROI Lead Gen)
   - Google Ads (Search, Performance Max, YouTube Ads)
   - Retargeting and Lookalike Audience scaling

3. 🌐 *Web Development & SEO*:
   - Custom high-converting landing pages & web apps
   - Google Business Profile (GMB) 5-star review automation & Local SEO

4. 🤖 *Custom AI Agents*:
   - 24/7 intelligent customer support & automatic lead qualification.`,
      },
      {
        category: "PRICING",
        topic: "Pricing & Packages",
        keywords: "pricing, cost, price, plans, packages, how much, rate, charges, fee",
        content: `💰 *Jisnu Digital Solutions Pricing Overview:*

• *WhatsApp CRM & Automation Plan*: Custom agency tiers starting with full multi-tenant access, unlimited agent seats, and broadcast tools.
• *Paid Ads Management (Meta / Google)*: Flexible monthly management retainers based on ad spend and growth targets.
• *Complete Digital Growth Suite*: Bundled plans combining CRM, Ads management, and AI Chatbot assistants for maximum ROI.

👉 *Would you like us to prepare a customized proposal for your business? Please share your website and business goals!*`,
      },
      {
        category: "CONTACT",
        topic: "Contact Details & Support",
        keywords: "contact, email, phone, location, address, support, call, talk to human, sales, meet",
        content: `📞 *Contact Jisnu Digital Solutions (JDS):*

• 📧 *Email*: info.jdsolutions2018@gmail.com / support@jisnudigital.com
• 🌐 *Website*: https://jisnudigital.com
• 💬 *WhatsApp Support*: Available 24/7 right here on this chat!
• 🕒 *Working Hours*: Monday to Saturday, 9:30 AM – 7:00 PM IST

If you would like an expert from our team to give you a callback, please reply with your *Phone Number* and preferred time!`,
      },
      {
        category: "FAQ",
        topic: "How WhatsApp Cloud API Works",
        keywords: "official api, meta api, green tick, ban risk, whatsapp cloud api, verification",
        content: `✅ *Why Official WhatsApp Cloud API is Superior:*

• 🔒 *100% Anti-Ban Guarantee*: Zero risk of number ban because it uses Meta's official Graph Cloud API.
• ⚡ *High-Speed Bulk Broadcasts*: Send approved templates to thousands of opted-in customers in seconds.
• 👥 *Multi-Agent Support*: Your entire sales and support team can chat from one single business number.
• 🟢 *Official Green Tick Verification*: Build instant brand trust and authority.`,
      },
      {
        category: "BOOKING",
        topic: "Book a Free Consultation Demo",
        keywords: "book, demo, consultation, meeting, appointment, schedule, call",
        content: `📅 *Book Your Free Growth Strategy Session:*

We offer a complimentary 30-minute consultation to audit your current marketing, show you a live CRM demo, and plan your automation roadmap.

To reserve your slot:
1. Reply with your *Name* and *Company Name*.
2. Share your preferred day (e.g. Tomorrow at 3 PM).
Our team will confirm your meeting link immediately!`,
      }
    ];

    // 4. Upsert Knowledge Items into database
    console.log(`Seeding ${knowledgeItems.length} Knowledge Base items for ${orgName}...`);
    for (const item of knowledgeItems) {
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
            isActive: true,
          }
        });
        console.log(`✓ Updated Knowledge Item: "${item.topic}"`);
      } else {
        await prisma.aiKnowledgeItem.create({
          data: {
            organizationId: orgId,
            category: item.category,
            topic: item.topic,
            keywords: item.keywords,
            content: item.content,
            isActive: true,
          }
        });
        console.log(`✓ Created Knowledge Item: "${item.topic}"`);
      }
    }

    console.log("\n=======================================================");
    console.log("SUCCESS: JDS Knowledge Base & AI Agent are 100% Live!");
    console.log("=======================================================\n");

  } catch (error) {
    console.error("Error seeding JDS Knowledge:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedJDSKnowledge();
