import type { LegacyAstNode } from "#/utils/rule-types";
import { getContainingFunction } from "./get-containing-function";
import { getFunctionName } from "./get-function-name";

export function getAwaitScopeName(node: LegacyAstNode) {
  const containingFunction = getContainingFunction(node);

  return containingFunction ? getFunctionName(containingFunction) : "top-level";
}
