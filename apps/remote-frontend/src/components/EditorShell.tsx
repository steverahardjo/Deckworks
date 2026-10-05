import { TopBar } from "./TopBar";
import { SlideRail } from "./SlideRail";
import { Slides } from "./Slides";
import { PresetPanel } from "./PresetPanel";
import { SpeakerNotes } from "./SpeakerNotes";
import { MarkdownPanel } from "./MarkdownPanel";
import { useAppState } from "@/state/store";

export function EditorShell() {
  const { activeSlideId } = useAppState();

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <SlideRail />
        <Slides />
        <PresetPanel />
      </div>
      <SpeakerNotes slideId={activeSlideId} />
      <MarkdownPanel />
    </div>
  );
}
