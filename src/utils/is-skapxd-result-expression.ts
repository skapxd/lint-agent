// @ts-nocheck
import { isSkapxdResultType } from "./is-skapxd-result-type";

export function isSkapxdResultExpression(node, typeContext) {
  return isSkapxdResultType(typeContext.services.getTypeAtLocation(node), typeContext);
}
