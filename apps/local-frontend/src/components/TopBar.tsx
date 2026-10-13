import { useSlides } from "@/state/store";

export function TopBar() {
  const { slides, activeIndex } = useSlides();

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <span className="grid size-6 place-items-center rounded-[4px] bg-primary text-[10px] font-bold text-primary-foreground">
          D
        </span>
        <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-foreground">
          Deckworks
        </span>
      </div>

      <div className="flex-1" />

      <span className="hidden rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground sm:inline">
        tmp/slides · live
      </span>
      <span className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">
        {slides.length > 0 ? `${activeIndex + 1} / ${slides.length}` : "no slides"}
      </span>
    </header>
  );
}
