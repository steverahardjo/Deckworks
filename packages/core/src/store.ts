import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";

import { presets } from "./presets.js";
import type { Comment, Presentation, Slide } from "./types.js";

const DECK_FILE = "deck.json";

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
  templateId = "consulting"
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
    this.presentation = existing ?? createPresentation();
    await mkdir(dir, { recursive: true });
    await this.save();
  }

  async newDeck(path: string, templateId?: string, title?: string): Promise<void> {
    const dir = resolve(path);
    this.dir = dir;
    this.presentation = createPresentation(title, templateId);
    await mkdir(dir, { recursive: true });
    await this.save();
  }

  async open(path: string): Promise<void> {
    const dir = resolve(path);
    this.dir = dir;
    const raw = await readFile(join(dir, DECK_FILE), "utf8");
    this.presentation = JSON.parse(raw) as Presentation;
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
