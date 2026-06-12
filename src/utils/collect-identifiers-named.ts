import type { RuleNode } from "#/utils/rule-types";
import { getNodeChildren } from "./get-node-children";
import { isAstNode } from "./is-ast-node";

export function collectIdentifiersNamed(
  node: RuleNode | null,
  name: string,
  results: RuleNode[] = [],
): RuleNode[] {
  if (!isAstNode(node)) {
    return results;
  }

  if (node?.type === "Identifier" && node.name === name) {
    results.push(node);
  }

  for (const child of getNodeChildren(node)) {
    collectIdentifiersNamed(child, name, results);
  }

  return results;
}
