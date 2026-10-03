import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";

import {
  SKILLS_DIR,
  SPECS_DIR,
  listMarkdown,
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
} as const;

const INSTRUCTIONS = [
  "Deckworks is an agent-native presentation workspace. The presentation state (deck.json) is the source of truth.",
  "Recommended workflow:",
  "1. deck_init or deck_open to load a project.",
  "2. list_slide to inspect the current slides (page, id, layout, elements).",
  "3. deck_list_skills, then deck_load_skill for the phase you are in (setup | create | edit | review | export).",
  "4. deck_list_looks, then deck_load_look for the chosen look before writing any slides.",
  "5. change_styling to apply the deck-wide look, then deck_get_schema to recall the data model.",
  "6. add_slide to build and change_slide(slide, page) to edit slides.",
  "7. deck_save to persist changes.",
  "8. deck_preview to render slides; deck_review to find layout, overflow and density problems.",
  "9. deck_export for html, pdf or pptx output.",
  "Styling is deck-wide: ONE shared stylesheet (backend/shared/specs/slide.css) rules every slide. Never style slides individually — slides differ only by content, layout and position. Use change_styling for the whole deck.",
  "Before building slides, collect every visual asset you need — SVG, chart, widget and icon — as element properties (chart/image `properties.svg`, image `properties.src`) so exhibits are first-class.",
  "Load the phase skill before acting — the skills encode the constraints that keep a deck consistent.",
  "Load the look spec before writing slides — it defines the palette usage, layout grid and density ceiling for that look.",
  "Progressive disclosure: load ONLY the skill for your current phase and ONLY the one chosen look's spec. Never load all skills or all specs at once.",
  "Human-in-the-loop: pause at setup (confirm look + required assets such as a logo SVG), after the narrative plan, after the first draft, and before export. Do not run past a gate unattended.",
  "Data analysis: default to Anthropic's Claude Code data-analysis skill (claude plugins add knowledge-work-plugins/data) and set chart SVGs to the Anthropic Sans font stack.",
  "At setup, write a per-run reference file (<project>/references.md) recording the chosen look, palette, grid, density ceiling, assets and sources.",
  "title, subtitle, body, chart and image elements render. deck_review warns when a deck uses an element type that renders as nothing.",
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
    "deck_list_skills",
    {
      description:
        "List the Deckworks agent skills available for loading, with the phase each one covers. Call this before deck_load_skill.",
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
        "Load a Deckworks agent skill (setup | create | edit | review | export). Returns the full Markdown instructions for that phase of the deck workflow.",
      inputSchema: {
        skill: z.string().describe("Skill name, e.g. setup, create, edit, review, export."),
      },
    },
    async (args) =>
      guard(async () => {
        const names = await listMarkdown(SKILLS_DIR, "Skills");
        return readDocument(SKILLS_DIR, "skill", args.skill, names);
      })
  );

  // Look specs are per-preset design guidance (palette, typography, layout and
  // density rules). They are separate from workflow skills: a skill says *what
  // to do next*, a spec says *how that look should be designed*.
  server.registerTool(
    "deck_list_looks",
    {
      description:
        "List the presentation looks (theme presets) that have a design spec available, for use with deck_load_look and deck_new.",
    },
    async () =>
      guard(async () => {
        const names = await listMarkdown(SPECS_DIR, "Look specs");
        const descriptions = await readmeDescriptions(SPECS_DIR);
        return {
          specsDir: SPECS_DIR,
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
        "Load the design spec for a presentation look (e.g. consulting, dark, editorial). Read this before writing slides so the deck follows that look's palette, typography and layout rules.",
      inputSchema: {
        look: z.string().describe("Look / preset id, e.g. consulting."),
      },
    },
    async (args) =>
      guard(async () => {
        const names = await listMarkdown(SPECS_DIR, "Look specs");
        return readDocument(SPECS_DIR, "look spec", args.look, names);
      })
  );
}
