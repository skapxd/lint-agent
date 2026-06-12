import type { RuleNode, RuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getCallExpressionExample(node: RuleNode, sourceCode: RuleSourceCode) {
  const calleeText = sourceCode.getText(node.callee);

  const hasNoArguments = node.arguments.length === 0;
  if (hasNoArguments) {
    return `${calleeText}()`;
  }

  const firstArgument = node.arguments[0];

  const usesSingleObjectArgument = firstArgument &&
    node.arguments.length === 1 &&
    unwrapExpression(firstArgument).type === "ObjectExpression";
  if (
    usesSingleObjectArgument
  ) {
    return `${calleeText}({...})`;
  }

  return `${calleeText}(...)`;
}
