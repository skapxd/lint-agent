import type { LegacyAstNode } from "#/utils/rule-types";
export function getFileName(filename: LegacyAstNode) {
  return filename.split(/[\\/]/).at(-1) ?? filename;
}
