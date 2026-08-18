import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import { FocusInput } from "./FocusInput";
import { SourcePicker } from "./SourcePicker";
import { LookCarousel } from "./LookCarousel";

export function StarterPage() {
  const { materials, selectedLook, presets, focus } = useAppState();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const look = presets.find((p) => p.id === selectedLook);

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Sparkles className="size-4" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Deckworks
          </span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl px-8 py-10">
          <h1 className="text-3xl font-semibold tracking-tight">
            Build your presentation
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Add source material and pick a look. Deckworks turns it into a slide
            deck.
          </p>

          <div className="mt-8">
            <FocusInput />
          </div>

          <div className="mt-10">
            <SourcePicker />
          </div>

          <div className="mt-10">
            <LookCarousel />
          </div>
        </div>
      </div>

      <footer className="flex shrink-0 items-center justify-between border-t px-8 py-4">
        <p className="text-sm text-muted-foreground">
          {materials.length} material{materials.length === 1 ? "" : "s"} ·{" "}
          {look?.name ?? "No"} look
          {focus ? " · focus set" : ""}
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
          <ArrowRight className="size-4" />
        </Button>
      </footer>
    </div>
  );
}
