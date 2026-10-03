import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { Presentation } from "@deckworks/core";

import { compileSlidesFromDir, writeSlideFiles } from "./exportHtml.js";
import { renderPresentationPdf } from "./exportPdf.js";
import { renderPresentationPdfViaChrome } from "./exportPdfChrome.js";
import { renderPresentationPptx } from "./exportPptx.js";

export { writeSlideFiles, compileSlidesFromDir } from "./exportHtml.js";

export type ExportFormat = "html" | "pdf" | "pptx";

export interface ExportResult {
  format: ExportFormat;
  file: string;
  bytes: number;
  slides: number;
}

/**
 * Backend export op. Writes one self-contained HTML file per slide into
 * `dir/slides` (e.g. tmp/slides/slide-1.html), then compiles the deck:
 *
 * - html: loads every slide file from disk and merges them into a single
 *   self-contained document (export.html in `dir`).
 * - pdf: prints every slide as one page (export.pdf in `dir`).
 * - pptx: builds a native PowerPoint file (export.pptx in `dir`).
 *
 * The per-slide files are left on disk so a frontend can fetch and display
 * them wrapped in the Slide component, and agents can read them directly.
 */
export async function exportDeck(
  presentation: Presentation,
  dir: string,
  format: ExportFormat
): Promise<ExportResult> {
  const slidesDir = join(dir, "slides");
  await mkdir(slidesDir, { recursive: true });
  const slideFiles = await writeSlideFiles(presentation, slidesDir);

  const fileName = `export.${format}`;
  const filePath = join(dir, fileName);

  if (format === "html") {
    const html = await compileSlidesFromDir(presentation, slidesDir);
    await writeFile(filePath, html, "utf8");
    return {
      format,
      file: filePath,
      bytes: Buffer.byteLength(html, "utf8"),
      slides: slideFiles.length,
    };
  }

  if (format === "pptx") {
    const pptx = await renderPresentationPptx(presentation);
    await writeFile(filePath, pptx);
    return {
      format,
      file: filePath,
      bytes: pptx.byteLength,
      slides: slideFiles.length,
    };
  }

  // Prefer the HTML/CSS engine (headless Chrome) so the PDF matches slide.css
  // and the SVG exhibits; fall back to React-PDF when Chrome is unavailable.
  const pdf =
    (await renderPresentationPdfViaChrome(presentation, slidesDir)) ??
    (await renderPresentationPdf(presentation));
  await writeFile(filePath, pdf);
  return {
    format,
    file: filePath,
    bytes: pdf.byteLength,
    slides: slideFiles.length,
  };
}
