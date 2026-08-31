import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./state/auth";
import { AuthGate } from "./components/auth/AuthGate";
import { router } from "./router";
import "./index.css";

export function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <RouterProvider router={router} />
      </AuthGate>
    </AuthProvider>
  );
}

export default App;
