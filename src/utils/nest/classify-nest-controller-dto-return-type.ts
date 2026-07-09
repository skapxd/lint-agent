import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { getSkapxdLayerOfType } from "#/utils/nest/get-skapxd-layer-of-type";
import tslib from "typescript";

type NestControllerDtoReturnTypeOptions = {
  dtoLayerSource: string;
};

type DtoReturnCause =
  | { status: "ok" }
  | { returned: string; status: "union" }
  | { returned: string; status: "void" }
  | { returned: string; status: "array" }
  | { returned: string; status: "primitive" }
  | { returned: string; status: "non-class" }
  | { returned: string; status: "unmarked-class" };

export function classifyNestControllerDtoReturnType(
  returnType: ts.Type,
  typeContext: TypeContext,
  options: NestControllerDtoReturnTypeOptions,
): DtoReturnCause {
  function getEffectiveReturnType(type: ts.Type): ts.Type {
    const awaitedType = typeContext.checker.getAwaitedType(type);
    const effectiveAwaitedType = awaitedType ?? type;
    const hasAwaitedWrapper = effectiveAwaitedType !== type;
    if (hasAwaitedWrapper) {
      return getEffectiveReturnType(effectiveAwaitedType);
    }

    return type;
  }

  const effectiveReturnType = getEffectiveReturnType(returnType);
  const returned = typeContext.checker.typeToString(effectiveReturnType);
  const isRawArray = typeContext.checker.isArrayType(effectiveReturnType) ||
    typeContext.checker.isTupleType(effectiveReturnType);
  if (isRawArray) {
    return {
      returned,
      status: "array",
    };
  }

  const isUnionReturnType = effectiveReturnType.isUnion();
  if (isUnionReturnType) {
    return {
      returned,
      status: "union",
    };
  }

  const isVoidType = Boolean(
    effectiveReturnType.flags & (tslib.TypeFlags.Void | tslib.TypeFlags.Undefined),
  );
  if (isVoidType) {
    return {
      returned,
      status: "void",
    };
  }

  const isPrimitiveType = Boolean(
    effectiveReturnType.flags &
      (tslib.TypeFlags.StringLike |
        tslib.TypeFlags.NumberLike |
        tslib.TypeFlags.BooleanLike |
        tslib.TypeFlags.BigIntLike),
  );
  if (isPrimitiveType) {
    return {
      returned,
      status: "primitive",
    };
  }

  const hasDtoLayer = getSkapxdLayerOfType(
    effectiveReturnType,
    typeContext,
    options.dtoLayerSource,
  ) === "dto";
  if (hasDtoLayer) {
    return { status: "ok" };
  }

  const returnSymbol = effectiveReturnType.getSymbol();
  const isClassType = Boolean(
    returnSymbol
      ?.getDeclarations()
      ?.some((declaration) => tslib.isClassDeclaration(declaration)),
  );

  return {
    returned,
    status: isClassType ? "unmarked-class" : "non-class",
  };
}
