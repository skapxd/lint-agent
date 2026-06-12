import type { LegacyAstNode } from "#/utils/rule-types";
import { isCalleeNamed } from "./is-callee-named";

export function isTrySafeCall(node: LegacyAstNode, trySafeCallNames: LegacyAstNode) {
  return (
    node?.type === "CallExpression" &&
    isCalleeNamed(node.callee, trySafeCallNames)
  );
}
