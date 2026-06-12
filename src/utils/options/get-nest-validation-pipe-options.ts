import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getNestValidationPipeOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Las opciones que sostienen el contrato de los DTOs:
    // - transform: sin él, class-transformer no corre y @Type no hace nada;
    // - whitelist: sin él, las props sin decorador pasan crudas al dominio.
    requiredPipeOptions: stringArrayOption(options, "requiredPipeOptions", [
      "transform",
      "whitelist",
    ]),
  };
}
