import type { LegacyAstNode } from "#/utils/rule-types";
export function getNestDtoApiPropertyOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    apiPropertyDecoratorNames: options.apiPropertyDecoratorNames ?? [
      "ApiProperty",
      "ApiPropertyOptional",
    ],
    dtoFilePatterns: options.dtoFilePatterns ?? ["*.dto.ts"],
  };
}
