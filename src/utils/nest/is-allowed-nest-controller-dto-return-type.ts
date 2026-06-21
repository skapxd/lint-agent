import type ts from "typescript";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { getSkapxdLayerOfType } from "#/utils/nest/get-skapxd-layer-of-type";
import tslib from "typescript";

type NestControllerDtoReturnTypeOptions = {
  dtoLayerSource: string;
};

export function isAllowedNestControllerDtoReturnType(
  returnType: ts.Type,
  typeContext: TypeContext,
  options: NestControllerDtoReturnTypeOptions,
): boolean {
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
    return false;
  }

  const isUnionLeafType = leafType.isUnion();
  if (isUnionLeafType) {
    return false;
  }

  return getSkapxdLayerOfType(leafType, typeContext, options.dtoLayerSource) === "dto";
}
