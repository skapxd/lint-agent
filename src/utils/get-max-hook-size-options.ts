import type { LegacyAstNode } from "#/utils/rule-types";
export function getMaxHookSizeOptions(options: LegacyAstNode = {}) {
  return {
    maxLines: options.maxLines ?? 120,
    maxUseState: options.maxUseState ?? 1,
  };
}
