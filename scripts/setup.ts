#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir, platform } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import * as p from "@clack/prompts";
import { parse, stringify } from "comment-json";

import { buildPreview, PREVIEW_BIN, ROOT } from "./build-preview";

const SERVER = join(ROOT, "packages", "mcp", "src", "index.ts");
const BUN = process.execPath;

type Json = Record<string, unknown>;
type Scope = "global" | "project";
type ClientId = "opencode" | "claude" | "codex" | "cursor" | "claude-desktop";

interface Client {
  id: ClientId;
  label: string;
  detected: boolean;
  globalOnly: boolean;
}

// --- path helpers -----------------------------------------------------------

/** User home. Honors DECKWORKS_HOME so the installer can be tested safely. */
function home(): string {
  return process.env.DECKWORKS_HOME ?? homedir();
}

function opencodeDir(): string {
  return join(home(), ".config", "opencode");
}

function opencodeGlobalPath(): string {
  const jsonc = join(opencodeDir(), "opencode.jsonc");
  return existsSync(jsonc) ? jsonc : join(opencodeDir(), "opencode.json");
}

function claudeDesktopPath(): string {
  return platform() === "darwin"
    ? join(home(), "Library", "Application Support", "Claude", "claude_desktop_config.json")
    : join(home(), ".config", "Claude", "claude_desktop_config.json");
}

function which(cmd: string): boolean {
  return Bun.which(cmd) !== null;
}

// --- json io ----------------------------------------------------------------

async function readJson(path: string, jsonc = false): Promise<Json> {
  try {
    const text = await readFile(path, "utf8");
    const parsed = (jsonc ? parse(text) : JSON.parse(text)) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Json)
      : {};
  } catch {
    return {};
  }
}

async function writeJson(path: string, value: Json, jsonc = false): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const text = jsonc ? stringify(value, null, 2) : JSON.stringify(value, null, 2);
  await writeFile(path, `${text}\n`, "utf8");
}

/** Merge `mcpServers.deckworks` into an `{ mcpServers }` style config. */
export async function writeMcpServers(path: string): Promise<string> {
  const cfg = await readJson(path);
  const servers = { ...((cfg.mcpServers as Json | undefined) ?? {}) };
  servers.deckworks = { command: BUN, args: [SERVER] };
  cfg.mcpServers = servers;
  await writeJson(path, cfg);
  return path;
}

// --- per-client latches -----------------------------------------------------

async function latchOpencode(scope: Scope): Promise<string> {
  const path = scope === "global" ? opencodeGlobalPath() : join(ROOT, "opencode.json");
  const jsonc = path.endsWith(".jsonc");
  const cfg = await readJson(path, jsonc);
  cfg.$schema ??= "https://opencode.ai/config.json";
  const mcp = { ...((cfg.mcp as Json | undefined) ?? {}) };
  mcp.deckworks = { type: "local", command: [BUN, SERVER], enabled: true };
  cfg.mcp = mcp;
  await writeJson(path, cfg, jsonc);
  return path;
}

async function latchMcpJsonProject(): Promise<string> {
  return writeMcpServers(join(ROOT, ".mcp.json"));
}

async function latchClaude(scope: Scope): Promise<string> {
  if (scope === "project") return latchMcpJsonProject();
  if (!which("claude")) {
    throw new Error("claude CLI not found — cannot write user-scope config");
  }
  Bun.spawnSync(["claude", "mcp", "remove", "--scope", "user", "deckworks"]);
  const out = Bun.spawnSync(
    ["claude", "mcp", "add", "--scope", "user", "deckworks", "--", BUN, SERVER],
    { stdout: "pipe", stderr: "pipe" }
  );
  if (out.exitCode !== 0) throw new Error(out.stderr.toString().trim() || "claude mcp add failed");
  return "claude user scope";
}

export async function appendCodexToml(path: string): Promise<string> {
  let text = "";
  try {
    text = await readFile(path, "utf8");
  } catch {
    /* new file */
  }
  if (!text.includes("[mcp_servers.deckworks]")) {
    const block = `[mcp_servers.deckworks]\ncommand = ${JSON.stringify(BUN)}\nargs = [${JSON.stringify(SERVER)}]\n`;
    text = `${text.trimEnd()}\n\n${block}`.replace(/^\n+/, "");
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, text, "utf8");
  }
  return path;
}

async function latchCodex(scope: Scope): Promise<string> {
  if (scope === "project") return appendCodexToml(join(ROOT, ".codex", "config.toml"));
  if (which("codex")) {
    Bun.spawnSync(["codex", "mcp", "remove", "deckworks"]);
    const out = Bun.spawnSync(["codex", "mcp", "add", "deckworks", "--", BUN, SERVER], {
      stdout: "pipe",
      stderr: "pipe",
    });
    if (out.exitCode === 0) return "~/.codex/config.toml (via codex mcp add)";
  }
  return appendCodexToml(join(home(), ".codex", "config.toml"));
}

async function latchCursor(scope: Scope): Promise<string> {
  const path =
    scope === "global" ? join(home(), ".cursor", "mcp.json") : join(ROOT, ".cursor", "mcp.json");
  return writeMcpServers(path);
}

async function latchClaudeDesktop(): Promise<string> {
  return writeMcpServers(claudeDesktopPath());
}

