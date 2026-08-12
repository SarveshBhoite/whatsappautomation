import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function removeViewPricing() {
  const activeFlow = await prisma.flow.findFirst({ where: { isActive: true } });
  if (!activeFlow) {
    console.error('No active flow found');
    process.exit(1);
  }

  const graph: any = activeFlow.graphJson;

  // 1. Update web_type_consult_btn node to only have 2 buttons: "Book Free Consult" and "Main Menu"
  const consultNode = graph.nodes.find((n: any) => n.id === 'web_type_consult_btn');
  if (consultNode) {
    consultNode.data.buttons = [
      { id: 'btn_wb_book', title: 'Book Free Consult' },
      { id: 'btn_wb_menu', title: 'Main Menu' }
    ];
    console.log('Updated buttons in web_type_consult_btn (removed View Pricing)');
  }

  // 2. Remove the e_wd_price edge that pointed to web_dev_pricing
  const initialEdgeCount = graph.edges.length;
  graph.edges = graph.edges.filter((e: any) => e.id !== 'e_wd_price' && e.sourceHandle !== 'btn_wb_price');
  console.log(`Removed ${initialEdgeCount - graph.edges.length} edge(s) associated with View Pricing.`);

  // 3. Save graph back to database
  await prisma.flow.update({ where: { id: activeFlow.id }, data: { graphJson: graph } });
  console.log('✅ Flow saved successfully!');

  await prisma.$disconnect();
  process.exit(0);
}

removeViewPricing().catch(err => { console.error(err); process.exit(1); });
