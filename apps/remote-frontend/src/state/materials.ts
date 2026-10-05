import type { Material, MaterialKind } from "./types";

const EXT_KIND: Record<string, MaterialKind> = {
  csv: "csv",
  pdf: "pdf",
  html: "html",
  htm: "html",
  md: "md",
  markdown: "md",
};

let seq = 0;

function nextId(): string {
  return `material-${Date.now()}-${seq++}`;
}

export function detectKind(file: File): MaterialKind | null {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (EXT_KIND[ext]) return EXT_KIND[ext];
  if (file.type.startsWith("image/")) return "image";
  return null;
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function fileToMaterial(file: File): Promise<Material | null> {
  const kind = detectKind(file);
  if (!kind) return null;

  const material: Material = {
    id: nextId(),
    kind,
    name: file.name,
    origin: "added",
    size: file.size,
  };

  if (kind === "csv" || kind === "md" || kind === "html") {
    material.text = await file.text();
  } else if (kind === "image") {
    material.dataUrl = await readAsDataURL(file);
  }

  return material;
}

export function linkToMaterial(url: string): Material {
  return {
    id: nextId(),
    kind: "link",
    name: url,
    origin: "added",
    url,
  };
}
