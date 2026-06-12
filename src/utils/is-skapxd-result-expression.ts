import type { RuleNode, TypeContext } from "#/utils/rule-types";
import { isSkapxdResultType } from "./is-skapxd-result-type";

export function isSkapxdResultExpression(node: RuleNode, typeContext: TypeContext) {
  return isSkapxdResultType(typeContext.services.getTypeAtLocation(node), typeContext);
}
