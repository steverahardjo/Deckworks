import { TopBar } from "./TopBar";
import { SlideRail } from "./SlideRail";
import { Slides } from "./Slides";
import { RightBar } from "./RightBar";
import { PresentationMode } from "./PresentationMode";
import { useSlides } from "../state/store";

export function EditorShell() {
  const { presenting } = useSlides();

  return (
    <div className="flex h-full flex-col bg-background text-foreground antialiased">
      <TopBar />
      <div className="relative flex min-h-0 flex-1">
        <SlideRail />
        <Slides />
        <RightBar />
      </div>
      {presenting ? <PresentationMode /> : null}
    </div>
  );
}
