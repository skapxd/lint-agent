import type { LegacyAstNode } from "#/utils/rule-types";
export function getResultErrorRequiresHandlingOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
