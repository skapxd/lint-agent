import type { RuleNode } from "#/utils/rule-types";
import { getPathParts } from "./get-path-parts";

export function isInsideAppDirectory(filename: string) {
  return getPathParts(filename).includes("app");
}
