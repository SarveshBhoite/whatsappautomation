import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function patchAdsFlow() {
  const activeFlow = await prisma.flow.findFirst({ where: { isActive: true } });
  if (!activeFlow) { console.error('No active flow'); process.exit(1); }
  
  const graph: any = activeFlow.graphJson;

  // Raw Meta Media IDs (freshly uploaded)
  const adsMediaIds = [
    { nodeId: 'ads_result_media_1', mediaId: '1028743320050147', caption: '📊 Live Meta Ads Dashboard: Real campaigns running for our clients — 72 messaging conversations' },
    { nodeId: 'ads_result_media_2', mediaId: '1592917125513711', caption: '🏠 Real Estate (Saffron Realty) — 15 Day Campaign: 85 leads at just ₹5.98/lead, 5,696 reach' },
    { nodeId: 'ads_result_media_3', mediaId: '1040680981879518', caption: '🚗 Car Rental — 60 Day Campaign: 267 leads, 22,052 reach at ₹15.86/lead via Meta Ads' },
    { nodeId: 'ads_result_media_4', mediaId: '2464660980696163', caption: '💻 Data Engineering Courses — 20 Day Campaign: High quality leads, 87,849 impressions' },
    { nodeId: 'ads_result_media_5', mediaId: '1540640186911682', caption: '🏗️ Real Estate (Saffron Realty) — 264 results across 3 campaigns at avg ₹6.11/result' },
  ];

  // 1. Remove old direct edge: ads_overview -> ads_action_btns
  graph.edges = graph.edges.filter((e: any) => e.id !== 'e_m_ads1');
  console.log('Removed old edge: ads_overview -> ads_action_btns');

  // 2. Add 5 new mediaNodes
  for (let i = 0; i < adsMediaIds.length; i++) {
    const { nodeId, mediaId, caption } = adsMediaIds[i];
    const newNode = {
      id: nodeId,
      type: 'mediaNode',
      data: {
        label: `Ads Result ${i + 1}`,
        mediaType: 'image',
        mediaUrl: mediaId,
        caption,
        platform: 'whatsapp',
      },
      position: { x: 750, y: 990 + i * 170 },
      width: 430,
      height: 101,
    };
    // Remove existing node if it exists
    graph.nodes = graph.nodes.filter((n: any) => n.id !== nodeId);
    graph.nodes.push(newNode);
    console.log(`Added node: ${nodeId}`);
  }

  // 3. Add edges chaining: ads_overview -> m1 -> m2 -> m3 -> m4 -> m5 -> ads_action_btns
  const newEdges = [
    { id: 'e_m_ads1',  source: 'ads_overview',      target: 'ads_result_media_1' },
    { id: 'e_m_ads2',  source: 'ads_result_media_1', target: 'ads_result_media_2' },
    { id: 'e_m_ads3',  source: 'ads_result_media_2', target: 'ads_result_media_3' },
    { id: 'e_m_ads4',  source: 'ads_result_media_3', target: 'ads_result_media_4' },
    { id: 'e_m_ads5',  source: 'ads_result_media_4', target: 'ads_result_media_5' },
    { id: 'e_m_ads6',  source: 'ads_result_media_5', target: 'ads_action_btns' },
  ];

  for (const edge of newEdges) {
    // Remove any existing edge with same id
    graph.edges = graph.edges.filter((e: any) => e.id !== edge.id);
    graph.edges.push({
      ...edge,
      type: 'smoothstep',
      animated: true,
      style: { stroke: '#10b981', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed', color: '#10b981' },
    });
    console.log(`Added edge: ${edge.source} -> ${edge.target}`);
  }

  // 4. Update the ads_action_btns node text to mention ads proof
  const actionBtn = graph.nodes.find((n: any) => n.id === 'ads_action_btns');
  if (actionBtn) {
    actionBtn.data.text = '🚀 Want results like these for YOUR business?\n\nLet\'s run a high-ROI Google or Meta Ads campaign for you!';
  }

  // 5. Save updated graph to DB
  await prisma.flow.update({ where: { id: activeFlow.id }, data: { graphJson: graph } });
  console.log('\n✅ Ads flow patched successfully with 5 proof-of-work images!');

  process.exit(0);
}

patchAdsFlow().catch(err => { console.error(err); process.exit(1); });
