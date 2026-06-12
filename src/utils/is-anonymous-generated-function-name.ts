import type { LegacyAstNode } from "#/utils/rule-types";
export function isAnonymousGeneratedFunctionName(name: LegacyAstNode) {
  return name === "anonymous" || name === "helper";
}
