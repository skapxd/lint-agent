// @ts-nocheck
import { countOwnUseStateCallsInNode } from "./count-own-use-state-calls-in-node";
import { isAstNode } from "./is-ast-node";

export function countOwnUseStateCalls(node) {
  const body = node.body;

  return isAstNode(body) ? countOwnUseStateCallsInNode(body) : 0;
}
