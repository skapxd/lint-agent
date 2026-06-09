// @ts-nocheck
export function isHookName(name) {
  return /^use[A-Z0-9]/.test(name ?? "");
}
