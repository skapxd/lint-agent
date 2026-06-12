import type { LegacyAstNode } from "#/utils/rule-types";
export function getSourceExtension(fileName: LegacyAstNode) {
  return fileName.endsWith(".tsx") ? ".tsx" : ".ts";
}
