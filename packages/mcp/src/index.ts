import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DeckworksApp } from "@deckworks/core/store";

import { registerLifecycleTools } from "./tools/lifecycle.js";
import { registerKnowledgeTools } from "./tools/knowledge.js";
import { registerEditingTools } from "./tools/editing.js";
import { registerFeedbackTools } from "./tools/feedback.js";
import { registerOutputTools } from "./tools/output.js";

const app = new DeckworksApp();

const server = new McpServer({ name: "deckworks", version: "0.1.0" });

registerLifecycleTools(server, app);
registerKnowledgeTools(server, app);
registerEditingTools(server, app);
registerFeedbackTools(server, app);
registerOutputTools(server, app);

const transport = new StdioServerTransport();
await server.connect(transport);
