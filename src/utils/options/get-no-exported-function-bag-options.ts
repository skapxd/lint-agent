import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

export function getNoExportedFunctionBagOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
  };
}
