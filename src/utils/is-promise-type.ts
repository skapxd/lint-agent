import type { LegacyAstNode } from "#/utils/rule-types";
export function isPromiseType(type: LegacyAstNode, typeContext: LegacyAstNode) {
  return typeContext.checker.getPromisedTypeOfPromise(type) !== undefined;
}
