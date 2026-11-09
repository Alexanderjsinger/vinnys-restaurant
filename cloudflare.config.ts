import { bindings, defineConfig, defineWorker } from "cf/config";

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
