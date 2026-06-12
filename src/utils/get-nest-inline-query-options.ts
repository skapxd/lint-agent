import type { LegacyAstNode } from "#/utils/rule-types";
export function getNestInlineQueryOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    // Un @Query('name') suelto es legítimo; desde 2 ya es un DTO disfrazado.
    max: options.max ?? 1,
  };
}
