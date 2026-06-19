import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getNestDtoValidationOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    dtoFilePatterns: stringArrayOption(options, "dtoFilePatterns", ["*.dto.ts"]),
    // Decoradores que declaran "esta propiedad puede faltar" para el runtime.
    optionalDecoratorNames: stringArrayOption(options, "optionalDecoratorNames", [
      "IsOptional",
      "ValidateIf",
    ]),
    // Las exenciones de output siguen existiendo para consumidores que las
    // decidan explicitamente; por defecto todo DTO declara contrato.
    outputDtoFilePatterns: stringArrayOption(options, "outputDtoFilePatterns", []),
    outputDtoClassPatterns: stringArrayOption(options, "outputDtoClassPatterns", []),
  };
}
