import { TopBar } from "./TopBar";
import { SlideRail } from "./SlideRail";
import { Slides } from "./Slides";
import { PresetPanel } from "./PresetPanel";

export function EditorShell() {
  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <SlideRail />
        <Slides />
        <PresetPanel />
      </div>
    </div>
  );
}
