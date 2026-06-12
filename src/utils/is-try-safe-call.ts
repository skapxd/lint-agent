import type { RuleNode } from "#/utils/rule-types";
import { isCalleeNamed } from "./is-callee-named";

export function isTrySafeCall(node: RuleNode, trySafeCallNames: readonly string[]) {
  return (
    node?.type === "CallExpression" &&
    isCalleeNamed(node.callee, trySafeCallNames)
  );
}
