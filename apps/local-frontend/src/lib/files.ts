// Client for the local backend's project file viewer
// (`/api/files`, `/api/file`, `/api/raw`).

export type FileEntry = {
  path: string;
  name: string;
  dir: string;
  ext: string;
  kind: "text" | "image";
  size: number;
  mtime: number;
};

export async function listFiles(): Promise<FileEntry[]> {
  const res = await fetch("/api/files");
  if (!res.ok) throw new Error(`Failed to list files (${res.status})`);
  const data = (await res.json()) as { files: FileEntry[] };
  return data.files;
}

export async function readFile(path: string): Promise<string> {
  const res = await fetch(`/api/file?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error(`Failed to read ${path} (${res.status})`);
  const data = (await res.json()) as { path: string; content: string };
  return data.content;
}

export function rawUrl(path: string): string {
  return `/api/raw?path=${encodeURIComponent(path)}`;
}

export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
