import type { TSESTree } from "@typescript-eslint/utils";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSkapxdResultType } from "./is-skapxd-result-type";

export function isSkapxdResultExpression(node: TSESTree.Node, typeContext: TypeContext) {
  return isSkapxdResultType(typeContext.services.getTypeAtLocation(node), typeContext);
}
