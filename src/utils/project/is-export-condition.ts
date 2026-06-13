import { isRecord } from "#/utils/unknown/is-record";

export function isExportCondition(
  value: unknown,
): value is { types: string } {
  return isRecord(value) && typeof value.types === "string";
}
