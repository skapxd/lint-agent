import type { RuleScope } from "#/utils/rule-authoring/rule-types";

export function getAncestorLocalScopes(functionScope: RuleScope) {
  const scopes = new Set<RuleScope>();
  let currentScope = functionScope.upper;

  while (currentScope) {
    const reachedModuleBoundary = currentScope.type === "module" ||
      currentScope.type === "global";
    if (reachedModuleBoundary) {
      return scopes;
    }

    scopes.add(currentScope);
    currentScope = currentScope.upper;
  }

  return scopes;
}
