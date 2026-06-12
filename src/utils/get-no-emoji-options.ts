import type { LegacyAstNode } from "#/utils/rule-types";
export function getNoEmojiOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
  };
}
