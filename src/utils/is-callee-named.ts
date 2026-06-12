import type { RuleNode } from "#/utils/rule-types";
import { isMemberPropertyNamed } from "./is-member-property-named";

export function isCalleeNamed(node: RuleNode, names: readonly string[]) {
  if (node?.type === "Identifier") {
    return names.includes(node.name);
  }

  if (node?.type === "MemberExpression") {
    return names.some((name: string) => isMemberPropertyNamed(node, name));
  }

  return false;
}
