import type { LegacyAstNode } from "#/utils/rule-types";
export function getTreeChildLines({ indent = "", names }: LegacyAstNode) {
  return names.map((name: LegacyAstNode, index: LegacyAstNode) => {
    const branch = index === names.length - 1 ? "└──" : "├──";

    return `${indent}${branch} ${name}`;
  });
}
