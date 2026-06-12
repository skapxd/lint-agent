import type { LegacyAstNode } from "#/utils/rule-types";
export function getNoElseOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
