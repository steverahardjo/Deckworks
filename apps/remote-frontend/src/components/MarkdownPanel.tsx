import { useEffect } from "react";
import { FileCode, X } from "@phosphor-icons/react";

import { MarkdownView } from "./MarkdownView";
import { useAppDispatch, useAppState } from "@/state/store";

export function MarkdownPanel() {
  const { materials, activeMarkdownId } = useAppState();
  const dispatch = useAppDispatch();
  const material = materials.find((item) => item.id === activeMarkdownId && item.kind === "md");
  const hasMd = materials.some((item) => item.kind === "md");

  useEffect(() => {
    if (!material) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dispatch({ type: "close-material" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [material, dispatch]);

  const openNote = () => {
    const note =
      materials.find(
        (item) => item.kind === "md" && item.name.toLowerCase() === "note.md"
      ) ?? materials.find((item) => item.kind === "md");
    if (note) dispatch({ type: "open-material", id: note.id });
  };

  if (!hasMd) return null;

  return (
    <>
      <button
        type="button"
        onClick={openNote}
        className={`absolute right-0 top-1/2 z-30 flex -translate-y-1/2 flex-col items-center gap-2 rounded-l-md border border-r-0 border-border bg-card py-3 pl-1.5 pr-1 text-muted-foreground shadow-[-8px_0_24px_-18px_rgba(28,25,23,0.5)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:text-foreground ${material ? "pointer-events-none translate-x-full opacity-0" : "opacity-100"}`}
        aria-label="Open note"
        title="Open note.md"
      >
        <FileCode size={16} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] [writing-mode:vertical-rl]">
          NOTE
        </span>
      </button>

      <div
        className={`absolute inset-0 z-20 bg-foreground/10 transition-opacity duration-300 ${material ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => dispatch({ type: "close-material" })}
        aria-hidden
      />

      <aside
        className={`absolute inset-y-0 right-0 z-30 flex w-[min(30rem,92vw)] flex-col border-l border-border bg-card shadow-[-16px_0_40px_-28px_rgba(28,25,23,0.5)] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${material ? "translate-x-0" : "translate-x-full"}`}
        aria-label="Markdown source preview"
      >
        {material && (
          <>
            <header className="flex h-14 shrink-0 items-center gap-3 border-b px-5">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ring">
                  Source note
                </p>
                <h2 className="truncate text-sm font-semibold">{material.name}</h2>
              </div>
              <button
                type="button"
                onClick={() => dispatch({ type: "close-material" })}
                className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="Close markdown preview"
              >
                <X size={16} />
              </button>
            </header>
            <article className="min-h-0 flex-1 overflow-y-auto px-5 py-6">
              <MarkdownView source={material.text ?? ""} />
            </article>
          </>
        )}
      </aside>
    </>
  );
}
