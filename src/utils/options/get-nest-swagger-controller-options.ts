import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getNestSwaggerControllerOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    // Lo único que un controller necesita de swagger cuando el plugin
    // @nestjs/swagger está activo: ocultar endpoints internos, agrupar,
    // declarar auth y documentar uploads multipart (no introspeccionables).
    allowedDecoratorNames: stringArrayOption(options, "allowedDecoratorNames", [
      "ApiBearerAuth",
      "ApiBody",
      "ApiConsumes",
      "ApiExcludeEndpoint",
      "ApiTags",
    ]),
    controllerDecoratorNames: stringArrayOption(options, "controllerDecoratorNames", ["Controller"]),
  };
}
