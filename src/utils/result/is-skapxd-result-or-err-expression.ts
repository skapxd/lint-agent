import type { TSESTree } from "@typescript-eslint/utils";
import { isSkapxdNamedType } from "./is-skapxd-named-type";
import { isSkapxdResultExpression } from "./is-skapxd-result-expression";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function isSkapxdResultOrErrExpression(
  node: TSESTree.Node,
  typeContext: TypeContext,
) {
  const expressionType = typeContext.services.getTypeAtLocation(node);
  const isResultUnion = isSkapxdResultExpression(node, typeContext);
  const isErrVariant = isSkapxdNamedType(expressionType, ["Err"], typeContext);

  return isResultUnion || isErrVariant;
}
