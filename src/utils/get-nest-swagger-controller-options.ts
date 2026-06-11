// @ts-nocheck
export function getNestSwaggerControllerOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Lo único que un controller necesita de swagger cuando el plugin
    // @nestjs/swagger está activo: ocultar endpoints internos, agrupar,
    // declarar auth y documentar uploads multipart (no introspeccionables).
    allowedDecoratorNames: options.allowedDecoratorNames ?? [
      "ApiBearerAuth",
      "ApiBody",
      "ApiConsumes",
      "ApiExcludeEndpoint",
      "ApiTags",
    ],
    controllerDecoratorNames: options.controllerDecoratorNames ?? ["Controller"],
  };
}
