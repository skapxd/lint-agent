import type { TSESTree } from "@typescript-eslint/utils";
import type { FunctionNode } from "./is-function-node";

export function getParentFunctionReportNode(node: FunctionNode): TSESTree.Node {
  const parent = node.parent;

  const hasVariableDeclaratorName = parent.type === "VariableDeclarator" && parent.id.type === "Identifier";
  if (hasVariableDeclaratorName) {
    return parent.id;
  }

  const hasPropertyLikeParent = parent.type === "Property" ||
    parent.type === "MethodDefinition" ||
    parent.type === "PropertyDefinition";
  if (
    hasPropertyLikeParent
  ) {
    return parent.key;
  }

  const isAnonymousArrowFunction = node.type === "ArrowFunctionExpression";
  if (isAnonymousArrowFunction) {
    return node;
  }

  return node.id ?? node;
}
