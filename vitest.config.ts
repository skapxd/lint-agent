import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import pkg from "./package.json" with { type: "json" };

const runsCoverageBudget = process.argv.includes("--coverage");

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
    testTimeout: runsCoverageBudget ? 60_000 : 15_000,
    hookTimeout: runsCoverageBudget ? 120_000 : 30_000,
    coverage: {
      enabled: runsCoverageBudget,
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: fileURLToPath(new URL("./coverage/v8", import.meta.url)),
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts", "src/utils/cli/**/*", "src/**/*.test.ts", "dist/**/*"],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
  },
});
