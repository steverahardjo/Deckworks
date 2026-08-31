import { Outlet, createBrowserRouter } from "react-router-dom";
import { AppProvider } from "./state/store";
import { useAuth } from "./state/auth";
import { StarterPage } from "./components/starter/StarterPage";
import { EditorShell } from "./components/EditorShell";

function AppBoundary() {
  const { deck, projectId } = useAuth();
  return (
    <AppProvider
      initialPresentation={deck ?? undefined}
      projectId={projectId ?? undefined}
    >
      <Outlet />
    </AppProvider>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppBoundary />,
    children: [
      { path: "/", element: <StarterPage /> },
      { path: "/slides", element: <EditorShell /> },
    ],
  },
]);
