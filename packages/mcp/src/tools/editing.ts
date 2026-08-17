import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp, ElementPatch } from "@deckworks/core/store";
import type { Slide } from "@deckworks/core";

import { guard } from "./util.js";

const positionSchema = z.object({
  x: z.number(),
  y: z.number(),
});

const sizeSchema = z.object({
  width: z.number(),
  height: z.number(),
});

const elementSchema = z.object({
  id: z.string(),
  type: z.enum([
    "title",
    "subtitle",
    "body",
    "image",
    "shape",
    "chart",
    "table",
    "divider",
    "callout",
  ]),
  position: positionSchema,
  size: sizeSchema,
  properties: z.record(z.string(), z.unknown()).optional(),
});

const slideSchema = z.object({
  id: z.string(),
  layout: z.enum(["title", "title-subtitle", "title-body", "two-column", "blank"]),
  elements: z.array(elementSchema),
});

const patchSchema = z.object({
  text: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  properties: z.record(z.string(), z.unknown()).optional(),
});

export function registerEditingTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_change",
    {
      description:
        "Apply a targeted change to a single element on a slide. Reference the element by its stable id and pass only the fields you want to update (text, x, y, width, height, or arbitrary properties).",
      inputSchema: {
        slideId: z.string().describe("Stable id of the slide (e.g. slide-04)."),
        elementId: z.string().describe("Stable id of the element (e.g. title, revenue-chart)."),
        patch: patchSchema,
      },
    },
    async (args) =>
      guard(() => {
        app.change(args.slideId, args.elementId, args.patch as ElementPatch);
        return { changed: { slideId: args.slideId, elementId: args.elementId } };
      })
  );

  server.registerTool(
    "deck_add_slide",
    {
      description: "Append a new slide to the presentation.",
      inputSchema: { slide: slideSchema },
    },
    async (args) =>
      guard(() => {
        const slide: Slide = {
          ...args.slide,
          elements: args.slide.elements.map((el) => ({
            ...el,
            properties: el.properties ?? {},
          })),
        };
        app.addSlide(slide);
        return { added: slide.id, slideCount: app.state.slides.length };
      })
  );

  server.registerTool(
    "deck_delete_slide",
    {
      description: "Remove a slide from the presentation by id.",
      inputSchema: { slideId: z.string() },
    },
    async (args) =>
      guard(() => {
        app.deleteSlide(args.slideId);
        return { deleted: args.slideId, slideCount: app.state.slides.length };
      })
  );

  server.registerTool(
    "deck_reorder_slide",
    {
      description: "Move a slide to a new zero-based index.",
      inputSchema: {
        slideId: z.string(),
        index: z.number().int().nonnegative(),
      },
    },
    async (args) =>
      guard(() => {
        app.reorderSlide(args.slideId, args.index);
        return { slides: app.state.slides.map((s) => s.id) };
      })
  );
}
