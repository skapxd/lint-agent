import { stringArrayOption } from "#/utils/string-array-option";
import type { RuleOptions } from "#/utils/rule-types";
export function getAwaitRequiresResultOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    trySafeCallNames: stringArrayOption(options, "trySafeCallNames", ["trySafe"]),
  };
}
