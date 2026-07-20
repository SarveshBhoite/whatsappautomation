import axios from "axios";

interface FlowNode {
  id: string;
  type: string;
  data: any;
  position?: { x: number; y: number };
}

interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
}

interface FlowGraph {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

/**
 * Automaticaly calculates node coordinates for React Flow tree visual rendering.
 * Nodes are arranged vertically by parent-child level, and horizontally spaced to avoid overlaps.
 */
export function autoLayoutFlow(nodes: FlowNode[], edges: FlowEdge[]): FlowNode[] {
  if (nodes.length === 0) return [];

  // Find root node (type "welcomeNode" or a node with no incoming edges)
  const incoming = new Set(edges.map(e => e.target));
  let root = nodes.find(n => n.type === "welcomeNode");
  if (!root) {
    root = nodes.find(n => !incoming.has(n.id));
  }
  if (!root) {
    root = nodes[0];
  }

  // BFS to calculate levels
  const nodeLevels: { [id: string]: number } = {};
  nodeLevels[root.id] = 0;

  const queue: string[] = [root.id];
  const visited = new Set<string>([root.id]);

  // Build adjacency list for fast lookup
  const adj: { [id: string]: string[] } = {};
  nodes.forEach(n => { adj[n.id] = []; });
  edges.forEach(e => {
    if (adj[e.source]) {
      adj[e.source].push(e.target);
    }
  });

  while (queue.length > 0) {
    const curr = queue.shift()!;
    const level = nodeLevels[curr];
    const neighbors = adj[curr] || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        nodeLevels[neighbor] = level + 1;
        queue.push(neighbor);
      }
    }
  }

  // Assign maxLevel + 1 to any disconnected nodes
  let maxLevel = Math.max(...Object.values(nodeLevels), 0);
  nodes.forEach(n => {
    if (nodeLevels[n.id] === undefined) {
      maxLevel += 1;
      nodeLevels[n.id] = maxLevel;
    }
  });

  // Group nodes by level
  const levels: { [level: number]: FlowNode[] } = {};
  nodes.forEach(node => {
    const lvl = nodeLevels[node.id];
    if (!levels[lvl]) levels[lvl] = [];
    levels[lvl].push(node);
  });

  // Layout geometry parameters
  const H_SPACING = 300;
  const V_SPACING = 220;
  const CENTER_X = 250;
  const START_Y = 50;

  const result: FlowNode[] = [];
  const levelKeys = Object.keys(levels).map(Number).sort((a, b) => a - b);

  for (const lvl of levelKeys) {
    const lvlNodes = levels[lvl];
    const count = lvlNodes.length;
    const y = START_Y + lvl * V_SPACING;

    if (count === 1) {
      lvlNodes[0].position = { x: CENTER_X, y };
      result.push(lvlNodes[0]);
    } else {
      const totalWidth = (count - 1) * H_SPACING;
      const startX = CENTER_X - totalWidth / 2;
      lvlNodes.forEach((node, index) => {
        node.position = { x: startX + index * H_SPACING, y };
        result.push(node);
      });
    }
  }

  return result;
}

/**
 * Validates the logical flow graph against node schemas and structural bounds.
 * Returns null if valid, or a string error message if invalid.
 */
