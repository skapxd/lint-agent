import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";

export function isPromiseType(type: ts.Type, typeContext: TypeContext) {
  const awaited = typeContext.checker.getAwaitedType(type);

  return Boolean(awaited && awaited !== type);
}
