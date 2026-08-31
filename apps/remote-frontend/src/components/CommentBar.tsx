import {
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Feather,
  X,
  PaperPlaneTilt,
  ImageSquare,
  Link,
  CircleNotch,
  Check,
  WarningCircle,
} from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppState } from "@/state/store";
import { addComment, getProjectId } from "@/lib/remote";
import type { Comment, Slide } from "@deckworks/core";

const DRAG_THRESHOLD = 4;

export interface CommentBarHandle {
  openAt: (pos: { x: number; y: number }) => void;
}

type SendStatus = "idle" | "sending" | "sent" | "error";

export const CommentBar = forwardRef<CommentBarHandle, { slide: Slide }>(
  function CommentBar({ slide }, ref) {
    const { presentation } = useAppState();
    const dispatch = useAppDispatch();
    const [open, setOpen] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [placed, setPlaced] = useState(false);

    const [message, setMessage] = useState("");
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [link, setLink] = useState("");
    const [showLink, setShowLink] = useState(false);
    const [status, setStatus] = useState<SendStatus>("idle");
    const [errorMsg, setErrorMsg] = useState("");

    const barRef = useRef<HTMLDivElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const anchorRef = useRef<{ x: number; y: number } | null>(null);
    const dragRef = useRef<{
      pointerId: number;
      startX: number;
      startY: number;
      originX: number;
      originY: number;
      moved: boolean;
    } | null>(null);

    const commentCount = presentation.comments.filter(
      (c) => c.slideId === slide.id && c.status === "open"
    ).length;

    useImperativeHandle(ref, () => ({
      openAt(p) {
        const bar = barRef.current;
        const stage = bar?.parentElement;
        let x = p.x;
        let y = p.y;
        if (bar && stage) {
          const stageRect = stage.getBoundingClientRect();
          const barRect = bar.getBoundingClientRect();
          x = Math.min(
            Math.max(0, x),
            Math.max(0, stageRect.width - barRect.width)
          );
          y = Math.min(
            Math.max(0, y),
            Math.max(0, stageRect.height - barRect.height)
          );
          const { width: stageW, height: stageH } = stageRect;
          const { width: slideW, height: slideH } = presentation.dimensions;
          anchorRef.current = {
            x: Math.round((p.x / stageW) * slideW),
            y: Math.round((p.y / stageH) * slideH),
          };
        }
        setPos({ x, y });
        setPlaced(true);
        setOpen(true);
        setStatus("idle");
        setErrorMsg("");
      },
    }));

    useLayoutEffect(() => {
      const bar = barRef.current;
      const stage = bar?.parentElement;
      if (!bar || !stage) return;
      const stageRect = stage.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();
      setPos({
        x: Math.max(0, (stageRect.width - barRect.width) / 2),
        y: Math.max(0, stageRect.height - barRect.height - 24),
      });
      setPlaced(true);
    }, []);

    const onPointerDown = (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      dragRef.current = {
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        originX: pos.x,
        originY: pos.y,
        moved: false,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      if (!drag.moved && Math.hypot(dx, dy) > DRAG_THRESHOLD) {
        drag.moved = true;
      }
      if (!drag.moved) return;

      const bar = barRef.current;
      const stage = bar?.parentElement;
      if (!bar || !stage) return;
      const stageRect = stage.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();
      setPos({
        x: Math.min(
          Math.max(0, drag.originX + dx),
          stageRect.width - barRect.width
        ),
        y: Math.min(
          Math.max(0, drag.originY + dy),
          stageRect.height - barRect.height
        ),
      });
    };

    const onPointerUp = (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || drag.pointerId !== e.pointerId) return;
      dragRef.current = null;
    };

    const onPickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => setImageUrl(reader.result as string);
      reader.readAsDataURL(file);
      e.target.value = "";
    };

    const send = async () => {
      const trimmed = message.trim();
      const trimmedLink = link.trim();
      if (!trimmed && !imageUrl && !trimmedLink) return;
      if (status === "sending") return;

      setStatus("sending");
      setErrorMsg("");

      const baseComment: Comment = {
        id: `comment-${Date.now()}`,
        slideId: slide.id,
        message: trimmed,
        status: "open",
        ...(anchorRef.current ? { position: anchorRef.current } : {}),
        ...(imageUrl ? { imageUrl } : {}),
        ...(trimmedLink ? { link: trimmedLink } : {}),
      };

      try {
        const projectId = getProjectId();
        if (!projectId) throw new Error("No active project");
        const remoteComment = trimmed || trimmedLink || "(image attachment)";
        const record = await addComment(projectId, remoteComment, imageUrl ?? undefined);
        const stored: Comment = {
          ...baseComment,
          id: record.id ?? baseComment.id,
          message: record.comment ?? trimmed,
        };
        dispatch({ type: "add-comment", comment: stored });
        setStatus("sent");
      } catch (err) {
        setStatus("error");
        setErrorMsg(err instanceof Error ? err.message : "Send failed");
        dispatch({ type: "add-comment", comment: baseComment });
      }

      setMessage("");
      setImageUrl(null);
      setLink("");
      setShowLink(false);
    };

    return (
      <div
        ref={barRef}
        className={cn(
          "absolute z-10 flex flex-col items-end gap-2 transition-opacity",
          placed ? "opacity-100" : "opacity-0"
        )}
        style={{ left: pos.x, top: pos.y }}
      >
        {open && (
          <div className="w-80 rounded-lg border border-border bg-card/95 p-3 shadow-[0_24px_48px_-24px_rgba(28,25,23,0.25)] backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">
                Add a comment
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6 text-muted-foreground"
                onClick={() => setOpen(false)}
              >
                <X size={14} />
              </Button>
            </div>

            <div className="space-y-2">
              {imageUrl && (
                <div className="relative">
                  <img
                    src={imageUrl}
                    alt="Attachment preview"
                    className="max-h-24 w-full rounded-[4px] border border-border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setImageUrl(null)}
                    className="absolute right-1 top-1 rounded-full bg-stone-900/60 p-1 text-foreground hover:bg-stone-900/80"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}

              {showLink && (
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Paste a web link…"
                  className="h-8 w-full rounded-md border border-input bg-muted/40 px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              )}

              <div className="flex gap-2">
                <input
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    if (status !== "idle") {
                      setStatus("idle");
                      setErrorMsg("");
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") void send();
                  }}
                  placeholder="Add a comment…"
                  disabled={status === "sending"}
                  className="h-8 flex-1 rounded-md border border-input bg-muted/40 px-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-60"
                />
                <Button
                  size="icon"
                  className="size-8"
                  onClick={() => void send()}
                  disabled={status === "sending"}
                >
                  {status === "sending" ? (
                    <CircleNotch size={15} className="animate-spin" />
                  ) : status === "sent" ? (
                    <Check size={15} weight="bold" />
                  ) : (
                    <PaperPlaneTilt size={15} weight="bold" />
                  )}
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 border border-border bg-muted/40 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImageSquare size={14} />
                  Image
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1.5 border border-border bg-muted/40 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowLink((v) => !v)}
                >
                  <Link size={14} />
                  Link
                </Button>
              </div>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onPickImage}
              />

              {status === "error" && (
                <p className="flex items-center gap-1 text-xs text-destructive">
                  <WarningCircle size={13} />
                  {errorMsg || "Could not send. Saved locally."}
                </p>
              )}

              {status === "sent" && (
                <p className="text-xs text-ring">
                  Sent to the build pipeline.
                </p>
              )}
            </div>
          </div>
        )}

        <button
          type="button"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            dragRef.current = null;
          }}
          className={cn(
            "flex cursor-grab items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm font-medium text-foreground shadow-[0_4px_16px_-8px_rgba(28,25,23,0.12)] transition-colors hover:border-ring/40 active:cursor-grabbing",
            open && "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          <Feather size={15} />
          {commentCount}
        </button>
      </div>
    );
  }
);
