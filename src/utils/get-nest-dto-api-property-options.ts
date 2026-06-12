import { stringArrayOption } from "#/utils/rule-types";
import type { RuleOptions } from "#/utils/rule-types";
export function getNestDtoApiPropertyOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    apiPropertyDecoratorNames: stringArrayOption(options, "apiPropertyDecoratorNames", [
      "ApiProperty",
      "ApiPropertyOptional",
    ]),
    dtoFilePatterns: stringArrayOption(options, "dtoFilePatterns", ["*.dto.ts"]),
  };
}
