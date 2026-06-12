import { booleanOption, stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getAsyncResultRuleOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    allowNamePatterns: stringArrayOption(options, "allowNamePatterns", []),
    checkMissingReturnType: booleanOption(options, "checkMissingReturnType", true),
    checkMissingReturnTypeWhenCallNames:
      stringArrayOption(options, "checkMissingReturnTypeWhenCallNames", []),
    promiseTypeNames: stringArrayOption(options, "promiseTypeNames", ["Promise"]),
    requireCallNames: stringArrayOption(options, "requireCallNames", []),
    resultTypeNames: stringArrayOption(options, "resultTypeNames", ["Result"]),
  };
}
