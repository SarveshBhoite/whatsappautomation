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
 * Automatically calculates node coordinates for React Flow tree visual rendering.
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
  const H_SPACING = 320;
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
    console.error("Rule Failed: Graph response is not a valid JSON object");
    return "Validation failed: Graph response is not a valid JSON object";
  }
  
  if (!Array.isArray(graph.nodes)) {
    console.error("Rule Failed: Missing nodes array");
    return "Validation failed: 'nodes' array is missing or not an array";
  }
  
  if (!Array.isArray(graph.edges)) {
    console.error("Rule Failed: Missing edges array");
    return "Validation failed: 'edges' array is missing or not an array";
  }

  const validNodeTypes = ["welcomeNode", "textNode", "buttonsNode", "listNode", "questionNode", "mediaNode"];
  const nodeIds = new Set<string>();

  // 1. Validate Nodes
  for (const node of graph.nodes) {
    if (!node || typeof node !== "object") {
      console.error("Rule Failed: Null or invalid node entry in list");
      return "Validation failed: A node entry in the list is null or not a valid object";
    }
    
    if (!node.id || typeof node.id !== "string") {
      console.error("Rule Failed: Missing node string ID");
      return "Validation failed: A node is missing a valid string 'id'";
    }
    
    if (nodeIds.has(node.id)) {
      console.error(`Rule Failed: Duplicate node ID detected: '${node.id}'`);
      return `Validation failed: Duplicate node ID detected: '${node.id}'`;
    }
    nodeIds.add(node.id);

    if (!node.type) {
      console.error(`Rule Failed: Node '${node.id}' is missing type`);
      return `Validation failed: Node '${node.id}' is missing a 'type' property`;
    }

    if (!validNodeTypes.includes(node.type)) {
      console.error(`Rule Failed: Unsupported node type '${node.type}' on node '${node.id}'`);
      return `Validation failed: Node '${node.id}' has invalid/unsupported type '${node.type}' (Valid types: ${validNodeTypes.join(", ")})`;
    }

    if (!node.data || typeof node.data !== "object") {
      console.error(`Rule Failed: Node '${node.id}' missing required 'data' object`);
      return `Validation failed: Node '${node.id}' is missing the required 'data' object`;
    }

    // Buttons count check
    if (node.type === "buttonsNode") {
      const buttons = node.data.buttons;
      if (!Array.isArray(buttons)) {
        console.error(`Rule Failed: Node '${node.id}' (buttonsNode) missing 'buttons' array`);
        return `Validation failed: Node '${node.id}' (buttonsNode) is missing 'buttons' array in 'data'`;
      }
      const limit = platform === "whatsapp" ? 3 : 13;
      if (buttons.length > limit) {
        console.error(`Rule Failed: Node '${node.id}' exceeds button limit (${buttons.length} > ${limit})`);
        return `Validation failed: Node '${node.id}' has ${buttons.length} buttons, which exceeds the platform limit of ${limit} for ${platform}`;
      }
      for (const btn of buttons) {
        if (!btn || typeof btn !== "object") {
          console.error(`Rule Failed: Node '${node.id}' contains invalid button element`);
          return `Validation failed: Node '${node.id}' contains an invalid/null button element in the list`;
        }
        if (!btn.id || !btn.title) {
          console.error(`Rule Failed: Node '${node.id}' button missing id or title`);
          return `Validation failed: Node '${node.id}' contains a button missing 'id' or 'title'`;
        }
      }
    }

    // List sections and rows check
    if (node.type === "listNode") {
      const sections = node.data.listSections;
      if (!Array.isArray(sections)) {
        console.error(`Rule Failed: Node '${node.id}' (listNode) missing 'listSections' array`);
        return `Validation failed: Node '${node.id}' (listNode) is missing 'listSections' array in 'data'`;
      }
      let totalRows = 0;
      for (const sec of sections) {
        if (!sec || typeof sec !== "object" || !sec.title || !Array.isArray(sec.rows)) {
          console.error(`Rule Failed: Node '${node.id}' contains invalid listSection structure`);
          return `Validation failed: Node '${node.id}' contains an invalid 'listSection' structure`;
        }
        totalRows += sec.rows.length;
        for (const row of sec.rows) {
          if (!row || typeof row !== "object") {
            console.error(`Rule Failed: Node '${node.id}' contains null/invalid row`);
            return `Validation failed: Node '${node.id}' contains a null or invalid row`;
          }
          if (!row.id || !row.title) {
            console.error(`Rule Failed: Node '${node.id}' row missing id or title`);
            return `Validation failed: Node '${node.id}' contains a row missing 'id' or 'title'`;
          }
        }
      }
      if (totalRows > 10) {
        console.error(`Rule Failed: Node '${node.id}' exceeds list item limit (${totalRows} > 10)`);
        return `Validation failed: Node '${node.id}' has ${totalRows} total list items, which exceeds the limit of 10`;
      }
    }

    // Question input check
    if (node.type === "questionNode") {
      if (!node.data.variableName || typeof node.data.variableName !== "string") {
        console.error(`Rule Failed: Node '${node.id}' (questionNode) missing 'variableName'`);
        return `Validation failed: Node '${node.id}' (questionNode) is missing a valid 'variableName' string in 'data'`;
      }
    }
  }

  // 2. Validate at least one welcomeNode exists
  const hasWelcome = graph.nodes.some((n: any) => n.type === "welcomeNode");
  if (!hasWelcome) {
    console.error("Rule Failed: Missing root welcomeNode in nodes list");
    return "Validation failed: The flow does not contain a root 'welcomeNode'";
  }

  // 3. Validate Edges
  for (const edge of graph.edges) {
    if (!edge || typeof edge !== "object") {
      console.error("Rule Failed: Edge entry is null or not an object");
      return "Validation failed: An edge entry in the list is null or not a valid object";
    }
    
    if (!edge.id || typeof edge.id !== "string") {
      console.error("Rule Failed: Edge missing string ID");
      return "Validation failed: An edge is missing a valid string 'id'";
    }
    
    if (!edge.source || typeof edge.source !== "string") {
      console.error(`Rule Failed: Edge '${edge.id}' missing source node ID`);
      return `Validation failed: Edge '${edge.id}' is missing a valid string 'source' ID`;
    }
    
    if (!edge.target || typeof edge.target !== "string") {
      console.error(`Rule Failed: Edge '${edge.id}' missing target node ID`);
      return `Validation failed: Edge '${edge.id}' is missing a valid string 'target' ID`;
    }

    if (!nodeIds.has(edge.source)) {
      console.error(`Rule Failed: Edge '${edge.id}' references non-existent source ID '${edge.source}'`);
      return `Validation failed: Edge '${edge.id}' references a non-existent source node ID: '${edge.source}'`;
    }
    if (!nodeIds.has(edge.target)) {
      console.error(`Rule Failed: Edge '${edge.id}' references non-existent target ID '${edge.target}'`);
      return `Validation failed: Edge '${edge.id}' references a non-existent target node ID: '${edge.target}'`;
    }

    const sourceNode = graph.nodes.find((n: any) => n.id === edge.source);
    if (sourceNode.type === "buttonsNode") {
      if (!edge.sourceHandle) {
        console.error(`Rule Failed: Missing sourceHandle on edge '${edge.id}' connecting from buttonsNode '${edge.source}'`);
        return `Validation failed: Edge '${edge.id}' connects from buttonsNode '${edge.source}' but is missing a 'sourceHandle' matching a button ID`;
      }
      const buttons = sourceNode.data.buttons || [];
      const hasBtn = buttons.some((btn: any) => btn.id === edge.sourceHandle);
      if (!hasBtn) {
        console.error(`Rule Failed: Edge '${edge.id}' references non-existent button ID '${edge.sourceHandle}' on node '${edge.source}'`);
        return `Validation failed: Edge '${edge.id}' references a non-existent button ID '${edge.sourceHandle}' on source buttonsNode '${edge.source}'`;
      }
    } else if (sourceNode.type === "listNode") {
      if (!edge.sourceHandle) {
        console.error(`Rule Failed: Missing sourceHandle on edge '${edge.id}' connecting from listNode '${edge.source}'`);
        return `Validation failed: Edge '${edge.id}' connects from listNode '${edge.source}' but is missing a 'sourceHandle' matching a list row ID`;
      }
      const sections = sourceNode.data.listSections || [];
      const allRows = sections.flatMap((sec: any) => sec.rows || []);
      const hasRow = allRows.some((row: any) => row.id === edge.sourceHandle);
      if (!hasRow) {
        console.error(`Rule Failed: Edge '${edge.id}' references non-existent list row ID '${edge.sourceHandle}' on node '${edge.source}'`);
        return `Validation failed: Edge '${edge.id}' references a non-existent list row ID '${edge.sourceHandle}' on source listNode '${edge.source}'`;
      }
    }
  }

  return null;
}

