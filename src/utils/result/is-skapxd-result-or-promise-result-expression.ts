import type { RuleNode, TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSkapxdResultOrPromiseResultType } from "./is-skapxd-result-or-promise-result-type";

export function isSkapxdResultOrPromiseResultExpression(node: RuleNode, typeContext: TypeContext) {
  return isSkapxdResultOrPromiseResultType(
    typeContext.services.getTypeAtLocation(node),
    typeContext,
  );
}
