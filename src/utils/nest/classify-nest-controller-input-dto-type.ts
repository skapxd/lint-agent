import type ts from "typescript";
import { getSkapxdLayerOfType } from "#/utils/nest/get-skapxd-layer-of-type";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import tslib from "typescript";

type NestControllerInputDtoTypeOptions = {
  dtoLayerSource: string;
};

type DtoInputCause =
  | { status: "ok" }
  | { received: string; status: "invalid" };

export function classifyNestControllerInputDtoType(
  inputType: ts.Type,
  typeContext: TypeContext,
  options: NestControllerInputDtoTypeOptions,
): DtoInputCause {
  const received = typeContext.checker.typeToString(inputType);
  const isStringLike = Boolean(inputType.flags & tslib.TypeFlags.StringLike);
  const isRawArray = !isStringLike &&
    (typeContext.checker.isArrayType(inputType) ||
      typeContext.checker.isTupleType(inputType) ||
      typeContext.checker.isArrayLikeType(inputType));
  if (isRawArray) {
    return {
      received: `array crudo (${received})`,
      status: "invalid",
    };
  }

  const hasDtoLayer = getSkapxdLayerOfType(
    inputType,
    typeContext,
    options.dtoLayerSource,
  ) === "dto";
  if (hasDtoLayer) {
    return { status: "ok" };
  }

  return {
    received,
    status: "invalid",
  };
}
