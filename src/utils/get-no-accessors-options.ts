import { stringArrayOption } from "#/utils/string-array-option";
import type { RuleOptions } from "#/utils/rule-types";
export function getNoAccessorsOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
  };
}
