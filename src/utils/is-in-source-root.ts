import type { LegacyAstNode } from "#/utils/rule-types";
import { getPathParts } from "./get-path-parts";

export function isInSourceRoot(filename: LegacyAstNode) {
  const pathParts = getPathParts(filename);
  return pathParts.at(-2) === "src";
}
