import type { TSESTree } from "@typescript-eslint/utils";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";

export function collectIdentifiersNamed(
  node: TSESTree.Node | null,
  name: string,
  results: TSESTree.Node[] = [],
): TSESTree.Node[] {
  if (!isAstNode(node)) {
    return results;
  }

  const isTargetIdentifier = node.type === "Identifier" && node.name === name;
  if (isTargetIdentifier) {
    results.push(node);
  }

  for (const child of getNodeChildren(node)) {
    collectIdentifiersNamed(child, name, results);
  }

  return results;
}
