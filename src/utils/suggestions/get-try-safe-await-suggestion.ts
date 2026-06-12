import type { RuleNode, RuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { containsAwaitExpression } from "#/utils/contains-await-expression";
import { getAwaitedOperationExample } from "./get-awaited-operation-example";

export function getTrySafeAwaitSuggestion(
  node: RuleNode,
  sourceCode: RuleSourceCode,
) {
  const callbackKeyword = containsAwaitExpression(node) ? "async " : "";

  return `await trySafe(${callbackKeyword}() => ${getAwaitedOperationExample(
    node,
    sourceCode,
  )})`;
}
