// @ts-nocheck
export function getNoTunnelPropsOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Regex de nombres de prop que sí pueden reenviarse (p. ej.
    // ["^className$", "^style$"] en wrappers de un design system).
    allowPropPatterns: options.allowPropPatterns ?? [],
  };
}
