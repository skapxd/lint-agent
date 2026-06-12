import { stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getNestSwaggerPluginOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // La regla se ancla al entrypoint para reportar UNA vez por proyecto.
    mainFilePatterns: stringArrayOption(options, "mainFilePatterns", ["src/main.ts"]),
  };
}
