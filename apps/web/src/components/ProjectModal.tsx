import { useEffect, useRef, useState } from "react";
import { FileCode, FileSpreadsheet, FileText, Image, Link2, Send, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import { fileToMaterial } from "@/state/materials";
import type { MaterialKind } from "@/state/types";

const KIND_LABEL: Record<MaterialKind, string> = {
  csv: "CSV",
  pdf: "PDF",
  md: "Markdown",
  image: "Image",
  link: "Link",
};

function KindIcon({ kind, className }: { kind: MaterialKind; className?: string }) {
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

export function ProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { materials, directive } = useAppState();
  const dispatch = useAppDispatch();
  const [value, setValue] = useState(directive);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setValue(directive);
      requestAnimationFrame(() => textareaRef.current?.focus());
    }
  }, [open, directive]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const submit = () => {
    dispatch({ type: "set-directive", directive: value.trim() });
  };

  const addFiles = async (files: File[]) => {
    for (const file of files) {
      const material = await fileToMaterial(file);
      if (material) dispatch({ type: "add-material", material });
    }
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    void addFiles(Array.from(e.target.files ?? []));
    e.target.value = "";
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void addFiles(Array.from(e.dataTransfer.files));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-6 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mt-[8vh] w-full max-w-xl rounded-2xl border border-border bg-card shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_64px_-16px_rgba(0,0,0,0.35)]">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Project changes
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct the build or add material, applied across the whole deck.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Directive
            </label>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={3}
              placeholder="e.g. Keep every slide under 10 words per bullet, lead each section with a customer quote"
              className="mt-1.5 w-full resize-none rounded-xl border border-input bg-card/40 px-3 py-2 text-sm text-foreground shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(0,0,0,0.04)] placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="mt-1.5 flex justify-end">
              <Button size="sm" onClick={submit}>
                <Send className="size-3.5" />
                Apply
              </Button>
            </div>
          </div>

          <div
            onDrop={onDrop}
            onDragOver={(e) => e.preventDefault()}
            className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border bg-card/60 px-6 py-6 text-center shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_8px_24px_-16px_rgba(0,0,0,0.1)] transition-colors hover:border-ring/40"
          >
            <Upload className="size-5 text-muted-foreground" />
            <p className="text-sm text-foreground">Drag & drop files here</p>
            <p className="text-xs text-muted-foreground">
              CSV, PDF, Markdown, or images
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() => fileRef.current?.click()}
            >
              Browse files
            </Button>
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={onInputChange}
            />
          </div>

          {materials.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {materials.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center gap-2 rounded-full border border-border bg-card py-1 pl-2.5 pr-1 text-sm shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_1px_2px_rgba(0,0,0,0.04)]"
                >
                  <KindIcon kind={m.kind} className="size-4 text-muted-foreground" />
                  <span className="max-w-[16rem] truncate">{m.name}</span>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "remove-material", id: m.id })}
                    className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label={`Remove ${m.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
