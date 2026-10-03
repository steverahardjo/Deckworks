import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { DeckworksApp } from "@deckworks/core/store";
import type { Comment, Element, Presentation, Slide } from "@deckworks/core";
import {
  TYPE_SCALE,
  compileSlidesFromDir,
  writeSlideFiles,
} from "@deckworks/export/html";

import { readLookSpec } from "./assets.js";
import { guard } from "./util.js";

let commentSeq = 0;

/** Element types the renderer actually draws. Everything else renders as "". */
const RENDERABLE_TYPES = new Set(["title", "subtitle", "body", "chart"]);

const TEXT_TYPES = ["title", "subtitle", "body"] as const;
type TextType = (typeof TEXT_TYPES)[number];

function isTextType(type: string): type is TextType {
  return (TEXT_TYPES as readonly string[]).includes(type);
}

/**
 * Average glyph width as a fraction of font size for the Anthropic Sans /
 * Inter stack. Text measurement here is a heuristic, so findings derived from
 * it are always warnings — never hard errors.
 */
const AVG_GLYPH_RATIO = 0.52;

type Severity = "error" | "warning" | "info";

interface Finding {
  severity: Severity;
  slideId: string;
  elementId?: string;
  problem: string;
  fix: string;
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function estimateTextHeight(el: Element): number | null {
  if (!isTextType(el.type)) return null;
  const scale = TYPE_SCALE[el.type];
  const text = String(el.properties?.text ?? "");
  const lineHeightPx = scale.fontSize * scale.lineHeight;
  const charsPerLine = Math.max(
    1,
    Math.floor(el.size.width / (scale.fontSize * AVG_GLYPH_RATIO))
  );

  let lines = 0;
  for (const paragraph of text.split("\n")) {
    if (paragraph.trim() === "") {
      lines += 1;
      continue;
    }
    lines += Math.max(1, Math.ceil(paragraph.length / charsPerLine));
  }
  return lines * lineHeightPx;
}

/**
 * Extract the body-copy word ceiling from a look spec's prose.
 *
 * The specs state the limit in a few different ways ("≤ 50 words",
 * "up to 80 words", "40–70 words", "12 words per slide"), so take the largest
 * figure mentioned — that is the body ceiling in every spec, since title limits
 * are always the smaller number. Returns null when nothing is parseable, in
 * which case the density check is skipped rather than guessed at.
 */
function parseDensityCeiling(markdown: string): number | null {
  const found: number[] = [];
  const patterns = [
    /≤\s*(\d+)\s+words/gi,
    /up to\s*(\d+)\s+words/gi,
    /(\d+)\s*[–—-]\s*(\d+)\s+words/gi,
    /(\d+)\s+words per slide/gi,
  ];
  for (const pattern of patterns) {
    for (const match of markdown.matchAll(pattern)) {
      const value = Number(match[2] ?? match[1]);
      if (Number.isFinite(value)) found.push(value);
    }
  }
  return found.length ? Math.max(...found) : null;
}

function reviewPresentation(
  presentation: Presentation,
  densityCeiling: number | null
): Finding[] {
  const { dimensions, slides, template } = presentation;
  const findings: Finding[] = [];

  if (slides.length === 0) {
    findings.push({
      severity: "info",
      slideId: "-",
      problem: "The presentation has no slides.",
      fix: "Add slides with deck_add_slide before previewing or exporting.",
    });
    return findings;
  }

  for (const slide of slides) {
    if (slide.elements.length === 0) {
      findings.push({
        severity: "warning",
        slideId: slide.id,
        problem: "Slide has no elements.",
        fix: "Add a title and body, or delete the slide.",
      });
    }

    const seenIds = new Set<string>();
    for (const el of slide.elements) {
      if (seenIds.has(el.id)) {
        findings.push({
          severity: "error",
          slideId: slide.id,
          elementId: el.id,
          problem: `Duplicate element id "${el.id}" on this slide.`,
          fix: "Give every element on a slide a unique id.",
        });
      }
      seenIds.add(el.id);
    }

    for (const el of slide.elements) {
      const { x, y } = el.position;
      const { width: w, height: h } = el.size;

      if (!RENDERABLE_TYPES.has(el.type)) {
        findings.push({
          severity: "warning",
          slideId: slide.id,
          elementId: el.id,
          problem:
            `Element type "${el.type}" does not render — it is stored in deck.json ` +
            `but produces no output in preview, PDF, PPTX or compiled screenshots.`,
          fix: "Replace it with a title, subtitle, body or chart element, or drop it.",
        });
      }

      if (!(w > 0) || !(h > 0)) {
        findings.push({
          severity: "error",
          slideId: slide.id,
          elementId: el.id,
          problem: `Element has a zero or negative size (${w}×${h}).`,
          fix: "Give the element a positive width and height.",
        });
      }

      if (x < 0 || y < 0 || x + w > dimensions.width || y + h > dimensions.height) {
        findings.push({
          severity: "error",
          slideId: slide.id,
          elementId: el.id,
          problem:
            `Off-canvas: box at (${x}, ${y}) sized ${w}×${h} exceeds the ` +
            `${dimensions.width}×${dimensions.height} canvas.`,
          fix: "Move or resize the element so it sits inside the canvas.",
        });
      }

      if (isTextType(el.type)) {
        const text = String(el.properties?.text ?? "");
        if (text.trim() === "") {
          findings.push({
            severity: "warning",
            slideId: slide.id,
            elementId: el.id,
            problem: `Empty ${el.type} element.`,
            fix: "Add text, or remove the element.",
          });
          continue;
        }

        const estimated = estimateTextHeight(el);
        if (estimated !== null && estimated > h * 1.05) {
          findings.push({
            severity: "warning",
            slideId: slide.id,
            elementId: el.id,
            problem:
              `Possible text overflow: roughly ${Math.round(estimated)}px of ` +
              `${el.type} text in a ${h}px box.`,
            fix: `Increase the height to about ${Math.ceil(estimated / 10) * 10}px, or shorten the text.`,
          });
        }
        if (estimated !== null && y + estimated > dimensions.height) {
          findings.push({
            severity: "warning",
            slideId: slide.id,
            elementId: el.id,
            problem: "Estimated text runs past the bottom edge of the canvas.",
            fix: "Shorten the text or move the element up.",
          });
        }
      }
    }

    for (let i = 0; i < slide.elements.length; i++) {
      for (let j = i + 1; j < slide.elements.length; j++) {
        const a = slide.elements[i]!;
        const b = slide.elements[j]!;
        const overlapX =
          Math.min(a.position.x + a.size.width, b.position.x + b.size.width) -
          Math.max(a.position.x, b.position.x);
        const overlapY =
          Math.min(a.position.y + a.size.height, b.position.y + b.size.height) -
          Math.max(a.position.y, b.position.y);
        if (overlapX > 1 && overlapY > 1) {
          findings.push({
            severity: "warning",
            slideId: slide.id,
            elementId: a.id,
            problem: `Overlaps "${b.id}" by ${Math.round(overlapX)}×${Math.round(overlapY)}px.`,
            fix: "Reposition one of the two elements so their boxes no longer intersect.",
          });
        }
      }
    }

    if (densityCeiling !== null) {
      const words = slide.elements
        .filter((el) => el.type === "body")
        .reduce((total, el) => total + wordCount(String(el.properties?.text ?? "")), 0);
      if (words > densityCeiling) {
        findings.push({
          severity: "warning",
          slideId: slide.id,
          problem:
            `Body copy is ${words} words; the "${template}" look spec caps a ` +
            `slide at about ${densityCeiling}.`,
          fix: "Trim the body text, or split the content across two slides.",
        });
      }
    }
  }

  return findings;
}

export function registerFeedbackTools(server: McpServer, app: DeckworksApp) {
  server.registerTool(
    "deck_comment",
    {
      description:
        "Attach a comment to a slide (optionally targeting a specific element). The comment is stored in presentation state but not yet persisted until deck_save.",
      inputSchema: {
        slideId: z.string(),
        elementId: z.string().optional(),
        message: z.string(),
        imageUrl: z.string().optional(),
        link: z.string().optional(),
      },
    },
    async (args) =>
      guard(() => {
        const comment: Comment = {
          id: `comment-${Date.now()}-${commentSeq++}`,
          slideId: args.slideId,
          elementId: args.elementId,
          message: args.message,
          status: "open",
          imageUrl: args.imageUrl,
          link: args.link,
        };
        app.addComment(comment);
        return comment;
      })
  );

  server.registerTool(
    "deck_comments",
    {
      description: "List comments, optionally filtered to a single slide.",
      inputSchema: { slideId: z.string().optional() },
    },
    async (args) =>
      guard(() =>
        app.state.comments.filter((c) => !args.slideId || c.slideId === args.slideId)
      )
  );

  server.registerTool(
    "deck_resolve_comment",
    {
      description: "Mark a comment as resolved.",
      inputSchema: { commentId: z.string() },
    },
    async (args) =>
      guard(() => {
        app.resolveComment(args.commentId);
        return { resolved: args.commentId };
      })
  );

  server.registerTool(
    "deck_preview",
    {
      description:
        "Render the active presentation to disk: one self-contained HTML file per slide in <project>/tmp/slides/, plus a merged <project>/tmp/preview.html. Returns the file paths. This renders files only — it does not start the interactive web editor (use `bun run dev` for that).",
      inputSchema: {
        merged: z
          .boolean()
          .optional()
          .describe("Also write the merged tmp/preview.html document (default true)."),
      },
    },
    async (args) =>
      guard(async () => {
        if (!app.projectDir) {
          throw new Error("No project open. Run deck_init or deck_open first.");
        }
        const presentation = app.state;
        const slidesDir = join(app.projectDir, "tmp", "slides");
        const files = await writeSlideFiles(presentation, slidesDir);

        const wantMerged = args.merged !== false;
        let mergedFile: string | null = null;
        if (wantMerged && presentation.slides.length > 0) {
          const html = await compileSlidesFromDir(presentation, slidesDir);
          mergedFile = join(app.projectDir, "tmp", "preview.html");
          await writeFile(mergedFile, html, "utf8");
        }

        return {
          previewDir: slidesDir,
          mergedFile,
          slideCount: presentation.slides.length,
          template: presentation.template,
          dimensions: presentation.dimensions,
          slides: presentation.slides.map((slide, index) => ({
            index,
            slideId: slide.id,
            elements: slide.elements.length,
            file: files[index] ?? null,
          })),
          next: "Run deck_review to check geometry and density before exporting.",
        };
      })
  );

  server.registerTool(
    "deck_review",
    {
      description:
        "Inspect the active presentation and report layout, overflow, overlap, off-canvas, unsupported-element and look-density problems as structured findings (slideId > elementId > problem > fix). Text-overflow results are estimates. Run deck_preview first for rendered files.",
    },
    async () =>
      guard(async () => {
        const presentation = app.state;
        const spec = await readLookSpec(presentation.template);
        const densityCeiling = spec ? parseDensityCeiling(spec) : null;

        const findings = reviewPresentation(presentation, densityCeiling);
        const summary = {
          errors: findings.filter((f) => f.severity === "error").length,
          warnings: findings.filter((f) => f.severity === "warning").length,
          info: findings.filter((f) => f.severity === "info").length,
        };

        const notes: string[] = [];
        if (!spec) {
          notes.push(
            `No look spec found for template "${presentation.template}" — the density check was skipped.`
          );
        } else if (densityCeiling === null) {
          notes.push(
            `Look spec "${presentation.template}" has no parseable word ceiling — the density check was skipped.`
          );
        } else {
          notes.push(
            `Measured against the "${presentation.template}" look spec (body ceiling ~${densityCeiling} words).`
          );
        }

        return {
          template: presentation.template,
          dimensions: presentation.dimensions,
          slideCount: presentation.slides.length,
          densityCeiling,
          summary,
          ok: summary.errors === 0,
          findings,
          report: findings.map(
            (f) =>
              `${f.slideId}${f.elementId ? ` > ${f.elementId}` : ""} > ${f.problem} > ${f.fix}`
          ),
          notes,
        };
      })
  );
}