/**
 * Automatically repairs and standardizes any LLM-generated flow graph into the project's exact schema.
 * Fixes missing welcomeNode, non-standard node types, data fields, button handles, and orphan nodes.
 */
function autoRepairGraphJson(graph: any, platform: string): void {
  if (!graph || typeof graph !== "object") return;
  if (!Array.isArray(graph.nodes)) graph.nodes = [];
  if (!Array.isArray(graph.edges)) graph.edges = [];

  const typeMap: Record<string, string> = {
    "welcome": "welcomeNode",
    "welcomenode": "welcomeNode",
    "root": "welcomeNode",
    "rootnode": "welcomeNode",
    "start": "welcomeNode",
    "startnode": "welcomeNode",
    "trigger": "welcomeNode",
    "triggernode": "welcomeNode",
    "greeting": "welcomeNode",
    "greetingnode": "welcomeNode",

    "text": "textNode",
    "textnode": "textNode",
    "message": "textNode",
    "reply": "textNode",
    "send_message": "textNode",

    "button": "buttonsNode",
    "buttons": "buttonsNode",
    "buttonsnode": "buttonsNode",
    "quick_reply": "buttonsNode",
    "options": "buttonsNode",

    "list": "listNode",
    "listnode": "listNode",
    "menu": "listNode",
    "select": "listNode",

    "question": "questionNode",
    "questionnode": "questionNode",
    "input": "questionNode",
    "capture": "questionNode",
    "form": "questionNode",

    "media": "mediaNode",
    "medianode": "mediaNode",
    "image": "mediaNode",
    "video": "mediaNode"
  };

  const validTypes = ["welcomeNode", "textNode", "buttonsNode", "listNode", "questionNode", "mediaNode"];
  const usedIds = new Set<string>();

  // 1. Sanitize Node Types and IDs
  graph.nodes.forEach((node: any, idx: number) => {
    if (!node || typeof node !== "object") return;

    if (!node.id || typeof node.id !== "string" || usedIds.has(node.id)) {
      node.id = `node_${idx + 1}`;
    }
    usedIds.add(node.id);

    const rawType = (node.type || "").toLowerCase().trim();
    if (typeMap[rawType]) {
      node.type = typeMap[rawType];
    } else if (!validTypes.includes(node.type)) {
      node.type = "textNode";
    }

    if (!node.data || typeof node.data !== "object") {
      node.data = {};
    }
  });

  // 2. Ensure Root welcomeNode Exists
  const hasWelcome = graph.nodes.some((n: any) => n.type === "welcomeNode");
  if (!hasWelcome) {
    if (graph.nodes.length > 0) {
      // Find root node (node with 0 incoming edges, or first node)
      const incoming = new Set(graph.edges.map((e: any) => e.target));
      const rootCandidate = graph.nodes.find((n: any) => !incoming.has(n.id)) || graph.nodes[0];
      rootCandidate.type = "welcomeNode";
      rootCandidate.data = {
        text: rootCandidate.data?.text || rootCandidate.data?.message || "Hello! Welcome to our automated assistant."
      };
      console.log(`[AI Flow Generator Repair] Converted node '${rootCandidate.id}' to root 'welcomeNode'.`);
    } else {
      graph.nodes.push({
        id: "welcome_1",
        type: "welcomeNode",
        data: { text: "Hello! Welcome to our automated assistant." }
      });
      console.log("[AI Flow Generator Repair] Created root 'welcomeNode'.");
    }
  }

  // 3. Sanitize Data Objects per Node Type
  graph.nodes.forEach((node: any) => {
    if (node.type === "welcomeNode" || node.type === "textNode") {
      if (!node.data.text || typeof node.data.text !== "string") {
        node.data.text = "Hello! Thank you for reaching out.";
      }
    } else if (node.type === "buttonsNode") {
      if (!node.data.text || typeof node.data.text !== "string") {
        node.data.text = "Please choose an option:";
      }
      if (!Array.isArray(node.data.buttons) || node.data.buttons.length === 0) {
        node.data.buttons = [{ id: `btn_${node.id}_1`, title: "Continue" }];
      }
      node.data.buttons.forEach((btn: any, bIdx: number) => {
        if (!btn || typeof btn !== "object") btn = {};
        if (!btn.id || typeof btn.id !== "string") btn.id = `btn_${node.id}_${bIdx + 1}`;
        if (!btn.title || typeof btn.title !== "string") btn.title = `Option ${bIdx + 1}`;
      });
      const limit = platform === "whatsapp" ? 3 : 13;
      if (node.data.buttons.length > limit) {
        node.data.buttons = node.data.buttons.slice(0, limit);
      }
    } else if (node.type === "listNode") {
      if (!node.data.text || typeof node.data.text !== "string") {
        node.data.text = "Select from the list below:";
      }
      if (!node.data.listButtonText || typeof node.data.listButtonText !== "string") {
        node.data.listButtonText = "View Menu";
      }
      if (!Array.isArray(node.data.listSections) || node.data.listSections.length === 0) {
        node.data.listSections = [
          { title: "Main Menu", rows: [{ id: `row_${node.id}_1`, title: "Option 1", description: "" }] }
        ];
      }
      node.data.listSections.forEach((sec: any, sIdx: number) => {
        if (!sec.title || typeof sec.title !== "string") sec.title = `Section ${sIdx + 1}`;
        if (!Array.isArray(sec.rows) || sec.rows.length === 0) {
          sec.rows = [{ id: `row_${node.id}_${sIdx + 1}_1`, title: "Option", description: "" }];
        }
        sec.rows.forEach((row: any, rIdx: number) => {
          if (!row || typeof row !== "object") row = {};
          if (!row.id || typeof row.id !== "string") row.id = `row_${node.id}_${sIdx + 1}_${rIdx + 1}`;
          if (!row.title || typeof row.title !== "string") row.title = `Option ${rIdx + 1}`;
          if (typeof row.description !== "string") row.description = "";
        });
      });
    } else if (node.type === "questionNode") {
      if (!node.data.text || typeof node.data.text !== "string") {
        node.data.text = "Please enter your response:";
      }
      if (!node.data.variableName || typeof node.data.variableName !== "string") {
        node.data.variableName = "user_input";
      }
    } else if (node.type === "mediaNode") {
      if (!node.data.mediaType || !["image", "video", "audio", "document"].includes(node.data.mediaType)) {
        node.data.mediaType = "image";
      }
      if (typeof node.data.mediaUrl !== "string") node.data.mediaUrl = "";
      if (typeof node.data.caption !== "string") node.data.caption = "";
    }
  });

  // 4. Sanitize and Connect Edges
  const validNodeIds = new Set(graph.nodes.map((n: any) => n.id));
  const sanitizedEdges: any[] = [];
  const edgeIds = new Set<string>();

  graph.edges.forEach((edge: any, idx: number) => {
    if (!edge || typeof edge !== "object") return;
    if (!edge.id || typeof edge.id !== "string" || edgeIds.has(edge.id)) {
      edge.id = `e_${idx + 1}`;
    }
    edgeIds.add(edge.id);

    if (!edge.source || !validNodeIds.has(edge.source)) return;
    if (!edge.target || !validNodeIds.has(edge.target)) return;

    const sourceNode = graph.nodes.find((n: any) => n.id === edge.source);
    if (sourceNode.type === "buttonsNode") {
      const buttons = sourceNode.data?.buttons || [];
      if (buttons.length > 0) {
        const hasExact = buttons.some((b: any) => b.id === edge.sourceHandle);
        if (!hasExact) {
          const matchByTitle = buttons.find((b: any) =>
            b.title.toLowerCase().trim() === (edge.sourceHandle || "").toLowerCase().trim()
          );
          edge.sourceHandle = matchByTitle ? matchByTitle.id : buttons[0].id;
        }
      }
    } else if (sourceNode.type === "listNode") {
      const sections = sourceNode.data?.listSections || [];
      const allRows = sections.flatMap((sec: any) => sec.rows || []);
      if (allRows.length > 0) {
        const hasExact = allRows.some((r: any) => r.id === edge.sourceHandle);
        if (!hasExact) {
          const matchByTitle = allRows.find((r: any) =>
            r.title.toLowerCase().trim() === (edge.sourceHandle || "").toLowerCase().trim()
          );
          edge.sourceHandle = matchByTitle ? matchByTitle.id : allRows[0].id;
        }
      }
    } else {
      delete edge.sourceHandle;
    }

    sanitizedEdges.push(edge);
  });

  graph.edges = sanitizedEdges;

  // 5. Connect Orphan / Disconnected Nodes
  if (graph.nodes.length > 1) {
    const connectedIds = new Set<string>();
    graph.edges.forEach((e: any) => {
      connectedIds.add(e.source);
      connectedIds.add(e.target);
    });

    const welcomeNode = graph.nodes.find((n: any) => n.type === "welcomeNode");
    graph.nodes.forEach((node: any, idx: number) => {
      if (node.type !== "welcomeNode" && !connectedIds.has(node.id)) {
        const prevNode = graph.nodes[idx - 1] || welcomeNode;
        if (prevNode) {
          const newEdge: any = {
            id: `e_auto_${prevNode.id}_${node.id}`,
            source: prevNode.id,
            target: node.id
          };
          if (prevNode.type === "buttonsNode" && prevNode.data.buttons?.length > 0) {
            newEdge.sourceHandle = prevNode.data.buttons[0].id;
          } else if (prevNode.type === "listNode" && prevNode.data.listSections?.[0]?.rows?.length > 0) {
            newEdge.sourceHandle = prevNode.data.listSections[0].rows[0].id;
          }
          graph.edges.push(newEdge);
          connectedIds.add(node.id);
          console.log(`[AI Flow Generator Repair] Connected orphan node '${node.id}' from '${prevNode.id}'.`);
        }
      }
    });
  }
}

