import { WhatsAppService } from '../src/services/whatsappService';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function uploadAndPatchDynamicWebFlow() {
  const waConfig = await prisma.whatsAppConfig.findFirst();
  if (!waConfig?.phoneNumberId || !waConfig?.accessToken) {
    console.error('No WhatsApp config found');
    process.exit(1);
  }

  const images = [
    { file: '/uploads/dynamic_web_proof_1.png', label: 'JISNU Digital Web Portal', caption: '⚙️ Dynamic Website Proof 1: JISNU Digital Web Portal (Interactive Business Directory & Category Platform)' },
    { file: '/uploads/dynamic_web_proof_2.png', label: 'Evenizers Premium Events', caption: '⚙️ Dynamic Website Proof 2: Evenizers (E-commerce & Custom Event Booking Platform)' }
  ];

  const mediaIds: string[] = [];

  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    console.log(`Uploading dynamic web image ${i + 1}/${images.length}: ${img.file}`);
    const mediaId = await WhatsAppService.uploadMedia(waConfig.phoneNumberId, waConfig.accessToken, img.file, 'image/png');
    if (mediaId) {
      mediaIds.push(mediaId);
      console.log(`  ✅ dynamic_web_proof_${i + 1} -> Meta ID: ${mediaId}`);
    } else {
      console.error(`  ❌ Failed to upload ${img.file}`);
      mediaIds.push('');
    }
  }

  const activeFlow = await prisma.flow.findFirst({ where: { isActive: true } });
  if (!activeFlow) { console.error('No active flow'); process.exit(1); }

  const graph: any = activeFlow.graphJson;

  // 1. Remove old edge: web_dynamic_info -> web_type_consult_btn
  graph.edges = graph.edges.filter((e: any) => e.id !== 'e_wd_d_cta');

  // 2. Add mediaNodes for the dynamic website proof images
  const proofNodes = [
    {
      id: 'dynamic_web_media_1',
      type: 'mediaNode',
      data: {
        label: 'Dynamic Web Proof 1',
        mediaType: 'image',
        mediaUrl: mediaIds[0],
        caption: images[0].caption,
        platform: 'whatsapp',
      },
      position: { x: 600, y: 1650 },
      width: 430,
      height: 101,
    },
    {
      id: 'dynamic_web_media_2',
      type: 'mediaNode',
      data: {
        label: 'Dynamic Web Proof 2',
        mediaType: 'image',
        mediaUrl: mediaIds[1],
        caption: images[1].caption,
        platform: 'whatsapp',
      },
      position: { x: 600, y: 1800 },
      width: 430,
      height: 101,
    }
  ];

  for (const node of proofNodes) {
    graph.nodes = graph.nodes.filter((n: any) => n.id !== node.id);
    graph.nodes.push(node);
    console.log(`Added node: ${node.id}`);
  }

  // 3. Add edges: web_dynamic_info -> dynamic_web_media_1 -> dynamic_web_media_2 -> web_type_consult_btn
  const newEdges = [
    { id: 'e_wd_d_m1', source: 'web_dynamic_info', target: 'dynamic_web_media_1' },
    { id: 'e_wd_d_m2', source: 'dynamic_web_media_1', target: 'dynamic_web_media_2' },
    { id: 'e_wd_d_cta', source: 'dynamic_web_media_2', target: 'web_type_consult_btn' },
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

  await prisma.flow.update({ where: { id: activeFlow.id }, data: { graphJson: graph } });
  console.log('\n✅ Dynamic Website flow updated with proof of work images!');

  await prisma.$disconnect();
  process.exit(0);
}

uploadAndPatchDynamicWebFlow().catch(err => { console.error(err); process.exit(1); });
