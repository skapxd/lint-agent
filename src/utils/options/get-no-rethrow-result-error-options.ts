import { nestEntrypointFilePatterns } from "#/constants/nest-entrypoint-file-patterns";
import { nestFrameworkHookNames } from "#/constants/nest-framework-hook-names";
import { stringArrayOption } from "./string-array-option";
import type { RuleOptions } from "#/utils/rule-authoring/rule-types";

const defaultAllowFilePatterns = [
  ...nestEntrypointFilePatterns,
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "**/*.e2e-spec.ts",
  "**/*.e2e-spec.tsx",
  "**/__tests__/**",
  "**/*.seed.ts",
  "**/*.seeder.ts",
  "**/seeds/**",
  "**/seeders/**",
  "**/*.decorator.ts",
  "**/*.middleware.ts",
];

export function getNoRethrowResultErrorOptions(options: RuleOptions = {}) {
  return {
    allowFilePatterns: [
      ...defaultAllowFilePatterns,
      ...stringArrayOption(options, "allowFilePatterns", []),
    ],
    bootstrapCallNames: stringArrayOption(options, "bootstrapCallNames", [
      "forRootAsync",
    ]),
    controllerDecoratorNames: stringArrayOption(options, "controllerDecoratorNames", [
      "Controller",
    ]),
    controllerFilePatterns: stringArrayOption(options, "controllerFilePatterns", [
      "**/*.controller.ts",
    ]),
    lifecycleFunctionNames: stringArrayOption(options, "lifecycleFunctionNames", [
      ...nestFrameworkHookNames,
      "forRootAsync",
    ]),
  };
}

export type NoRethrowResultErrorOptions = ReturnType<
  typeof getNoRethrowResultErrorOptions
>;
