import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { presets } from "./presets.js";
import type { Comment, Presentation, Slide } from "./types.js";

const DECK_FILE = "deck.json";
export const DEFAULT_WORKFLOW = "create";
const SHARED_SANDBOX_DIR = resolve(import.meta.dir, "../../../backend/shared/sandbox");

const SANDBOX_FALLBACK = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Deckworks sandbox</title><link rel="stylesheet" href="./slide.css"></head>
<body><main class="sandbox"><p>Deckworks sandbox</p><h1>Drop a rendered slide here.</h1></main></body></html>
`;

async function writeIfMissing(path: string, contents: string): Promise<void> {
  try {
    await access(path);
  } catch {
    await writeFile(path, contents, "utf8");
  }
}

async function ensureProjectWorkspace(
  dir: string,
  templateId: string,
  workflow = DEFAULT_WORKFLOW
): Promise<void> {
  const theme = presets.find((preset) => preset.id === templateId)?.theme ?? presets[0]!.theme;
  await Promise.all([
    mkdir(join(dir, "assets"), { recursive: true }),
    mkdir(join(dir, "tmp"), { recursive: true }),
    mkdir(join(dir, "sandbox"), { recursive: true }),
  ]);

  const stylesheet = await readFile(join(SHARED_SANDBOX_DIR, "slide.css"), "utf8").catch(() => "");
  await writeIfMissing(join(dir, "sandbox", "index.html"), SANDBOX_FALLBACK);
  await writeIfMissing(join(dir, "sandbox", "slide.css"), stylesheet);
  await writeIfMissing(
    join(dir, "deck-profile.md"),
    `# Deck profile\n\n- Workflow: ${workflow}\n- Look: ${templateId}\n- Canvas: 1280×720\n- Background: ${theme.background}\n- Foreground: ${theme.foreground}\n- Accent: ${theme.accent}\n- Muted: ${theme.muted}\n- Font: ${theme.font}\n- Components: title, subtitle, body, chart, image\n- Update this file when the selected workflow, look, or audience changes.\n`
  );
  await writeIfMissing(
    join(dir, "scratchpad.md"),
    "# Scratchpad\n\nUse this file for temporary analysis, source checks, and slide-construction decisions.\n"
  );
}

export interface ElementPatch {
  text?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  properties?: Record<string, unknown>;
}

export function createPresentation(
  title = "Untitled presentation",
  templateId = "consulting",
  workflow = DEFAULT_WORKFLOW
): Presentation {
  const now = new Date().toISOString();
  const theme =
    presets.find((p) => p.id === templateId)?.theme ??
    presets.find((p) => p.id === "consulting")!.theme;

  return {
    metadata: { title, author: "deckworks", createdAt: now, updatedAt: now },
    dimensions: { width: 1280, height: 720 },
    theme,
    template: theme.id,
    workflow,
    slides: [],
    comments: [],
  };
}

export class DeckworksApp {
  private dir: string | null = null;
  private presentation: Presentation = createPresentation();

  get projectDir(): string | null {
    return this.dir;
  }

  get state(): Presentation {
    return this.presentation;
  }

  async init(path: string): Promise<void> {
    const dir = resolve(path);
    this.dir = dir;
    const existing = await this.tryRead();
    this.presentation = existing
      ? { ...existing, workflow: existing.workflow ?? DEFAULT_WORKFLOW }
      : createPresentation();
    await mkdir(dir, { recursive: true });
    await ensureProjectWorkspace(dir, this.presentation.template, this.presentation.workflow);
    await this.save();
  }

  async newDeck(
    path: string,
    templateId?: string,
    title?: string,
    workflow = DEFAULT_WORKFLOW
  ): Promise<void> {
    const dir = resolve(path);
    this.dir = dir;
    this.presentation = createPresentation(title, templateId, workflow);
    await mkdir(dir, { recursive: true });
    await ensureProjectWorkspace(dir, this.presentation.template, this.presentation.workflow);
    await this.save();
  }

  async open(path: string): Promise<void> {
    const dir = resolve(path);
    this.dir = dir;
    const raw = await readFile(join(dir, DECK_FILE), "utf8");
    const parsed = JSON.parse(raw) as Presentation;
    this.presentation = { ...parsed, workflow: parsed.workflow ?? DEFAULT_WORKFLOW };
    await ensureProjectWorkspace(dir, this.presentation.template, this.presentation.workflow);
  }

