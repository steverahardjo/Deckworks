import { FileCsv, FileCode, FileText, Image, Link, X, type Icon } from "@phosphor-icons/react";

import type { Material, MaterialKind } from "@/state/types";

export const KIND_LABEL: Record<MaterialKind, string> = {
  csv: "CSV",
  pdf: "PDF",
  html: "HTML",
  md: "Markdown",
  image: "Image",
  link: "Link",
};

const KIND_ICON: Record<MaterialKind, Icon> = {
  csv: FileCsv,
  pdf: FileText,
  html: FileCode,
  md: FileCode,
  image: Image,
  link: Link,
};

export function MaterialKindIcon({
  kind,
  size = 16,
  className,
}: {
  kind: MaterialKind;
  size?: number;
  className?: string;
}) {
  const IconComp = KIND_ICON[kind];
  return <IconComp size={size} weight="regular" className={className} />;
}

export function MaterialChip({
  material,
  onRemove,
  onOpen,
}: {
  material: Material;
  onRemove: (id: string) => void;
  onOpen?: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-2 rounded-md border border-border bg-card py-1 pl-2 pr-1 text-sm">
      <button
        type="button"
        className="flex min-w-0 items-center gap-2 text-left hover:text-ring"
        onClick={() => onOpen?.(material.id)}
        aria-label={onOpen ? `Open ${material.name}` : material.name}
      >
        <MaterialKindIcon kind={material.kind} className="shrink-0 text-muted-foreground" />
        <span className="max-w-[16rem] truncate">{material.name}</span>
      </button>
      {material.size != null && (
        <span className="text-xs text-muted-foreground">
          {formatSize(material.size)}
        </span>
      )}
      <button
        type="button"
        onClick={() => onRemove(material.id)}
        className="rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`Remove ${material.name}`}
      >
        <X size={12} />
      </button>
    </li>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
