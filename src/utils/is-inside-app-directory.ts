import type { LegacyAstNode } from "#/utils/rule-types";
import { getPathParts } from "./get-path-parts";

export function isInsideAppDirectory(filename: LegacyAstNode) {
  return getPathParts(filename).includes("app");
}
