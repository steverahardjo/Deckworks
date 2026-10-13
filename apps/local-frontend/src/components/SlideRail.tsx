import { useEffect, useRef } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useSlides } from "@/state/store";
import { ScaledFrame } from "./ScaledFrame";

export function SlideRail() {
  const { slides, activeIndex, select } = useSlides();
  const activeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  return (
    <aside className="glass flex w-48 shrink-0 flex-col border-r border-border/70">
      <div className="flex items-center justify-between px-3.5 py-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          Slides
        </span>
        <span className="rounded-full bg-muted/70 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-muted-foreground">
          {slides.length}
        </span>
      </div>

      <ScrollArea className="flex-1">
        <div className="flex flex-col gap-2.5 px-3 py-3">
          {slides.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card/60 p-3 text-center">
              <p className="text-xs font-medium text-foreground">No slides</p>
              <p className="mt-1 font-mono text-[10px] leading-relaxed text-muted-foreground">
                Write slide-N.html into tmp/slides.
              </p>
            </div>
          )}
          {slides.map((slide, i) => {
            const isActive = i === activeIndex;
            return (
              <button
                key={slide.id}
                ref={isActive ? activeRef : undefined}
                onClick={() => select(i)}
                className={cn(
                  "group flex flex-col gap-1.5 rounded-xl border bg-card p-1.5 text-left transition-all duration-200 hover:-translate-y-px hover:shadow-md active:scale-[0.98]",
                  isActive
                    ? "border-ring/60 shadow-lg ring-2 ring-ring/25"
                    : "border-border/70 shadow-sm hover:border-ring/40"
                )}
              >
                <div
                  className="w-full overflow-hidden rounded-lg bg-muted/40 ring-1 ring-black/5 dark:ring-white/10"
                  style={{ aspectRatio: "1280 / 720" }}
                >
                  <ScaledFrame html={slide.html} className="size-full" />
                </div>
                <span className="flex items-center justify-between px-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                  {isActive && <span className="size-1.5 rounded-full bg-ring" />}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
