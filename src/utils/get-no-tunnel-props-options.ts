// @ts-nocheck
export function getNoTunnelPropsOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Reenviar 1 prop es composición normal; 2+ ya es un componente-túnel.
    maxPassThroughProps: options.maxPassThroughProps ?? 2,
  };
}
