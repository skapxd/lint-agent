export function isHookName(name: string | null | undefined) {
  return /^use[A-Z0-9]/.test(name ?? "");
}
