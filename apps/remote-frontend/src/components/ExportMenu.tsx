import { useState } from "react";
import { FileArrowDown, CircleNotch, WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { FileTypeIcon } from "./FileTypeIcon";
import { useAppState } from "@/state/store";
import { ApiError, exportDeck, getProjectId } from "@/lib/remote";
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
  const projectId = getProjectId();
  if (!projectId) throw new Error("No active project");
  const res = await exportDeck(projectId, format, presentation as never);
  if (!res.ok) throw new ApiError(`Export failed (${res.status})`, res.status);
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
  const [error, setError] = useState("");

  const handle = async (format: ExportFormat) => {
    if (busy) return;
    setBusy(format);
    setError("");
    try {
      await downloadExport(format, presentation);
    } catch (err) {
      if (err instanceof ApiError && err.status === 501) {
        setError("Remote export is not implemented yet.");
      } else {
        console.error("export failed", err);
        setError(err instanceof Error ? err.message : "Export failed");
      }
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
        {error && (
          <p className="flex items-center gap-1 px-2 py-1 text-xs text-destructive">
            <WarningCircle size={13} />
            {error}
          </p>
        )}
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
