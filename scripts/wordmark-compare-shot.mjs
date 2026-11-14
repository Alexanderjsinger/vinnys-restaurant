#!/usr/bin/env node
/** Alias: runs v5 menu overlay compare (side-by-side). */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
execSync(`node "${path.join(root, "scripts/wordmark-overlay-shot.mjs")}"`, { stdio: "inherit" });