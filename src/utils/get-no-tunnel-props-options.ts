import type { LegacyAstNode } from "#/utils/rule-types";
export function getNoTunnelPropsOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Regex de nombres de prop que sí pueden reenviarse (p. ej.
    // ["^className$", "^style$"] en wrappers de un design system).
    allowPropPatterns: options.allowPropPatterns ?? [],
  };
}
