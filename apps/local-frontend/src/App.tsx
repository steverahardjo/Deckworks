import "./index.css";
import { SlidesProvider } from "./state/store";
import { EditorShell } from "./components/EditorShell";

export function App() {
  return (
    <SlidesProvider>
      <EditorShell />
    </SlidesProvider>
  );
}

export default App;
