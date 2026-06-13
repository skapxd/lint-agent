import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  resolve: {
    alias: [
      {
        find: /^#\//,
        replacement: fileURLToPath(new URL("./src/", import.meta.url)),
      },
    ],
  },
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 15_000,
  },
});
