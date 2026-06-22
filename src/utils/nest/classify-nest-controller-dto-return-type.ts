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
  | { returned: string; status: "primitive" }
  | { returned: string; status: "non-class" }
  | { returned: string; status: "unmarked-class" };

export function classifyNestControllerDtoReturnType(
  returnType: ts.Type,
  typeContext: TypeContext,
  options: NestControllerDtoReturnTypeOptions,
): DtoReturnCause {
  function getLeafType(type: ts.Type): ts.Type | null {
    const awaitedType = typeContext.checker.getAwaitedType(type);
    const effectiveAwaitedType = awaitedType ?? type;
    const hasAwaitedWrapper = effectiveAwaitedType !== type;
    if (hasAwaitedWrapper) {
      return getLeafType(effectiveAwaitedType);
    }

    const hasArrayWrapper = typeContext.checker.isArrayType(type);
    if (hasArrayWrapper) {
      const elementType = typeContext.checker.getIndexTypeOfType(
        type,
        tslib.IndexKind.Number,
      );

      return elementType ? getLeafType(elementType) : null;
    }

    return type;
  }

  const leafType = getLeafType(returnType);
  const lacksLeafType = !leafType;
  if (lacksLeafType) {
    return {
      returned: typeContext.checker.typeToString(returnType),
      status: "non-class",
    };
  }

  const isUnionLeafType = leafType.isUnion();
  if (isUnionLeafType) {
    return {
      returned: typeContext.checker.typeToString(leafType),
      status: "union",
    };
  }

  const isVoidType = Boolean(
    leafType.flags & (tslib.TypeFlags.Void | tslib.TypeFlags.Undefined),
  );
  if (isVoidType) {
    return {
      returned: typeContext.checker.typeToString(leafType),
      status: "void",
    };
  }

  const isPrimitiveType = Boolean(
    leafType.flags &
      (tslib.TypeFlags.StringLike |
        tslib.TypeFlags.NumberLike |
        tslib.TypeFlags.BooleanLike |
        tslib.TypeFlags.BigIntLike),
  );
  if (isPrimitiveType) {
    return {
      returned: typeContext.checker.typeToString(leafType),
      status: "primitive",
    };
  }

  const hasDtoLayer = getSkapxdLayerOfType(
    leafType,
    typeContext,
    options.dtoLayerSource,
  ) === "dto";
  if (hasDtoLayer) {
    return { status: "ok" };
  }

  const leafSymbol = leafType.getSymbol();
  const isClassType = Boolean(
    leafSymbol
      ?.getDeclarations()
      ?.some((declaration) => tslib.isClassDeclaration(declaration)),
  );

  return {
    returned: typeContext.checker.typeToString(leafType),
    status: isClassType ? "unmarked-class" : "non-class",
  };
}
