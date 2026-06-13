import type { TSESTree } from "@typescript-eslint/utils";
import type { RuleScopeReference } from "#/utils/rule-authoring/rule-types";

export function isReferenceToDeclaration(
  reference: RuleScopeReference,
  declarationNode: TSESTree.Node,
) {
  const resolvedVariable = reference.resolved;
  const lacksResolvedVariable = !resolvedVariable;
  if (lacksResolvedVariable) {
    return false;
  }

  return resolvedVariable.defs.some((definition) => definition.node === declarationNode);
}
