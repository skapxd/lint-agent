import { defineConfig } from "tsup";

export default defineConfig({
  clean: true,
  dts: true,
  entry: [
    "src/index.ts",
    "src/astro/index.ts",
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
