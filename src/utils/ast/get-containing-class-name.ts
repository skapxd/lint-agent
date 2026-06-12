import type { TSESTree } from "@typescript-eslint/utils";
import { isClassBoundary } from "./is-class-boundary";

export function getContainingClassName(node: TSESTree.Node) {
  let current: TSESTree.Node | undefined = node.parent;

  while (current) {
    if (isClassBoundary(current)) {
      return current.id?.name ?? null;
    }

    current = current.parent;
  }

  return null;
}