  async save(): Promise<void> {
    if (!this.dir) throw new Error("No project open. Run deck_init or deck_open first.");
    this.presentation.metadata.updatedAt = new Date().toISOString();
    await writeFile(
      join(this.dir, DECK_FILE),
      JSON.stringify(this.presentation, null, 2),
      "utf8"
    );
  }

  status() {
    return {
      projectDir: this.dir,
      title: this.presentation.metadata.title,
      template: this.presentation.template,
      workflow: this.presentation.workflow ?? DEFAULT_WORKFLOW,
      slideCount: this.presentation.slides.length,
      slides: this.presentation.slides.map((s) => ({
        id: s.id,
        layout: s.layout,
        elementCount: s.elements.length,
      })),
      openComments: this.presentation.comments.filter((c) => c.status === "open").length,
      updatedAt: this.presentation.metadata.updatedAt,
    };
  }

  async setWorkflow(workflow: string): Promise<void> {
    const normalized = workflow.trim().toLowerCase();
    if (!/^[a-z0-9][a-z0-9-]*$/.test(normalized)) {
      throw new Error(`Invalid workflow "${workflow}".`);
    }
    this.presentation.workflow = normalized;
    if (this.dir) {
      await this.save();
      await writeFile(
        join(this.dir, "deck-profile.md"),
        `# Deck profile\n\n- Workflow: ${normalized}\n- Look: ${this.presentation.template}\n- Canvas: ${this.presentation.dimensions.width}×${this.presentation.dimensions.height}\n- Background: ${this.presentation.theme.background}\n- Foreground: ${this.presentation.theme.foreground}\n- Accent: ${this.presentation.theme.accent}\n- Muted: ${this.presentation.theme.muted}\n- Font: ${this.presentation.theme.font}\n- Components: title, subtitle, body, chart, image\n- Update this file when the selected workflow, look, or audience changes.\n`,
        "utf8"
      );
    }
  }

  addSlide(slide: Slide): void {
    this.presentation.slides.push(slide);
  }

  deleteSlide(slideId: string): void {
    const idx = this.presentation.slides.findIndex((s) => s.id === slideId);
    if (idx === -1) throw new Error(`Slide "${slideId}" not found.`);
    this.presentation.slides.splice(idx, 1);
  }

  reorderSlide(slideId: string, index: number): void {
    const idx = this.presentation.slides.findIndex((s) => s.id === slideId);
    if (idx === -1) throw new Error(`Slide "${slideId}" not found.`);
    const [slide] = this.presentation.slides.splice(idx, 1);
    const clamped = Math.max(0, Math.min(index, this.presentation.slides.length));
    this.presentation.slides.splice(clamped, 0, slide!);
  }

  change(slideId: string, elementId: string, patch: ElementPatch): void {
    const slide = this.presentation.slides.find((s) => s.id === slideId);
    if (!slide) throw new Error(`Slide "${slideId}" not found.`);
    const element = slide.elements.find((e) => e.id === elementId);
    if (!element) throw new Error(`Element "${elementId}" not found on slide "${slideId}".`);

    if (patch.x !== undefined) element.position.x = patch.x;
    if (patch.y !== undefined) element.position.y = patch.y;
    if (patch.width !== undefined) element.size.width = patch.width;
    if (patch.height !== undefined) element.size.height = patch.height;
    if (patch.text !== undefined) element.properties.text = patch.text;
    if (patch.properties) {
      element.properties = { ...element.properties, ...patch.properties };
    }
  }

  addComment(comment: Comment): void {
    this.presentation.comments.push(comment);
  }

  resolveComment(commentId: string): void {
    const comment = this.presentation.comments.find((c) => c.id === commentId);
    if (!comment) throw new Error(`Comment "${commentId}" not found.`);
    comment.status = "resolved";
  }

  private async tryRead(): Promise<Presentation | null> {
    try {
      const raw = await readFile(join(this.dir!, DECK_FILE), "utf8");
      return JSON.parse(raw) as Presentation;
    } catch {
      return null;
    }
  }
}
