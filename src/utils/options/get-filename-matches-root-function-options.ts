import { stringArrayOption } from "./string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

export function getFilenameMatchesRootFunctionOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
  };
}
