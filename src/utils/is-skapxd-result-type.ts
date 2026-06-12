import type { LegacyAstNode } from "#/utils/rule-types";
import { isSkapxdNamedType } from "./is-skapxd-named-type";

export function isSkapxdResultType(type: LegacyAstNode, typeContext: LegacyAstNode) {
  if (isSkapxdNamedType(type, ["Result", "SafeResult"], typeContext)) {
    return true;
  }

  if (!type.isUnion()) {
    return false;
  }

  const hasOk = type.types.some((part: LegacyAstNode) =>
    isSkapxdNamedType(part, ["Ok"], typeContext),
  );
  const hasErr = type.types.some((part: LegacyAstNode) =>
    isSkapxdNamedType(part, ["Err"], typeContext),
  );

  return hasOk && hasErr;
}
