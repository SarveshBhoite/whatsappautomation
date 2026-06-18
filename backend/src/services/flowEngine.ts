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
    caption?: string;
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
          
          if (currentNode.type === "buttonsNode") {
            const matchingBtn = currentNode.data.buttons?.find(
              (btn) => btn.title.toLowerCase().trim() === userResponseText
            );
            if (matchingBtn) {
              const matchingEdge = graph.edges.find(
                (edge) => edge.source === currentNode.id && edge.sourceHandle === matchingBtn.id
              );
              if (matchingEdge) {
                nextNodeId = matchingEdge.target;
              }
            }
          } else {
            // List menu item matching
            const allRows = currentNode.data.listSections?.flatMap((sec) => sec.rows) || [];
            const matchingRow = allRows.find(
              (row) => row.title.toLowerCase().trim() === userResponseText
            );
            if (matchingRow) {
              const matchingEdge = graph.edges.find(
                (edge) => edge.source === currentNode.id && edge.sourceHandle === matchingRow.id
              );
              if (matchingEdge) {
                nextNodeId = matchingEdge.target;
              }
            }
          }

          if (!nextNodeId) {
            // Did not match options, re-send options (optionally notify client)
            await sendNodeMessage(waConfig.phoneNumberId, waConfig.accessToken, conversation.customerPhone, currentNode, conversationId, conversation.organizationId);
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
      await executeNodeChain(waConfig.phoneNumberId, waConfig.accessToken, conversation.customerPhone, nextNodeId, graph, conversationId, conversation.organizationId);
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
  conversationId: string,
  organizationId: string
) {
  const node = graph.nodes.find((n) => n.id === nodeId);
  if (!node) return;

  // Save progress state in conversation
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { currentNodeId: nodeId },
  });

  // Send the node's configured message
  await sendNodeMessage(phoneNumberId, accessToken, customerPhone, node, conversationId, organizationId);

  // If node type is static (Text or Media node), we can transition immediately
  if (node.type === "textNode" || node.type === "mediaNode" || node.type === "welcomeNode") {
    const outgoingEdge = graph.edges.find((e) => e.source === node.id);
    if (outgoingEdge) {
      // Small delay for natural pacing
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await executeNodeChain(phoneNumberId, accessToken, customerPhone, outgoingEdge.target, graph, conversationId, organizationId);
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

// Call WhatsAppService based on node configuration and save message to DB
async function sendNodeMessage(
  phoneNumberId: string,
  accessToken: string,
  to: string,
  node: FlowNode,
  conversationId: string,
  organizationId: string
) {
  const data = node.data;
  let content = "";
  let messageType = "text";
  let responseData: any = null;

  try {
    if (node.type === "textNode" || node.type === "welcomeNode" || node.type === "questionNode") {
      content = data.text || "No text defined.";
      messageType = "text";
      responseData = await WhatsAppService.sendTextMessage(phoneNumberId, accessToken, to, content);
    } else if (node.type === "mediaNode") {
      const type = data.mediaType || "image";
      const url = data.mediaUrl || "";
      const filename = data.filename || "";
      const caption = data.caption || "";
      
      messageType = type;
      responseData = await WhatsAppService.sendMediaMessage(
        phoneNumberId,
        accessToken,
        to,
        type as any,
        url,
        filename,
        caption
      );
      
      // Construct content format for database saving
      if (type === "document") {
        content = `${filename || "document.pdf"}|${url}`;
      } else {
        content = url;
      }
      if (caption) {
        content += `|caption:${caption}`;
      }
    } else if (node.type === "buttonsNode") {
      content = data.text || "Select an option:";
      messageType = "buttonsNode";
      const buttons = data.buttons || [];
      responseData = await WhatsAppService.sendButtonMessage(phoneNumberId, accessToken, to, content, buttons);
      // Format content to include button info for frontend rendering
      const btnTitles = buttons.map(b => b.title).join(", ");
      content = `${content}|buttons:${btnTitles}`;
    } else if (node.type === "listNode") {
      content = data.text || "Choose from the menu:";
      messageType = "listNode";
      const buttonText = data.listButtonText || "View Menu";
      const sections = data.listSections || [];
      responseData = await WhatsAppService.sendListMessage(phoneNumberId, accessToken, to, content, buttonText, sections);
      content = `${content}|list:${buttonText}`;
    }

    const waMessageId = responseData?.messages?.[0]?.id || null;

    // Save outbound message to Database
    const savedMsg = await prisma.message.create({
      data: {
        conversationId,
        direction: "outbound",
        messageType,
        content,
        waMessageId,
        status: "sent",
        senderName: "Bot",
      },
    });

    // Lazy load socket server to emit to client dashboard instantly
    const { io } = require("../index");
    io.to(organizationId).emit("new-message", {
      conversationId,
      message: savedMsg,
    });
  } catch (err: any) {
    console.error(`Failed to send flow node message ${node.id} to ${to}:`, err.message);
  }
}
