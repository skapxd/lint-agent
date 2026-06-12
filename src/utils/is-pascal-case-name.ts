import type { LegacyAstNode } from "#/utils/rule-types";
export function isPascalCaseName(value: LegacyAstNode) {
  return /^[A-Z][A-Za-z0-9]*$/.test(value);
}
