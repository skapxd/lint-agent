import type { LegacyAstNode } from "#/utils/rule-types";
export function getNestSwaggerPluginOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // La regla se ancla al entrypoint para reportar UNA vez por proyecto.
    mainFilePatterns: options.mainFilePatterns ?? ["src/main.ts"],
  };
}
