import { TopBar } from "./TopBar";
import { SlideRail } from "./SlideRail";
import { Slides } from "./Slides";

export function EditorShell() {
  return (
    <div className="flex h-full flex-col bg-background text-foreground antialiased">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <SlideRail />
        <Slides />
      </div>
    </div>
  );
}
