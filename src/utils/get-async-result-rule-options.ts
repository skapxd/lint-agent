import type { LegacyAstNode } from "#/utils/rule-types";
export function getAsyncResultRuleOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    allowNamePatterns: options.allowNamePatterns ?? [],
    checkMissingReturnType: options.checkMissingReturnType ?? true,
    checkMissingReturnTypeWhenCallNames:
      options.checkMissingReturnTypeWhenCallNames ?? [],
    promiseTypeNames: options.promiseTypeNames ?? ["Promise"],
    requireCallNames: options.requireCallNames ?? [],
    resultTypeNames: options.resultTypeNames ?? ["Result"],
  };
}
