import type { LegacyAstNode } from "#/utils/rule-types";
import { isSkapxdResultType } from "./is-skapxd-result-type";

export function isSkapxdResultExpression(node: LegacyAstNode, typeContext: LegacyAstNode) {
  return isSkapxdResultType(typeContext.services.getTypeAtLocation(node), typeContext);
}
