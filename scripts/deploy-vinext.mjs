#!/usr/bin/env node
/**
 * `npm run deploy:vinext` — refuse to publish unless CLOUDFLARE_API_TOKEN is set.
 * The check runs before vinext-cloudflare is started, so a missing token never
 * reaches the network. The token value is never printed.
 */
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const CLOUDFLARE_TOKEN_EXPLANATION =
  "CLOUDFLARE_API_TOKEN is unset or blank, so this command exited before any network publish. Cloud agents need CLOUDFLARE_API_TOKEN as a Cloud Agent runtime secret on environment 7e682a92 (https://cursor.com/dashboard/cloud-agents/environments/e/7e682a92-dc57-11f1-8120-06b44be262b7), injected at agent start. A published-app secret does not deploy the Worker. Workers Builds stays disconnected. D1 id 5bd8ee69-a229-4156-a6fa-166f55e3abcb must remain the DB binding via cloudflare.config.ts. The only publish path is npm run deploy:vinext after npm run ci, from an approved SHA. Record the new Worker version after each publish.";

export function cloudflareApiTokenSet(env = process.env) {
  const value = env.CLOUDFLARE_API_TOKEN;
  return typeof value === "string" && value.trim() !== "";
}

export function resolveVinextCloudflare(env = process.env) {
  const pathEnv = env.PATH ?? env.Path ?? "";
  for (const dir of pathEnv.split(path.delimiter)) {
    if (!dir) continue;
    const candidate = path.join(dir, "vinext-cloudflare");
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.join(root, "node_modules", ".bin", "vinext-cloudflare");
}

export function main(env = process.env, argv = process.argv) {
  if (!cloudflareApiTokenSet(env)) {
    console.error(CLOUDFLARE_TOKEN_EXPLANATION);
    process.exit(1);
  }

  const bin = resolveVinextCloudflare(env);
  const child = spawn(bin, ["deploy", ...argv.slice(2)], {
    stdio: "inherit",
    env,
    shell: false,
  });
  child.on("error", (error) => {
    console.error(`Failed to start vinext-cloudflare: ${error.message}`);
    process.exit(1);
  });
  child.on("exit", (code, signal) => {
    if (signal) process.exit(1);
    process.exit(code ?? 1);
  });
}

function invokedDirectly() {
  const entry = process.argv[1];
  if (!entry) return false;
  return import.meta.url === pathToFileURL(path.resolve(entry)).href;
}

if (invokedDirectly()) {
  main();
}
