import { defineConfig } from "tsup";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  clean: true,
  define: {
    __PKG_VERSION__: JSON.stringify(pkg.version),
  },
  dts: true,
  entry: [
    "src/index.ts",
    "src/astro/index.ts",
    "src/nest/index.ts",
    "src/next/index.ts",
    "src/shared/index.ts",
    "src/cli.ts",
  ],
  format: ["esm", "cjs"],
  sourcemap: true,
  target: "es2022",
  tsconfig: "tsconfig.build.json",
});
