import { AppProvider } from "./state/store";
import { TopBar } from "./components/TopBar";
import { SlideRail } from "./components/SlideRail";
import { Slides } from "./components/Slides";
import { PresetPanel } from "./components/PresetPanel";
import "./index.css";

export function App() {
  return (
    <AppProvider>
      <div className="flex h-full flex-col">
        <TopBar />
        <div className="relative flex min-h-0 flex-1">
          <SlideRail />
          <Slides />
          <PresetPanel />
        </div>
      </div>
    </AppProvider>
  );
}

export default App;