function validateGraphJson(graph: any, platform: string): string | null {
  if (!graph || typeof graph !== "object") {
    console.error("Validation failed: Graph response is not an object.");
    return "Validation failed: Graph response is not a valid JSON object";
  }
  
  if (!Array.isArray(graph.nodes)) {
    console.error("Validation failed: 'nodes' array is missing.");
    return "Validation failed: 'nodes' array is missing or not an array";
  }
  
  if (!Array.isArray(graph.edges)) {
    console.error("Validation failed: 'edges' array is missing.");
    return "Validation failed: 'edges' array is missing or not an array";
  }

  const validNodeTypes = ["welcomeNode", "textNode", "buttonsNode", "listNode", "questionNode", "mediaNode"];
  const nodeIds = new Set<string>();

  // 1. Validate Nodes
  for (const node of graph.nodes) {
    console.log("Validating node:", JSON.stringify(node, null, 2));

    if (!node || typeof node !== "object") {
      console.error("Validation failed: A node entry is null or not an object.");
      return "Validation failed: A node entry in the list is null or not a valid object";
    }
    
    if (!node.id || typeof node.id !== "string") {
      console.error("Validation failed: A node is missing a string ID.", JSON.stringify(node));
      return "Validation failed: A node is missing a valid string 'id'";
    }
    
    if (nodeIds.has(node.id)) {
      console.error(`Validation failed: Duplicate node ID detected: ${node.id}`);
      return `Validation failed: Duplicate node ID detected: '${node.id}'`;
    }
    nodeIds.add(node.id);

    if (!node.type) {
      console.error(`Validation failed: Node ${node.id} is missing a type.`);
      return `Validation failed: Node '${node.id}' is missing a 'type' property`;
    }

    if (!validNodeTypes.includes(node.type)) {
      console.error(`Validation failed: Node ${node.id} has invalid type: ${node.type}`);
      return `Validation failed: Node '${node.id}' has invalid/unsupported type '${node.type}' (Valid types: ${validNodeTypes.join(", ")})`;
    }

    if (!node.data || typeof node.data !== "object") {
      console.error(`Validation failed: Node ${node.id} is missing 'data' object.`);
      return `Validation failed: Node '${node.id}' is missing the required 'data' object`;
    }

    // Buttons count check
    if (node.type === "buttonsNode") {
      const buttons = node.data.buttons;
      if (!Array.isArray(buttons)) {
        console.error(`Validation failed: Node ${node.id} (buttonsNode) is missing 'buttons' array.`);
        return `Validation failed: Node '${node.id}' (buttonsNode) is missing 'buttons' array in 'data'`;
      }
      const limit = platform === "whatsapp" ? 3 : 13;
      if (buttons.length > limit) {
        console.error(`Validation failed: Node ${node.id} has ${buttons.length} buttons (limit: ${limit}).`);
        return `Validation failed: Node '${node.id}' has ${buttons.length} buttons, which exceeds the platform limit of ${limit} for ${platform}`;
      }
      for (const btn of buttons) {
        if (!btn || typeof btn !== "object") {
          console.error(`Validation failed: Node ${node.id} contains invalid button element.`);
          return `Validation failed: Node '${node.id}' contains an invalid/null button element in the list`;
        }
        if (!btn.id || !btn.title) {
          console.error(`Validation failed: Node ${node.id} contains incomplete button structure:`, JSON.stringify(btn));
          return `Validation failed: Node '${node.id}' contains a button missing 'id' or 'title' (Button: ${JSON.stringify(btn)})`;
        }
      }
    }

    // List sections and rows check
    if (node.type === "listNode") {
      const sections = node.data.listSections;
      if (!Array.isArray(sections)) {
        console.error(`Validation failed: Node ${node.id} (listNode) is missing 'listSections' array.`);
        return `Validation failed: Node '${node.id}' (listNode) is missing 'listSections' array in 'data'`;
      }
      let totalRows = 0;
      for (const sec of sections) {
        if (!sec || typeof sec !== "object" || !sec.title || !Array.isArray(sec.rows)) {
          console.error(`Validation failed: Node ${node.id} contains invalid section structure:`, JSON.stringify(sec));
          return `Validation failed: Node '${node.id}' contains an invalid 'listSection' structure: ${JSON.stringify(sec)}`;
        }
        totalRows += sec.rows.length;
        for (const row of sec.rows) {
          if (!row || typeof row !== "object") {
            console.error(`Validation failed: Node ${node.id} contains null/invalid row.`);
            return `Validation failed: Node '${node.id}' contains a null or invalid row in section '${sec.title}'`;
          }
          if (!row.id || !row.title) {
            console.error(`Validation failed: Node ${node.id} contains incomplete row structure:`, JSON.stringify(row));
            return `Validation failed: Node '${node.id}' contains a row missing 'id' or 'title' in section '${sec.title}'`;
          }
        }
      }
      if (totalRows > 10) {
        console.error(`Validation failed: Node ${node.id} has ${totalRows} list items (limit: 10).`);
        return `Validation failed: Node '${node.id}' has ${totalRows} total list items, which exceeds the limit of 10`;
      }
    }

    // Question input check
    if (node.type === "questionNode") {
      if (!node.data.variableName || typeof node.data.variableName !== "string") {
        console.error(`Validation failed: Node ${node.id} (questionNode) is missing 'variableName'.`);
        return `Validation failed: Node '${node.id}' (questionNode) is missing a valid 'variableName' string in 'data'`;
      }
    }
  }

  // 2. Validate at least one welcomeNode exists
  const hasWelcome = graph.nodes.some((n: any) => n.type === "welcomeNode");
  if (!hasWelcome) {
    console.error("Validation failed: No welcomeNode found in nodes list.");
    return "Validation failed: The flow does not contain a root 'welcomeNode'";
  }

  // 3. Validate Edges
  for (const edge of graph.edges) {
    console.log("Validating edge:", JSON.stringify(edge, null, 2));

    if (!edge || typeof edge !== "object") {
      console.error("Validation failed: Edge entry is null or not an object.");
      return "Validation failed: An edge entry in the list is null or not a valid object";
    }
    
    if (!edge.id || typeof edge.id !== "string") {
      console.error("Validation failed: Edge is missing a string ID.", JSON.stringify(edge));
      return "Validation failed: An edge is missing a valid string 'id'";
    }
    
    if (!edge.source || typeof edge.source !== "string") {
      console.error(`Validation failed: Edge ${edge.id} is missing a source node ID.`);
      return `Validation failed: Edge '${edge.id}' is missing a valid string 'source' ID`;
    }
    
    if (!edge.target || typeof edge.target !== "string") {
      console.error(`Validation failed: Edge ${edge.id} is missing a target node ID.`);
      return `Validation failed: Edge '${edge.id}' is missing a valid string 'target' ID`;
    }

    if (!nodeIds.has(edge.source)) {
      console.error(`Validation failed: Edge ${edge.id} source '${edge.source}' does not exist.`);
      return `Validation failed: Edge '${edge.id}' references a non-existent source node ID: '${edge.source}'`;
    }
    if (!nodeIds.has(edge.target)) {
      console.error(`Validation failed: Edge ${edge.id} target '${edge.target}' does not exist.`);
      return `Validation failed: Edge '${edge.id}' references a non-existent target node ID: '${edge.target}'`;
    }

    const sourceNode = graph.nodes.find((n: any) => n.id === edge.source);
    if (sourceNode.type === "buttonsNode") {
      if (!edge.sourceHandle) {
        console.error(`Validation failed: Edge ${edge.id} connects from buttonsNode ${edge.source} but lacks sourceHandle.`);
        return `Validation failed: Edge '${edge.id}' connects from buttonsNode '${edge.source}' but is missing a 'sourceHandle' matching a button ID`;
      }
      const buttons = sourceNode.data.buttons || [];
      const hasBtn = buttons.some((btn: any) => btn.id === edge.sourceHandle);
      if (!hasBtn) {
        console.error(`Validation failed: Edge ${edge.id} references non-existent button ID ${edge.sourceHandle} on source node ${edge.source}.`);
        return `Validation failed: Edge '${edge.id}' references a non-existent button ID '${edge.sourceHandle}' on source buttonsNode '${edge.source}'`;
      }
    } else if (sourceNode.type === "listNode") {
      if (!edge.sourceHandle) {
        console.error(`Validation failed: Edge ${edge.id} connects from listNode ${edge.source} but lacks sourceHandle.`);
        return `Validation failed: Edge '${edge.id}' connects from listNode '${edge.source}' but is missing a 'sourceHandle' matching a list row ID`;
      }
      const sections = sourceNode.data.listSections || [];
      const allRows = sections.flatMap((sec: any) => sec.rows || []);
      const hasRow = allRows.some((row: any) => row.id === edge.sourceHandle);
      if (!hasRow) {
        console.error(`Validation failed: Edge ${edge.id} references non-existent list row ID ${edge.sourceHandle} on source node ${edge.source}.`);
        return `Validation failed: Edge '${edge.id}' references a non-existent list row ID '${edge.sourceHandle}' on source listNode '${edge.source}'`;
      }
    }
  }

  return null;
}

