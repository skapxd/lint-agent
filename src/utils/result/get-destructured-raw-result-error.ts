import type { TSESTree } from "@typescript-eslint/utils";
import { getErrorPatternFunction } from "./get-error-pattern-function";
import { getMatchResultExpression } from "./get-match-result-expression";
import { isSkapxdResultExpression } from "./is-skapxd-result-expression";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";
import type { RawResultError } from "./no-rethrow-result-error-types";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function getDestructuredRawResultError(
  node: TSESTree.Node,
  typeContext: TypeContext,
): RawResultError | null {
  const unwrappedNode = unwrapExpression(node);
  const isThrownIdentifier = unwrappedNode.type === "Identifier";
  if (!isThrownIdentifier) {
    return null;
  }

  const callback = getErrorPatternFunction(unwrappedNode, typeContext);
  if (!callback) {
    return null;
  }

  const resultExpression = getMatchResultExpression(callback);
  if (!resultExpression) {
    return null;
  }

  const isSkapxdResult = isSkapxdResultExpression(resultExpression, typeContext);
  if (!isSkapxdResult) {
    return null;
  }

  return {
    errorExpression: unwrappedNode,
    resultExpression,
  };
}
