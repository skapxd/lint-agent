export function isExportValue(
  value: unknown,
): value is string | Record<string, unknown> {
  return (
    typeof value === "string" ||
    (typeof value === "object" && value !== null)
  );
}
