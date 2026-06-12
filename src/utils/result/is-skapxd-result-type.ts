import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { isSkapxdNamedType } from "./is-skapxd-named-type";

export function isSkapxdResultType(type: ts.Type, typeContext: TypeContext) {
  const isSkapxdResultNamedType = isSkapxdNamedType(type, ["Result", "SafeResult"], typeContext);
  if (isSkapxdResultNamedType) {
    return true;
  }

  if (!type.isUnion()) {
    return false;
  }

  const hasOk = type.types.some((part: ts.Type) =>
    isSkapxdNamedType(part, ["Ok"], typeContext),
  );
  const hasErr = type.types.some((part: ts.Type) =>
    isSkapxdNamedType(part, ["Err"], typeContext),
  );

  return hasOk && hasErr;
}
