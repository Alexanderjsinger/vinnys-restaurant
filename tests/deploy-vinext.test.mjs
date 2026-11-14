import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { pathToFileURL } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const script = path.join(root, "scripts", "deploy-vinext.mjs");

function childEnv(overrides = {}) {
  const env = { ...process.env, ...overrides };
  if (!Object.hasOwn(overrides, "CLOUDFLARE_API_TOKEN")) {
    delete env.CLOUDFLARE_API_TOKEN;
  }
  return env;
}

function runGuard(env) {
  return spawnSync(process.execPath, [script], {
    cwd: root,
    env,
    encoding: "utf8",
    timeout: 5000,
  });
}

test("deploy guard exits non-zero before publish when CLOUDFLARE_API_TOKEN is absent", () => {
  const binDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-deploy-guard-"));
  const marker = path.join(binDir, "invoked");
  const fake = path.join(binDir, "vinext-cloudflare");
  fs.writeFileSync(
    fake,
    "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$DEPLOY_GUARD_MARKER\"\nexit 0\n",
  );
  fs.chmodSync(fake, 0o755);

  const result = runGuard(
    childEnv({
      PATH: binDir,
      DEPLOY_GUARD_MARKER: marker,
    }),
  );

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.match(result.stderr, /exited before any network publish/);
  assert.match(
    result.stderr,
    /Cloud Agent runtime secret on environment 7e682a92 \(https:\/\/cursor\.com\/dashboard\/cloud-agents\/environments\/e\/7e682a92-dc57-11f1-8120-06b44be262b7\)/,
  );
  assert.match(result.stderr, /published-app secret does not deploy the Worker/);
  assert.match(result.stderr, /Workers Builds stays disconnected/);
  assert.match(result.stderr, /5bd8ee69-a229-4156-a6fa-166f55e3abcb/);
  assert.match(result.stderr, /cloudflare\.config\.ts/);
  assert.match(result.stderr, /npm run deploy:vinext after npm run ci/);
  assert.match(result.stderr, /Record the new Worker version after each publish/);
  assert.equal(fs.existsSync(marker), false, "vinext-cloudflare must not start");
});

test("deploy guard treats a blank CLOUDFLARE_API_TOKEN as absent", () => {
  const binDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-deploy-guard-"));
  const marker = path.join(binDir, "invoked");
  const fake = path.join(binDir, "vinext-cloudflare");
  fs.writeFileSync(fake, "#!/bin/sh\nprintf invoked > \"$DEPLOY_GUARD_MARKER\"\nexit 0\n");
  fs.chmodSync(fake, 0o755);

  const result = runGuard(
    childEnv({
      PATH: binDir,
      DEPLOY_GUARD_MARKER: marker,
      CLOUDFLARE_API_TOKEN: "   ",
    }),
  );

  assert.equal(result.status, 1);
  assert.equal(result.stdout, "");
  assert.equal(fs.existsSync(marker), false);
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, /CLOUDFLARE_API_TOKEN=\S+/);
});

test("deploy guard invokes vinext-cloudflare deploy without printing the token", () => {
  const binDir = fs.mkdtempSync(path.join(os.tmpdir(), "vinnys-deploy-guard-"));
  const marker = path.join(binDir, "invoked");
  const fake = path.join(binDir, "vinext-cloudflare");
  const token = "test-token-do-not-print";
  fs.writeFileSync(
    fake,
    "#!/bin/sh\nprintf '%s\\n' \"$@\" > \"$DEPLOY_GUARD_MARKER\"\nexit 0\n",
  );
  fs.chmodSync(fake, 0o755);

  const result = runGuard(
    childEnv({
      PATH: binDir,
      DEPLOY_GUARD_MARKER: marker,
      CLOUDFLARE_API_TOKEN: token,
    }),
  );

  assert.equal(result.status, 0);
  assert.equal(fs.readFileSync(marker, "utf8").trim(), "deploy");
  assert.equal(`${result.stdout}${result.stderr}`.includes(token), false);
});

test("cloudflareApiTokenSet ignores unset and blank values", async () => {
  const mod = await import(pathToFileURL(script).href);
  assert.equal(mod.cloudflareApiTokenSet({}), false);
  assert.equal(mod.cloudflareApiTokenSet({ CLOUDFLARE_API_TOKEN: "" }), false);
  assert.equal(mod.cloudflareApiTokenSet({ CLOUDFLARE_API_TOKEN: " \t" }), false);
  assert.equal(mod.cloudflareApiTokenSet({ CLOUDFLARE_API_TOKEN: "present" }), true);
  assert.match(mod.CLOUDFLARE_TOKEN_EXPLANATION, /published-app secret does not deploy the Worker/);
});
