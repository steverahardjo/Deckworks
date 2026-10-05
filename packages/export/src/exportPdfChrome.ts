import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { Presentation } from "@deckworks/core";

import { compileSlidesFromDir } from "./exportHtml.js";

/**
 * Print the self-contained HTML deck to PDF with headless Chrome, so the PDF is
 * pixel-faithful to `slide.css` and the SVG exhibits (unlike the React-PDF
 * fallback, which does neither).
 *
 * Returns null when Chrome is unavailable or printing fails, so callers can
 * fall back to React-PDF.
 */
const CANDIDATES = [
  process.env.DECKWORKS_CHROME,
  process.env.CHROME_BIN,
  "/usr/bin/google-chrome",
  "/usr/bin/google-chrome-stable",
  "google-chrome",
  "google-chrome-stable",
  "chromium",
  "chromium-browser",
].filter(Boolean) as string[];

let cachedChrome: string | null | undefined;

async function run(bin: string, args: string[]): Promise<number> {
  try {
    const proc = Bun.spawn([bin, ...args], {
      stdin: "ignore",
      stdout: "ignore",
      stderr: "ignore",
    });
    return await proc.exited;
  } catch {
    return 1;
  }
}

export async function findChrome(): Promise<string | null> {
  if (cachedChrome !== undefined) return cachedChrome;
  for (const bin of CANDIDATES) {
    try {
      if ((await run(bin, ["--version"])) === 0) {
        cachedChrome = bin;
        return bin;
      }
    } catch {
      /* try the next candidate */
    }
  }
  cachedChrome = null;
  return null;
}

export async function renderPresentationPdfViaChrome(
  presentation: Presentation,
  slidesDir: string
): Promise<Uint8Array | null> {
  const chrome = await findChrome();
  if (!chrome) return null;

  const html = await compileSlidesFromDir(presentation, slidesDir);
  const dir = await mkdtemp(join(tmpdir(), "deckworks-pdf-"));
  const htmlPath = join(dir, "deck.html");
  const pdfPath = join(dir, "deck.pdf");

  try {
    await writeFile(htmlPath, html, "utf8");
    const profileDir = join(dir, "chrome-profile");
    const code = await run(chrome, [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-crash-reporter",
      "--disable-breakpad",
      "--disable-dev-shm-usage",
      "--disable-features=Crashpad",
      "--no-first-run",
      "--no-default-browser-check",
      "--hide-scrollbars",
      "--no-pdf-header-footer",
      `--user-data-dir=${profileDir}`,
      `--print-to-pdf=${pdfPath}`,
      `file://${htmlPath}`,
    ]);
    if (code !== 0) return null;
    const buf = await readFile(pdfPath);
    return new Uint8Array(buf);
  } catch {
    return null;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
