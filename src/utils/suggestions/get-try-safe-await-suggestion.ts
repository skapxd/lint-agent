import type { TSESTree } from "@typescript-eslint/utils";
import type { RuleSourceCode } from "#/utils/rule-authoring/rule-types";
import { containsAwaitExpression } from "#/utils/async/contains-await-expression";
import { getAwaitedOperationExample } from "./get-awaited-operation-example";

export function getTrySafeAwaitSuggestion(
  node: TSESTree.Node,
  sourceCode: RuleSourceCode,
) {
  const callbackKeyword = containsAwaitExpression(node) ? "async " : "";

  return `await trySafe(${callbackKeyword}() => ${getAwaitedOperationExample(
    node,
    sourceCode,
  )})`;
}
