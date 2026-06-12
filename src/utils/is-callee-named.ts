import type { LegacyAstNode } from "#/utils/rule-types";
import { isMemberPropertyNamed } from "./is-member-property-named";

export function isCalleeNamed(node: LegacyAstNode, names: LegacyAstNode) {
  if (node?.type === "Identifier") {
    return names.includes(node.name);
  }

  if (node?.type === "MemberExpression") {
    return names.some((name: LegacyAstNode) => isMemberPropertyNamed(node, name));
  }

  return false;
}
