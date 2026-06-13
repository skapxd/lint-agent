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
  // commander se empaqueta dentro del bin (no es dependencia externa): quien solo
  // usa las reglas no carga commander.
  noExternal: ["commander"],
  sourcemap: true,
  target: "es2022",
  tsconfig: "tsconfig.build.json",
});
