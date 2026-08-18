import { Outlet, createBrowserRouter } from "react-router-dom";
import { AppProvider } from "./state/store";
import { StarterPage } from "./components/starter/StarterPage";
import { EditorShell } from "./components/EditorShell";

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AppProvider>
        <Outlet />
      </AppProvider>
    ),
    children: [
      { path: "/", element: <StarterPage /> },
      { path: "/slides", element: <EditorShell /> },
    ],
  },
]);
