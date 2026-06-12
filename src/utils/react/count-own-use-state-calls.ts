import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { countOwnUseStateCallsInNode } from "./count-own-use-state-calls-in-node";
import { isAstNode } from "#/utils/ast/is-ast-node";

export function countOwnUseStateCalls(node: RuleNode) {
  const body = node.body;

  return isAstNode(body) ? countOwnUseStateCallsInNode(body) : 0;
}
