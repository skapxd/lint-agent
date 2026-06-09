// @ts-nocheck
import { isSkapxdResultType } from "./is-skapxd-result-type";

export function isSkapxdResultOrPromiseResultType(type, typeContext) {
  if (isSkapxdResultType(type, typeContext)) {
    return true;
  }

  const promisedType = typeContext.checker.getPromisedTypeOfPromise(type);

  return Boolean(promisedType && isSkapxdResultType(promisedType, typeContext));
}
