// @ts-nocheck
export function getAsyncResultRuleOptions(options = {}) {
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
