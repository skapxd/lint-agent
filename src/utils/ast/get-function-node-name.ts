import type { FunctionNode } from "./is-function-node";

export function getFunctionNodeName(node: FunctionNode) {
  const isAnonymousArrowFunction = node.type === "ArrowFunctionExpression";
  if (isAnonymousArrowFunction) {
    return "helper";
  }

  return node.id?.name ?? "helper";
}
