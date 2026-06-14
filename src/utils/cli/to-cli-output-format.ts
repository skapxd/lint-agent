import type { CliOutputFormat } from "./types";

const supportedCliOutputFormats = ["compact", "json"] satisfies CliOutputFormat[];

export function toCliOutputFormat(rawFormat: string): CliOutputFormat | null {
  const format = supportedCliOutputFormats.find((candidate) => candidate === rawFormat);

  return format ?? null;
}
