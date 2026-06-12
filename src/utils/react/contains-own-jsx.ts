import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { getNodeChildren } from "#/utils/ast/get-node-children";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isFunctionNode } from "#/utils/ast/is-function-node";

export function containsOwnJsx(node: RuleNode): boolean {
  if (!isAstNode(node)) {
    return false;
  }

  const isOwnJsxNode = node.type === "JSXElement" || node.type === "JSXFragment";
  if (isOwnJsxNode) {
    return true;
  }

  const isFunctionBoundary = isFunctionNode(node);
  if (isFunctionBoundary) {
    return false;
  }

  return getNodeChildren(node).some((child: RuleNode) => containsOwnJsx(child));
}
