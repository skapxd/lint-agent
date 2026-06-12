import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isFunctionNode } from "#/utils/ast/is-function-node";

export function containsAwaitExpression(node: RuleNode): boolean {
  if (!isAstNode(node)) {
    return false;
  }

  if (node.type === "AwaitExpression") {
    return true;
  }

  if (isFunctionNode(node)) {
    return false;
  }

  return getNodeChildren(node).some((child: RuleNode) => containsAwaitExpression(child));
}
