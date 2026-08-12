import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function patchMediaIds() {
  const activeFlow = await prisma.flow.findFirst({ where: { isActive: true } });
  if (!activeFlow) { console.log('No active flow'); return; }
  const graph: any = activeFlow.graphJson;
  
  // Use raw numeric Meta Media IDs — no prefix, no upload needed
  const ids: Record<string, string> = {
    'seo_result_media_1': '1868110550830190',
    'seo_result_media_2': '2707013109680980',
    'seo_result_media_3': '4475117349472559',
  };
  
  for (const node of graph.nodes) {
    if (ids[node.id]) {
      node.data.mediaUrl = ids[node.id];
      console.log(`Updated ${node.id} -> ${ids[node.id]}`);
    }
  }
  
  await prisma.flow.update({ where: { id: activeFlow.id }, data: { graphJson: graph } });
  console.log('Done. Media node URLs now use raw Meta Media IDs.');
  process.exit(0);
}

patchMediaIds().catch(err => { console.error(err); process.exit(1); });
