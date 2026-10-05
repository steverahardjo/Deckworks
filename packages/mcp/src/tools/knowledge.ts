import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

import {
  SKILLS_DIR,
  LOOK_SPECS_DIR,
  WORKFLOW_SPECS_DIR,
  listMarkdown,
  listLooks,
  listWorkflows,
  readDocument,
  readmeDescriptions,
} from "./assets.js";
import { guard } from "./util.js";

const PRESENTATION_SCHEMA = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  required: ["metadata", "dimensions", "theme", "template", "slides", "comments"],
  properties: {
    metadata: {
      type: "object",
      required: ["title", "author", "createdAt", "updatedAt"],
      properties: {
        title: { type: "string" },
        author: { type: "string" },
        createdAt: { type: "string", format: "date-time" },
        updatedAt: { type: "string", format: "date-time" },
      },
    },
    dimensions: {
      type: "object",
      required: ["width", "height"],
      properties: {
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    theme: {
      type: "object",
      required: ["id", "name", "background", "foreground", "accent", "muted", "font"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        background: { type: "string" },
        foreground: { type: "string" },
        accent: { type: "string" },
        muted: { type: "string" },
        font: { type: "string" },
      },
    },
    template: { type: "string" },
    workflow: { type: "string" },
    slides: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "layout", "elements"],
          properties: {
            id: { type: "string" },
            layout: {
            type: "string",
            enum: ["title", "title-subtitle", "title-body", "two-column", "blank"],
              },
              notes: { type: "string" },
              elements: {
            type: "array",
            items: {
              type: "object",
              required: ["id", "type", "position", "size"],
              properties: {
                id: { type: "string" },
                type: {
                  type: "string",
                  enum: [
                    "title",
                    "subtitle",
                    "body",
                    "image",
                    "shape",
                    "chart",
                    "table",
                    "divider",
                    "callout",
                  ],
                },
                position: {
                  type: "object",
                  required: ["x", "y"],
                  properties: {
                    x: { type: "number" },
                    y: { type: "number" },
                  },
                },
                size: {
                  type: "object",
                  required: ["width", "height"],
                  properties: {
                    width: { type: "number" },
                    height: { type: "number" },
                  },
                },
                properties: { type: "object", additionalProperties: true },
              },
            },
          },
        },
      },
    },
    comments: {
      type: "array",
      items: {
        type: "object",
        required: ["id", "slideId", "message", "status"],
        properties: {
          id: { type: "string" },
          slideId: { type: "string" },
          elementId: { type: "string" },
          message: { type: "string" },
          status: { type: "string", enum: ["open", "resolved"] },
          imageUrl: { type: "string" },
          link: { type: "string" },
        },
      },
    },
  },
} as const;

const INSTRUCTIONS =
  "Load backend/shared/skills/SKILL.md first. Route exactly one workflow, persist it with " +
  "deck_set_workflow, then load that workflow from /spec/workflow and one look from " +
  "/spec/look. deck.json remains the source of truth.";

export function registerKnowledgeTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_get_schema",
    {
      description: "Return the JSON schema of the Deckworks presentation state.",
    },
    async () => guard(() => PRESENTATION_SCHEMA)
  );

  server.registerTool(
    "deck_get_instructions",
    {
      description: "Return workflow instructions for operating on a Deckworks presentation.",
    },
    async () => guard(() => INSTRUCTIONS)
  );

  server.registerTool(
    "deck_list_specs",
    {
      description: "Return the runtime-discovered workflow and look choices under /spec.",
    },
    async () =>
      guard(async () => ({
        specDir: WORKFLOW_SPECS_DIR.replace(/[/\\]workflow$/, ""),
        workflows: await listWorkflows(),
        looks: await listLooks(),
      }))
  );

  server.registerTool(
    "deck_list_skills",
    {
      description:
        "List runtime-discovered Deckworks skills. SKILL.md is the main workflow and data-analysis.md is the optional analysis companion.",
    },
    async () =>
      guard(async () => {
        const names = await listMarkdown(SKILLS_DIR, "Skills");
        const descriptions = await readmeDescriptions(SKILLS_DIR);
        return {
          skillsDir: SKILLS_DIR,
          skills: names.map((name) => ({
            name,
            file: `${name}.md`,
            purpose: descriptions.get(name) ?? null,
          })),
        };
      })
  );

  server.registerTool(
    "deck_load_skill",
    {
      description:
        "Load a runtime-discovered Deckworks skill. Use SKILL.md for the main workflow or data-analysis.md for analysis.",
      inputSchema: {
        skill: z.string().describe("Skill name, e.g. SKILL or data-analysis."),
      },
    },
    async (args) =>
      guard(async () => {
        const names = await listMarkdown(SKILLS_DIR, "Skills");
        return readDocument(SKILLS_DIR, "skill", args.skill, names);
      })
  );

  server.registerTool(
    "deck_list_workflows",
    {
      description: "List workflow specs discovered at runtime from /spec/workflow.",
    },
    async () =>
      guard(async () => {
        const names = await listWorkflows();
        const descriptions = await readmeDescriptions(WORKFLOW_SPECS_DIR);
        return {
          workflowsDir: WORKFLOW_SPECS_DIR,
          workflows: names.map((name) => ({
            id: name,
            file: `${name}.md`,
            summary: descriptions.get(name) ?? null,
          })),
        };
      })
  );

  server.registerTool(
    "deck_load_workflow",
    {
      description: "Load one runtime-discovered workflow spec from /spec/workflow.",
      inputSchema: {
        workflow: z.string().describe("Workflow id, e.g. create."),
      },
    },
    async (args) =>
      guard(async () =>
        readDocument(WORKFLOW_SPECS_DIR, "workflow spec", args.workflow, await listWorkflows())
      )
  );

  // Look specs own palette, font, grid and rendered component guidance.
  server.registerTool(
    "deck_list_looks",
    {
      description:
        "List presentation looks discovered at runtime from /spec/look.",
    },
    async () =>
      guard(async () => {
        const names = await listLooks();
        const descriptions = await readmeDescriptions(LOOK_SPECS_DIR);
        return {
          looksDir: LOOK_SPECS_DIR,
          looks: names.map((name) => ({
            id: name,
            file: `${name}.md`,
            summary: descriptions.get(name) ?? null,
          })),
        };
      })
  );

  server.registerTool(
    "deck_load_look",
    {
      description:
        "Load one design spec from /spec/look. It defines palette, font, grid, density, and rendered components for that look.",
      inputSchema: {
        look: z.string().describe("Look / preset id, e.g. consulting."),
      },
    },
    async (args) =>
      guard(async () => {
        const names = await listLooks();
        return readDocument(LOOK_SPECS_DIR, "look spec", args.look, names);
      })
  );
}
