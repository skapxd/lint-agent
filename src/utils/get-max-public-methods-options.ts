import type { LegacyAstNode } from "#/utils/rule-types";
// La regla es agnóstica al framework: por defecto no ignora ningún nombre.
// El conocimiento del framework lo inyecta cada preset (el de Nest pasa sus
// lifecycle hooks vía `ignore`).
export function getMaxPublicMethodsOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    ignore: new Set(options.ignore ?? []),
    max: options.max ?? 1,
  };
}