/**
 * Automatically corrects common LLM mistakes on flow edges, specifically missing or
 * mismatched sourceHandles originating from buttonsNodes.
 */
function autoCorrectGraph(graph: any) {
  if (!graph || typeof graph !== "object") return;
  if (!Array.isArray(graph.nodes) || !Array.isArray(graph.edges)) return;

  const nodeMap = new Map<string, any>();
  graph.nodes.forEach((n: any) => {
    if (n && n.id) nodeMap.set(n.id, n);
  });

  for (const edge of graph.edges) {
    if (!edge || typeof edge !== "object" || !edge.source) continue;

    const sourceNode = nodeMap.get(edge.source);
    if (!sourceNode) continue;

    if (sourceNode.type === "buttonsNode") {
      const buttons = sourceNode.data?.buttons || [];
      if (buttons.length > 0) {
        // Case 1: sourceHandle is missing
        if (!edge.sourceHandle) {
          edge.sourceHandle = buttons[0].id;
          console.log(`Auto-fixed edge:\n${edge.id}\n\nAssigned sourceHandle:\n${edge.sourceHandle}`);
        } else {
          // Case 2: sourceHandle exists but does not match any button ID
          const hasExactBtn = buttons.some((btn: any) => btn.id === edge.sourceHandle);
          if (!hasExactBtn) {
            // Attempt to match by button title (case-insensitive, trimmed)
            const matchByTitle = buttons.find((btn: any) => 
              btn.title.toLowerCase().trim() === edge.sourceHandle?.toLowerCase().trim()
            );
            if (matchByTitle) {
              edge.sourceHandle = matchByTitle.id;
              console.log(`Auto-fixed edge:\n${edge.id}\n\nAssigned sourceHandle:\n${edge.sourceHandle}`);
            } else {
              // Fallback to first button
              edge.sourceHandle = buttons[0].id;
              console.log(`Auto-fixed edge:\n${edge.id}\n\nAssigned sourceHandle:\n${edge.sourceHandle}`);
            }
          }
        }
      }
    }
  }
}

