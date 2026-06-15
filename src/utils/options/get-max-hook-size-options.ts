import { numberOption } from "#/utils/options/number-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const DEFAULT_MAX_LINES = 120;

export function getMaxHookSizeOptions(options: RuleOptions = {}) {
  return {
    maxLines: numberOption(options, "maxLines", DEFAULT_MAX_LINES),
    maxUseState: numberOption(options, "maxUseState", 1),
  };
}
