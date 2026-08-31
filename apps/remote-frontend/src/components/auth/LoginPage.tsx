import { useState, type FormEvent } from "react";
import { CircleNotch, WarningCircle, ArrowRight } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/state/auth";

type Mode = "login" | "register";

export function LoginPage() {
  const { signIn, error } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setLocalError("");
    if (!email.trim() || !password) {
      setLocalError("Email and password are required.");
      return;
    }
    if (mode === "register" && !name.trim()) {
      setLocalError("Name is required to register.");
      return;
    }
    setBusy(true);
    try {
      await signIn(mode, email.trim(), password, mode === "register" ? name.trim() : undefined);
    } finally {
      setBusy(false);
    }
  };

  const message = localError || error;

  return (
    <div className="flex h-full flex-col">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b px-6">
        <div className="flex items-center gap-2.5">
          <span className="grid size-6 place-items-center rounded-[4px] bg-primary text-[10px] font-bold text-primary-foreground">
            D
          </span>
          <span className="font-mono text-xs font-medium uppercase tracking-[0.22em] text-foreground">
            Deckworks
          </span>
        </div>
        <span className="ml-auto hidden rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px] text-muted-foreground sm:inline">
          remote backend
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center overflow-y-auto p-6">
        <div className="w-full max-w-sm">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-ring">
            Sign in
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.02em]">
            Open your decks from anywhere.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            This editor talks to the Deckworks remote backend
            (http://127.0.0.1:8000). Your deck is stored in a project scoped to
            your account.
          </p>

          <form
            onSubmit={submit}
            className="mt-8 space-y-4 rounded-lg border border-border bg-card p-5"
          >
            {mode === "register" && (
              <div>
                <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ada Lovelace"
                  autoComplete="name"
                  className="mt-1.5"
                />
              </div>
            )}

            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="mt-1.5"
              />
            </div>

            <div>
              <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "8+ characters" : "••••••••"}
                autoComplete={mode === "register" ? "new-password" : "current-password"}
                className="mt-1.5"
              />
            </div>

            {message && (
              <p className="flex items-center gap-1.5 text-xs text-destructive">
                <WarningCircle size={13} className="shrink-0" />
                {message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full gap-2"
              disabled={busy}
            >
              {busy ? (
                <CircleNotch size={15} className="animate-spin" />
              ) : mode === "register" ? (
                "Create account"
              ) : (
                "Sign in"
              )}
              {!busy && <ArrowRight size={15} weight="bold" />}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode((m) => (m === "login" ? "register" : "login"));
              setLocalError("");
            }}
            className="mt-4 text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
