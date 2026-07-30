import prisma from "../utils/prisma";

async function seedCompanyAiAgentData() {
  console.log("🚀 Initializing Jisnu Digital Solutions AI Agent Training Engine...");

  const organizationId = "demo-org-123";

  // 1. Configure AI Agent Persona & Set Mode to AI_AGENT
  const config = await prisma.aiAgentConfig.upsert({
    where: { organizationId },
    update: {
      agentName: "Jisnu AI Growth Consultant",
      personalityPrompt: "You are a warm, highly knowledgeable, human-like growth consultant for Jisnu Digital Solutions PVT LTD. Speak in a friendly, helpful, conversational tone. Answer questions based on trained company data. Attach relevant portfolio screenshots or PDFs when asked to show previous work or rate cards, and politely collect contact details if the user wants an outbound callback or custom quote.",
      greetingMessage: "👋 Hello! Welcome to Jisnu Digital Solutions. How can I help you grow your business today?",
      activeMode: "AI_AGENT",
      isActive: true,
      autoSendMedia: true,
    },
    create: {
      organizationId,
      agentName: "Jisnu AI Growth Consultant",
      personalityPrompt: "You are a warm, highly knowledgeable, human-like growth consultant for Jisnu Digital Solutions PVT LTD. Speak in a friendly, helpful, conversational tone. Answer questions based on trained company data. Attach relevant portfolio screenshots or PDFs when asked to show previous work or rate cards, and politely collect contact details if the user wants an outbound callback or custom quote.",
      greetingMessage: "👋 Hello! Welcome to Jisnu Digital Solutions. How can I help you grow your business today?",
      activeMode: "AI_AGENT",
      isActive: true,
      autoSendMedia: true,
    },
  });

  console.log(`✅ Configured AI Agent: "${config.agentName}" (Active Mode: ${config.activeMode})`);

  // 2. Training Data Topics
  const knowledgeItems = [
    {
      category: "SERVICES",
      topic: "Website & Mobile App Development Services",
      keywords: "website, web development, app development, nextjs, react, ecommerce, portal, mobile app, software",
      content: `Jisnu Digital Solutions PVT LTD specializes in high-performance web & mobile application development.

Key Offerings:
1. Business & Corporate Websites: Next.js, React, and Tailwind CSS for lightning speed and technical SEO readiness.
2. E-Commerce Online Stores: Custom payment gateway integration, product catalogs, order tracking, and WhatsApp CRM integration.
3. Custom Portals & Web Apps: Client dashboards, booking management systems, and automated CRMs.
4. Mobile Applications: Cross-platform iOS and Android apps using React Native.

All websites include SSL security, mobile responsive layout, fast load speed under 1.5 seconds, and integrated WhatsApp chat widgets.`,
      mediaUrl: "https://ik.imagekit.io/automationjds/sample_web_portfolio.png",
      mediaType: "image",
      mediaTitle: "Ecommerce_Web_Application_Screenshot.png",
    },
    {
      category: "SERVICES",
      topic: "Digital Marketing & SEO Optimization",
      keywords: "seo, search engine optimization, digital marketing, google ads, meta ads, facebook ads, instagram ads, ranking, traffic",
      content: `Jisnu Digital Solutions delivers data-driven digital marketing and SEO services designed to maximize client ROI.

Marketing Services:
1. Technical & On-Page SEO: Keyword strategy, site architecture, Google PageSpeed optimization, and rank tracking to achieve top 3 Google SERP positions.
2. Google Search & Shopping Ads: High-conversion PPC campaigns managed by certified Google Ads specialists.
3. Meta Ads (Facebook & Instagram): Visual lead generation & retargeting ad funnels.
4. Google Business Profile (GMB) Optimization: Local SEO booster and automated Google review manager.

Proven Growth Track Record: Average 340% organic traffic growth within 90 days for client accounts.`,
      mediaUrl: "https://ik.imagekit.io/automationjds/sample_seo_growth.png",
      mediaType: "image",
      mediaTitle: "Google_Search_Console_SEO_Ranking_Proof.png",
    },
    {
      category: "PRICING",
      topic: "Official Company Service Rate Card & Package Deck",
      keywords: "pricing, price, rate card, cost, packages, quote, fee, deck, brochure, pdf",
      content: `Jisnu Digital Solutions Pricing & Investment Packages:

Website Packages:
• Starter Business Site: ₹15,000 - ₹25,000 (5 Page Responsive Site + Contact Forms)
• Growth Custom Web App: ₹35,000 - ₹65,000 (Custom Next.js Web App + WhatsApp CRM)
• Enterprise E-Commerce: ₹75,000+ (Full Online Store + Payment Gateways)

Digital Marketing Packages:
• Local SEO & Brand Booster: ₹12,000 / month
• Growth Multi-Channel Ads & SEO: ₹25,000 / month
• Enterprise Omni-Channel Growth: ₹50,000+ / month

We also provide customized milestone payments (e.g. 40% advance, 40% beta, 20% final launch).`,
      mediaUrl: "https://ik.imagekit.io/automationjds/jisnu_services_brochure.pdf",
      mediaType: "document",
      mediaTitle: "Jisnu_Digital_Solutions_Official_Brochure.pdf",
    },
    {
      category: "JOBS",
      topic: "Careers, Jobs & Internship Inquiries",
      keywords: "job, career, hiring, interview, vacancy, internship, developer, marketer, hr, resume, cv",
      content: `Career & Job Opportunities at Jisnu Digital Solutions PVT LTD:

We are actively hiring passionate talent for the following roles:
1. Full-Stack Web Developers (React, Next.js, Node.js, TypeScript)
2. Performance Digital Marketers & PPC Specialists (Google Ads, Meta Ads)
3. Graphic Designers & UI/UX Designers
4. Business Development & Sales Executives

How to Apply:
Interested candidates should send their updated Resume/CV and Portfolio link to careers@jisnudigital.com or contact HR at +91 9136870930. Our hiring team reviews applications within 48 hours.`,
      mediaUrl: null,
      mediaType: null,
      mediaTitle: null,
    },
    {
      category: "FAQ",
      topic: "Company Contact Information & Office Location",
      keywords: "contact, address, office, location, phone, email, website, wakad, pune, map",
      content: `Jisnu Digital Solutions PVT LTD Contact Details:

📍 Office Address: Wakad, Pune, Maharashtra 411057
📞 Phone / WhatsApp: +91 9136870930 / 02047246321
✉️ General Email: info@jisnudigital.com / contact@jisnudigital.com
🌐 Official Website: https://jisnudigital.com

Working Hours: Monday to Saturday (9:30 AM to 6:30 PM IST).`,
      mediaUrl: null,
      mediaType: null,
      mediaTitle: null,
    },
  ];

  // 3. Clear existing items and insert fresh training items
  await prisma.aiKnowledgeItem.deleteMany({
    where: { organizationId },
  });

  for (const item of knowledgeItems) {
    await prisma.aiKnowledgeItem.create({
      data: {
        organizationId,
        category: item.category,
        topic: item.topic,
        keywords: item.keywords,
        content: item.content,
        mediaUrl: item.mediaUrl,
        mediaType: item.mediaType,
        mediaTitle: item.mediaTitle,
        isActive: true,
      },
    });
  }

  console.log(`✅ Successfully trained AI Agent with ${knowledgeItems.length} company knowledge items for Jisnu Digital Solutions!`);
}

seedCompanyAiAgentData().catch((err) => {
  console.error("❌ Error seeding company data:", err);
  process.exit(1);
});
