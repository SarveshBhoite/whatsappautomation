import prisma from "../utils/prisma";
import { WhatsAppService } from "./whatsappService";

interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

interface FlowNode {
  id: string;
  type: string; // "welcomeNode" | "textNode" | "buttonsNode" | "listNode" | "questionNode"
  data: {
    text?: string;
    mediaUrl?: string;
    mediaType?: "image" | "document" | "video" | "audio";
    filename?: string;
    buttons?: { id: string; title: string }[];
    listButtonText?: string;
    listSections?: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[];
    variableName?: string; // e.g. "email"
    validationPattern?: string; // regex pattern
  };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // Maps to button ID or list row ID
}

export async function processChatbotFlow(conversationId: string, incomingMessageId: string) {
  try {
    // 1. Fetch Conversation and Message
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { organization: { include: { waConfig: true } } },
    });

    const message = await prisma.message.findUnique({
      where: { id: incomingMessageId },
    });

    if (!conversation || !message || conversation.isBotPaused) {
      return;
    }

    const waConfig = conversation.organization.waConfig;
    if (!waConfig || !waConfig.phoneNumberId || !waConfig.accessToken) {
      console.warn(`WhatsApp credentials missing for conversation ${conversationId}`);
      return;
    }

    // 2. Fetch the Active Flow for the Organization
    const activeFlow = await prisma.flow.findFirst({
      where: { organizationId: conversation.organizationId, isActive: true },
    });

    if (!activeFlow) {
      console.log(`No active flow found for organization ${conversation.organizationId}`);
      return;
    }

    const graph: FlowGraph = activeFlow.graphJson as unknown as FlowGraph;
    if (!graph || !graph.nodes || graph.nodes.length === 0) {
      return;
    }

    let nextNodeId: string | null = null;
    const currentNodeId = conversation.currentNodeId;

    // 3. Traversal Logic: Determine next node ID
    if (!currentNodeId) {
      // First contact: Start at the Root node (usually type "welcomeNode" or the first node with no incoming edges)
      const rootNode = findRootNode(graph);
      if (rootNode) {
        nextNodeId = rootNode.id;
      }
    } else {
      const currentNode = graph.nodes.find((n) => n.id === currentNodeId);
      
      if (currentNode) {
        if (currentNode.type === "buttonsNode" || currentNode.type === "listNode") {
          // Interactive Nodes: Match user selection
          const userResponseText = message.content.toLowerCase().trim();
          
          // Check if there's an edge from current node matching user input
          const matchingEdge = graph.edges.find((edge) => {
            if (edge.source !== currentNode.id) return false;
            
            // Match by button ID (sourceHandle) or button title
            if (currentNode.type === "buttonsNode") {
              const matchingBtn = currentNode.data.buttons?.find(
                (btn) => btn.id === edge.sourceHandle || btn.title.toLowerCase().trim() === userResponseText
              );
              return matchingBtn?.id === edge.sourceHandle;
            } else {
              // List menu item matching
              const allRows = currentNode.data.listSections?.flatMap((sec) => sec.rows) || [];
              const matchingRow = allRows.find(
                (row) => row.id === edge.sourceHandle || row.title.toLowerCase().trim() === userResponseText
              );
              return matchingRow?.id === edge.sourceHandle;
            }
          });

          if (matchingEdge) {
            nextNodeId = matchingEdge.target;
          } else {
            // Did not match options, re-send options (optionally notify client)
            await sendNodeMessage(waConfig.phoneNumberId, waConfig.accessToken, conversation.customerPhone, currentNode);
            return;
          }
        } else if (currentNode.type === "questionNode") {
          // Input Node: Save response to Database metadata or contact record
          const answer = message.content;
          const variableName = currentNode.data.variableName || "last_input";

          console.log(`Saved variable [${variableName}] = "${answer}" for conversation ${conversationId}`);
          
          // Future: Save variables to contact fields
          // For now, follow the single outgoing edge
          const outgoingEdge = graph.edges.find((e) => e.source === currentNode.id);
          if (outgoingEdge) {
            nextNodeId = outgoingEdge.target;
          }
        } else {
          // Static text nodes/media nodes (if they didn't pause, which they shouldn't)
          const outgoingEdge = graph.edges.find((e) => e.source === currentNode.id);
          if (outgoingEdge) {
            nextNodeId = outgoingEdge.target;
          }
        }
      }
    }

    // 4. Execute Next Node
    if (nextNodeId) {
      await executeNodeChain(waConfig.phoneNumberId, waConfig.accessToken, conversation.customerPhone, nextNodeId, graph, conversationId);
    }
  } catch (error) {
    console.error("Error in flow engine execution:", error);
  }
}

// Recursively execute nodes that do not wait for input (e.g. TextNode -> MediaNode -> ButtonsNode)
async function executeNodeChain(
  phoneNumberId: string,
  accessToken: string,
  customerPhone: string,
  nodeId: string,
  graph: FlowGraph,
  conversationId: string
) {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node) return;

  // Save progress state in conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { currentNodeId: nodeId },
  });

  // Send the node's configured message
  await sendNodeMessage(phoneNumberId, accessToken, customerPhone, node);

  // If node type is static (Text or Media node), we can transition immediately
  if (node.type === "textNode" || node.type === "mediaNode" || node.type === "welcomeNode") {
    const outgoingEdge = graph.edges.find((e) => e.source === node.id);
    if (outgoingEdge) {
      // Small delay for natural pacing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await executeNodeChain(phoneNumberId, accessToken, customerPhone, outgoingEdge.target, graph, conversationId);
    }
  }
}

// Identify starting welcome or orphaned node
function findRootNode(graph: FlowGraph): FlowNode | null {
  const welcomeNode = graph.nodes.find((n) => n.type === "welcomeNode");
  if (welcomeNode) return welcomeNode;

  // Fallback: Find a node with no incoming edges
  const targetNodeIds = new Set(graph.edges.map((e) => e.target));
  const orphanNode = graph.nodes.find((n) => !targetNodeIds.has(n.id));
  return orphanNode || graph.nodes[0] || null;
}

// Call WhatsAppService based on node configuration
async function sendNodeMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  node: FlowNode
) {
  const data = node.data;
  
  if (node.type === "textNode" || node.type === "welcomeNode" || node.type === "questionNode") {
    const text = data.text || "No text defined.";
    await WhatsAppService.sendTextMessage(phoneNumberId, accessToken, to, text);
  } else if (node.type === "mediaNode") {
    const text = data.text || "";
    const mediaUrl = data.mediaUrl || "";
    const mediaType = data.mediaType || "image";
    await WhatsAppService.sendMediaMessage(phoneNumberId, accessToken, to, mediaType, mediaUrl, data.filename);
  } else if (node.type === "buttonsNode") {
    const text = data.text || "Select an option:";
    const buttons = data.buttons || [];
    await WhatsAppService.sendButtonMessage(phoneNumberId, accessToken, to, text, buttons);
  } else if (node.type === "listNode") {
    const text = data.text || "Choose from the menu:";
    const buttonText = data.listButtonText || "View Menu";
    const sections = data.listSections || [];
    await WhatsAppService.sendListMessage(phoneNumberId, accessToken, to, text, buttonText, sections);
  }
}
