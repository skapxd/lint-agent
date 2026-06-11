// @ts-nocheck
export function getNestSwaggerPluginOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // La regla se ancla al entrypoint para reportar UNA vez por proyecto.
    mainFilePatterns: options.mainFilePatterns ?? ["src/main.ts"],
  };
}
