import { useEffect, useRef, useState } from "react";
import { PaperPlaneTilt, X } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import { MaterialChip } from "@/components/MaterialChip";
import { MaterialDropzone } from "@/components/MaterialDropzone";

export function ProjectModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { materials, directive } = useAppState();
  const dispatch = useAppDispatch();
  const [value, setValue] = useState(directive);
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-stone-900/40 p-6 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="mt-[8vh] w-full max-w-xl rounded-lg border border-border bg-card shadow-[0_24px_64px_-24px_rgba(28,25,23,0.3)]">
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
            <X size={14} />
          </Button>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
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
              className="mt-1.5 w-full resize-none rounded-md border border-input bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <div className="mt-1.5 flex justify-end">
              <Button size="sm" onClick={submit}>
                <PaperPlaneTilt size={14} />
                Apply
              </Button>
            </div>
          </div>

          <MaterialDropzone
            compact
            onAdd={(material) => dispatch({ type: "add-material", material })}
          />

          {materials.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {materials.map((m) => (
                <MaterialChip
                  key={m.id}
                  material={m}
                  onRemove={(id) => dispatch({ type: "remove-material", id })}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
