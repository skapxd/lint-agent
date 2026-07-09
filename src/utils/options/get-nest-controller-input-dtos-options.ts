import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAllowFilePatterns = ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts"];

export function getNestControllerInputDtosOptions(options: RuleOptions = {}) {
  const dtoLayerSource = typeof options.dtoLayerSource === "string"
    ? options.dtoLayerSource
    : "@skapxd/nest";
  const nestDecoratorSource = typeof options.nestDecoratorSource === "string"
    ? options.nestDecoratorSource
    : "@nestjs/common";

  return {
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    checkedDecorators: stringArrayOption(options, "checkedDecorators", ["Body", "Query", "Param"]),
    controllerDecoratorNames: stringArrayOption(options, "controllerDecoratorNames", ["Controller"]),
    dtoLayerSource,
    nestDecoratorSource,
  };
}
