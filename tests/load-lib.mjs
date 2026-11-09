import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function rewrite(specifier, context) {
  if (specifier === "server-only") return new URL("./stubs/server-only.mjs", import.meta.url).href;
  if (specifier === "cloudflare:workers") {
    return new URL("./stubs/cloudflare-workers.mjs", import.meta.url).href;
  }
  let base = null;
  if (specifier.startsWith("@/")) {
    base = path.join(root, "src", specifier.slice(2));
  } else if (specifier.startsWith(".")) {
    const parent = context.parentURL ? fileURLToPath(context.parentURL) : root;
    base = path.resolve(path.dirname(parent), specifier);
  }
  if (!base) return null;
  if (fs.existsSync(`${base}.ts`)) return pathToFileURL(`${base}.ts`).href;
  if (fs.existsSync(`${base}.json`)) return pathToFileURL(`${base}.json`).href;
  if (fs.existsSync(base)) return pathToFileURL(base).href;
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  const url = rewrite(specifier, context);
  if (url) return { url, shortCircuit: true };
  return nextResolve(specifier, context);
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".json")) {
    const source = fs.readFileSync(fileURLToPath(url), "utf8");
    return { format: "module", source: `export default ${source}`, shortCircuit: true };
  }
  return nextLoad(url, context);
}
