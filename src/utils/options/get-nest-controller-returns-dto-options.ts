import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAllowFilePatterns = ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts"];

export function getNestControllerReturnsDtoOptions(options: RuleOptions = {}) {
  const dtoLayerSource = typeof options.dtoLayerSource === "string"
    ? options.dtoLayerSource
    : "@skapxd/nest";

  return {
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    controllerDecoratorNames: stringArrayOption(options, "controllerDecoratorNames", ["Controller"]),
    dtoLayerSource,
    gatewayDecoratorNames: stringArrayOption(options, "gatewayDecoratorNames", ["WebSocketGateway"]),
    responseHandlerParamDecorators: stringArrayOption(options, "responseHandlerParamDecorators", ["Res", "Next"]),
  };
}
