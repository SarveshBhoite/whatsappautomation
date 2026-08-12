import prisma from '../src/utils/prisma';

async function updateFlowUrlsToImageKit() {
  const activeFlow = await prisma.flow.findFirst({ where: { isActive: true } });
  if (!activeFlow) {
    console.error('No active flow found in database');
    process.exit(1);
  }

  const graph: any = activeFlow.graphJson;
  const imageKitBase = 'https://ik.imagekit.io/automationjds/';

  const map: Record<string, string> = {
    seo_result_media_1: 'seo_result_1.jpg',
    seo_result_media_2: 'seo_result_2.jpg',
    seo_result_media_3: 'seo_result_3.jpg',
    ads_result_media_1: 'ads_result_1.jpg',
    ads_result_media_2: 'ads_result_2.jpg',
    ads_result_media_3: 'ads_result_3.jpg',
    ads_result_media_4: 'ads_result_4.jpg',
    ads_result_media_5: 'ads_result_5.jpg',
    static_web_media_1: 'static_web_proof_1.png',
    static_web_media_2: 'static_web_proof_2.png',
    dynamic_web_media_1: 'dynamic_web_proof_1.png',
    dynamic_web_media_2: 'dynamic_web_proof_2.png',
  };

  let count = 0;
  graph.nodes = graph.nodes.map((n: any) => {
    if (map[n.id]) {
      n.data.mediaUrl = `${imageKitBase}${map[n.id]}`;
      count++;
      console.log(`Updated node [${n.id}] -> ${n.data.mediaUrl}`);
    } else if (n.type === 'mediaNode' && typeof n.data?.mediaUrl === 'string' && n.data.mediaUrl.startsWith('/uploads/')) {
      const filename = n.data.mediaUrl.replace('/uploads/', '');
      n.data.mediaUrl = `${imageKitBase}${filename}`;
      count++;
      console.log(`Updated generic media node [${n.id}] -> ${n.data.mediaUrl}`);
    }
    return n;
  });

  await prisma.flow.update({
    where: { id: activeFlow.id },
    data: { graphJson: graph },
  });

  console.log(`\n✅ Successfully updated ${count} media nodes to use ImageKit CDN (${imageKitBase})!`);
  await prisma.$disconnect();
  process.exit(0);
}

updateFlowUrlsToImageKit().catch((err) => {
  console.error('Error updating flow URLs:', err);
  process.exit(1);
});