/**
 * Main generator service utilizing Groq API and applying schema validation & auto-repair.
 */
export async function generateFlow(prompt: string, platform: "whatsapp" | "instagram" | "youtube"): Promise<FlowGraph> {
  const groqKey = process.env.GROQ_KEY;
  if (!groqKey) {
    throw new Error("GROQ_KEY environment variable is not set");
  }

  const systemPrompt = `You are an expert WhatsApp, Instagram, and YouTube chatbot architect.
Your job is to generate chatbot flow JSON compatible with our existing CRM Flow Builder schema.

MANDATORY RULES:
1. Return ONLY valid JSON. No markdown, no prose explanations.
2. The root greeting node MUST be a "welcomeNode" with type: "welcomeNode". Every flow MUST start with a welcomeNode.
3. Use ONLY these official node types:
   - "welcomeNode": Root greeting node. Has data: { text: string }
   - "textNode": Standard message reply. Has data: { text: string }
   - "buttonsNode": Quick reply options. Has data: { text: string, buttons: [{ id: string, title: string }] }. Limit: WhatsApp max 3 buttons, Instagram max 13, YouTube max 13.
   - "listNode": Interactive menu. Has data: { text: string, listButtonText: string, listSections: [{ title: string, rows: [{ id: string, title: string, description: string }] }] }. Total rows <= 10.
   - "questionNode": Asks user for text input. Has data: { text: string, variableName: string }.
   - "mediaNode": Media message. Has data: { mediaType: "image" | "video" | "audio" | "document", mediaUrl: string, caption: string }.

4. Edge specifications:
   - "id": string
   - "source": string (source node ID)
   - "target": string (target node ID)
   - "sourceHandle": string (MANDATORY if source node is buttonsNode or listNode. Must EXACTLY match a button ID or list row ID)

REFERENCE SCHEMA TEMPLATE:
{
  "nodes": [
    { "id": "welcome_1", "type": "welcomeNode", "data": { "text": "Welcome to JISNU Digital Solutions!" } },
    { "id": "btn_menu", "type": "buttonsNode", "data": { "text": "How can we help you today?", "buttons": [{ "id": "b_sales", "title": "Contact Sales" }, { "id": "b_support", "title": "Support" }] } },
    { "id": "sales_reply", "type": "textNode", "data": { "text": "Our sales team will assist you shortly." } },
    { "id": "support_reply", "type": "textNode", "data": { "text": "Please describe your issue." } }
  ],
  "edges": [
    { "id": "e1", "source": "welcome_1", "target": "btn_menu" },
    { "id": "e2", "source": "btn_menu", "sourceHandle": "b_sales", "target": "sales_reply" },
    { "id": "e3", "source": "btn_menu", "sourceHandle": "b_support", "target": "support_reply" }
  ]
}

Generate a conversational tree for: "${prompt}" on platform: "${platform}".`;

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
              content: `Generate a chatbot flow for: "${prompt}" on platform "${platform}"`
            }
          ],
          temperature: 0.2,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`
          },
          timeout: 25000
        }
      );

      const contentText = response.data?.choices?.[0]?.message?.content?.trim();
      if (!contentText) {
        throw new Error("Received empty response content from Groq");
      }

      console.log("[AI Flow Generator] Raw Groq Response Received.");

      // Parse JSON
      let flowGraph: any;
      try {
        flowGraph = JSON.parse(contentText);
      } catch (err: any) {
        console.error(`[AI Flow Generator] JSON parsing failed: ${err.message}`);
        throw new Error(`JSON parsing failed: ${err.message}`);
      }

      // Step 1 & 2: Auto-repair graph structure into project schema
      autoRepairGraphJson(flowGraph, platform);

      // Step 3 & 4: Validate graph against project rules
      let validationError = validateGraphJson(flowGraph, platform);
      if (validationError) {
        console.warn(`[AI Flow Generator] Validation issue detected: ${validationError}. Applying secondary repair...`);
        autoRepairGraphJson(flowGraph, platform);
        validationError = validateGraphJson(flowGraph, platform);
      }

      if (validationError) {
        console.error(`[AI Flow Generator] Validation failed after repair: ${validationError}`);
        throw new Error(`Schema validation failed: ${validationError}`);
      }

      // Set platform on node data
      flowGraph.nodes.forEach((n: any) => {
        if (n.data) {
          n.data.platform = platform;
        }
      });

      // Calculate Positions using visual auto-layout
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
