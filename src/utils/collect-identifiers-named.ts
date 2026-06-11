// @ts-nocheck
import { getNodeChildren } from "./get-node-children";

export function collectIdentifiersNamed(node, name, results = []) {
  if (node?.type === "Identifier" && node.name === name) {
    results.push(node);
  }

  for (const child of getNodeChildren(node)) {
    collectIdentifiersNamed(child, name, results);
  }

  return results;
}
