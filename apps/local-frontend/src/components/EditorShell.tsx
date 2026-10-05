import { useEffect } from "react";

import { TopBar } from "./TopBar";
import { SlideRail } from "./SlideRail";
import { Slides } from "./Slides";
import { PresetPanel } from "./PresetPanel";
import { useAppDispatch } from "@/state/store";
import { useAppState } from "@/state/store";
import type { Comment } from "@deckworks/core";
import { SpeakerNotes } from "./SpeakerNotes";
import { FilesPanel } from "./FilesPanel";

export function EditorShell() {
  const dispatch = useAppDispatch();
  const { activeSlideId } = useAppState();

  useEffect(() => {
    let cancelled = false;
    fetch("/api/comments")
      .then((res) => (res.ok ? (res.json() as Promise<{ comments: Comment[] }>) : null))
      .then((data) => {
        if (cancelled || !data) return;
        dispatch({ type: "hydrate-comments", comments: data.comments });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <SlideRail />
        <Slides />
        <PresetPanel />
      </div>
      <SpeakerNotes slideId={activeSlideId} />
      <FilesPanel />
    </div>
  );
}
