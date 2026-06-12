import type { LegacyAstNode } from "#/utils/rule-types";
export function getNoAccessorsOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
