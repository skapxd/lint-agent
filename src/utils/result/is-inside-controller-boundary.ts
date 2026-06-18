import type { TSESTree } from "@typescript-eslint/utils";
import { isClassBoundary } from "#/utils/ast/is-class-boundary";
import { hasClassDecoratorNamed } from "#/utils/nest/has-class-decorator-named";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { NoRethrowResultErrorOptions } from "#/utils/options/get-no-rethrow-result-error-options";

export function isInsideControllerBoundary(
  node: TSESTree.Node,
  filename: string,
  options: NoRethrowResultErrorOptions,
) {
  const matchesControllerFile = matchesAnyGlob(
    filename,
    options.controllerFilePatterns,
  );
  if (matchesControllerFile) {
    return true;
  }

  let current: TSESTree.Node | undefined = node.parent;
  while (current) {
    const hasControllerDecorator = isClassBoundary(current) &&
      hasClassDecoratorNamed(current, options.controllerDecoratorNames);
    if (hasControllerDecorator) {
      return true;
    }

    current = current.parent;
  }

  return false;
}
