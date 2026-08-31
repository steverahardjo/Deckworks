import { useAuth } from "@/state/auth";
import { LoginPage } from "./LoginPage";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === "signed-out") return <LoginPage />;

  if (status === "loading") {
    return (
      <div className="flex h-full flex-col">
        <div className="flex h-14 shrink-0 items-center gap-3 border-b px-6">
          <span className="size-6 rounded-[4px] bg-primary" />
          <span className="h-3 w-24 rounded-sm bg-muted" />
        </div>
        <div className="grid flex-1 place-items-center">
          <div className="w-full max-w-sm space-y-4">
            <span className="block h-3 w-24 rounded-sm bg-muted" />
            <span className="block h-9 w-full max-w-xs rounded-sm bg-muted" />
            <span className="block h-4 w-full max-w-[16rem] rounded-sm bg-muted/70" />
            <div className="rounded-lg border border-border bg-card p-5">
              <span className="block h-3 w-16 rounded-sm bg-muted" />
              <span className="mt-4 block h-9 w-full rounded-md bg-muted" />
              <span className="mt-3 block h-3 w-20 rounded-sm bg-muted/70" />
              <span className="mt-4 block h-9 w-full rounded-md bg-muted" />
              <span className="mt-4 block h-9 w-full rounded-md bg-primary/40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
