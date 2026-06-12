import type { LegacyAstNode } from "#/utils/rule-types";
export function getNoNestedIfOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
