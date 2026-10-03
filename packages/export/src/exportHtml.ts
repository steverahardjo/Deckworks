import { readFileSync } from "node:fs";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Element, Presentation, Slide, Theme } from "@deckworks/core";

/**
 * The single shared stylesheet that rules every slide. It lives in the spec
 * directory so all looks, the MCP server and the frontend can agree on it.
 * Override its location with DECKWORKS_SPECS_DIR for bundled installs.
 */
const SPECS_DIR =
  process.env.DECKWORKS_SPECS_DIR ??
  resolve(import.meta.dir, "../../../backend/shared/specs");

let sharedCssCache: string | null = null;
function sharedCss(): string {
  if (sharedCssCache !== null) return sharedCssCache;
  try {
    sharedCssCache = readFileSync(join(SPECS_DIR, "slide.css"), "utf8");
  } catch {
    sharedCssCache = FALLBACK_CSS;
  }
  return sharedCssCache;
}

/**
 * Anthropic Sans, embedded as base64 data URIs so exported documents (and the
 * PDF printed from them by headless Chrome) render the deck's real typeface
 * without depending on fonts installed on the machine.
 */
const FONT_DIR = resolve(import.meta.dir, "../assets/fonts");
const FONT_FILES: [number, string][] = [
  [300, "AnthropicSans-Text-Light-Static.otf"],
  [400, "AnthropicSans-Text-Regular-Static.otf"],
  [500, "AnthropicSans-Text-Medium-Static.otf"],
  [600, "AnthropicSans-Text-Semibold-Static.otf"],
  [700, "AnthropicSans-Text-Bold-Static.otf"],
];

let fontFaceCache: string | null = null;
function fontFaceCss(): string {
  if (fontFaceCache !== null) return fontFaceCache;
  const rules: string[] = [];
  for (const [weight, file] of FONT_FILES) {
    try {
      const b64 = readFileSync(join(FONT_DIR, file)).toString("base64");
      rules.push(
        `@font-face{font-family:"Anthropic Sans Text";font-style:normal;` +
          `font-weight:${weight};font-display:swap;` +
          `src:url(data:font/otf;base64,${b64}) format("opentype");}`
      );
    } catch {
      /* font missing — fall back to the stack */
    }
  }
  fontFaceCache = rules.join("\n");
  return fontFaceCache;
}

/** Minimal fallback so slides stay legible if the spec stylesheet is missing. */
const FALLBACK_CSS = `.slide-surface{position:relative;overflow:hidden;width:100%;height:100%;background:var(--slide-bg,#fff);color:var(--slide-fg,#0f172a);font-family:var(--slide-font,system-ui,sans-serif)}
.slide-el{position:absolute}
.slide-title{font-size:54px;font-weight:700;line-height:1.1;color:var(--slide-fg)}
.slide-subtitle{font-size:28px;line-height:1.1;color:var(--slide-muted)}
.slide-body{font-size:20px;line-height:1.6;color:var(--slide-muted);white-space:pre-line}
.slide-chart{display:flex;align-items:center;justify-content:center;border:2px solid var(--slide-accent);border-radius:12px;color:var(--slide-muted)}
.slide-image{display:flex;align-items:center;justify-content:center;overflow:hidden}
.slide-image>img,.slide-image>svg{width:100%;height:100%;object-fit:contain}`;

const SLIDE_CSS = `
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: var(--font-stack, system-ui, sans-serif); background: #e5e7eb; }
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
 * typography. The shared stylesheet applies it, and the MCP `deck_review` tool
 * reads it to estimate text overflow.
 */
export const TYPE_SCALE = {
  title: { fontSize: 54, fontWeight: 700, lineHeight: 1.1 },
  subtitle: { fontSize: 28, fontWeight: 400, lineHeight: 1.1 },
  body: { fontSize: 20, fontWeight: 400, lineHeight: 1.6 },
} as const;

/** Theme colours + font, exposed to the shared stylesheet as CSS variables. */
function themeVarsCss(theme: Theme): string {
  return `.slide-surface{--slide-bg:${theme.background};--slide-fg:${theme.foreground};--slide-muted:${theme.muted};--slide-accent:${theme.accent};--slide-font:${theme.font};}`;
}

export function slideInnerHtml(slide: Slide): string {
  return slide.elements.map((el) => elementHtml(el)).filter(Boolean).join("\n      ");
}

export function slideSurfaceHtml(slide: Slide): string {
  return `<div class="slide-surface">
      ${slideInnerHtml(slide)}
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
  --font-stack: ${theme.font};
}
${SLIDE_CSS}
${sharedCss()}
${themeVarsCss(theme)}
</style>
</head>
<body>
<section class="slide" data-slide="${slide.id}">
${slideSurfaceHtml(slide)}
</section>
</body>
</html>
`;
}

export function renderPresentationHtml(presentation: Presentation): string {
  const { theme, dimensions, slides, metadata } = presentation;
  const slidesHtml = slides
    .map(
      (s) => `    <section class="slide" data-slide="${s.id}">
      ${slideSurfaceHtml(s)}
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
  --font-stack: ${theme.font};
}
${SLIDE_CSS}
${sharedCss()}
${themeVarsCss(theme)}
${fontFaceCss()}
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
  --font-stack: ${theme.font};
}
${SLIDE_CSS}
${sharedCss()}
${themeVarsCss(theme)}
${fontFaceCss()}
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

/**
 * One element → one `.slide-el .slide-<type>` node carrying only its box
 * geometry inline. All visual styling comes from the shared stylesheet.
 */
function elementHtml(el: Element): string {
  const x = el.position.x;
  const y = el.position.y;
  const w = el.size.width;
  const h = el.size.height;
  const base = `left:${x}px;top:${y}px;width:${w}px;height:${h}px;`;
  const text = String(el.properties.text ?? "");
  const cls = `slide-el slide-${el.type}`;
  const svg = String(el.properties.svg ?? "").trim();

  switch (el.type) {
    case "title":
    case "subtitle":
    case "body":
    case "table":
      return `<div class="${cls}" style="${base}">${escapeHtml(text)}</div>`;
    case "callout":
      return `<div class="${cls}" style="${base}">${escapeHtml(text)}</div>`;
    case "divider":
    case "shape":
      return `<div class="${cls}" style="${base}"></div>`;
    case "image": {
      if (svg) return `<div class="${cls}" style="${base}">${svg}</div>`;
      const src = String(el.properties.src ?? "").trim();
      if (!src) return "";
      return `<div class="${cls}" style="${base}"><img src="${escapeAttr(src)}" alt="${escapeAttr(
        String(el.properties.alt ?? "")
      )}"/></div>`;
    }
    case "chart": {
      if (svg) return `<div class="${cls}" style="${base}">${svg}</div>`;
      return `<div class="${cls}" style="${base}">${escapeHtml(text || "Chart")}</div>`;
    }
    default:
      return "";
  }
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value: string): string {
  return escapeHtml(value);
}
