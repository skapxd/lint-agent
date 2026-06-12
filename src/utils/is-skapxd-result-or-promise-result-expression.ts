import type { LegacyAstNode } from "#/utils/rule-types";
import { isSkapxdResultOrPromiseResultType } from "./is-skapxd-result-or-promise-result-type";

export function isSkapxdResultOrPromiseResultExpression(node: LegacyAstNode, typeContext: LegacyAstNode) {
  return isSkapxdResultOrPromiseResultType(
    typeContext.services.getTypeAtLocation(node),
    typeContext,
  );
}
