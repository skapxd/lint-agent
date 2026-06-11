// @ts-nocheck
export function getNestNoResultResponseOptions(options = {}) {
  return {
    allowFilePatterns: options.allowFilePatterns ?? [],
    controllerDecoratorNames: options.controllerDecoratorNames ?? ["Controller"],
  };
}
