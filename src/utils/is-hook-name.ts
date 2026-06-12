import type { LegacyAstNode } from "#/utils/rule-types";
export function isHookName(name: LegacyAstNode) {
  return /^use[A-Z0-9]/.test(name ?? "");
}
