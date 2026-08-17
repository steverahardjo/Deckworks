import { useRef, useState } from "react";
import {
  FileCode,
  FileSpreadsheet,
  FileText,
  Image,
  Link2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import { fileToMaterial, linkToMaterial } from "@/state/materials";
import type { MaterialKind } from "@/state/types";

const KIND_LABEL: Record<MaterialKind, string> = {
  csv: "CSV",
  pdf: "PDF",
  md: "Markdown",
  image: "Image",
  link: "Link",
};

const KIND_ACCEPT: Partial<Record<MaterialKind, string>> = {
  csv: ".csv,text/csv",
  pdf: ".pdf,application/pdf",
  md: ".md,.markdown,text/markdown",
  image: "image/*",
};

const QUICK_KINDS: MaterialKind[] = ["csv", "pdf", "md", "image"];

function KindIcon({
  kind,
  className,
}: {
  kind: MaterialKind;
  className?: string;
}) {
  switch (kind) {
    case "csv":
      return <FileSpreadsheet className={className} />;
    case "pdf":
      return <FileText className={className} />;
    case "md":
      return <FileCode className={className} />;
    case "image":
      return <Image className={className} />;
    case "link":
      return <Link2 className={className} />;
  }
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SourcePicker() {
  const { materials } = useAppState();
  const dispatch = useAppDispatch();
  const fileRef = useRef<HTMLInputElement>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const openPicker = (kind: MaterialKind) => {
    const accept = KIND_ACCEPT[kind];
    const input = fileRef.current;
    if (!accept || !input) return;
    input.accept = accept;
    input.value = "";
    input.click();
  };

  const addFiles = async (files: File[]) => {
    for (const file of files) {
      const material = await fileToMaterial(file);
      if (material) dispatch({ type: "add-material", material });
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(e.target.files ?? []));
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void addFiles(Array.from(e.dataTransfer.files));
  };

  const submitLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    dispatch({ type: "add-material", material: linkToMaterial(url) });
    setLinkUrl("");
    setLinkOpen(false);
  };

  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight">Build material</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Add the files and links your deck will be generated from.
      </p>

      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="mt-4 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-white/15 bg-white/5 px-6 py-8 text-center transition-colors hover:border-white/25"
      >
        <Upload className="size-5 text-muted-foreground" />
        <p className="text-sm text-foreground">Drag & drop files here</p>
        <p className="text-xs text-muted-foreground">
          CSV, PDF, Markdown, or images
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {QUICK_KINDS.map((kind) => (
          <Button
            key={kind}
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => openPicker(kind)}
          >
            <KindIcon kind={kind} className="size-4" />
            {KIND_LABEL[kind]}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setLinkOpen((v) => !v)}
        >
          <Link2 className="size-4" />
          Link
        </Button>
      </div>

      {linkOpen && (
        <div className="mt-3 flex gap-2">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitLink();
            }}
            placeholder="https://…"
            className="h-8 flex-1 rounded-md border border-white/15 bg-white/5 px-2 text-sm text-foreground placeholder:text-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button size="sm" onClick={submitLink}>
            Add
          </Button>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={onInputChange}
      />

      {materials.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-2">
          {materials.map((m) => (
            <li
              key={m.id}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-2.5 pr-1 text-sm"
            >
              <KindIcon kind={m.kind} className="size-4 text-muted-foreground" />
              <span className="max-w-[16rem] truncate">{m.name}</span>
              {m.size != null && (
                <span className="text-xs text-muted-foreground">
                  {formatSize(m.size)}
                </span>
              )}
              <button
                type="button"
                onClick={() => dispatch({ type: "remove-material", id: m.id })}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                aria-label={`Remove ${m.name}`}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
