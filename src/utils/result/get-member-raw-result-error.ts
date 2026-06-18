import type { TSESTree } from "@typescript-eslint/utils";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { isSkapxdResultOrErrExpression } from "./is-skapxd-result-or-err-expression";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";
import type { RawResultError } from "./no-rethrow-result-error-types";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function getMemberRawResultError(
  node: TSESTree.Node,
  typeContext: TypeContext,
): RawResultError | null {
  const unwrappedNode = unwrapExpression(node);
  const isErrorMember = unwrappedNode.type === "MemberExpression" &&
    isMemberPropertyNamed(unwrappedNode, "error");
  if (!isErrorMember) {
    return null;
  }

  const resultExpression = unwrapExpression(unwrappedNode.object);
  const isSkapxdResult = isSkapxdResultOrErrExpression(
    resultExpression,
    typeContext,
  );
  if (!isSkapxdResult) {
    return null;
  }

  return {
    errorExpression: unwrappedNode,
    resultExpression,
  };
}
