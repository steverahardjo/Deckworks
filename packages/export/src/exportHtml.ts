import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Element, Presentation, Slide, Theme } from "@deckworks/core";

const FONT_STACK =
  '"Anthropic Sans Text", "Inter Variable", Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

const SLIDE_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: ${FONT_STACK}; background: #e5e7eb; }
.slide-surface {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
}
.slide {
  width: var(--slide-width);
  height: var(--slide-height);
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  page-break-after: always;
  break-after: page;
}
.slide:last-child { page-break-after: auto; break-after: auto; }
@media print { body { background: #ffffff; } }
`;

/**
 * Type scale for rendered elements — the single source of truth for element
 * typography. The HTML renderer applies it, and the MCP `deck_review` tool
 * reads it to estimate text overflow.
 */
export const TYPE_SCALE = {
  title: { fontSize: 54, fontWeight: 700, lineHeight: 1.1 },
  subtitle: { fontSize: 28, fontWeight: 400, lineHeight: 1.1 },
  body: { fontSize: 20, fontWeight: 400, lineHeight: 1.6 },
} as const;

export function slideInnerHtml(slide: Slide, theme: Theme): string {
  return slide.elements
    .map((el) => elementHtml(el, theme))
    .filter(Boolean)
    .join("\n      ");
}

export function slideSurfaceHtml(slide: Slide, theme: Theme): string {
  return `<div class="slide-surface" style="background:${theme.background};color:${theme.foreground}">
      ${slideInnerHtml(slide, theme)}
    </div>`;
}

export function slideDocumentHtml(
  slide: Slide,
  theme: Theme,
  dimensions: { width: number; height: number },
  index: number,
  total: number
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Slide ${index + 1} / ${total}</title>
<style>
:root {
  --slide-width: ${dimensions.width}px;
  --slide-height: ${dimensions.height}px;
}
${SLIDE_CSS}
</style>
</head>
<body>
<section class="slide" data-slide="${slide.id}">
${slideSurfaceHtml(slide, theme)}
</section>
</body>
</html>
`;
}

export function renderPresentationHtml(presentation: Presentation): string {
  const { theme, dimensions, slides, metadata } = presentation;
  const slidesHtml = slides
    .map(
      (s, i) => `    <section class="slide" data-slide="${s.id}">
      ${slideSurfaceHtml(s, theme)}
    </section>`
    )
    .join("\n");
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(metadata.title)}</title>
<style>
:root {
  --slide-width: ${dimensions.width}px;
  --slide-height: ${dimensions.height}px;
}
${SLIDE_CSS}
@page {
  size: ${dimensions.width}px ${dimensions.height}px;
  margin: 0;
}
</style>
</head>
<body>
${slidesHtml}
</body>
</html>
`;
}

/**
 * Write one self-contained HTML file per slide into `dir` (e.g. tmp/).
 * Returns the paths of the written files, ordered by slide index.
 */
export async function writeSlideFiles(
  presentation: Presentation,
  dir: string
): Promise<string[]> {
  const { theme, dimensions, slides } = presentation;
  await mkdir(dir, { recursive: true });
  const paths: string[] = [];
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i]!;
    const fileName = `slide-${i + 1}.html`;
    const filePath = join(dir, fileName);
    await writeFile(
      filePath,
      slideDocumentHtml(slide, theme, dimensions, i, slides.length),
      "utf8"
    );
    paths.push(filePath);
  }
  return paths;
}

/**
 * Compile op: load every `slide-*.html` in `dir` and merge them into a single
 * self-contained deck document (the source of the HTML export).
 */
export async function compileSlidesFromDir(
  presentation: Presentation,
  dir: string
): Promise<string> {
  const { theme, dimensions, metadata } = presentation;
  const entries = (await readdir(dir))
    .filter((f) => /^slide-\d+\.html$/.test(f))
    .sort((a, b) => {
      const na = Number(/slide-(\d+)\.html/.exec(a)?.[1]);
      const nb = Number(/slide-(\d+)\.html/.exec(b)?.[1]);
      return na - nb;
    });

  const slidesHtml: string[] = [];
  for (const entry of entries) {
    const html = await readFile(join(dir, entry), "utf8");
    const inner = /<section class="slide"[^>]*>([\s\S]*?)<\/section>/.exec(html)?.[1];
    slidesHtml.push(
      `    <section class="slide" data-slide="${entry.replace(/\.html$/, "")}">\n${inner?.trim() ?? ""}\n    </section>`
    );
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(metadata.title)}</title>
<style>
:root {
  --slide-width: ${dimensions.width}px;
  --slide-height: ${dimensions.height}px;
}
${SLIDE_CSS}
@page {
  size: ${dimensions.width}px ${dimensions.height}px;
  margin: 0;
}
</style>
</head>
<body>
${slidesHtml.join("\n")}
</body>
</html>
`;
}

function elementHtml(el: Element, theme: Theme): string {
  const x = el.position.x;
  const y = el.position.y;
  const w = el.size.width;
  const h = el.size.height;
  const base = `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;
  const text = String(el.properties.text ?? "");

  switch (el.type) {
    case "title":
      return `<div style="${base}font-size:${TYPE_SCALE.title.fontSize}px;font-weight:${TYPE_SCALE.title.fontWeight};line-height:${TYPE_SCALE.title.lineHeight};color:${theme.foreground}">${escapeHtml(
        text
      )}</div>`;
    case "subtitle":
      return `<div style="${base}font-size:${TYPE_SCALE.subtitle.fontSize}px;font-weight:${TYPE_SCALE.subtitle.fontWeight};line-height:${TYPE_SCALE.subtitle.lineHeight};color:${theme.muted}">${escapeHtml(
        text
      )}</div>`;
    case "body":
      return `<div style="${base}font-size:${TYPE_SCALE.body.fontSize}px;line-height:${TYPE_SCALE.body.lineHeight};color:${theme.muted};white-space:pre-line">${escapeHtml(
        text
      )}</div>`;
    case "chart":
      return `<div style="${base}display:flex;align-items:center;justify-content:center;border:2px solid ${theme.accent};border-radius:12px;color:${theme.muted}">Chart</div>`;
    default:
      return "";
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
