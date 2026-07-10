import { numberOption } from "#/utils/options/number-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const DEFAULT_MAX_LINES = 150;

export function getMaxClassSizeOptions(options: RuleOptions = {}) {
  return {
    maxLines: numberOption(options, "maxLines", DEFAULT_MAX_LINES),
  };
}
