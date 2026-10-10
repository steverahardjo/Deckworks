import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp, ElementPatch } from "@deckworks/core/store";
import { listPresets } from "@deckworks/core/specs";
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

  // ── Simplified slide API ────────────────────────────────────────────────
  // list_slide() / change_styling() / add_slide() / change_slide(slide, page).
  // Styling is deck-wide and driven by one shared stylesheet — never per slide.

  server.registerTool(
    "list_slide",
    {
      description:
        "List every slide with its zero-based page, id, layout and elements (id, type, text).",
    },
    async () =>
      guard(() => ({
        slides: app.state.slides.map((s, index) => ({
          page: index,
          id: s.id,
          layout: s.layout,
          elements: s.elements.map((el) => ({
            id: el.id,
            type: el.type,
            text: String(el.properties.text ?? ""),
          })),
        })),
      }))
  );

  server.registerTool(
    "change_styling",
    {
      description:
        "Change the deck-wide palette. Pass a runtime-discovered look id to apply its theme colours and font; omit it to read current styling. Styling is deck-wide, never per slide.",
      inputSchema: {
        style: z
          .string()
          .optional()
          .describe("Look/preset id, e.g. dark, consulting, startup. Omit to read current."),
      },
    },
    async (args) =>
      guard(() => {
        if (args.style) {
          const presets = listPresets();
          const preset = presets.find(
            (p) => p.id === args.style || p.theme.id === args.style
          );
          if (!preset) {
            throw new Error(
              `Unknown style "${args.style}". Available: ${presets
                .map((p) => p.id)
                .join(", ")}.`
            );
          }
          app.state.theme = preset.theme;
          app.state.template = preset.id;
        }
        return { template: app.state.template, theme: app.state.theme };
      })
  );

  server.registerTool(
    "deck_set_stylesheet",
    {
      description:
        "Write the deck-wide stylesheet that lays out and styles every slide. Author it from the selected look spec — palette, type scale, grid, and component treatments — instead of relying on the bundled default. The stylesheet is stored on the deck and written to <project>/tmp/slide.css; deck_preview, deck_export and the editor render the generated slide HTML with it.",
      inputSchema: {
        css: z
          .string()
          .describe("Full CSS applied to every slide surface. Use the theme vars --slide-bg/fg/muted/accent/font."),
      },
    },
    async (args) =>
      guard(async () => {
        const result = await app.setStylesheet(args.css);
        return {
          file: result.file,
          bytes: result.bytes,
          template: app.state.template,
          next: "Run deck_preview to render the slides with this stylesheet.",
        };
      })
  );

  server.registerTool(
    "add_slide",
    {
      description: "Append a slide, or insert it at a zero-based page index.",
      inputSchema: {
        slide: slideSchema,
        page: z.number().int().nonnegative().optional(),
      },
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
        const slides = app.state.slides;
        if (args.page === undefined || args.page >= slides.length) {
          slides.push(slide);
        } else {
          slides.splice(args.page, 0, slide);
        }
        return {
          added: slide.id,
          page: args.page ?? slides.length - 1,
          slideCount: slides.length,
        };
      })
  );

  server.registerTool(
    "change_slide",
    {
      description:
        "Replace the slide at a page (zero-based index or slide id) with new content. Use list_slide to find the page.",
      inputSchema: {
        slide: slideSchema,
        page: z.union([z.number().int().nonnegative(), z.string()]),
      },
    },
    async (args) =>
      guard(() => {
        const slides = app.state.slides;
        const index =
          typeof args.page === "number"
            ? args.page
            : slides.findIndex((s) => s.id === args.page);
        if (index < 0 || index >= slides.length) {
          throw new Error(
            `Page "${args.page}" not found. Valid pages: 0–${slides.length - 1}.`
          );
        }
        const slide: Slide = {
          ...args.slide,
          elements: args.slide.elements.map((el) => ({
            ...el,
            properties: el.properties ?? {},
          })),
        };
        slides[index] = slide;
        return { changed: slide.id, page: index, slideCount: slides.length };
      })
  );
}
