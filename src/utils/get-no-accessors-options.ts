import { stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getNoAccessorsOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
  };
}
