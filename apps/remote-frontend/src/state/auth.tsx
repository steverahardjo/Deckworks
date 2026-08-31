import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  ApiError,
  createProject,
  getAccessToken,
  getDeck,
  getProjectId,
  getRefreshToken,
  login,
  logout,
  me,
  refresh,
  register,
  type RemoteUser,
} from "@/lib/remote";
import type { Presentation } from "@deckworks/core";

export type AuthStatus = "loading" | "signed-out" | "signed-in";

type AuthContextValue = {
  status: AuthStatus;
  user: RemoteUser | null;
  projectId: string | null;
  deck: Presentation | null;
  error: string | null;
  signIn: (
    mode: "login" | "register",
    email: string,
    password: string,
    name?: string
  ) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isPresentation(value: unknown): value is Presentation {
  return (
    value !== null &&
    typeof value === "object" &&
    "metadata" in value &&
    "dimensions" in value &&
    "theme" in value &&
    Array.isArray((value as { slides?: unknown }).slides)
  );
}

async function loadProject(): Promise<{ projectId: string; deck: Presentation | null }> {
  const existing = getProjectId();
  if (existing) {
    try {
      const deck = await getDeck(existing);
      return { projectId: existing, deck: isPresentation(deck) ? deck : null };
    } catch (err) {
      if (!(err instanceof ApiError) || (err.status !== 404 && err.status !== 403)) {
        throw err;
      }
      // Project is gone or belongs to someone else — fall through and create a fresh one.
    }
  }
  const projectId = await createProject();
  const deck = await getDeck(projectId);
  return { projectId, deck: isPresentation(deck) ? deck : null };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<RemoteUser | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [deck, setDeck] = useState<Presentation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const boot = useCallback(async () => {
    setError(null);
    if (!getAccessToken() && !getRefreshToken()) {
      setStatus("signed-out");
      return;
    }
    try {
      let current: RemoteUser;
      try {
        current = await me();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401 && getRefreshToken()) {
          await refresh();
          current = await me();
        } else {
          throw err;
        }
      }
      const project = await loadProject();
      setUser(current);
      setProjectId(project.projectId);
      setDeck(project.deck);
      setStatus("signed-in");
    } catch (err) {
      await logout().catch(() => {});
      setStatus("signed-out");
    }
  }, []);

  useEffect(() => {
    void boot();
  }, [boot]);

  const signIn = useCallback(
    async (mode: "login" | "register", email: string, password: string, name?: string) => {
      setError(null);
      try {
        const pair = mode === "register" ? await register(email, password, name ?? "") : await login(email, password);
        const project = await loadProject();
        setUser(pair.user);
        setProjectId(project.projectId);
        setDeck(project.deck);
        setStatus("signed-in");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Sign in failed");
      }
    },
    []
  );

  const signOut = useCallback(async () => {
    await logout().catch(() => {});
    setUser(null);
    setProjectId(null);
    setDeck(null);
    setStatus("signed-out");
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, projectId, deck, error, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
