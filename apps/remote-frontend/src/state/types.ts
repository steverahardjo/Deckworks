// Frontend-local types for build materials (the "open a directory" model).
//
// A project starts from a directory. That directory is either:
//   - empty  → the user adds materials into it, or
//   - populated → it already contains the necessary files, which we discover.
//
// Materials are the inputs a deck is built from: data files, documents,
// images, and web links. These live in the frontend store for now and will be
// surfaced to the MCP `deck_new` tool once parsing/generation is wired up.

export type MaterialKind = "csv" | "pdf" | "html" | "md" | "image" | "link";

/** Whether a material was added this session or already existed in the opened directory. */
export type MaterialOrigin = "added" | "existing";

export interface Material {
  id: string;
  kind: MaterialKind;
  /** Filename (files) or a human label (links). */
  name: string;
  origin: MaterialOrigin;
  /** Relative path inside the project directory (files only). */
  path?: string;
  /** File size in bytes (files only). */
  size?: number;
  /** Parsed text content — used for csv/md. */
  text?: string;
  /** Inline image preview as a data URL (image). */
  dataUrl?: string;
  /** Web link target (link only). */
  url?: string;
}

export interface ProjectDirectory {
  /** Absolute path of the opened directory. */
  path: string;
  /** Directory basename. */
  name: string;
  materials: Material[];
}
