import type { LegacyAstNode } from "#/utils/rule-types";
export function getDirectoryName(filename: LegacyAstNode) {
  return filename.split(/[\\/]/).slice(0, -1).join("/");
}
