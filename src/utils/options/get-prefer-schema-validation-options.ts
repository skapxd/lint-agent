import { numberOption } from "#/utils/options/number-option";
import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const DEFAULT_MAX_STRUCTURAL_CHECKS = 4;

export function getPreferSchemaValidationOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    maxStructuralChecks: numberOption(
      options,
      "maxStructuralChecks",
      DEFAULT_MAX_STRUCTURAL_CHECKS,
    ),
  };
}
