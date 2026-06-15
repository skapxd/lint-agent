import { numberOption } from "#/utils/options/number-option";
import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const DEFAULT_MIN_LINES = 30;
const DEFAULT_MIN_LITERALS = 10;
const DEFAULT_MIN_BRANCHES = 5;

export function getDenseFunctionRequiresCommentOptions(
  options: RuleOptions = {},
) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    minBranches: numberOption(options, "minBranches", DEFAULT_MIN_BRANCHES),
    minLines: numberOption(options, "minLines", DEFAULT_MIN_LINES),
    minLiterals: numberOption(options, "minLiterals", DEFAULT_MIN_LITERALS),
  };
}
