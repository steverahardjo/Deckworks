import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { DeckworksApp } from "@deckworks/core/store";

import { registerLifecycleTools } from "./tools/lifecycle.js";
import { registerKnowledgeTools } from "./tools/knowledge.js";
import { registerReviewTools } from "./tools/review.js";
import { registerPreviewTools } from "./tools/preview.js";
import { registerOutputTools } from "./tools/output.js";

const app = new DeckworksApp();

const server = new McpServer({ name: "deckworks", version: "0.1.0" });

registerLifecycleTools(server, app);
registerKnowledgeTools(server, app);
registerReviewTools(server, app);
registerPreviewTools(server, app);
registerOutputTools(server, app);

const transport = new StdioServerTransport();
await server.connect(transport);
