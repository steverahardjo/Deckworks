import { AppProvider, useAppState } from "./state/store";
import { TopBar } from "./components/TopBar";
import { SlideRail } from "./components/SlideRail";
import { Slides } from "./components/Slides";
import { PresetPanel } from "./components/PresetPanel";
import { StarterPage } from "./components/starter/StarterPage";
import "./index.css";

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}

function Shell() {
  const { view } = useAppState();

  if (view === "start") return <StarterPage />;

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

export default App;
