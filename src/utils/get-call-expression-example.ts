import type { LegacyAstNode } from "#/utils/rule-types";
import { unwrapExpression } from "./unwrap-expression";

export function getCallExpressionExample(node: LegacyAstNode, sourceCode: LegacyAstNode) {
  const calleeText = sourceCode.getText(node.callee);

  if (node.arguments.length === 0) {
    return `${calleeText}()`;
  }

  if (node.arguments.length === 1 && unwrapExpression(node.arguments[0]).type === "ObjectExpression") {
    return `${calleeText}({...})`;
  }

  return `${calleeText}(...)`;
}
