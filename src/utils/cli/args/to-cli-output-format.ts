import type { CliOutputFormat } from "#/utils/cli/types";

const supportedCliOutputFormats = ["compact", "json", "toon"] satisfies CliOutputFormat[];

export function toCliOutputFormat(rawFormat: string): CliOutputFormat | null {
  const format = supportedCliOutputFormats.find((candidate) => candidate === rawFormat);

  return format ?? null;
}
