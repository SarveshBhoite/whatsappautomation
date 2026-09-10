# ⚡ AutomationCRM

> **The Enterprise Omnichannel Customer Engagement, Creator Intelligence, Multi-Channel Ad Management & Autonomous AI Marketing Automation Suite**

[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2F%20Express-green?style=flat-square&logo=node.js)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL%20(Neon)-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Groq AI](https://img.shields.io/badge/AI%20Engine-Groq%20LLaMA%203.3-F55036?style=flat-square)](https://groq.com/)
[![Meta API](https://img.shields.io/badge/Meta-WhatsApp%20%7C%20Instagram%20%7C%20Ads-0081FB?style=flat-square&logo=meta)](https://developers.facebook.com/)
[![Google API](https://img.shields.io/badge/Google-Ads%20%7C%20GMB%20%7C%20YouTube%20%7C%20Gmail-4285F4?style=flat-square&logo=google)](https://cloud.google.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

**AutomationCRM** is an enterprise-grade, multi-tenant customer relationship management, creator intelligence, and marketing automation platform. Built for digital agencies, modern businesses, and high-velocity content creators, it consolidates **WhatsApp Cloud API**, **Instagram Direct & Comment Automation**, **YouTube Channel Analytics & Comments**, **LinkedIn Content Studio**, **Google Business Profiles (GMB) & Review Shield**, **Google Ads & Performance Max**, **Meta Ads Manager**, **Gmail & Cold Outreach Campaigns**, **Google Calendar & Meet Booking**, **AI Agent Studio with RAG Knowledge Base**, and an **Enterprise Developer API** into one cohesive, beautifully designed system.

---

## 🌟 Executive Overview & Platform Capabilities

Modern businesses and digital agencies juggle dozens of fragmented SaaS subscriptions: one tool for WhatsApp customer support, another for Instagram DMs, another for Google review management, separate dashboards for Google Ads and Meta Ads, disconnected email marketing tools, and ad-hoc AI chatbot platforms.

**AutomationCRM unifies this entire operating stack into an integrated, organization-isolated powerhouse:**

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │               ⚡ AutomationCRM PLATFORM                │
                                  └───────────────────────────┬────────────────────────────┘
             ┌───────────────────────────────┬────────────────┼──────────────────────────────┬──────────────────────────────┐
             ▼                               ▼                ▼                              ▼                              ▼
  [ 💬 Omnichannel Inbox ]       [ 🤖 Autonomous AI ]   [ 📢 Multi-Channel Ads ]     [ 🛡️ Reputation & Local ]     [ 📈 Growth & SEO Tools ]
  • WhatsApp Multi-Number/WABA   • Groq LLaMA 3.3 Engine • Google Ads & PMax          • GMB Multi-Location Sync     • AI Content Inspector
  • WhatsApp Drip Campaigns      • URL & PDF Ingestion   • Meta Ads Suite (FB & IG)   • Star-Calibrated Review Funnel • Google PageSpeed Audit
  • Instagram Direct & DMs       • Visual Flow Builder   • GAQL Live Performance Sync • Groq AI Review Auto-Reply   • Branded PDF/Excel Reports
  • Comment-to-DM Triggers       • Auto Lead Capture     • Ad Set & Budget Controls   • Google Local Posts Scheduler • Developer API & Webhooks
  • Gmail Unified Reading Pane   • Multi-Channel Agent   • Daily ROAS / KPI Tracking  • GMB Search Performance Stats • Google Calendar & Meet
```

---

## 🚀 Complete Feature Matrix

| Functional Pillar | Core Capabilities & Innovations | Backend Endpoints / Services |
| :--- | :--- | :--- |
| **WhatsApp Multi-Number** | Multi-tenant Meta Cloud API, embedded signup, coexistence routing, interactive buttons/lists, template messages, media streaming via ImageKit. | `/api/whatsapp`, `/api/whatsapp-embedded`, `whatsappService.ts` |
| **WhatsApp Drip Engine** | Multi-step drip workflows, time-delayed sequences, lead enrollment, queue state machine, delivery & read telemetry. | `/api/whatsapp/drip`, `whatsappDripService.ts` |
| **Instagram DM & Comments** | Real-time direct chat, comment-to-DM auto triggers, keyword-based coupon/link delivery, Instagram Graph API webhooks. | `/api/admin/instagram`, `instagramCommentToDm.ts` |
| **Autonomous AI Agent Studio** | Groq LLaMA 3.3 70B & 8B engine, organization RAG Knowledge Base, website crawler (`/train-url`), PDF document trainer, multi-channel autopilot. | `/api/ai-agent`, `aiAgentEngine.ts` |
| **Lead Capture Engine** | Automatic real-time extraction of visitor names, phone numbers, email addresses, buying intent, and conversational notes. | `/api/ai-agent/leads`, `AiCapturedLead` model |
| **Visual Flow Builder** | Drag-and-drop React Flow canvas, interactive button blocks, dropdown menus, media nodes, natural-language prompt-to-flow generator. | `/api/admin/flows`, `aiFlowGenerator.ts` |
| **Google Ads & PMax** | Direct OAuth token rotation, MCC sub-account selector, Performance Max & Search campaign builder, live GAQL metrics, daily KPI snapshots. | `/api/ads`, `googleAds.ts`, `googleAdsService.ts` |
| **Meta Ads Suite** | Facebook Login for Business OAuth, campaigns for Traffic/Awareness/Leads/Conversions, budget control, live ad set metrics. | `/api/meta-ads`, `metaAds.ts`, `metaAdsService.ts` |
| **GMB & Review Shield** | Smart QR code funnel (4-5★ to Google Maps; 1-3★ to internal care queue), Groq sentiment auto-replies, 1-click batch reply, Google posts. | `/api/gmb`, `/api/gmb/performance`, `gmb.ts` |
| **YouTube Creator CRM** | Shorts vs. Long-form video classification, channel growth timeline, audience demographics, unified comment inbox with inline reply. | `/api/youtube`, `youtube.ts`, `youtubeService.ts` |
| **LinkedIn Content Studio** | Personal profile & Company page publishing, post scheduler, draft management, AI post creator, rewriter, hashtag & CTA generator. | `/api/linkedin`, `linkedin.ts`, `linkedinService.ts` |
| **Gmail Hub & Cold Outreach** | Multi-account OAuth, threaded reading pane, AI email drafting assistant, bulk cold email engine with CSV import & tag substitution. | `/api/gmail`, `gmail.ts`, `gmailService.ts` |
| **Appointments & Meet** | Two-way Google Calendar integration, dynamic appointment booking, automatic Google Meet room generation, IST timezone calculation. | `/api/appointments`, `/api/google-calendar`, `appointmentService.ts` |
| **AI Content Inspector** | AI-generated text detector, originality score, Flesch-Kincaid readability grade, grammar analyzer, 1-click AI humanizer. | `/api/content-inspector`, `contentInspector.ts` |
| **SEO & PageSpeed Auditor** | Google PageSpeed Insights integration, Mobile vs. Desktop Core Web Vitals (FCP, LCP, TBT, CLS), technical audit recommendations. | `/api/seo`, `seo.ts` |
| **Developer API & Webhooks** | Scoped API key management, rate limiting, real-time API telemetry audit log (latency ms, status codes, IPs), REST API v1. | `/api/api-keys`, `/api/v1`, `externalApiV1.ts` |
| **Executive Reports** | Weekly & Monthly performance summaries exported to CSV, styled Excel spreadsheets (`.xlsx`), and branded executive PDF documents. | `/api/reports`, `reports.ts` |
| **Super Admin & Multi-Tenant** | Full organization CRUD, role-based access control (`super_admin`, `client`), modular feature toggles per organization. | `/api/admin`, `admin.ts` |

---

## 🎨 System Architecture & Data Flow

```mermaid
flowchart TB
    subgraph ClientLayer["🖥️ Frontend Client Layer (Next.js 14 App Router)"]
        UI_Inbox["💬 Omnichannel Inbox (Socket.IO)"]
        UI_Flow["🔀 Drag-and-Drop Flow Builder"]
        UI_AI["🤖 AI Agent Studio & Knowledge Hub"]
        UI_Ads["📢 Google & Meta Ads Dashboards"]
        UI_GMB["🛡️ GMB Review Shield & QR Generator"]
        UI_YT["📺 YouTube Creator CRM"]
        UI_LI["💼 LinkedIn Content Studio"]
        UI_Mail["📧 Gmail & Outreach Hub"]
        UI_Tools["🔍 SEO & Content Inspector"]
        UI_Admin["🏢 Super Admin Control Plane"]
    end

    subgraph BackendLayer["⚡ Core Backend Engine (Express + TypeScript)"]
        Router["🌐 Express API Gateway (/api)"]
        SocketServer["⚡ Real-Time Socket.IO Server"]
        DripEngine["⏱️ WhatsApp Drip Background Engine"]
        AIEngine["🧠 AI Agent & Knowledge RAG Service"]
        Telemetry["📊 API Telemetry & Rate Limiting"]
    end

    subgraph StorageLayer["🗄️ Persistence & Database Layer"]
        PrismaORM["💎 Prisma ORM Client"]
        PostgresDB[("🐘 PostgreSQL (Neon Cloud / Direct URL)")]
        ImageKit["🖼️ ImageKit CDN (Media Cache)"]
    end

    subgraph ExternalEcosystem["🌐 Connected External APIs & Gateways"]
        MetaAPI["📱 Meta Graph API (WhatsApp Cloud, IG Direct, Meta Ads)"]
        GoogleAPI["🔍 Google Cloud APIs (Ads v17/18, GMB, YouTube, Gmail, Calendar, PageSpeed)"]
        LinkedInAPI["💼 LinkedIn Developer Platform (v2 REST API)"]
        GroqCloud["⚡ Groq Cloud LLaMA 3.3 70B & 8B Inference"]
        OpenAICloud["🧠 OpenAI GPT Models (Fallback Engine)"]
    end

    %% Connections
    ClientLayer <-->|REST HTTP & WebSockets| BackendLayer
    BackendLayer --> PrismaORM
    PrismaORM --> PostgresDB
    BackendLayer --> ImageKit

    BackendLayer <-->|Webhooks & REST| MetaAPI
    BackendLayer <-->|OAuth2 & REST/gRPC| GoogleAPI
    BackendLayer <-->|OAuth2 & REST| LinkedInAPI
    AIEngine <-->|Fast Streaming Inference| GroqCloud
    AIEngine <-->|Chat Completion| OpenAICloud
```

---

## 🔍 Detailed Module Walkthroughs

### 💬 1. WhatsApp & Omnichannel Live Messaging Hub
Manage enterprise WhatsApp and Instagram customer inquiries in real time without jumping between tabs.

![WhatsApp & Instagram Omnichannel Inbox](./docs/assets/whatsapp_inbox.png)

- **Multi-Account & Multi-WABA Support**: Connect and switch between multiple WhatsApp Business Accounts (WABAs) and phone numbers under one organization with complete isolation.
- **Embedded Signup & Coexistence**: Supports Meta's official embedded signup flow as well as custom WABA credentials.
- **Real-Time WebSockets**: Instant message synchronization using Socket.IO with typing indicators, delivery checkmarks (sent, delivered, read), and live conversation counters.
- **Rich Media & Interactive Messaging**: Send and receive photos, videos, audio voice notes, PDF documents, interactive reply buttons, and dropdown selection lists.
- **Quoted Messages**: Click-to-quote replies with context banners for clear communication.
- **Multi-Step Drip Campaigns**: Create scheduled sequences with custom time delays (minutes, hours, days), dynamic triggers, and recipient queue monitoring.

---

### 🤖 2. Autonomous AI Agent Studio & Knowledge Brain
Transform static chatbots into an autonomous, 24/7 intelligent sales and support representative.

```mermaid
flowchart LR
    CustomerMsg["💬 Inbound Message (WhatsApp / IG / Comments)"] --> AgentRouter{"🤖 AI Agent Active?"}
    AgentRouter -->|Yes| KnowledgeRAG["📚 Organization Knowledge Retrieval"]
    KnowledgeRAG -->|Relevant Context| GroqLLM["⚡ Groq LLaMA 3.3 AI Inference"]
    GroqLLM --> Decision{"Intent Analysis"}
    Decision -->|Customer Inquiring| ResponseMsg["💬 Contextual Answer Sent to Channel"]
    Decision -->|Contact Details Detected| LeadCapture["📋 Lead Automatically Saved in CRM"]
    AgentRouter -->|Flow Mode| FlowRunner["🔀 Visual Flow Execution"]
```

- **Dual Operating Modes**:
  - **AI Agent Mode**: Autonomous conversational AI powered by **Groq LLaMA 3.3** that reads incoming messages, checks the organization knowledge base, and replies conversationally.
  - **Flow Builder Mode**: Strict deterministic routing following visual step-by-step nodes.
- **RAG Knowledge Base (`AiKnowledgeItem`)**:
  - **Manual Q&A Entries**: Add specialized business facts, pricing tiers, and contact policies.
  - **One-Click Website URL Training**: Ingest and index entire public websites or landing pages via `/train-url`.
  - **PDF Document Upload**: Extract, parse, and train on product brochures, catalogs, and technical documentation via `/knowledge/upload-pdf`.
- **Autonomous Multi-Channel Toggles**: Enable or disable AI handling individually for **WhatsApp**, **Instagram DMs**, **YouTube Comments**, and **LinkedIn**.
- **Automated Lead Capture (`AiCapturedLead`)**: The engine naturally listens for names, phone numbers, email addresses, and service intent, storing structured leads directly in the CRM.
- **Interactive Simulator**: Built-in side-by-side test playground to test bot responses and inspect retrieved knowledge context in real time.

---

### 🔀 3. Visual Drag-and-Drop Chatbot Flow Builder
Build visual branching workflows with zero code.

![Visual Chatbot Flow Builder](./docs/assets/flows_builder.png)

- **Interactive Node Palette**: Drag-and-drop Welcome Nodes, Text Messages, Media Nodes (Images/PDFs), Interactive Action Buttons, Dropdown Lists, and Dynamic User Input Questions.
- **AI Prompt-to-Flow Generator**: Type a natural language description (e.g., *"Build an appointment booking flow for a dental clinic with doctor selection and timings"*), and the system automatically synthesizes the complete node layout and connections.
- **Visual Canvas Tools**: Auto-layout formatting, zoom controls, mini-map, connection validation, and instant test simulation.

---

### 📢 4. Google Ads & Performance Max Automation
Monitor ad spend and launch high-converting campaigns directly inside AutomationCRM.

![Google Ads Performance Dashboard](./docs/assets/google_ads.png)

- **MCC Manager & Sub-Account Switching**: Authenticate using Google OAuth2 and effortlessly switch across client sub-accounts under an MCC manager.
- **Performance Max & Search Campaign Creator**: Launch new ad campaigns with budget allocation, target locations, headlines, descriptions, and bid strategies without leaving the CRM.
- **Live GAQL Metrics Sync**: Direct queries to the Google Ads API extracting Impressions, Clicks, Total Spend, Cost-per-Click (CPC), Click-Through Rate (CTR), Conversions, and ROAS.
- **Daily Performance Historical Snapshots**: Automated daily metric rollups for trend charting and executive reporting.

---

### 🎯 5. Meta Ads Suite (Facebook & Instagram)
Control your social media advertising directly alongside organic conversations.

- **Facebook Login for Business**: Secure OAuth connection with access to ad accounts, pixels, and campaign catalogs.
- **Multi-Objective Campaign Launcher**: Build and deploy campaigns for **Awareness**, **Traffic**, **Lead Generation**, and **Sales Conversions**.
- **Ad Set & Budget Controls**: Set daily or lifetime budgets, geographic targeting, and device placements.
- **Live Campaign Telemetry**: Real-time status toggling (ACTIVE / PAUSED) and spend tracking.

---

### 🛡️ 6. Google Business Profile & Smart Review Shield
Protect your online reputation while scaling authentic 5-star reviews on Google Maps.

![Google Business Profile Dashboard](./docs/assets/gmb_dashboard.png)

```mermaid
flowchart LR
    Customer["👤 Customer Scans QR Code"] --> Funnel{"⭐ Selects Star Rating"}
    Funnel -->|4 or 5 Stars| GoogleMaps["⭐ Redirected to Live Google Maps Listing"]
    Funnel -->|1 to 3 Stars| InternalQueue["📝 Buffered Internally for Support Resolution"]
    
    GoogleMaps --> LiveGMB["📍 Google Business Profile Review Published"]
    LiveGMB --> GroqAI["🤖 Groq AI Sentiment Engine"]
    GroqAI -->|Auto-Generated Response| AutoReply["💬 Empathetic Reply Published on Google"]
```

- **Smart QR Funnel**: Generate printable, location-branded QR codes. Customers rating 4-5 stars are forwarded to Google Maps, while dissatisfied customers (1-3 stars) submit private feedback to an internal resolution queue.
- **Groq AI Sentiment Auto-Reply**: Powered by **Groq LLaMA 3.3**, automatically generates personalized, star-calibrated responses:
  - **4-5 Stars**: Enthusiastic, brand-affirming gratitude.
  - **3 Stars**: Courteous appreciation with commitments to improve.
  - **1-2 Stars**: Empathetic, sincere apologies with direct escalations to management.
- **One-Click Reply All**: Clear backlogs by automatically drafting and publishing AI replies to all unreplied Google reviews in seconds.
- **GMB Local Updates Publisher**: Schedule and broadcast Google Posts with promotional photos and custom CTA buttons (Order Online, Book, Learn More).
- **GMB Performance Insights**: Track Google Maps queries, website clicks, call button clicks, and direction requests.

![Review Moderation Queue & Filters](./docs/assets/reviews_filter.png)

---

### 📺 7. YouTube Creator CRM & Channel Analytics
A signature YouTube Red analytics command center for video creators and agencies.

![YouTube Creator CRM](./docs/assets/youtube_crm.png)

- **Live Channel Metrics**: Real-time subscriber counts, lifetime views, engagement percentages, and watch time.
- **Automatic Shorts vs. Long-Form Classification**: Server-side video metadata analyzer separating YouTube Shorts from standard videos for accurate engagement benchmarks.
- **Month-over-Month (MoM) Growth Comparison**: Comparative analytics across custom date filters (7 Days, 30 Days, 90 Days, 1 Year, Lifetime).
- **Audience Demographics & Traffic Channels**: Deep dives into viewer age distribution, gender breakdown, top viewing geographies, and discovery sources.
- **Unified Video Comment Inbox**: Browse cards for all uploaded content; click any video to expand the full comment tree and send direct replies to viewers.

---

### 💼 8. LinkedIn Content Studio & Growth Hub
Manage personal personal branding and company page growth without context switching.

- **Profile & Company Page Switcher**: Toggle between personal creator profiles and managed organization pages.
- **Post Publishing & Scheduling Engine**: Schedule text posts, carousel articles, and media-rich updates with live preview.
- **AI Content Generator**: Generate compelling LinkedIn hooks, frameworks, and thought leadership posts using Groq AI.
- **AI Rewrite & Tone Tools**: Polish drafts with 1-click tone adjustments (Professional, Punchy, Storytelling), automated hashtag generators, and engaging Call-to-Action (CTA) closers.
- **Activity Feed & Comments**: Monitor recent post reactions and comments with quick-reply tools.

---

### 📧 9. Gmail Hub & Cold Email Outreach
Consolidate customer email communications and run outbound campaigns from one platform.

- **Multi-Account OAuth Sync**: Connect and manage multiple Google Workspace or personal Gmail addresses.
- **Threaded Reading Pane**: Clean, modern email client with search, label filtering (Inbox, Sent, Starred, Trash), and unread indicators.
- **AI Email Copilot**: Draft contextual replies, summarize lengthy email threads, and adjust response tones in real time.
- **Cold Email Outreach Campaigns**: Import prospect lists via CSV, inject personalization tags (`{{firstName}}`, `{{company}}`), attach marketing collateral (up to 15MB), and track real-time queue states (SENDING, PAUSED, CANCELLED).

---

### 📅 10. Google Calendar & Instant Google Meet Appointments
Automate client bookings and customer consultations.

- **Real-Time Calendar Sync**: Connect Google Calendar accounts with live two-way availability synchronization.
- **Instant Google Meet Link Generation**: Automatically generates and attaches a unique Google Meet video link upon booking.
- **Timezone-Aware Scheduling**: Full support for global timezones with default Indian Standard Time (IST / Asia/Kolkata) offsets.
- **Appointment Lifecycle**: Track statuses across `SCHEDULED`, `COMPLETED`, `CANCELLED`, and `NO_SHOW` with direct rescheduling options.

---

### 🔍 11. SEO Content Inspector & Google PageSpeed Auditor
Deliver enterprise-quality content and diagnose website performance bottlenecks.

- **AI Content Inspector**:
  - **AI vs. Human Probability**: Predicts whether a block of text was generated by AI models.
  - **Readability & Grade Scoring**: Computes Flesch-Kincaid grade level, word counts, sentence lengths, and reading time.
  - **Originality & Plagiarism Analysis**: Highlights repetitive phrases and generic robotic language.
  - **1-Click AI Humanizer**: Rewrites robotic AI copy into natural, engaging, human-sounding text across multiple tone presets.
- **Google PageSpeed Insights Auditor**:
  - Audit any URL for both **Mobile** and **Desktop**.
  - Measures Core Web Vitals: Largest Contentful Paint (LCP), First Contentful Paint (FCP), Total Blocking Time (TBT), and Cumulative Layout Shift (CLS).
  - Outlines concrete technical opportunities and passed diagnostic audits.

---

### 🔑 12. Developer Platform & Public REST API v1
Extend AutomationCRM into your existing backend systems or custom applications.

- **API Key Management**: Generate SHA-256 protected API keys with granular permission scopes (`all`, `read:leads`, `write:messages`, `read:analytics`).
- **Real-Time Telemetry Audit Log**: Live dashboard displaying every inbound external API call, latency in milliseconds (`latencyMs`), response status codes, caller IPs, and key prefixes.
- **Public REST API v1**:
  - `GET /api/v1/ping` - Health and authentication check.
  - `POST /api/v1/leads` - External lead ingestion endpoint.
  - `POST /api/v1/whatsapp/send` - Send outbound WhatsApp messages programmatically.
  - `GET /api/v1/analytics/overview` - Ingest CRM telemetry into external BI tools.

---

### 📊 13. Executive Reporting & Export Engine
Generate professional, branded reports for stakeholders and clients in one click.

- **Multi-Format Export**: Download analytics summaries in **CSV**, formatted **Excel (`.xlsx`)**, or branded **PDF** format.
- **Weekly & Monthly Rollups**: Automated aggregations of social engagement, WhatsApp conversions, ad spend, and review reputation metrics.

---

### 🏢 14. Super Admin & Multi-Tenant Control Plane
Manage multi-client agency setups with zero data leakage.

- **Strict Organization Isolation**: All database queries are filtered by `organizationId`.
- **Granular Module Toggles**: Enable or disable specific platform modules per organization (e.g., enable WhatsApp and GMB for Client A; enable YouTube and LinkedIn for Client B).
- **Role-Based Access Control**: Separate privileges for `super_admin` and organization staff/clients.

---

## 🛠️ Technology Stack

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | Next.js 14 (App Router), React 18 | High-performance server and client rendering |
| **Styling & UI** | Vanilla CSS Modules, Tailwind CSS, Lucide React | Clean, responsive, modern dark-mode aesthetics |
| **Visual Workflow Engine** | React Flow (`@xyflow/react`) | Interactive drag-and-drop node graph canvas |
| **Real-Time Layer** | Socket.IO (`socket.io-client` & `socket.io`) | Sub-millisecond bidirectional WebSocket communications |
| **Backend Framework** | Node.js, Express, TypeScript | Modular, type-safe REST API server |
| **Database & ORM** | PostgreSQL (Neon Serverless), Prisma ORM | Relational data persistence with strict schema migrations |
| **AI Inference** | Groq Cloud (LLaMA 3.3 70B & 8B), OpenAI API | High-speed sentiment analysis, RAG, and AI agent chat |
| **Media & CDN** | ImageKit.io SDK | High-speed media caching, image uploads, and document sync |
| **Document Generation** | PDFKit, ExcelJS, json2csv | Dynamic export of executive PDF, Excel, and CSV reports |
| **External Integrations** | Meta Cloud API, Google APIs, YouTube Data API, LinkedIn API | Official third-party channel connections |

---

## 📂 Project Directory Structure

```
automationcrm/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma              # Comprehensive PostgreSQL schema & models
│   ├── src/
│   │   ├── config/                    # Feature flags & environment configurations
│   │   ├── controllers/               # Webhook and route controllers
│   │   ├── middleware/                # API key auth, organization validation, error handlers
│   │   ├── routes/
│   │   │   ├── admin.ts               # Super admin & organization management
│   │   │   ├── aiAgent.ts             # AI agent configuration, RAG knowledge, leads & test sandbox
│   │   │   ├── apiKeys.ts             # Developer API key generation & telemetry logs
│   │   │   ├── appointments.ts        # Booking management & Google Meet rooms
│   │   │   ├── contentInspector.ts    # AI detector, plagiarism, readability & humanizer
│   │   │   ├── externalApiV1.ts       # Public developer REST API endpoints
│   │   │   ├── gmail.ts               # Gmail OAuth, threads, AI drafts, cold email campaigns
│   │   │   ├── gmb.ts                 # Google Business Profile reviews, posts & Groq auto-reply
│   │   │   ├── gmbPerformance.ts      # GMB search, call, and direction analytics
│   │   │   ├── googleAds.ts           # Google Ads API v17/18, PMax campaigns & GAQL metrics
│   │   │   ├── googleCalendar.ts      # Google Calendar two-way event synchronization
│   │   │   ├── instagramCommentToDm.ts# Instagram comment monitoring & direct DM triggers
│   │   │   ├── linkedin.ts            # LinkedIn posts, scheduler, AI writing & analytics
│   │   │   ├── messages.ts            # Live chat manual messaging & toggles
│   │   │   ├── metaAds.ts             # Meta Ads campaign launcher & ad set management
│   │   │   ├── reports.ts             # PDFKit, ExcelJS & CSV report generators
│   │   │   ├── seo.ts                 # Google PageSpeed Insights auditor
│   │   │   ├── webhook.ts             # Meta webhook verification & payload ingestion
│   │   │   ├── whatsappDrip.ts        # WhatsApp multi-step drip automation
│   │   │   ├── whatsappEmbedded.ts    # Meta Embedded Signup & multi-number routing
│   │   │   └── youtube.ts             # YouTube CRM, Shorts classifier & comment replies
│   │   ├── services/                  # Business logic services for all channel integrations
│   │   ├── utils/                     # Prisma singleton, logger, account resolvers
│   │   └── index.ts                   # Express server entry point & Socket.IO initialization
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/                 # Super Admin & Organization Management Portal
│   │   │   ├── ads/                   # Google Ads & Performance Max Analytics
│   │   │   ├── ai-agent/              # AI Agent Studio, Knowledge Base Trainer & Simulator
│   │   │   ├── appointments/          # Google Calendar & Meet Bookings Dashboard
│   │   │   ├── dashboard/             # Executive Overview & Unified Analytics
│   │   │   ├── flows/                 # Drag-and-Drop Chatbot Visual Flow Builder
│   │   │   ├── gmail/                 # Gmail Threaded Reading Pane & Cold Email Campaigner
│   │   │   ├── gmb/                   # Google Business Profile, Local Posts & AI Review Shield
│   │   │   ├── instagram/             # Instagram Direct Messaging & Comment Automations
│   │   │   ├── linkedin/              # LinkedIn Post Creator, Scheduler & AI Generator
│   │   │   ├── meta-ads/              # Meta Ads (Facebook & Instagram) Campaign Manager
│   │   │   ├── reviews/               # Smart QR Code Funnel & Google Maps Redirect
│   │   │   ├── settings/              # API Key Management, Telemetry & Organization Setup
│   │   │   ├── tools/                 # AI Content Inspector & PageSpeed SEO Auditor
│   │   │   ├── whatsapp/              # WhatsApp Omnichannel Live Chat & Drip Campaigns
│   │   │   └── youtube/               # YouTube Creator CRM & Analytics Hub
│   │   ├── components/                # Reusable UI cards, tables, modals & layout navigation
│   │   └── globals.css                # Custom styling, glassmorphism tokens & dark mode
│   ├── package.json
│   └── tsconfig.json
│
└── docs/
    └── assets/                        # High-resolution screenshots and architectural diagrams
```

---

## ⚙️ Environment Variables Reference

Create a `.env` file inside the `backend/` directory with the following variables:

```env
# ==============================================================================
# 🌐 CORE APPLICATION SETTINGS
# ==============================================================================
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_super_secret_jwt_key_here

# ==============================================================================
# 🗄️ DATABASE CONNECTION (PostgreSQL / Neon)
# ==============================================================================
DATABASE_URL="postgresql://user:password@ep-cool-pool-12345.us-east-2.aws.neon.tech/automationcrm?sslmode=require"
DIRECT_URL="postgresql://user:password@ep-cool-pool-12345.us-east-2.aws.neon.tech/automationcrm?sslmode=require"

# ==============================================================================
# 🤖 AI ENGINES (Groq & OpenAI)
# ==============================================================================
# Groq LLaMA 3.3 AI (Super fast sentiment analysis, humanizer & AI agent engine)
GROQ_KEY=gsk_your_groq_api_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here

# OpenAI (Optional fallback engine)
OPENAI_API_KEY=sk-proj-your_openai_api_key_here

# ==============================================================================
# 📱 META CLOUD API (WhatsApp, Instagram, Meta Ads)
# ==============================================================================
META_APP_ID=your_meta_app_id
META_APP_SECRET=your_meta_app_secret
META_SYSTEM_USER_TOKEN=your_permanent_system_user_access_token
WEBHOOK_VERIFY_TOKEN=your_custom_webhook_verify_token

# WhatsApp Defaults
DEFAULT_PHONE_NUMBER_ID=your_default_meta_phone_number_id
DEFAULT_WABA_ID=your_default_whatsapp_business_account_id

# Meta Ads
META_REDIRECT_URI=http://localhost:5000/api/meta/callback

# ==============================================================================
# 🔍 GOOGLE CLOUD ECOSYSTEM (Ads, GMB, YouTube, Gmail, Calendar, SEO)
# ==============================================================================
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/gmb/oauth/callback
GMAIL_REDIRECT_URI=http://localhost:5000/api/gmail/oauth/callback

# Google Ads API v17/18
GOOGLE_ADS_DEVELOPER_TOKEN=your_google_ads_developer_token
GOOGLE_ADS_CLIENT_CUSTOMER_ID=123-456-7890

# Google PageSpeed Insights & Public APIs
GOOGLE_PAGESPEED_API_KEY=your_google_cloud_api_key

# ==============================================================================
# 💼 LINKEDIN DEVELOPER PLATFORM
# ==============================================================================
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
LINKEDIN_REDIRECT_URI=http://localhost:5000/api/linkedin/auth/callback

# ==============================================================================
# 🖼️ IMAGEKIT CDN (Media Storage & Document Caching)
# ==============================================================================
IMAGEKIT_PUBLIC_KEY=public_your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=private_your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_account_id
```

---

## 🚀 Getting Started & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**
- **PostgreSQL Database** (e.g. free tier on [Neon.tech](https://neon.tech))
- **Meta & Google Developer Accounts** (for live channel testing)

---

### 2. Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env # or create .env using the template above

# 4. Generate Prisma Client & Push Database Schema
npx prisma generate
npx prisma db push

# 5. Start the backend development server
npm run dev
```

The backend server will launch on `http://localhost:5000` with WebSocket listeners active.

---

### 3. Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Configure local environment
# Create frontend/.env.local with:
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000

# 4. Start Next.js development server
npm run dev
```

The web dashboard will be accessible at `http://localhost:3000`.

---

### 4. Webhook Configuration (Local Testing)

To receive real-time webhooks from **Meta (WhatsApp & Instagram)** on your local machine:

```bash
# Expose port 5000 via ngrok or cloudflared
ngrok http 5000
```

1. Open the **Meta App Dashboard** -> **WhatsApp** -> **Configuration**.
2. Set Callback URL: `https://your-ngrok-domain.ngrok-free.app/api/webhook`.
3. Set Verify Token: The value defined in `WEBHOOK_VERIFY_TOKEN` in your `.env`.
4. Subscribe to the `messages` webhook field.

---

## 🛡️ Security & Multi-Tenant Isolation

- **Tenant Isolation**: Every database record is indexed and linked to an `Organization`. Requests include the `x-organization-id` header to ensure strict tenant boundary enforcement.
- **BigInt JSON Serialization**: High-precision IDs (e.g., Meta Phone Number IDs, Google Customer IDs) are safely serialized using a native prototype patch in `backend/src/index.ts`.
- **API Key Security**: Developer API keys are stored hashed, requiring bearer prefix authentication and scoped permissions (`apiKeyAuth` middleware).
- **Token Refresh Lifecycles**: Automatic token rotation for Google OAuth2, Gmail, and YouTube ensures continuous offline background sync without session disconnects.

---

## 📄 License & Attribution

Distributed under the **MIT License**.

Built with ❤️ for digital agencies, automated customer engagement, and high-velocity creator growth.
