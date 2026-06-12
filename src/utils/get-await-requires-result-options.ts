import type { LegacyAstNode } from "#/utils/rule-types";
export function getAwaitRequiresResultOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    trySafeCallNames: options.trySafeCallNames ?? ["trySafe"],
  };
}
