import type { TSESTree } from "@typescript-eslint/utils";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSkapxdResultOrPromiseResultType } from "./is-skapxd-result-or-promise-result-type";

export function isSkapxdResultOrPromiseResultExpression(node: TSESTree.Node, typeContext: TypeContext) {
  return isSkapxdResultOrPromiseResultType(
    typeContext.services.getTypeAtLocation(node),
    typeContext,
  );
}
