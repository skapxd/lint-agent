import type { LegacyAstNode } from "#/utils/rule-types";
export function toPascalCase(value: LegacyAstNode) {
  return value.replace(/^[a-z]/, (letter: LegacyAstNode) => letter.toLocaleUpperCase());
}
