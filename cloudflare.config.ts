import { bindings, defineConfig, defineWorker } from "cf/config";

// Production/staging D1: vinnys-bar-grill (5bd8ee69-a229-4156-a6fa-166f55e3abcb).
// Do not point a preview worker at this binding if you need isolated test data.
//
// Owner blockers (see docs/owner-setup.md):
// - MEDIA: bindings.r2({ name: "vinnys-bar-grill-media" }) after R2 is enabled
// - RESEND_API_KEY / RESEND_FROM: bindings.secret() after Resend is configured
// Leaving those unset keeps deploy working; upload/email stay queued/disabled.

export default defineConfig({
  worker: defineWorker({
    name: "vinnys-bar-grill",
    entrypoint: "vinext/server/fetch-handler",
    compatibilityDate: "2026-11-08",
    compatibilityFlags: ["nodejs_compat"],
    assets: {
      htmlHandling: "none",
      notFoundHandling: "none",
      runWorkerFirst: ["/*", "!/_next/static/*", "!/*/_next/static/*"],
    },
    env: {
      ASSETS: bindings.assets(),
      DB: bindings.d1({
        name: "vinnys-bar-grill",
        id: "5bd8ee69-a229-4156-a6fa-166f55e3abcb",
      }),
      ADMIN_PASSWORD: bindings.secret(),
    },
  }),
});
