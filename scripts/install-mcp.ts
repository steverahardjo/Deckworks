#!/usr/bin/env bun
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SERVER = join(ROOT, "packages", "mcp", "src", "index.ts");
const BUN = process.execPath;

const OPENCODE_FILE = join(ROOT, "opencode.json");
const MCP_FILE = join(ROOT, ".mcp.json");

type Json = Record<string, unknown>;

async function readJson(path: string): Promise<Json> {
  try {
    const parsed = JSON.parse(await readFile(path, "utf8")) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Json)
      : {};
  } catch {
    return {};
  }
}

async function writeJson(path: string, value: Json): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

/** opencode.json — a `local` server whose command is an array. */
async function installOpencode(): Promise<void> {
  const config = await readJson(OPENCODE_FILE);
  config.$schema ??= "https://opencode.ai/config.json";
  const mcp = { ...((config.mcp as Json | undefined) ?? {}) };
  mcp.deckworks = { type: "local", command: [BUN, SERVER], enabled: true };
  config.mcp = mcp;
  await writeJson(OPENCODE_FILE, config);
}

/** .mcp.json — Claude Code / Codex project scope. */
async function installMcpJson(): Promise<void> {
  const config = await readJson(MCP_FILE);
  const servers = { ...((config.mcpServers as Json | undefined) ?? {}) };
  servers.deckworks = { command: BUN, args: [SERVER] };
  config.mcpServers = servers;
  await writeJson(MCP_FILE, config);
}

/** Boot the server and confirm it answers `initialize` with our name. */
async function probe(): Promise<boolean> {
  const proc = Bun.spawn([BUN, SERVER], {
    stdin: "pipe",
    stdout: "pipe",
    stderr: "pipe",
  });
  proc.stdin.write(
    `${JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: { name: "install-mcp", version: "1" },
      },
    })}\n`
  );
  proc.stdin.end();

  const read = new Response(proc.stdout).text();
  const timeout = Bun.sleep(8000).then(() => "");
  const out = await Promise.race([read, timeout]);
  proc.kill();
  await Promise.allSettled([proc.exited, read]);
  return out.includes("deckworks");
}

async function main(): Promise<void> {
  console.log(
    `Deckworks MCP installer\n  repo:   ${ROOT}\n  server: ${SERVER}\n  bun:    ${BUN}\n`
  );

  if (!existsSync(SERVER)) {
    console.error(`✗ server not found at ${SERVER}. Run this from the repo root.`);
    process.exitCode = 1;
    return;
  }

  await installOpencode();
  console.log(`✓ updated ${relative(ROOT, OPENCODE_FILE)}`);
  await installMcpJson();
  console.log(`✓ updated ${relative(ROOT, MCP_FILE)}`);

  const ok = await probe();
  console.log(
    ok
      ? "✓ server booted (initialize probe passed)"
      : "✗ server did not answer initialize within 8s"
  );

  console.log("\nOther MCP clients — add this server:\n");
  console.log(
    JSON.stringify(
      { mcpServers: { deckworks: { command: BUN, args: [SERVER] } } },
      null,
      2
    )
  );
  console.log(
    `\nCodex (~/.codex/config.toml):\n\n[mcp_servers.deckworks]\ncommand = "${BUN}"\nargs = ["${SERVER}"]\nenabled = true`
  );

  if (!ok) process.exitCode = 1;
}

await main();
