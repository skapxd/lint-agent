import { isRecord } from "#/utils/unknown/is-record";

export function parseJsonRecord(source: string): Record<string, unknown> {
  const parsed: unknown = JSON.parse(source);

  if (!isRecord(parsed)) {
    throw new Error("JSON root is not an object");
  }

  return parsed;
}
