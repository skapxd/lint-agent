// @ts-nocheck
import { getTypeReferenceParameters } from "./get-type-reference-parameters";
import { isTypeReferenceNamed } from "./is-type-reference-named";

export function isPromiseOfResultType(node, options) {
  if (node.type !== "TSTypeReference") {
    return false;
  }

  if (!isTypeReferenceNamed(node, options.promiseTypeNames)) {
    return false;
  }

  const promiseValueType = getTypeReferenceParameters(node)[0];

  return Boolean(
    promiseValueType &&
      promiseValueType.type === "TSTypeReference" &&
      isTypeReferenceNamed(promiseValueType, options.resultTypeNames),
  );
}
