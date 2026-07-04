import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

export function getNestDtoNoClassDecoratorOptions(options: RuleOptions = {}) {
  const dtoLayerSource = typeof options.dtoLayerSource === "string"
    ? options.dtoLayerSource
    : "@skapxd/nest";

  return {
    allowedClassDecorators: stringArrayOption(options, "allowedClassDecorators", []),
    dtoLayerSource,
  };
}
