import fs from "node:fs";
import path from "node:path";
import { toCliPreset } from "#/utils/cli/to-cli-preset";
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
