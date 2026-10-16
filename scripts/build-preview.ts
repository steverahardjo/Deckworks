#!/usr/bin/env bun
import { mkdir } from "node:fs/promises";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import tailwind from "bun-plugin-tailwind";

export const ROOT = resolve(import.meta.dir, "..");
export const PREVIEW_ENTRY = join(ROOT, "apps", "local-frontend", "index.ts");

/** Where the compiled preview server is installed. */
export const PREVIEW_BIN =
  process.env.DECKWORKS_PREVIEW_BIN ??
  join(homedir(), ".local", "bin", "deckworks-preview");

/**
 * Compile the local frontend into a standalone binary that embeds Bun, React
 * and Tailwind, so the preview runs without the source tree or node_modules.
 * Uses the Bun.build API (not the CLI) so the Tailwind plugin is applied.
 */
export async function buildPreview(outfile: string = PREVIEW_BIN): Promise<string> {
  await mkdir(dirname(outfile), { recursive: true });

  const result = await Bun.build({
    entrypoints: [PREVIEW_ENTRY],
    compile: { outfile },
    minify: true,
    plugins: [tailwind],
  });

  if (!result.success) {
    for (const log of result.logs) console.error(log);
    throw new Error("Preview build failed.");
  }
  return outfile;
}

if (import.meta.main) {
  console.log(`Building preview binary → ${PREVIEW_BIN}`);
  const out = await buildPreview();
  console.log(`✓ ${out}`);
}
