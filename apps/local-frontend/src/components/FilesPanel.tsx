import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowClockwise,
  ArrowLeft,
  FileImage,
  Files,
  FileText,
  X,
} from "@phosphor-icons/react";

import { MarkdownView } from "./MarkdownView";
import {
  formatSize,
  listFiles,
  rawUrl,
  readFile,
  type FileEntry,
} from "@/lib/files";

const REFRESH_MS = 3000;

export function FilesPanel() {
  const [open, setOpen] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<FileEntry | null>(null);
  const [content, setContent] = useState("");
  const [contentLoading, setContentLoading] = useState(false);
  const [contentError, setContentError] = useState<string | null>(null);
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);

  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  const firstLoad = useRef(true);

  const loadContent = useCallback(async (file: FileEntry) => {
    setContentLoading(true);
    setContentError(null);
    try {
      const text = await readFile(file.path);
      setContent(text);
    } catch (err: unknown) {
      setContentError(err instanceof Error ? err.message : "Failed to read file");
    } finally {
      setContentLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (firstLoad.current) setListLoading(true);
    try {
      const next = await listFiles();
      setFiles(next);
      setListError(null);

      const current = selectedRef.current;
      if (current) {
        const fresh = next.find((file) => file.path === current.path);
        if (!fresh) {
          setSelected(null);
          setRemovedNotice(`${current.path} was removed.`);
        } else if (fresh.kind === "text" && fresh.mtime !== current.mtime) {
          setSelected(fresh);
          void loadContent(fresh);
        } else if (fresh.mtime !== current.mtime) {
          setSelected(fresh);
        }
      }
    } catch (err: unknown) {
      setListError(err instanceof Error ? err.message : "Failed to list files");
    } finally {
      firstLoad.current = false;
      setListLoading(false);
    }
  }, [loadContent]);

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
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      if (cancelled) return;
      await refresh();
      if (!cancelled) timer = setTimeout(tick, REFRESH_MS);
    };
    void tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [open, refresh]);

  const openFile = (file: FileEntry) => {
    setRemovedNotice(null);
    setSelected(file);
    if (file.kind === "text") {
      void loadContent(file);
    } else {
      setContentLoading(false);
      setContentError(null);
    }
  };

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
        title="Project files (.md, .txt, images)"
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
            <h2 className="truncate text-sm font-semibold">Sources · .md · .txt · images</h2>
          </div>
          <button
            type="button"
            onClick={() => void refresh()}
            className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Refresh files"
            title="Refresh"
          >
            <ArrowClockwise size={16} />
          </button>
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
                No .md, .txt or image files.
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
                      onClick={() => openFile(file)}
                      className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs transition-colors ${selected?.path === file.path ? "bg-card text-foreground" : "text-foreground/75 hover:bg-card/70"}`}
                    >
                      {file.kind === "image" ? (
                        <FileImage size={13} className="shrink-0 text-muted-foreground" />
                      ) : (
                        <FileText size={13} className="shrink-0 text-muted-foreground" />
                      )}
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
                  {selected.kind === "image" ? (
                    <div className="flex h-full items-center justify-center rounded-sm bg-muted/40 p-3">
                      <img
                        src={`${rawUrl(selected.path)}?v=${selected.mtime}`}
                        alt={selected.name}
                        className="max-h-full max-w-full rounded-sm object-contain"
                      />
                    </div>
                  ) : contentLoading ? (
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
                <p className="text-sm text-muted-foreground">
                  {removedNotice ?? "Select a file to view it."}
                </p>
              </div>
            )}
          </article>
        </div>
      </aside>
    </>
  );
}
