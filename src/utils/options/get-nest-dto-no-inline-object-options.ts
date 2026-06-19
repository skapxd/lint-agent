import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";
export function getNestDtoNoInlineObjectOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: stringArrayOption(options, "allowFilePatterns", []),
    apiPropertyDecoratorNames: stringArrayOption(options, "apiPropertyDecoratorNames", [
      "ApiProperty",
      "ApiPropertyOptional",
    ]),
    dtoFilePatterns: stringArrayOption(options, "dtoFilePatterns", ["*.dto.ts"]),
  };
}
