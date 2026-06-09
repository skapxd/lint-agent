// @ts-nocheck
import { containsAwaitExpression } from "./contains-await-expression";
import { getAwaitedOperationExample } from "./get-awaited-operation-example";

export function getTrySafeAwaitSuggestion(node, sourceCode) {
  const callbackKeyword = containsAwaitExpression(node) ? "async " : "";

  return `await trySafe(${callbackKeyword}() => ${getAwaitedOperationExample(
    node,
    sourceCode,
  )})`;
}
