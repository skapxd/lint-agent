export function packageJsonHasExports(value: unknown) {
  const isObject = typeof value === "object" && value !== null;

  if (!isObject) {
    return false;
  }

  return Object.hasOwn(value, "exports");
}
