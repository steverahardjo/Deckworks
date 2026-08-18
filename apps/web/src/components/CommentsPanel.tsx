import { useEffect, useRef, useState } from "react";
import {
  MessageSquare,
  X,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppState } from "@/state/store";
import type { Comment } from "@deckworks/core";

export function CommentsPanel({ slideId }: { slideId: string }) {
  const { presentation } = useAppState();
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const comments = presentation.comments.filter((c) => c.slideId === slideId);
  const openCount = comments.filter((c) => c.status === "open").length;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const resolve = (c: Comment) => {
    dispatch({ type: "resolve-comment", commentId: c.id });
  };

  return (
    <div ref={panelRef} className="relative">
      <Button
        variant={openCount > 0 ? "default" : "outline"}
        size="sm"
        className="gap-2"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageSquare className="size-4" />
        Comment
        {comments.length > 0 && (
          <span className="rounded-full bg-background/20 px-1.5 text-xs tabular-nums">
            {comments.length}
          </span>
        )}
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-96 rounded-2xl border border-border bg-card/95 p-3 shadow-[0_1px_0_rgba(255,255,255,0.7)_inset,0_24px_48px_-12px_rgba(0,0,0,0.2)] backdrop-blur-xl">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Comments on this page
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-6 text-foreground/70"
              onClick={() => setOpen(false)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
            {comments.length === 0 ? (
              <p className="py-3 text-center text-sm text-foreground/70">
                No comments on this page yet.
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-border bg-muted/60 p-2"
                >
                  {c.imageUrl && (
                    <img
                      src={c.imageUrl}
                      alt=""
                      className="mb-2 max-h-36 w-full rounded-md object-cover"
                    />
                  )}
                  {c.message && (
                    <p className="text-sm text-foreground">{c.message}</p>
                  )}
                  {c.link && (
                    <a
                      href={c.link}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex items-center gap-1 break-all text-sm text-primary underline-offset-2 hover:underline"
                    >
                      <ExternalLink className="size-3.5 shrink-0" />
                      {c.link}
                    </a>
                  )}
                  {c.position && (
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      at {c.position.x}, {c.position.y}
                    </p>
                  )}
                  {c.status === "open" ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-1.5 h-6 gap-1 px-2 text-[11px] text-foreground/80"
                      onClick={() => resolve(c)}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Resolve
                    </Button>
                  ) : (
                    <p className="mt-1.5 flex items-center gap-1 text-[11px] text-emerald-600">
                      <CheckCircle2 className="size-3.5" />
                      Resolved
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
