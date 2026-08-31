import { useRef } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

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
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="max-w-md text-sm text-muted-foreground">
          Scroll to preview how your deck will feel.
        </p>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="icon"
            aria-label="Scroll looks left"
            onClick={() => scrollBy(-1)}
          >
            <CaretLeft size={15} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Scroll looks right"
            onClick={() => scrollBy(1)}
          >
            <CaretRight size={15} />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2"
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
    </div>
  );
}
