import type { LegacyAstNode } from "#/utils/rule-types";
export function getNoRuntimeStateGuardOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
