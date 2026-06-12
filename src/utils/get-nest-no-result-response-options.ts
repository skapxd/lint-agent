import type { LegacyAstNode } from "#/utils/rule-types";
export function getNestNoResultResponseOptions(options: LegacyAstNode = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    controllerDecoratorNames: options.controllerDecoratorNames ?? ["Controller"],
  };
}
