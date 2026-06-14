import type { CliOutputFormat } from "./types";

const supportedCliOutputFormats = ["json", "toon"] satisfies CliOutputFormat[];

export function toCliOutputFormat(rawFormat: string): CliOutputFormat | null {
  const format = supportedCliOutputFormats.find((candidate) => candidate === rawFormat);

  return format ?? null;
}
