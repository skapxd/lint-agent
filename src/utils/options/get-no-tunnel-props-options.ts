import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getNoTunnelPropsOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Regex de nombres de prop que sí pueden reenviarse (p. ej.
    // ["^className$", "^style$"] en wrappers de un design system).
    allowPropPatterns: stringArrayOption(options, "allowPropPatterns", []),
  };
}
