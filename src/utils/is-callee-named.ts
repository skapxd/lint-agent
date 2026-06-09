// @ts-nocheck
import { isMemberPropertyNamed } from "./is-member-property-named";

export function isCalleeNamed(node, names) {
  if (node?.type === "Identifier") {
    return names.includes(node.name);
  }

  if (node?.type === "MemberExpression") {
    return names.some((name) => isMemberPropertyNamed(node, name));
  }

  return false;
}
