export function toCliLocationNumber(value: unknown) {
  const hasNumericValue = typeof value === "number";

  if (hasNumericValue) {
    return value;
  }

  return 0;
}
