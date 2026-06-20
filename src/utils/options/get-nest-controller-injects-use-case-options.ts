import { stringArrayOption } from "#/utils/options/string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAllowFilePatterns = ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts"];

export function getNestControllerInjectsUseCaseOptions(options: RuleOptions = {}) {
  const useCaseDecoratorSource = typeof options.useCaseDecoratorSource === "string"
    ? options.useCaseDecoratorSource
    : "@skapxd/nest";

  return {
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    allowedInjectionTypeNames: stringArrayOption(options, "allowedInjectionTypeNames", []),
    controllerDecoratorNames: stringArrayOption(options, "controllerDecoratorNames", ["Controller"]),
    gatewayDecoratorNames: stringArrayOption(options, "gatewayDecoratorNames", ["WebSocketGateway"]),
    useCaseDecoratorNames: stringArrayOption(options, "useCaseDecoratorNames", ["UseCase"]),
    useCaseDecoratorSource,
  };
}
