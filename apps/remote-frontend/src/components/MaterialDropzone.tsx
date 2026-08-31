import { useRef } from "react";
import { UploadSimple } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { fileToMaterial } from "@/state/materials";

export function MaterialDropzone({
  onAdd,
  compact = false,
}: {
  onAdd: (material: NonNullable<Awaited<ReturnType<typeof fileToMaterial>>>) => void;
  compact?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const addFiles = async (files: File[]) => {
    for (const file of files) {
      const material = await fileToMaterial(file);
      if (material) onAdd(material);
    }
  };

  return (
    <div
      onDrop={(e) => {
        e.preventDefault();
        void addFiles(Array.from(e.dataTransfer.files));
      }}
      onDragOver={(e) => e.preventDefault()}
      className={`flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-input bg-card/60 text-center transition-colors hover:border-ring/40 ${
        compact ? "px-6 py-6" : "px-6 py-8"
      }`}
    >
      <UploadSimple size={20} weight="regular" className="text-muted-foreground" />
      <p className="text-sm text-foreground">Drag & drop files here</p>
      <p className="text-xs text-muted-foreground">
        CSV, PDF, Markdown, or images
      </p>
      {!compact && (
        <Button
          variant="outline"
          size="sm"
          className="mt-1"
          onClick={() => fileRef.current?.click()}
        >
          Browse files
        </Button>
      )}
      <input
        ref={fileRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(Array.from(e.target.files ?? []));
          e.target.value = "";
        }}
      />
    </div>
  );
}
