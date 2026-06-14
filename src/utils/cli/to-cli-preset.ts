import type { CliPreset } from "./types";

const cliPresetByName: Partial<Record<string, CliPreset>> = {
  astro: "astro",
  base: "base",
  nest: "nest",
  next: "next",
  package: "package",
};

export function toCliPreset(value: string): CliPreset | null {
  return cliPresetByName[value] ?? null;
}
