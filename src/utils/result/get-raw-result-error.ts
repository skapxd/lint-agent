import type { TSESTree } from "@typescript-eslint/utils";
import { getDestructuredRawResultError } from "./get-destructured-raw-result-error";
import { getMemberRawResultError } from "./get-member-raw-result-error";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function getRawResultError(
  node: TSESTree.Node | null,
  typeContext: TypeContext,
) {
  if (!node) {
    return null;
  }

  const isNewError = unwrapExpression(node).type === "NewExpression";
  if (isNewError) {
    return null;
  }

  return getMemberRawResultError(node, typeContext) ??
    getDestructuredRawResultError(node, typeContext);
}
