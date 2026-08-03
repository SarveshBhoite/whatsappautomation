import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function patchWebDevFlow() {
  const activeFlow = await prisma.flow.findFirst({ where: { isActive: true } });
  if (!activeFlow) { console.error('No active flow'); process.exit(1); }

  const graph: any = activeFlow.graphJson;

  // ─── 1. Remove old linear web_dev chain edges ────────────────────────────
  const edgesToRemove = ['e_sm1', 'e_wd1', 'e_wd2', 'e_wd3'];
  graph.edges = graph.edges.filter((e: any) => !edgesToRemove.includes(e.id));
  console.log('Removed old edges:', edgesToRemove);

  // ─── 2. Transform web_dev_overview into a buttonsNode (type selector) ────
  const overviewNode = graph.nodes.find((n: any) => n.id === 'web_dev_overview');
  if (overviewNode) {
    overviewNode.type = 'buttonsNode';
    overviewNode.data = {
      label: 'Website Type Selection',
      text: '🌐 *JISNU Website Development Services*\n\nWe build professional websites tailored to your business needs.\n\nWhat type of website are you looking for?',
      buttons: [
        { id: 'btn_web_static', title: 'Static Website' },
        { id: 'btn_web_dynamic', title: 'Dynamic Website' },
        { id: 'btn_web_menu', title: 'Main Menu' },
      ],
    };
    console.log('Transformed web_dev_overview -> buttonsNode');
  }

  // ─── 3. Create Static Website info node ──────────────────────────────────
  const staticInfoNode = {
    id: 'web_static_info',
    type: 'textNode',
    data: {
      label: 'Static Website Info',
      text: `🖥️ *Static Website — Fast, Affordable & Clean*

📋 *What is a Static Website?*
A static website displays the same content to every visitor. Pages are pre-built HTML/CSS/JS files — no database, no server-side processing.

✅ *Best For:*
• Portfolio & personal websites
• Business landing pages
• Brochure / info websites
• Event pages & product catalogs

⚡ *Key Benefits:*
• ⚡ Super fast loading speed
• 🔒 More secure (no backend to attack)
• 💸 Lower hosting costs
• 🛠️ Easy maintenance
• 📱 Fully mobile responsive

💰 *JISNU Static Website Packages:*
• Basic (5 pages) — ₹8,000–₹12,000
• Standard (10 pages) — ₹12,000–₹18,000
• Premium (custom pages + SEO) — ₹18,000–₹28,000

⏱️ *Delivery:* 5–10 working days
📍 Wakad, Pimpri-Chinchwad Pune, Maharashtra 411057`,
    },
    position: { x: 100, y: 1500 },
    width: 430,
    height: 120,
  };

  // ─── 4. Create Dynamic Website info node ─────────────────────────────────
  const dynamicInfoNode = {
    id: 'web_dynamic_info',
    type: 'textNode',
    data: {
      label: 'Dynamic Website Info',
      text: `⚙️ *Dynamic Website — Powerful, Scalable & Interactive*

📋 *What is a Dynamic Website?*
A dynamic website generates content in real-time based on user actions, database queries, or admin inputs. Built with backend frameworks like Node.js, PHP, or Python.

✅ *Best For:*
• E-commerce stores (product catalog, cart, orders)
• Business portals & dashboards
• Booking & appointment systems
• Blogs, news & content platforms
• CRM & lead management tools

⚡ *Key Benefits:*
• 🧠 Smart, interactive user experience
• 🛒 Full e-commerce functionality
• 👤 User login & personalisation
• 🗄️ Database-driven content
• 📊 Admin panel & analytics
• 🔄 Auto-updating content

💰 *JISNU Dynamic Website Packages:*
• Standard E-Commerce — ₹25,000–₹45,000
• Business Portal — ₹35,000–₹60,000
• Custom Web App — ₹60,000–₹1,50,000+

⏱️ *Delivery:* 15–45 working days
📍 Wakad, Pimpri-Chinchwad Pune, Maharashtra 411057`,
    },
    position: { x: 600, y: 1500 },
    width: 430,
    height: 120,
  };

  // ─── 5. Create shared consult button node for website ────────────────────
  const webConsultNode = {
    id: 'web_type_consult_btn',
    type: 'buttonsNode',
    data: {
      label: 'Website Consult CTA',
      text: '🚀 Ready to build your website with JISNU Digital Solutions?\n\nBook a FREE consultation and get a custom quote!',
      buttons: [
        { id: 'btn_wb_book', title: 'Book Free Consult' },
        { id: 'btn_wb_price', title: 'View Pricing' },
        { id: 'btn_wb_menu', title: 'Main Menu' },
      ],
    },
    position: { x: 350, y: 1750 },
    width: 430,
    height: 120,
  };

  // Remove existing nodes if they exist
  graph.nodes = graph.nodes.filter((n: any) => !['web_static_info', 'web_dynamic_info', 'web_type_consult_btn'].includes(n.id));
  graph.nodes.push(staticInfoNode, dynamicInfoNode, webConsultNode);
  console.log('Added nodes: web_static_info, web_dynamic_info, web_type_consult_btn');

  // ─── 6. Add new edges ────────────────────────────────────────────────────
  const newEdges = [
    // services_menu -> web_dev_overview (type selector)
    { id: 'e_sm1', source: 'services_menu', target: 'web_dev_overview', sourceHandle: 'btn_web_dev' },
    // web_dev_overview buttons -> branches
    { id: 'e_wd_static', source: 'web_dev_overview', target: 'web_static_info',   sourceHandle: 'btn_web_static' },
    { id: 'e_wd_dynamic', source: 'web_dev_overview', target: 'web_dynamic_info', sourceHandle: 'btn_web_dynamic' },
    { id: 'e_wd_menu',   source: 'web_dev_overview', target: 'main_menu',         sourceHandle: 'btn_web_menu' },
    // static/dynamic -> shared consult button
    { id: 'e_wd_s_cta',  source: 'web_static_info',  target: 'web_type_consult_btn' },
    { id: 'e_wd_d_cta',  source: 'web_dynamic_info', target: 'web_type_consult_btn' },
    // consult button -> actions
    { id: 'e_wd_book',   source: 'web_type_consult_btn', target: 'lead_form_name', sourceHandle: 'btn_wb_book' },
    { id: 'e_wd_price',  source: 'web_type_consult_btn', target: 'web_dev_pricing', sourceHandle: 'btn_wb_price' },
    { id: 'e_wd_menu2',  source: 'web_type_consult_btn', target: 'main_menu',       sourceHandle: 'btn_wb_menu' },
  ];

  for (const edge of newEdges) {
    graph.edges = graph.edges.filter((e: any) => e.id !== edge.id);
    graph.edges.push({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#6366f1', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed', color: '#6366f1' },
    });
    console.log(`Added edge: ${edge.source} -> ${edge.target}`);
  }

  // ─── 7. Save to DB ────────────────────────────────────────────────────────
  await prisma.flow.update({ where: { id: activeFlow.id }, data: { graphJson: graph } });
  console.log('\n✅ Website Development sub-flow patched successfully!');
  console.log('Flow: services_menu → web_dev_overview (Static/Dynamic/Menu)');
  console.log('       → web_static_info → web_type_consult_btn');
  console.log('       → web_dynamic_info → web_type_consult_btn');

  process.exit(0);
}

patchWebDevFlow().catch(err => { console.error(err); process.exit(1); });
