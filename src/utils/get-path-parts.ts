import type { LegacyAstNode } from "#/utils/rule-types";
export function getPathParts(filename: LegacyAstNode) {
  return filename.split(/[\\/]/).filter(Boolean);
}
