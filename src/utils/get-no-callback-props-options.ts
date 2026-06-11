// @ts-nocheck
export function getNoCallbackPropsOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Regex de nombres de prop exentos (p. ej. ["^render"] para render props
    // de librerías de terceros).
    allowPropPatterns: options.allowPropPatterns ?? [],
  };
}
