import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

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
};

const INSTRUCTIONS = [
  "Deckworks is an agent-native presentation workspace. The presentation state (deck.json) is the source of truth.",
  "Recommended workflow:",
  "1. deck_init or deck_open to load a project.",
  "2. deck_status to inspect the current state.",
  "3. deck_get_schema to recall the data model.",
  "4. deck_add_slide and deck_change to edit content by stable ids.",
  "5. deck_save to persist changes.",
  "6. deck_preview / deck_review / deck_export for output (preview/export land in later phases).",
  "Prefer minimal, targeted edits: reference a slide id and element id rather than regenerating a whole slide.",
].join("\n");

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
    "deck_load_skill",
    {
      description: "Load a Deckworks agent skill (setup | create | edit | review | export).",
      inputSchema: {
        skill: z.string().describe("Skill name."),
      },
    },
    async (args) =>
      guard(
        () =>
          `Skill "${args.skill}" is not implemented yet. Skills ship in Phase 2. ` +
          `Use deck_get_instructions for the current workflow.`
      )
  );
}
