import { stringArrayOption } from "#/utils/string-array-option";
import type { RuleOptions } from "#/utils/rule-types";
export function getNestDtoValidationOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    dtoFilePatterns: stringArrayOption(options, "dtoFilePatterns", ["*.dto.ts"]),
    // Decoradores que declaran "esta propiedad puede faltar" para el runtime.
    optionalDecoratorNames: stringArrayOption(options, "optionalDecoratorNames", [
      "IsOptional",
      "ValidateIf",
    ]),
    // Los DTOs de RESPUESTA no se validan (el server los produce, no los
    // recibe): quedan exentos por convención de nombre de ARCHIVO...
    outputDtoFilePatterns: stringArrayOption(options, "outputDtoFilePatterns", [
      "out-*.dto.ts",
      "output-*.dto.ts",
      "*-response.dto.ts",
      "*-result.dto.ts",
      "*-output.dto.ts",
    ]),
    // ...y también de CLASE (regex): un UploadDocumentResponseDto puede
    // vivir en un archivo de nombre neutro o compartido con DTOs de input.
    outputDtoClassPatterns: stringArrayOption(options, "outputDtoClassPatterns", [
      "(Response|Result|Output)(Dto)?$",
    ]),
  };
}
