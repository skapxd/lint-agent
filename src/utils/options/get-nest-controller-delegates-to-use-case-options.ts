import { stringArrayOption } from "#/utils/options/string-array-option";
import { isHttpRouteMethod } from "#/utils/nest/is-http-route-method";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAllowFilePatterns = ["**/*.spec.ts", "**/*.test.ts", "**/*.e2e-spec.ts"];
const defaultHttpMethodDecoratorNames = ["Delete", "Get", "Head", "Options", "Patch", "Post", "Put"].filter(
  (name) => isHttpRouteMethod(name.toUpperCase()),
);

export function getNestControllerDelegatesToUseCaseOptions(
  options: RuleOptions = {},
) {
  return {
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    controllerDecoratorNames: stringArrayOption(
      options,
      "controllerDecoratorNames",
      ["Controller"],
    ),
    dtoLayerSource: typeof options.dtoLayerSource === "string"
      ? options.dtoLayerSource
      : "@skapxd/nest",
    httpMethodDecoratorNames: stringArrayOption(
      options,
      "httpMethodDecoratorNames",
      defaultHttpMethodDecoratorNames,
    ),
    nestDecoratorSource: typeof options.nestDecoratorSource === "string"
      ? options.nestDecoratorSource
      : "@nestjs/common",
    responseHandlerParamDecorators: stringArrayOption(
      options,
      "responseHandlerParamDecorators",
      ["Res", "Next"],
    ),
    useCaseDecoratorNames: stringArrayOption(
      options,
      "useCaseDecoratorNames",
      ["UseCase"],
    ),
    useCaseDecoratorSource: typeof options.useCaseDecoratorSource === "string"
      ? options.useCaseDecoratorSource
      : "@skapxd/nest",
  };
}
