import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getPreferAbortSignalOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    effectNames: stringArrayOption(options, "effectNames", ["useEffect", "useLayoutEffect"]),
  };
}
