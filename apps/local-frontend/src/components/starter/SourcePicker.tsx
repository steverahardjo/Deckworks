import { useRef, useState } from "react";
import { Link } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import { linkToMaterial, fileToMaterial } from "@/state/materials";
import { MaterialChip, KIND_LABEL, MaterialKindIcon } from "@/components/MaterialChip";
import { MaterialDropzone } from "@/components/MaterialDropzone";
import type { MaterialKind } from "@/state/types";

const KIND_ACCEPT: Partial<Record<MaterialKind, string>> = {
  csv: ".csv,text/csv",
  pdf: ".pdf,application/pdf",
  html: ".html,.htm,text/html",
  md: ".md,.markdown,text/markdown",
  image: "image/*",
};

const QUICK_KINDS: MaterialKind[] = ["csv", "pdf", "html", "md", "image"];

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

  const submitLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    dispatch({ type: "add-material", material: linkToMaterial(url) });
    setLinkUrl("");
    setLinkOpen(false);
  };

  return (
    <section className="space-y-3">
      <p className="max-w-md text-sm text-muted-foreground">
        Add the files and links your deck will be generated from.
      </p>

      <MaterialDropzone
        onAdd={(material) => dispatch({ type: "add-material", material })}
      />

      <div className="flex flex-wrap gap-2">
        {QUICK_KINDS.map((kind) => (
          <Button
            key={kind}
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => openPicker(kind)}
          >
            <MaterialKindIcon kind={kind} size={15} />
            {KIND_LABEL[kind]}
          </Button>
        ))}
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => setLinkOpen((v) => !v)}
        >
          <Link size={15} />
          Link
        </Button>
      </div>

      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          for (const file of Array.from(e.target.files ?? [])) {
            void fileToMaterial(file).then((m) => {
              if (m) dispatch({ type: "add-material", material: m });
            });
          }
        }}
      />

      {linkOpen && (
        <div className="flex gap-2">
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitLink();
            }}
            placeholder="https://…"
            className="h-9 flex-1 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button size="sm" onClick={submitLink}>
            Add
          </Button>
        </div>
      )}

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
    </section>
  );
}
