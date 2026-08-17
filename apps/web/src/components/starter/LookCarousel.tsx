import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import { LookCard } from "./LookCard";

export function LookCarousel() {
  const { presets, selectedLook } = useAppState();
  const dispatch = useAppDispatch();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Choose a look</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Scroll to preview how your deck will feel.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label="Scroll looks left"
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Scroll looks right"
            onClick={() => scrollBy(1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
      >
        {presets.map((preset) => (
          <div key={preset.id} className="snap-start">
            <LookCard
              preset={preset}
              selected={preset.id === selectedLook}
              onSelect={() =>
                dispatch({ type: "select-look", presetId: preset.id })
              }
            />
          </div>
        ))}
      </div>
    </section>
  );
}
