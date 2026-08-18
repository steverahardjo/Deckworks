import { useState } from "react";
import { FileText, Wand2, Loader2 } from "lucide-react";

import { ExportMenu } from "./ExportMenu";
import { CommentsPanel } from "./CommentsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch, useAppState } from "@/state/store";
import { captureSlide } from "@/lib/captureSlide";

export function TopBar() {
  const { presentation, activeSlideId } = useAppState();
  const dispatch = useAppDispatch();
  const [compiling, setCompiling] = useState(false);
  const openComments = presentation.comments.filter(
    (c) => c.status === "open"
  ).length;

  const handleCompile = async () => {
    if (compiling || openComments === 0) return;
    setCompiling(true);
    try {
      // Capture every slide that has at least one open comment, once per slide.
      const affected = presentation.slides
        .map((slide) => ({
          slide,
          pins: presentation.comments
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
        const screenshot = await captureSlide({
          slide,
          theme: presentation.theme,
          width: presentation.dimensions.width,
          height: presentation.dimensions.height,
          pins,
        });
        compiled.push({ slide, screenshot });
      }

      if (compiled.length > 0) {
        const res = await fetch("/api/compile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slides: compiled }),
        });
        if (!res.ok) throw new Error(`Backend rejected: ${res.status}`);
      }
      dispatch({ type: "compile" });
    } catch (err) {
      console.error("compile failed", err);
    } finally {
      setCompiling(false);
    }
  };

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <FileText className="size-4" />
        <span className="text-xs font-medium uppercase tracking-wider">
          Deckworks
        </span>
      </div>

      <div className="flex-1">
        <Input
          value={presentation.metadata.title}
          onChange={(e) => dispatch({ type: "rename", title: e.target.value })}
          className="h-8 max-w-sm border-transparent bg-transparent text-sm font-medium hover:border-input focus-visible:ring-0"
          aria-label="Presentation name"
        />
      </div>

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
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Wand2 className="size-4" />
        )}
        Compile
        {openComments > 0 && (
          <span className="rounded-full bg-background/20 px-1.5 text-xs tabular-nums">
            {openComments}
          </span>
        )}
      </Button>

      <CommentsPanel slideId={activeSlideId} />

      <ExportMenu />
    </header>
  );
}
