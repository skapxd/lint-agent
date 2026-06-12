import type { TSESTree } from "@typescript-eslint/utils";
import type { TypeContext } from "#/utils/rule-authoring/rule-types";
import { getTypeReferenceParameters } from "#/utils/type-aware/get-type-reference-parameters";
import { isTypeReferenceNamed } from "#/utils/type-aware/is-type-reference-named";

export function isPromiseOfResultType(node: TSESTree.Node, options: { promiseTypeNames: readonly string[]; resultTypeNames: readonly string[] }) {
  const isTypeReferenceNode = node.type === "TSTypeReference";
  if (!isTypeReferenceNode) {
    return false;
  }

  const isConfiguredPromiseType = isTypeReferenceNamed(node, options.promiseTypeNames);
  if (!isConfiguredPromiseType) {
    return false;
  }

  const promiseValueType = getTypeReferenceParameters(node)[0];

  return Boolean(
    promiseValueType &&
      promiseValueType.type === "TSTypeReference" &&
      isTypeReferenceNamed(promiseValueType, options.resultTypeNames),
  );
}
