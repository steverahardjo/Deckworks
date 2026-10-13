import { useState } from "react";
import { MagicWand, CircleNotch } from "@phosphor-icons/react";

import { Button } from "./ui/button";
import { useSlides } from "../state/store";
import { captureSlide } from "../lib/captureSlide";
import { CommentsPanel } from "./CommentsPanel";

export function TopBar() {
  const { slides, activeIndex, comments, resolveAllComments } = useSlides();
  const [compiling, setCompiling] = useState(false);
  const openComments = comments.filter((c) => c.status === "open").length;
  const activeSlide = slides[activeIndex];

  const handleCompile = async () => {
    if (compiling || openComments === 0) return;
    setCompiling(true);
    try {
      // Capture every slide that has at least one open comment, once per slide.
      const affected = slides
        .map((slide) => ({
          slide,
          pins: comments
            .filter(
              (c) => c.slideId === slide.id && c.status === "open" && c.position
            )
            .map((c) => ({
              x: c.position!.x,
              y: c.position!.y,
              label: c.message || "Comment",
            })),
        }))
        .filter((s) => s.pins.length > 0);

      const compiled = [];
      for (const { slide, pins } of affected) {
        const screenshot = await captureSlide({ html: slide.html, pins });
        compiled.push({ slideId: slide.id, screenshot });
      }

      if (compiled.length > 0) {
        const res = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: compiled }),
        });
        if (!res.ok) throw new Error(`Backend rejected: ${res.status}`);
      }
      resolveAllComments();
    } catch (err) {
      console.error("compile failed", err);
    } finally {
      setCompiling(false);
    }
  };

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

      <Button
        variant={openComments > 0 ? "default" : "outline"}
        size="sm"
        className="gap-2"
        disabled={openComments === 0 || compiling}
        onClick={() => void handleCompile()}
        title={
          openComments > 0
            ? `Compile ${openComments} open comment${openComments === 1 ? "" : "s"}`
            : "Add a comment to enable compiling"
        }
      >
        {compiling ? (
          <CircleNotch size={16} className="animate-spin" />
        ) : (
          <MagicWand size={16} />
        )}
        Compile
        {openComments > 0 && (
          <span className="rounded-full bg-background/20 px-1.5 text-xs tabular-nums">
            {openComments}
          </span>
        )}
      </Button>

      {activeSlide ? <CommentsPanel slideId={activeSlide.id} /> : null}
    </header>
  );
}
