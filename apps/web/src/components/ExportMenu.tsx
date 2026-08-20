import { useState } from "react";
import { FileArrowDown, CircleNotch } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "./FileTypeIcon";
import { useAppState } from "@/state/store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ExportFormat = "pdf" | "html" | "pptx";

async function downloadExport(format: ExportFormat, presentation: unknown) {
  const res = await fetch("/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ format, presentation }),
  });
  if (!res.ok) throw new Error(`Export failed (${res.status})`);
  const blob = await res.blob();
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const match = /filename="([^"]+)"/.exec(disposition);
  const fileName = match?.[1] ?? `presentation.${format}`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function ExportMenu() {
  const { presentation } = useAppState();
  const [busy, setBusy] = useState<ExportFormat | null>(null);

  const handle = async (format: ExportFormat) => {
    if (busy) return;
    setBusy(format);
    try {
      await downloadExport(format, presentation);
    } catch (err) {
      console.error("export failed", err);
    } finally {
      setBusy(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2" disabled={busy !== null}>
          {busy ? (
            <CircleNotch size={16} className="animate-spin" />
          ) : (
            <FileArrowDown size={16} />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Export deck</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => void handle("pdf")}>
          <FileTypeIcon format="PDF" />
          {busy === "pdf" ? "Exporting…" : "PDF"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handle("html")}>
          <FileTypeIcon format="HTML" />
          {busy === "html" ? "Exporting…" : "HTML"}
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void handle("pptx")}>
          <FileTypeIcon format="PPTX" />
          {busy === "pptx" ? "Exporting…" : "PPTX"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
