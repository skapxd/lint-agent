import type { LegacyAstNode } from "#/utils/rule-types";
import { getNodeChildren } from "./get-node-children";

export function collectIdentifiersNamed(node: LegacyAstNode, name: LegacyAstNode, results: LegacyAstNode = []) {
  if (node?.type === "Identifier" && node.name === name) {
    results.push(node);
  }

  for (const child of getNodeChildren(node)) {
    collectIdentifiersNamed(child, name, results);
  }

  return results;
}
