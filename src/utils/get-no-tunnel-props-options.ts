import { stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getNoTunnelPropsOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Regex de nombres de prop que sí pueden reenviarse (p. ej.
    // ["^className$", "^style$"] en wrappers de un design system).
    allowPropPatterns: stringArrayOption(options, "allowPropPatterns", []),
  };
}
