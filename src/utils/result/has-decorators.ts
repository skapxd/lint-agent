import type { TSESTree } from "@typescript-eslint/utils";

export function hasDecorators(node: TSESTree.Node) {
  const decorators = "decorators" in node ? node.decorators : null;

  return Array.isArray(decorators) && decorators.length > 0;
}