export function latch(id: ClientId, scope: Scope): Promise<string> {
  switch (id) {
    case "opencode":
      return latchOpencode(scope);
    case "claude":
      return latchClaude(scope);
    case "codex":
      return latchCodex(scope);
    case "cursor":
      return latchCursor(scope);
    case "claude-desktop":
      return latchClaudeDesktop();
  }
}

// --- detection --------------------------------------------------------------

export function detectClients(): Client[] {
  return [
    {
      id: "opencode",
      label: "opencode",
      detected: which("opencode") || existsSync(opencodeDir()),
      globalOnly: false,
    },
    {
      id: "claude",
      label: "Claude Code",
      detected: which("claude") || existsSync(join(ROOT, ".mcp.json")),
      globalOnly: false,
    },
    {
      id: "codex",
      label: "Codex",
      detected: which("codex") || existsSync(join(home(), ".codex", "config.toml")),
      globalOnly: false,
    },
    {
      id: "cursor",
      label: "Cursor",
      detected: which("cursor") || existsSync(join(home(), ".cursor")),
      globalOnly: false,
    },
    {
      id: "claude-desktop",
      label: "Claude Desktop",
      detected: existsSync(claudeDesktopPath()),
      globalOnly: true,
    },
  ];
}

// --- probe + preview --------------------------------------------------------

async function probe(): Promise<boolean> {
  const proc = Bun.spawn([BUN, SERVER], { stdin: "pipe", stdout: "pipe", stderr: "pipe" });
  proc.stdin.write(
    `${JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "setup", version: "1" },
      },
    })}\n`
  );
  proc.stdin.end();
  const out = await Promise.race([
    new Response(proc.stdout).text(),
    Bun.sleep(8000).then(() => ""),
  ]);
  proc.kill();
  await Promise.allSettled([proc.exited]);
  return out.includes("deckworks");
}

function startPreview(projectDir: string, port: number, detached: boolean) {
  const proc = Bun.spawn([PREVIEW_BIN], {
    cwd: projectDir,
    env: {
      ...process.env,
      DECKWORK_PROJECT_DIR: projectDir,
      DECKWORKS_PORT: String(port),
      PORT: String(port),
    },
    stdin: "ignore",
    stdout: "inherit",
    stderr: "inherit",
  });
  if (detached) proc.unref();
  return proc;
}

// --- main -------------------------------------------------------------------

async function main(): Promise<void> {
  p.intro("Deckworks setup");

  // Phase 1 — preview binary (mandatory).
  const build = p.spinner();
  build.start("Building the preview binary");
  try {
    await buildPreview();
    build.stop(`Preview binary ready → ${PREVIEW_BIN}`);
  } catch (err) {
    build.stop("Preview build failed");
    p.cancel(err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  // Phase 2 — latch the MCP into the chosen clients.
  const clients = detectClients();
  const selected = await p.multiselect({
    message: "Which clients should launch the Deckworks MCP?",
    options: clients.map((c) => ({
      value: c.id,
      label: c.label,
      hint: c.detected ? "detected" : "not detected",
    })),
    initialValues: clients.filter((c) => c.detected).map((c) => c.id),
    required: true,
  });
  if (p.isCancel(selected)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const results: string[] = [];
  for (const id of selected as ClientId[]) {
    const client = clients.find((c) => c.id === id)!;
    let scope: Scope = "global";
    if (!client.globalOnly) {
      const choice = await p.select({
        message: `Scope for ${client.label}`,
        options: [
          { value: "global", label: "Global — all projects", hint: "user-level config" },
          { value: "project", label: "This repository only", hint: ROOT },
        ],
        initialValue: "global",
      });
      if (p.isCancel(choice)) {
        p.cancel("Cancelled.");
        process.exit(0);
      }
      scope = choice as Scope;
    }
    try {
      const where = await latch(id, scope);
      results.push(`✓ ${client.label} (${scope}) → ${where}`);
    } catch (err) {
      results.push(
        `✗ ${client.label} (${scope}) → ${err instanceof Error ? err.message : String(err)}`
      );
    }
  }
  p.note(results.join("\n"), "Latched");

  const health = p.spinner();
  health.start("Probing the MCP server");
  const ok = await probe();
  health.stop(ok ? "MCP server responded to initialize" : "MCP server did not respond");

  // Phase 3 — preview (mandatory).
  const projectInput = await p.text({
    message: "Project directory to preview",
    defaultValue: process.env.DECKWORK_PROJECT_DIR ?? ".deckworks",
    placeholder: ".deckworks",
  });
  if (p.isCancel(projectInput)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }
  const projectDir = isAbsolute(projectInput) ? projectInput : resolve(ROOT, projectInput);
  await mkdir(join(projectDir, "tmp", "slides"), { recursive: true });

  const port = Number(process.env.DECKWORKS_PORT ?? process.env.PORT ?? 3000);
  const mode = await p.select({
    message: "Start the preview",
    options: [
      { value: "foreground", label: "Foreground", hint: "Ctrl-C to stop" },
      { value: "detached", label: "Detached", hint: "runs in the background" },
    ],
    initialValue: "foreground",
  });
  if (p.isCancel(mode)) {
    p.cancel("Cancelled.");
    process.exit(0);
  }

  const proc = startPreview(projectDir, port, mode === "detached");
  p.outro(`Preview at http://localhost:${port}  ·  ${projectDir}/tmp/slides`);

  if (mode === "foreground") await proc.exited;
}

if (import.meta.main) {
  await main();
}
