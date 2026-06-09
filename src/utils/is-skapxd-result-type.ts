// @ts-nocheck
import { isSkapxdNamedType } from "./is-skapxd-named-type";

export function isSkapxdResultType(type, typeContext) {
  if (isSkapxdNamedType(type, ["Result", "SafeResult"], typeContext)) {
    return true;
  }

  if (!type.isUnion()) {
    return false;
  }

  const hasOk = type.types.some((part) =>
    isSkapxdNamedType(part, ["Ok"], typeContext),
  );
  const hasErr = type.types.some((part) =>
    isSkapxdNamedType(part, ["Err"], typeContext),
  );

  return hasOk && hasErr;
}
