import { booleanOption } from "#/utils/options/boolean-option";
import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAllowFilePatterns = ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts"];

export function getNestControllerReturnsDtoOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    allowPrimitiveReturns: booleanOption(options, "allowPrimitiveReturns", true),
    controllerDecoratorNames: stringArrayOption(options, "controllerDecoratorNames", ["Controller"]),
    gatewayDecoratorNames: stringArrayOption(options, "gatewayDecoratorNames", ["WebSocketGateway"]),
    requireDtoSuffix: booleanOption(options, "requireDtoSuffix", false),
    responseHandlerParamDecorators: stringArrayOption(options, "responseHandlerParamDecorators", ["Res", "Next"]),
    streamReturnTypes: stringArrayOption(options, "streamReturnTypes", ["StreamableFile", "Buffer"]),
  };
}
