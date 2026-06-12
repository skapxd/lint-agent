import type { LegacyAstNode } from "#/utils/rule-types";
export function getNestValidationPipeOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Las opciones que sostienen el contrato de los DTOs:
    // - transform: sin él, class-transformer no corre y @Type no hace nada;
    // - whitelist: sin él, las props sin decorador pasan crudas al dominio.
    requiredPipeOptions: options.requiredPipeOptions ?? [
      "transform",
      "whitelist",
    ],
  };
}
