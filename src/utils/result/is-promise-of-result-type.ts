import type { RuleNode, TypeContext } from "#/utils/rule-authoring/rule-types";
import { getTypeReferenceParameters } from "#/utils/type-aware/get-type-reference-parameters";
import { isTypeReferenceNamed } from "#/utils/type-aware/is-type-reference-named";

export function isPromiseOfResultType(node: RuleNode, options: { promiseTypeNames: readonly string[]; resultTypeNames: readonly string[] }) {
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
