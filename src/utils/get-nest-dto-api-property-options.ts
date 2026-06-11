// @ts-nocheck
export function getNestDtoApiPropertyOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    apiPropertyDecoratorNames: options.apiPropertyDecoratorNames ?? [
      "ApiProperty",
      "ApiPropertyOptional",
    ],
    dtoFilePatterns: options.dtoFilePatterns ?? ["*.dto.ts"],
  };
}
