import type { RuleNode, RuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { unwrapExpression } from "#/utils/unwrap-expression";

export function getCallExpressionExample(node: RuleNode, sourceCode: RuleSourceCode) {
  const calleeText = sourceCode.getText(node.callee);

  if (node.arguments.length === 0) {
    return `${calleeText}()`;
  }

  const firstArgument = node.arguments[0];

  if (
    firstArgument &&
    node.arguments.length === 1 &&
    unwrapExpression(firstArgument).type === "ObjectExpression"
  ) {
    return `${calleeText}({...})`;
  }

  return `${calleeText}(...)`;
}
