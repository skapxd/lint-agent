import type { LegacyAstNode } from "#/utils/rule-types";
import { containsAwaitExpression } from "./contains-await-expression";
import { getAwaitedOperationExample } from "./get-awaited-operation-example";

export function getTrySafeAwaitSuggestion(node: LegacyAstNode, sourceCode: LegacyAstNode) {
  const callbackKeyword = containsAwaitExpression(node) ? "async " : "";

  return `await trySafe(${callbackKeyword}() => ${getAwaitedOperationExample(
    node,
    sourceCode,
  )})`;
}
