import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Files, FileText, X } from "@phosphor-icons/react";

import { MarkdownView } from "./MarkdownView";
import { formatSize, listFiles, readFile, type FileEntry } from "@/lib/files";

export function FilesPanel() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const [content, setContent] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setListLoading(true);
    setListError(null);
    listFiles()
      .then((next) => {
        if (!cancelled) setFiles(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setListError(err instanceof Error ? err.message : "Failed to list files");
        }
      })
      .finally(() => {
        if (!cancelled) setListLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    setContentLoading(true);
    setContentError(null);
    readFile(selected.path)
      .then((text) => {
        if (!cancelled) setContent(text);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setContentError(err instanceof Error ? err.message : "Failed to read file");
        }
      })
      .finally(() => {
        if (!cancelled) setContentLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  const groups = useMemo(() => {
    const map = new Map<string, FileEntry[]>();
    for (const file of files) {
      const bucket = map.get(file.dir) ?? [];
      bucket.push(file);
      map.set(file.dir, bucket);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dir, bucket]) => ({
        dir,
        files: [...bucket].sort((a, b) => a.name.localeCompare(b.name)),
      }));
  }, [files]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`absolute right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-md border border-r-0 border-border bg-card py-3 pl-1.5 pr-1 text-muted-foreground shadow-[-8px_0_24px_-18px_rgba(28,25,23,0.5)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground ${open ? "pointer-events-none translate-x-full opacity-0" : "opacity-100"}`}
        aria-label="Open project files"
        title="Project files (.md, .txt)"
      >
        <Files size={16} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
          FILES
        </span>
      </button>

      <div
        className={`absolute inset-0 z-20 bg-foreground/10 transition-opacity duration-300 ${open ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setOpen(false)}
        aria-hidden
      />

      <aside
        className={`absolute inset-y-0 right-0 z-30 flex w-[min(40rem,94vw)] flex-col border-l border-border bg-card shadow-[-16px_0_40px_-28px_rgba(28,25,23,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Project file viewer"
      >
        <header className="flex h-14 shrink-0 items-center gap-3 border-b px-5">
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ring">
              Project files
            </p>
            <h2 className="truncate text-sm font-semibold">Sources · .md &amp; .txt</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close file viewer"
          >
            <X size={16} />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          <nav className="w-44 shrink-0 overflow-y-auto border-r border-border bg-muted/30 py-2">
            {listError ? (
              <p className="px-3 py-2 text-xs text-destructive">{listError}</p>
            ) : listLoading ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Loading…</p>
            ) : groups.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">
                No .md or .txt files.
              </p>
            ) : (
              groups.map((group) => (
                <div key={group.dir || "."} className="mb-1">
                  <p className="px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {group.dir || "project root"}
                  </p>
                  {group.files.map((file) => (
                    <button
                      key={file.path}
                      type="button"
                      onClick={() => setSelected(file)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${selected?.path === file.path ? "bg-card text-foreground" : "text-foreground/75 hover:bg-card/70"}`}
                    >
                      <FileText size={13} className="shrink-0 text-muted-foreground" />
                      <span className="truncate">{file.name}</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </nav>

          <article className="flex min-h-0 flex-1 flex-col">
            {selected ? (
              <>
                <div className="flex shrink-0 items-center gap-2 border-b px-4 py-2">
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label="Back to file list"
                  >
                    <ArrowLeft size={14} />
                  </button>
                  <span className="min-w-0 flex-1 truncate font-mono text-xs text-foreground/80">
                    {selected.path}
                  </span>
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    {formatSize(selected.size)}
                  </span>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  {contentLoading ? (
                    <p className="text-sm text-muted-foreground">Loading…</p>
                  ) : contentError ? (
                    <p className="text-sm text-destructive">{contentError}</p>
                  ) : selected.ext === "md" ? (
                    <MarkdownView source={content} />
                  ) : (
                    <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-6 text-foreground/85">
                      {content}
                    </pre>
                  )}
                </div>
              </>
            ) : (
              <div className="grid flex-1 place-items-center px-6 text-center">
                <p className="text-sm text-muted-foreground">Select a file to view it.</p>
              </div>
            )}
          </article>
        </div>
      </aside>
    </>
  );
}
