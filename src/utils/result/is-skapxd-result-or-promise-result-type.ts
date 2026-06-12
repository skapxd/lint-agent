import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSkapxdResultType } from "./is-skapxd-result-type";

export function isSkapxdResultOrPromiseResultType(type: ts.Type, typeContext: TypeContext) {
  const isSkapxdResult = isSkapxdResultType(type, typeContext);
  if (isSkapxdResult) {
    return true;
  }

  const promisedType = typeContext.checker.getAwaitedType(type);

  return Boolean(
    promisedType &&
      promisedType !== type &&
      isSkapxdResultType(promisedType, typeContext),
  );
}
