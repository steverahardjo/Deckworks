const apps = {
  local: "apps/local-frontend/index.ts",
  remote: "apps/remote-frontend/index.ts",
} as const;

type AppName = keyof typeof apps;

const requested = (process.env.DECK_APP ?? process.argv[2] ?? "local") as
  | AppName
  | string;

const entry = apps[requested as AppName];
if (!entry) {
  console.error(`Unknown app "${requested}". Use "local" or "remote".`);
  process.exit(1);
}

const child = Bun.spawn({
  cmd: ["bun", "--hot", entry],
  stdout: "inherit",
  stderr: "inherit",
  stdin: "inherit",
});

process.on("SIGINT", () => child.kill());
process.on("SIGTERM", () => child.kill());
await child.exited;
