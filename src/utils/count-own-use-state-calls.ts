import type { LegacyAstNode } from "#/utils/rule-types";
import { countOwnUseStateCallsInNode } from "./count-own-use-state-calls-in-node";
import { isAstNode } from "./is-ast-node";

export function countOwnUseStateCalls(node: LegacyAstNode) {
  const body = node.body;

  return isAstNode(body) ? countOwnUseStateCallsInNode(body) : 0;
}
