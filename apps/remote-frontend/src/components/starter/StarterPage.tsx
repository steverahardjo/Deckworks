import { ArrowRight } from "@phosphor-icons/react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import { FocusInput } from "./FocusInput";
import { SourcePicker } from "./SourcePicker";
import { LookCarousel } from "./LookCarousel";

function SectionLabel({ index, title }: { index: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ring">
        {index}
      </span>
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <span className="h-px flex-1 self-center bg-border" aria-hidden />
    </div>
  );
}

export function StarterPage() {
  const { materials, selectedLook, presets, focus } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const look = presets.find((p) => p.id === selectedLook);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-6 place-items-center rounded-[4px] bg-primary text-[10px] font-bold text-primary-foreground">
            D
          </span>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-foreground">
            Deckworks
          </span>
        </div>
        <span className="ml-auto hidden rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground sm:inline">
          agent-native slides
        </span>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-28">
          <div className="rise-in" style={{ "--index": 0 } as React.CSSProperties}>
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ring">
              From material to deck
            </p>
            <h1 className="mt-4 max-w-xl font-serif text-5xl font-medium leading-[1.05] tracking-[-0.02em] sm:text-6xl">
              Build the deck you&rsquo;ll actually present.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
              Add your source material, give the build a direction, and pick a
              look. Deckworks composes the slides, and you refine them with
              comments.
            </p>
          </div>

          <div className="mt-16 space-y-14">
            <section className="rise-in space-y-4" style={{ "--index": 1 } as React.CSSProperties}>
              <SectionLabel index="01" title="Direction" />
              <FocusInput />
            </section>

            <section className="rise-in space-y-4" style={{ "--index": 2 } as React.CSSProperties}>
              <SectionLabel index="02" title="Material" />
              <SourcePicker />
            </section>

            <section className="rise-in space-y-4" style={{ "--index": 3 } as React.CSSProperties}>
              <SectionLabel index="03" title="Look" />
              <LookCarousel />
            </section>
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t px-6 py-4">
        <p className="font-mono text-xs text-muted-foreground">
          {materials.length} material{materials.length === 1 ? "" : "s"} /{" "}
          {look?.name ?? "no"} look
          {focus ? " / focus set" : ""}
        </p>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            dispatch({ type: "build" });
            navigate("/slides");
          }}
        >
          Build deck
          <ArrowRight size={16} weight="bold" />
        </Button>
      </footer>
    </div>
  );
}
