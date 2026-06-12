import { numberOption } from "#/utils/options/number-option";
import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
// La regla es agnóstica al framework: por defecto no ignora ningún nombre.
// El conocimiento del framework lo inyecta cada preset (el de Nest pasa sus
// lifecycle hooks vía `ignore`).
export function getMaxPublicMethodsOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    ignore: new Set(stringArrayOption(options, "ignore")),
    max: numberOption(options, "max", 1),
  };
}
