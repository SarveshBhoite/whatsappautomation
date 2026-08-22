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
    const brandName = "JISNU Digital Solutions PVT LTD";
    const flowGraph = {
        nodes: [
            {
                id: "welcome_root",
                type: "welcomeNode",
                position: { x: 600, y: 50 },
                data: { label: "Welcome Node", text: `👋 Welcome to ${brandName}.\n\nWe build high-performing websites and execute data-driven digital marketing campaigns to grow your business.\n\nPlease choose an option below to continue:` }
            },
            {
                id: "main_menu",
                type: "buttonsNode",
                position: { x: 600, y: 220 },
                data: {
                    label: "Main Menu",
                    text: "How can we help you today? Please choose an option below:",
                    buttons: [
                        { id: "btn_services", title: "🚀 Services" },
                        { id: "btn_jobs", title: "💼 Job Related Query" },
                        { id: "btn_contact", title: "📞 Contact Us" }
                    ]
                }
            },
            {
                id: "services_menu",
                type: "buttonsNode",
                position: { x: 150, y: 450 },
                data: {
                    label: "Services Menu",
                    text: "Explore our professional digital services:",
                    buttons: [
                        { id: "btn_web_dev", title: "Website Development" },
                        { id: "btn_digital_mkt", title: "Digital Marketing" },
                        { id: "btn_main_menu_serv", title: "Main Menu" }
                    ]
                }
            },
            {
                id: "web_dev_overview",
                type: "textNode",
                position: { x: -150, y: 650 },
                data: { label: "Website Development Overview", text: `🌐 ${brandName} Website Development Overview:\n\n• Business & Corporate Websites\n• E-Commerce Online Stores\n• Custom Web Applications & Portals\n• High-Performance, Mobile & SEO Ready` }
            },
            {
                id: "web_dev_features",
                type: "textNode",
                position: { x: -150, y: 820 },
                data: { label: "Website Features", text: `⚡ Key Website Features Included:\n\n• Custom Responsive UI/UX Design\n• Lightning Fast Performance & Speed\n• WhatsApp & Lead Management Integration\n• SSL Security & Easy Admin Dashboard` }
            },
            {
                id: "web_dev_pricing",
                type: "textNode",
                position: { x: -150, y: 990 },
                data: { label: "Website Pricing", text: `💰 Website Development Pricing Packages:\n\n• Starter Package: Essential Business Site\n• Growth Package: Custom Web App & CRM\n• Enterprise Package: Full E-Commerce Platform` }
            },
            {
                id: "web_dev_consult_btn",
                type: "buttonsNode",
                position: { x: -150, y: 1160 },
                data: {
                    label: "Book Website Consultation",
                    text: "Ready to start your website project with JISNU?",
                    buttons: [
                        { id: "btn_web_book", title: "Book Consultation" },
                        { id: "btn_web_menu", title: "Main Menu" }
                    ]
                }
            },
            {
                id: "mkt_overview",
                type: "buttonsNode",
                position: { x: 350, y: 650 },
                data: {
                    label: "Digital Marketing Services",
                    text: `📈 ${brandName} Digital Marketing Services:\n\nSelect a marketing service below to explore SEO proof of work, pricing & details:`,
                    buttons: [
                        { id: "btn_mkt_seo", title: "SEO Proof & Services" },
                        { id: "btn_mkt_ads", title: "Google & Meta Ads" },
                        { id: "btn_mkt_menu", title: "Main Menu" }
                    ]
                }
            },
            {
                id: "seo_proof_intro",
                type: "textNode",
                position: { x: 350, y: 820 },
                data: { label: "SEO Proof of Work Intro", text: `🏆 Real Client SEO Proof of Work & Rankings:\n\nHere are live Google Page 1 & Local Search rankings achieved for our clients by ${brandName}:` }
            },
            {
                id: "seo_result_media_1",
                type: "mediaNode",
                position: { x: 350, y: 990 },
                data: { label: "SEO Result - Data Engineering", mediaType: "image", mediaUrl: "https://ik.imagekit.io/automationjds/seo_result_1.jpg", caption: "📊 Proof 1: Google Page 1 Rank #1 for 'best data engineering course in pune'" }
            },
            {
                id: "seo_result_media_2",
                type: "mediaNode",
                position: { x: 350, y: 1160 },
                data: { label: "SEO Result - Occupational Therapy", mediaType: "image", mediaUrl: "https://ik.imagekit.io/automationjds/seo_result_2.jpg", caption: "📍 Proof 2: Google Local Map Pack Rank #1 for 'occupational therapy in wakad'" }
            },
            {
                id: "seo_result_media_3",
                type: "mediaNode",
                position: { x: 350, y: 1330 },
                data: { label: "SEO Result - Kids Therapy Clinic", mediaType: "image", mediaUrl: "https://ik.imagekit.io/automationjds/seo_result_3.jpg", caption: "⭐ Proof 3: Top Ranked Local Business for 'kids therapy clinic nearby wakad'" }
            },
            {
                id: "seo_action_btns",
                type: "buttonsNode",
                position: { x: 350, y: 1500 },
                data: {
                    label: "SEO Action Options",
                    text: "Would you like to boost your website ranking on Google Page 1?",
                    buttons: [
                        { id: "btn_seo_book", title: "Book Consultation" },
                        { id: "btn_seo_pkg", title: "Marketing Packages" },
                        { id: "btn_seo_menu", title: "Main Menu" }
                    ]
                }
            },
            {
                id: "ads_overview",
                type: "textNode",
                position: { x: 550, y: 820 },
                data: { label: "Paid Ads Overview", text: `🎯 High-ROI Google & Meta Paid Ad Campaigns:\n\n• Targeted Google Search & Shopping Ads\n• High-Converting Meta (FB & IG) Ads\n• Lead Generation & Retargeting Setup\n• Continuous ROI Optimization & Tracking` }
            },
            {
                id: "ads_action_btns",
                type: "buttonsNode",
                position: { x: 550, y: 990 },
                data: {
                    label: "Ads Action Options",
                    text: "Ready to scale your business leads with paid ad campaigns?",
                    buttons: [
                        { id: "btn_ads_book", title: "Book Consultation" },
                        { id: "btn_ads_pkg", title: "Marketing Packages" },
                        { id: "btn_ads_menu", title: "Main Menu" }
                    ]
                }
            },
            {
                id: "mkt_pricing",
                type: "textNode",
                position: { x: 350, y: 1670 },
                data: { label: "Marketing Pricing", text: `💳 Digital Marketing Packages:\n\n• Starter Package: Local SEO & Social Management\n• Growth Package: Full Performance Ads & SEO\n• Enterprise Package: Multi-Channel Brand Growth` }
            },
            {
                id: "mkt_consult_btn",
                type: "buttonsNode",
                position: { x: 350, y: 1840 },
                data: {
                    label: "Book Marketing Consultation",
                    text: "Ready to accelerate your business growth with JISNU?",
                    buttons: [
                        { id: "btn_mkt_book", title: "Book Consultation" },
                        { id: "btn_mkt_menu", title: "Main Menu" }
                    ]
                }
            },
            {
                id: "lead_form_name",
                type: "questionNode",
                position: { x: 100, y: 1380 },
                data: { label: "Lead Form - Full Name", text: "Please enter your Full Name:", variableName: "consult_full_name" }
            },
            {
                id: "lead_form_phone",
                type: "questionNode",
                position: { x: 100, y: 1530 },
                data: { label: "Lead Form - Phone Number", text: "Please enter your Phone Number:", variableName: "consult_phone" }
            },
            {
                id: "lead_form_email",
                type: "questionNode",
                position: { x: 100, y: 1680 },
                data: { label: "Lead Form - Email Address", text: "Please enter your Email Address:", variableName: "consult_email" }
            },
            {
                id: "lead_form_biz_name",
                type: "questionNode",
                position: { x: 100, y: 1830 },
                data: { label: "Lead Form - Business Name", text: "What is your Business Name?", variableName: "consult_biz_name" }
            },
            {
                id: "lead_form_reqs",
                type: "questionNode",
                position: { x: 100, y: 1980 },
                data: { label: "Lead Form - Project Requirement", text: "Please describe your Project Requirements:", variableName: "consult_reqs" }
            },
            {
                id: "lead_form_confirm_text",
                type: "textNode",
                position: { x: 100, y: 2130 },
                data: { label: "Lead Form Confirmation Message", text: `Thank you! Your consultation request has been successfully submitted to ${brandName}.\nOur business strategist will reach out to you shortly.` }
            },
            {
                id: "lead_form_confirm_btns",
                type: "buttonsNode",
                position: { x: 100, y: 2280 },
                data: { label: "Lead Form Confirmation Action", text: "Thank you for contacting us! What would you like to do next?", buttons: [{ id: "btn_lf_menu", title: "Main Menu" }] }
            },
            {
                id: "job_cat_btns",
                type: "buttonsNode",
                position: { x: 800, y: 450 },
                data: {
                    label: "Job Categories",
                    text: "Select a job category to explore career opportunities at JISNU:",
                    buttons: [
                        { id: "btn_job_tech", title: "Tech Jobs" },
                        { id: "btn_job_mkt", title: "Marketing Jobs" },
                        { id: "btn_job_intern", title: "Internship Jobs" }
                    ]
                }
            },
            {
                id: "tech_jobs_list",
                type: "listNode",
                position: { x: 600, y: 650 },
                data: {
                    label: "Tech Jobs List",
                    text: "Select an open Tech position to view details:",
                    listButtonText: "View Tech Roles",
                    listSections: [{
                        title: "Tech Positions",
                        rows: [
                            { id: "tj_py", title: "Python Developer", description: "Python, Django / FastAPI" },
                            { id: "tj_react", title: "React Developer", description: "React, Next.js, Redux" },
                            { id: "tj_next", title: "NextJS Developer", description: "Next.js SSR, React, TypeScript" },
                            { id: "tj_node", title: "NodeJS Developer", description: "Node.js, Express, REST APIs" },
                            { id: "tj_full", title: "Full Stack Developer", description: "MERN / PERN Stack Development" },
                            { id: "tj_uiux", title: "UI UX Designer", description: "Figma, Wireframing, UX Strategy" }
                        ]
                    }]
                }
            },
            {
                id: "tech_job_details",
                type: "textNode",
                position: { x: 600, y: 820 },
                data: { label: "Tech Job Details", text: `💼 Tech Roles at JISNU Digital Solutions PVT LTD:\n\n1. Python Developer: Django, FastAPI, PostgreSQL & Backend Microservices.\n2. React Developer: Modern React, Next.js, Redux & Responsive UI.\n3. NextJS Developer: SSR/SSG Applications, TypeScript & Performance.\n4. NodeJS Developer: Node.js, Express, REST APIs & Websockets.\n5. Full Stack Developer: MERN / PERN Stack End-to-End Product Engineering.\n6. UI UX Designer: Figma Wireframes, Prototyping & UX Design Strategy.\n\n• Experience: 0 - 5 Years\n• Location: Wakad, Pimpri-Chinchwad Pune, Maharashtra 411057\n• Official Site: https://jisnudigitals.com/` }
            },
            {
                id: "tech_job_apply_btn",
                type: "buttonsNode",
                position: { x: 600, y: 990 },
                data: { label: "Tech Job Apply Action", text: "Would you like to apply for a Tech position at JISNU?", buttons: [{ id: "btn_tj_apply", title: "Apply Now" }, { id: "btn_tj_menu", title: "Main Menu" }] }
            },
            {
                id: "mkt_jobs_list",
                type: "listNode",
                position: { x: 850, y: 650 },
                data: {
                    label: "Digital Marketing Jobs List",
                    text: "Select an open Marketing position to view details:",
                    listButtonText: "View Marketing Roles",
                    listSections: [{
                        title: "Marketing Positions",
                        rows: [
                            { id: "mj_seo", title: "SEO Executive", description: "Search Engine Optimization" },
                            { id: "mj_gads", title: "Google Ads Expert", description: "PPC & Google Ads Management" },
                            { id: "mj_sme", title: "Social Media Executive", description: "Social Growth & Engagement" },
                            { id: "mj_des", title: "Graphic Designer", description: "Ad Creatives & Visual Media" },
                            { id: "mj_vid", title: "Video Editor", description: "Reels & Motion Graphics" },
                            { id: "mj_writer", title: "Content Writer", description: "Copywriting & Blogs" }
                        ]
                    }]
                }
            },
            {
                id: "mkt_job_details",
                type: "textNode",
                position: { x: 850, y: 820 },
                data: { label: "Marketing Job Details", text: `📣 Digital Marketing Roles at JISNU Digital Solutions PVT LTD:\n\n1. SEO Executive: Technical SEO, Google Search Console, Ahrefs & Link Building.\n2. Google Ads Expert: High-ROI PPC, Shopping Ads, GA4 & Conversion Tracking.\n3. Social Media Executive: Meta (FB/IG) Brand Growth & Strategy.\n4. Graphic Designer: Social Media Creatives & Ad Banners.\n5. Video Editor: Reels, YouTube Shorts & Motion Graphics.\n6. Content Writer: SEO Copywriting & Website Content.\n\n• Experience: 0 - 4 Years\n• Location: Wakad, Pimpri-Chinchwad Pune, Maharashtra 411057\n• Official Site: https://jisnudigitals.com/` }
            },
            {
                id: "mkt_job_apply_btn",
                type: "buttonsNode",
                position: { x: 850, y: 990 },
                data: { label: "Marketing Job Apply Action", text: "Would you like to apply for a Digital Marketing position at JISNU?", buttons: [{ id: "btn_mj_apply", title: "Apply Now" }, { id: "btn_mj_menu", title: "Main Menu" }] }
            },
            {
                id: "intern_list",
                type: "listNode",
                position: { x: 1100, y: 650 },
                data: {
                    label: "Internship Jobs List",
                    text: "Select an open Internship position to view details:",
                    listButtonText: "View Internship Roles",
                    listSections: [{
                        title: "Internship Positions",
                        rows: [
                            { id: "ij_py", title: "Python Internship", description: "Hands-on Python & Backend" },
                            { id: "ij_web", title: "Web Dev Internship", description: "Frontend, React & Web Dev" },
                            { id: "ij_seo", title: "SEO Internship", description: "SEO Optimization & Traffic" },
                            { id: "ij_mkt", title: "Digital Marketing", description: "Social Media & Ads" },
                            { id: "ij_des", title: "Graphic Design", description: "Visual Design & Creatives" }
                        ]
                    }]
                }
            },
            {
                id: "intern_details",
                type: "textNode",
                position: { x: 1100, y: 820 },
                data: { label: "Internship Job Details", text: `🎓 Internship Programs at JISNU Digital Solutions PVT LTD:\n\n1. Python Internship: Hands-on Python & Backend API Development.\n2. Web Development Internship: Modern Frontend, React, Next.js & UI Components.\n3. SEO Internship: Search Engine Optimization, Technical SEO & Analytics.\n4. Digital Marketing Internship: Meta (FB/IG) Ad Campaigns & Social Growth.\n5. Graphic Design Internship: Ad Creatives, Branding Banners & Visual Design.\n\n• Duration: 3 - 6 Months | Stipend & Certificate Included\n• Location: Wakad, Pimpri-Chinchwad Pune, Maharashtra 411057\n• Pre-Placement Offer (PPO) opportunities for top performers\n• Official Site: https://jisnudigitals.com/` }
            },
            {
                id: "intern_apply_btn",
                type: "buttonsNode",
                position: { x: 1100, y: 990 },
                data: { label: "Internship Job Apply Action", text: "Would you like to apply for an Internship position at JISNU?", buttons: [{ id: "btn_ij_apply", title: "Apply Now" }, { id: "btn_ij_menu", title: "Main Menu" }] }
            },
            {
                id: "app_form_name",
                type: "questionNode",
                position: { x: 850, y: 1200 },
                data: { label: "Application Form - Full Name", text: "Please enter your Full Name:", variableName: "app_full_name" }
            },
            {
                id: "app_form_email",
                type: "questionNode",
                position: { x: 850, y: 1350 },
                data: { label: "Application Form - Email", text: "Please enter your Email Address:", variableName: "app_email" }
            },
            {
                id: "app_form_phone",
                type: "questionNode",
                position: { x: 850, y: 1500 },
                data: { label: "Application Form - Phone", text: "Please enter your Phone Number:", variableName: "app_phone" }
            },
            {
                id: "app_form_qualification",
                type: "questionNode",
                position: { x: 850, y: 1650 },
                data: { label: "Application Form - Highest Qualification", text: "What is your Highest Qualification? (e.g., B.Tech, MCA, Degree):", variableName: "app_qualification" }
            },
            {
                id: "app_form_experience",
                type: "questionNode",
                position: { x: 850, y: 1800 },
                data: { label: "Application Form - Experience", text: "How many years of relevant experience do you have? (e.g., Fresher, 2 Years):", variableName: "app_experience" }
            },
            {
                id: "app_form_resume",
                type: "questionNode",
                position: { x: 850, y: 1950 },
                data: { label: "Application Form - Resume Link", text: "Please share a Google Drive / LinkedIn / Portfolio link to your Resume:", variableName: "app_resume_link" }
            },
            {
                id: "app_form_confirm_text",
                type: "textNode",
                position: { x: 850, y: 2100 },
                data: { label: "Application Confirmation Message", text: `Thank you! Your application has been successfully submitted to ${brandName}.\nOur HR team will review your application and contact you soon.` }
            },
            {
                id: "app_form_confirm_btns",
                type: "buttonsNode",
                position: { x: 850, y: 2250 },
                data: { label: "Application Confirmation Action", text: "Thank you for applying! What would you like to do next?", buttons: [{ id: "btn_af_menu", title: "Main Menu" }] }
            },
            {
                id: "contact_btns",
                type: "buttonsNode",
                position: { x: 1550, y: 450 },
                data: { label: "Contact Options", text: `How would you like to connect with ${brandName}?`, buttons: [{ id: "btn_cu_call", title: "Call Us" }, { id: "btn_cu_email", title: "Email Us" }, { id: "btn_cu_addr", title: "Office Address" }] }
            },
            {
                id: "call_us_text",
                type: "textNode",
                position: { x: 1350, y: 650 },
                data: { label: "Display Phone Number", text: `📞 Call ${brandName}:\n\nDirect Phone: +91 77099 36965\nOfficial Website: https://jisnudigitals.com/\n\nWorking Hours: Mon-Sat | 9:30 AM - 6:30 PM` }
            },
            {
                id: "call_us_req_btn",
                type: "buttonsNode",
                position: { x: 1350, y: 820 },
                data: { label: "Call Us Action", text: "Would you like our team to call you back?", buttons: [{ id: "btn_cu_cb1", title: "Request Callback" }, { id: "btn_cu_mm1", title: "Main Menu" }] }
            },
            {
                id: "email_us_text",
                type: "textNode",
                position: { x: 1550, y: 650 },
                data: { label: "Display Emails", text: `✉️ Email ${brandName}:\n\n• Business Enquiries: info@jdsolutions.in\n• Official Website: https://jisnudigitals.com/\n• Working Hours: Mon-Sat | 9:30 AM - 6:30 PM` }
            },
            {
                id: "email_us_req_btn",
                type: "buttonsNode",
                position: { x: 1550, y: 820 },
                data: { label: "Email Us Action", text: "Would you like our team to call you back?", buttons: [{ id: "btn_cu_cb2", title: "Request Callback" }, { id: "btn_cu_mm2", title: "Main Menu" }] }
            },
            {
                id: "office_addr_text",
                type: "textNode",
                position: { x: 1750, y: 650 },
                data: { label: "Display Address", text: `📍 ${brandName}\n\nRegistered Office Address:\nWakad, Pimpri-Chinchwad Pune, Maharashtra 411057, India.\nOfficial Website: https://jisnudigitals.com/` }
            },
            {
                id: "office_addr_req_btn",
                type: "buttonsNode",
                position: { x: 1750, y: 820 },
                data: { label: "Office Address Action", text: "Would you like our team to call you back?", buttons: [{ id: "btn_cu_cb3", title: "Request Callback" }, { id: "btn_cu_mm3", title: "Main Menu" }] }
            },
            {
                id: "cb_form_name",
                type: "questionNode",
                position: { x: 1550, y: 1020 },
                data: { label: "Callback Form - Full Name", text: "Please enter your Full Name:", variableName: "cb_full_name" }
            },
            {
                id: "cb_form_phone",
                type: "questionNode",
                position: { x: 1550, y: 1170 },
                data: { label: "Callback Form - Phone Number", text: "Please enter your Phone Number:", variableName: "cb_phone" }
            },
            {
                id: "cb_form_email",
                type: "questionNode",
                position: { x: 1550, y: 1320 },
                data: { label: "Callback Form - Email", text: "Please enter your Email Address:", variableName: "cb_email" }
            },
            {
                id: "cb_form_req",
                type: "questionNode",
                position: { x: 1550, y: 1470 },
                data: { label: "Callback Form - Requirement", text: "Please state your Primary Requirement / Enquiry:", variableName: "cb_requirement" }
            },
            {
                id: "cb_form_time",
                type: "buttonsNode",
                position: { x: 1550, y: 1620 },
                data: { label: "Callback Form - Preferred Contact Time", text: "Select your Preferred Contact Time:", buttons: [{ id: "btn_t_morn", title: "Morning (9-12)" }, { id: "btn_t_aft", title: "Afternoon (12-4)" }, { id: "btn_t_eve", title: "Evening (4-7)" }] }
            },
            {
                id: "cb_form_confirm_text",
                type: "textNode",
                position: { x: 1550, y: 1790 },
                data: { label: "Callback Confirmation Message", text: `Thank you! Your callback request has been received by ${brandName}.\nWe will call you at your preferred contact time.` }
            },
            {
                id: "cb_form_confirm_btns",
                type: "buttonsNode",
                position: { x: 1550, y: 1940 },
                data: { label: "Callback Confirmation Action", text: "Thank you! What would you like to do next?", buttons: [{ id: "btn_cb_menu", title: "Main Menu" }] }
            }
        ],
        edges: [
            { id: "e_root", source: "welcome_root", target: "main_menu" },
            { id: "e_mm1", source: "main_menu", sourceHandle: "btn_services", target: "services_menu" },
            { id: "e_mm2", source: "main_menu", sourceHandle: "btn_jobs", target: "job_cat_btns" },
            { id: "e_mm3", source: "main_menu", sourceHandle: "btn_contact", target: "contact_btns" },
            { id: "e_sm1", source: "services_menu", sourceHandle: "btn_web_dev", target: "web_dev_overview" },
            { id: "e_sm2", source: "services_menu", sourceHandle: "btn_digital_mkt", target: "mkt_overview" },
            { id: "e_sm3", source: "services_menu", sourceHandle: "btn_main_menu_serv", target: "main_menu" },
            { id: "e_wd1", source: "web_dev_overview", target: "web_dev_features" },
            { id: "e_wd2", source: "web_dev_features", target: "web_dev_pricing" },
            { id: "e_wd3", source: "web_dev_pricing", target: "web_dev_consult_btn" },
            { id: "e_wd4", source: "web_dev_consult_btn", sourceHandle: "btn_web_book", target: "lead_form_name" },
            { id: "e_wd5", source: "web_dev_consult_btn", sourceHandle: "btn_web_menu", target: "main_menu" },
            { id: "e_m1", source: "mkt_overview", sourceHandle: "btn_mkt_seo", target: "seo_proof_intro" },
            { id: "e_m2", source: "mkt_overview", sourceHandle: "btn_mkt_ads", target: "ads_overview" },
            { id: "e_m3", source: "mkt_overview", sourceHandle: "btn_mkt_menu", target: "main_menu" },
            { id: "e_m_seo1", source: "seo_proof_intro", target: "seo_result_media_1" },
            { id: "e_m_seo2", source: "seo_result_media_1", target: "seo_result_media_2" },
            { id: "e_m_seo3", source: "seo_result_media_2", target: "seo_result_media_3" },
            { id: "e_m_seo4", source: "seo_result_media_3", target: "seo_action_btns" },
            { id: "e_m_seo_b1", source: "seo_action_btns", sourceHandle: "btn_seo_book", target: "lead_form_name" },
            { id: "e_m_seo_b2", source: "seo_action_btns", sourceHandle: "btn_seo_pkg", target: "mkt_pricing" },
            { id: "e_m_seo_b3", source: "seo_action_btns", sourceHandle: "btn_seo_menu", target: "main_menu" },
            { id: "e_m_ads1", source: "ads_overview", target: "ads_action_btns" },
            { id: "e_m_ads_b1", source: "ads_action_btns", sourceHandle: "btn_ads_book", target: "lead_form_name" },
            { id: "e_m_ads_b2", source: "ads_action_btns", sourceHandle: "btn_ads_pkg", target: "mkt_pricing" },
            { id: "e_m_ads_b3", source: "ads_action_btns", sourceHandle: "btn_ads_menu", target: "main_menu" },
            { id: "e_m_prc", source: "mkt_pricing", target: "mkt_consult_btn" },
            { id: "e_m4", source: "mkt_consult_btn", sourceHandle: "btn_mkt_book", target: "lead_form_name" },
            { id: "e_m5", source: "mkt_consult_btn", sourceHandle: "btn_mkt_menu", target: "main_menu" },
            { id: "e_lf1", source: "lead_form_name", target: "lead_form_phone" },
            { id: "e_lf2", source: "lead_form_phone", target: "lead_form_email" },
            { id: "e_lf3", source: "lead_form_email", target: "lead_form_biz_name" },
            { id: "e_lf4", source: "lead_form_biz_name", target: "lead_form_reqs" },
            { id: "e_lf5", source: "lead_form_reqs", target: "lead_form_confirm_text" },
            { id: "e_lf6", source: "lead_form_confirm_text", target: "lead_form_confirm_btns" },
            { id: "e_lf7", source: "lead_form_confirm_btns", sourceHandle: "btn_lf_menu", target: "main_menu" },
            { id: "e_jc1", source: "job_cat_btns", sourceHandle: "btn_job_tech", target: "tech_jobs_list" },
            { id: "e_jc2", source: "job_cat_btns", sourceHandle: "btn_job_mkt", target: "mkt_jobs_list" },
            { id: "e_jc3", source: "job_cat_btns", sourceHandle: "btn_job_intern", target: "intern_list" },
            { id: "e_tj1", source: "tech_jobs_list", sourceHandle: "tj_py", target: "tech_job_details" },
            { id: "e_tj2", source: "tech_jobs_list", sourceHandle: "tj_react", target: "tech_job_details" },
            { id: "e_tj3", source: "tech_jobs_list", sourceHandle: "tj_next", target: "tech_job_details" },
            { id: "e_tj4", source: "tech_jobs_list", sourceHandle: "tj_node", target: "tech_job_details" },
            { id: "e_tj5", source: "tech_jobs_list", sourceHandle: "tj_full", target: "tech_job_details" },
            { id: "e_tj6", source: "tech_jobs_list", sourceHandle: "tj_uiux", target: "tech_job_details" },
            { id: "e_tj7", source: "tech_job_details", target: "tech_job_apply_btn" },
            { id: "e_tj8", source: "tech_job_apply_btn", sourceHandle: "btn_tj_apply", target: "app_form_name" },
            { id: "e_tj9", source: "tech_job_apply_btn", sourceHandle: "btn_tj_menu", target: "main_menu" },
            { id: "e_mj1", source: "mkt_jobs_list", sourceHandle: "mj_seo", target: "mkt_job_details" },
            { id: "e_mj2", source: "mkt_jobs_list", sourceHandle: "mj_gads", target: "mkt_job_details" },
            { id: "e_mj3", source: "mkt_jobs_list", sourceHandle: "mj_sme", target: "mkt_job_details" },
            { id: "e_mj4", source: "mkt_jobs_list", sourceHandle: "mj_des", target: "mkt_job_details" },
            { id: "e_mj5", source: "mkt_jobs_list", sourceHandle: "mj_vid", target: "mkt_job_details" },
            { id: "e_mj6", source: "mkt_jobs_list", sourceHandle: "mj_writer", target: "mkt_job_details" },
            { id: "e_mj7", source: "mkt_job_details", target: "mkt_job_apply_btn" },
            { id: "e_mj8", source: "mkt_job_apply_btn", sourceHandle: "btn_mj_apply", target: "app_form_name" },
            { id: "e_mj9", source: "mkt_job_apply_btn", sourceHandle: "btn_mj_menu", target: "main_menu" },
            { id: "e_ij1", source: "intern_list", sourceHandle: "ij_py", target: "intern_details" },
            { id: "e_ij2", source: "intern_list", sourceHandle: "ij_web", target: "intern_details" },
            { id: "e_ij3", source: "intern_list", sourceHandle: "ij_seo", target: "intern_details" },
            { id: "e_ij4", source: "intern_list", sourceHandle: "ij_mkt", target: "intern_details" },
            { id: "e_ij5", source: "intern_list", sourceHandle: "ij_des", target: "intern_details" },
            { id: "e_ij6", source: "intern_details", target: "intern_apply_btn" },
            { id: "e_ij7", source: "intern_apply_btn", sourceHandle: "btn_ij_apply", target: "app_form_name" },
            { id: "e_ij8", source: "intern_apply_btn", sourceHandle: "btn_ij_menu", target: "main_menu" },
            { id: "e_af1", source: "app_form_name", target: "app_form_email" },
            { id: "e_af2", source: "app_form_email", target: "app_form_phone" },
            { id: "e_af3", source: "app_form_phone", target: "app_form_qualification" },
            { id: "e_af4", source: "app_form_qualification", target: "app_form_experience" },
            { id: "e_af5", source: "app_form_experience", target: "app_form_resume" },
            { id: "e_af6", source: "app_form_resume", target: "app_form_confirm_text" },
            { id: "e_af7", source: "app_form_confirm_text", target: "app_form_confirm_btns" },
            { id: "e_af8", source: "app_form_confirm_btns", sourceHandle: "btn_af_menu", target: "main_menu" },
            { id: "e_cu1", source: "contact_btns", sourceHandle: "btn_cu_call", target: "call_us_text" },
            { id: "e_cu2", source: "contact_btns", sourceHandle: "btn_cu_email", target: "email_us_text" },
            { id: "e_cu3", source: "contact_btns", sourceHandle: "btn_cu_addr", target: "office_addr_text" },
            { id: "e_cl1", source: "call_us_text", target: "call_us_req_btn" },
            { id: "e_cl2", source: "call_us_req_btn", sourceHandle: "btn_cu_cb1", target: "cb_form_name" },
            { id: "e_cl3", source: "call_us_req_btn", sourceHandle: "btn_cu_mm1", target: "main_menu" },
            { id: "e_em1", source: "email_us_text", target: "email_us_req_btn" },
            { id: "e_em2", source: "email_us_req_btn", sourceHandle: "btn_cu_cb2", target: "cb_form_name" },
            { id: "e_em3", source: "email_us_req_btn", sourceHandle: "btn_cu_mm2", target: "main_menu" },
            { id: "e_oa1", source: "office_addr_text", target: "office_addr_req_btn" },
            { id: "e_oa2", source: "office_addr_req_btn", sourceHandle: "btn_cu_cb3", target: "cb_form_name" },
            { id: "e_oa3", source: "office_addr_req_btn", sourceHandle: "btn_cu_mm3", target: "main_menu" },
            { id: "e_cb1", source: "cb_form_name", target: "cb_form_phone" },
            { id: "e_cb2", source: "cb_form_phone", target: "cb_form_email" },
            { id: "e_cb3", source: "cb_form_email", target: "cb_form_req" },
            { id: "e_cb4", source: "cb_form_req", target: "cb_form_time" },
            { id: "e_cb5", source: "cb_form_time", sourceHandle: "btn_t_morn", target: "cb_form_confirm_text" },
            { id: "e_cb6", source: "cb_form_time", sourceHandle: "btn_t_aft", target: "cb_form_confirm_text" },
            { id: "e_cb7", source: "cb_form_time", sourceHandle: "btn_t_eve", target: "cb_form_confirm_text" },
            { id: "e_cb8", source: "cb_form_confirm_text", target: "cb_form_confirm_btns" },
            { id: "e_cb9", source: "cb_form_confirm_btns", sourceHandle: "btn_cb_menu", target: "main_menu" }
        ]
    };

    await prisma.flow.deleteMany({ where: { organizationId: org.id } });

    const flow = await prisma.flow.upsert({
        where: { id: "default-flow-123" },
        update: {
            name: "JISNU Digital Solutions PVT LTD Production Flow",
            description: "Official Production WhatsApp Chatbot Flow for JISNU Digital Solutions PVT LTD",
            graphJson: flowGraph,
            platform: "whatsapp",
            isActive: true,
        },
        create: {
            id: "default-flow-123",
            name: "JISNU Digital Solutions PVT LTD Production Flow",
            description: "Official Production WhatsApp Chatbot Flow for JISNU Digital Solutions PVT LTD",
            graphJson: flowGraph,
            isActive: true,
            platform: "whatsapp",
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
        where: { organizationId_platform_customerPhone: { organizationId: org.id, platform: "whatsapp", customerPhone: "+919876543210" } },
        update: {},
        create: {
            organizationId: org.id,
            platform: "whatsapp",
            customerPhone: "+919876543210",
            customerName: "Rahul Sharma",
            isBotPaused: false,
            currentNodeId: "welcome_root",
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
        where: { organizationId_platform_customerPhone: { organizationId: org.id, platform: "whatsapp", customerPhone: "+918765432109" } },
        update: {},
        create: {
            organizationId: org.id,
            platform: "whatsapp",
            customerPhone: "+918765432109",
            customerName: "Priya Patel",
            isBotPaused: true,
            botPausedUntil: new Date(Date.now() + 23 * 60 * 60 * 1000),
            currentNodeId: "web_dev_pricing",
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
        where: { organizationId_platform_customerPhone: { organizationId: org.id, platform: "instagram", customerPhone: "+15550199" } },
        update: {},
        create: {
            organizationId: org.id,
            platform: "instagram",
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
