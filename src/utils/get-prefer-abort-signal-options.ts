import { stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getPreferAbortSignalOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    effectNames: stringArrayOption(options, "effectNames", ["useEffect", "useLayoutEffect"]),
  };
}
