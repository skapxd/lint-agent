import type { FunctionNode } from "#/utils/ast/is-function-node";
import { countOwnUseStateCallsInNode } from "./count-own-use-state-calls-in-node";
import { isAstNode } from "#/utils/ast/is-ast-node";

export function countOwnUseStateCalls(node: FunctionNode) {
  const body = node.body;

  return isAstNode(body) ? countOwnUseStateCallsInNode(body) : 0;
}
