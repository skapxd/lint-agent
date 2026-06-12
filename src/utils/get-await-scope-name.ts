import type { RuleNode } from "#/utils/rule-types";
import { getContainingFunction } from "./get-containing-function";
import { getFunctionName } from "./get-function-name";

export function getAwaitScopeName(node: RuleNode) {
  const containingFunction = getContainingFunction(node);

  return containingFunction ? getFunctionName(containingFunction) : "top-level";
}
