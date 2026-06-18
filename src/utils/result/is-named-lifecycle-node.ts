import type { TSESTree } from "@typescript-eslint/utils";
import { getPropertyName } from "#/utils/ast/get-property-name";

export function isNamedLifecycleNode(
  node: TSESTree.Node,
  lifecycleFunctionNames: readonly string[],
) {
  const isMethodDefinition = node.type === "MethodDefinition";
  if (isMethodDefinition) {
    return lifecycleFunctionNames.includes(getPropertyName(node.key));
  }

  const isProperty = node.type === "Property";
  if (isProperty) {
    return lifecycleFunctionNames.includes(getPropertyName(node.key));
  }

  const isFunctionDeclaration = node.type === "FunctionDeclaration";
  if (isFunctionDeclaration) {
    const functionName = node.id?.name ?? "";

    return lifecycleFunctionNames.includes(functionName);
  }

  return false;
}
