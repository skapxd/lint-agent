// @ts-nocheck
import { isCalleeNamed } from "./is-callee-named";

export function isTrySafeCall(node, trySafeCallNames) {
  return (
    node?.type === "CallExpression" &&
    isCalleeNamed(node.callee, trySafeCallNames)
  );
}
