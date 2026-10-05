import type { ChangeEvent } from "react";
import { useAppDispatch, useAppState } from "@/state/store";

export function SpeakerNotes({ slideId }: { slideId: string }) {
  const { presentation } = useAppState();
  const dispatch = useAppDispatch();
  const slide = presentation.slides.find((item) => item.id === slideId);
  if (!slide) return null;

  const onChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    dispatch({ type: "set-slide-notes", slideId, notes: event.target.value });
  };

  return (
    <section className="border-t border-border bg-card/80 px-5 py-3 backdrop-blur-xl">
      <div className="mx-auto flex max-w-4xl flex-col gap-1">
        <label htmlFor="speaker-notes" className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Speaker notes
        </label>
        <textarea
          id="speaker-notes"
          value={slide.notes ?? ""}
          onChange={onChange}
          placeholder="Add context, transitions, or delivery cues for this slide…"
          className="min-h-16 resize-y rounded-md border border-border bg-background/70 px-3 py-2 text-sm leading-6 text-foreground outline-none ring-ring/30 placeholder:text-muted-foreground/70 focus:ring-2"
        />
      </div>
    </section>
  );
}
