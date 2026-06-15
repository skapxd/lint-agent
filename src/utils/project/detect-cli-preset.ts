import fs from "node:fs";
import path from "node:path";
import { toCliPreset } from "#/utils/cli/args/to-cli-preset";
import type { CliPreset } from "#/utils/cli/types";
import { packageJsonHasExports } from "./package-json-has-exports";

const nextConfigFiles = [
  "next.config.js",
  "next.config.mjs",
  "next.config.cjs",
  "next.config.ts",
  "next.config.mts",
  "next.config.cts",
];

const astroConfigFiles = [
  "astro.config.js",
  "astro.config.mjs",
  "astro.config.cjs",
  "astro.config.ts",
  "astro.config.mts",
  "astro.config.cts",
];

/**
 * Infere el preset inicial del CLI desde señales de proyecto baratas y deterministas. No intenta entender todo el framework: solo escoge el preset mas especifico que puede probar con archivos de configuracion o con `package.json` exportable.
 *
 * Prioridad: Nest por `nest-cli.json`, luego Next, luego Astro, despues package npm si `package.json` tiene `exports`, y finalmente `base`. El orden evita que un paquete con exports eclipse a una app framework.
 *
 * Ej.: proyecto con `next.config.ts` y `package.json#exports` -> `next`; libreria sin framework y con `exports` -> `package`; carpeta sin `package.json` -> `base`.
 */
export function detectCliPreset(projectRoot: string): CliPreset {
  const hasNestSignal = fs.existsSync(path.join(projectRoot, "nest-cli.json"));
  if (hasNestSignal) {
    return "nest";
  }

  const hasNextSignal = nextConfigFiles.some((file) =>
    fs.existsSync(path.join(projectRoot, file)),
  );
  if (hasNextSignal) {
    return "next";
  }

  const hasAstroSignal = astroConfigFiles.some((file) =>
    fs.existsSync(path.join(projectRoot, file)),
  );
  if (hasAstroSignal) {
    return "astro";
  }

  const packageJsonPath = path.join(projectRoot, "package.json");
  const hasPackageJson = fs.existsSync(packageJsonPath);
  if (!hasPackageJson) {
    return "base";
  }

  const packageJson: unknown = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const hasExports = packageJsonHasExports(packageJson);
  if (hasExports) {
    return toCliPreset("package") ?? "package";
  }

  return "base";
}