/**
 * Main generator service utilizing Groq's API and applying automated node positions.
 */
export async function generateFlow(prompt: string, platform: "whatsapp" | "instagram"): Promise<FlowGraph> {
  const groqKey = process.env.GROQ_KEY;
  if (!groqKey) {
    throw new Error("GROQ_KEY environment variable is not set");
  }

  const systemPrompt = `You are an expert WhatsApp and Instagram chatbot architect.
Your job is to generate chatbot flow JSON compatible with our existing CRM Flow Builder.

Rules:
Return ONLY valid JSON.
Do NOT return markdown.
Do NOT explain anything.
Do NOT write code blocks.
Do NOT write any text before or after JSON.
The response must be directly parsable using JSON.parse().
Use ONLY existing node types already supported by the project.
Never invent new node types.
Do NOT generate node positions.
Do NOT generate x/y coordinates.
Generate only the logical conversation structure.

Existing node types:
1. welcomeNode: Root greeting node. Has data: { text: string }
2. textNode: Standard text reply message. Has data: { text: string }
3. buttonsNode: Quick reply options. Has data: { text: string, buttons: [{ id: string, title: string }] }. Limit: WhatsApp max 3 buttons, Instagram max 13 buttons.
4. listNode: Structured list menu. Has data: { text: string, listButtonText: string, listSections: [{ title: string, rows: [{ id: string, title: string, description: string }] }] }. Total rows <= 10.
5. questionNode: Asks user for text input and stores it. Has data: { text: string, variableName: string }.
6. mediaNode: Static media message. Has data: { mediaType: "image" | "video" | "audio" | "document", mediaUrl: string, caption: string }.

Edge specifications:
Edges connect nodes. An edge must contain:
- "id": string (unique ID)
- "source": string (source node ID)
- "target": string (target node ID)
- "sourceHandle": string (ONLY if source node is buttonsNode or listNode, must match the specific button/row ID)

Generate a logical conversational tree for: ${prompt} on platform: ${platform}.`;

  let lastError: string | null = null;
  const maxRetries = 2;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[AI Flow Generator] Dispatching prompt to Groq API (Attempt ${attempt}/${maxRetries})...`);
      
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: `Create a chatbot flow description: "${prompt}" for platform "${platform}"`
            }
          ],
          temperature: 0.2, // Low temperature for deterministic JSON output
          response_format: { type: "json_object" } // Force JSON mode
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`
          },
          timeout: 25000 // 25s timeout
        }
      );

      const contentText = response.data?.choices?.[0]?.message?.content?.trim();
      if (!contentText) {
        throw new Error("Received empty response content from Groq");
      }

      console.log("[AI Flow Generator] Raw Groq Response Content:\n" + contentText);

      // Parse JSON
      let flowGraph: any;
      try {
        flowGraph = JSON.parse(contentText);
        console.log("[AI Flow Generator] Parsed JSON:\n" + JSON.stringify(flowGraph, null, 2));
      } catch (err: any) {
        console.error(`[AI Flow Generator] JSON parsing failed: ${err.message}. Raw AI Response Content was:\n${contentText}`);
        throw new Error(`JSON parsing failed: ${err.message}. Content was: ${contentText}`);
      }

      // Auto-correct edge source handles for buttonsNode
      autoCorrectGraph(flowGraph);

      // Validate
      const validationError = validateGraphJson(flowGraph, platform);
      if (validationError) {
        console.error(`[AI Flow Generator] Validation failed: ${validationError}`);
        throw new Error(`Schema validation failed: ${validationError}`);
      }

      // Set platform field for all nodes
      flowGraph.nodes.forEach((n: any) => {
        if (n.data) {
          n.data.platform = platform;
        }
      });

      // Calculate Positions
      const positionedNodes = autoLayoutFlow(flowGraph.nodes, flowGraph.edges);

      return {
        nodes: positionedNodes,
        edges: flowGraph.edges
      };

    } catch (err: any) {
      console.warn(`[AI Flow Generator] Attempt ${attempt} failed: ${err.message}`);
      lastError = err.message;
    }
  }

  throw new Error(`Failed to generate a valid flow after ${maxRetries} attempts. Last error: ${lastError}`);
}
