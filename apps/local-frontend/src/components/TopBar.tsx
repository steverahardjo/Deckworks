import { useSlides } from "@/state/store";

export function TopBar() {
  const { slides, activeIndex } = useSlides();

  return (
    <header className="glass sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 px-4">
      <div className="flex items-center gap-2.5">
        <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-primary via-primary to-ring text-[11px] font-bold text-primary-foreground shadow-md shadow-black/10">
          D
        </span>
        <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-foreground">
          Deckworks
        </span>
      </div>

      <div className="flex-1" />

      <span className="hidden items-center gap-1.5 rounded-full border border-border/70 bg-card/70 px-2.5 py-1 font-mono text-[11px] text-muted-foreground shadow-sm backdrop-blur-md sm:inline-flex">
        <span className="live-dot inline-block size-1.5 rounded-full bg-emerald-500 text-emerald-500" />
        tmp/slides · live
      </span>
      <span className="rounded-full border border-border/70 bg-muted/60 px-2.5 py-1 font-mono text-[11px] tabular-nums text-muted-foreground">
        {slides.length > 0 ? `${activeIndex + 1} / ${slides.length}` : "no slides"}
      </span>
    </header>
  );
}
