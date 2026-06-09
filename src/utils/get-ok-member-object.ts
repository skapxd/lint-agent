// @ts-nocheck
import { isMemberPropertyNamed } from "./is-member-property-named";
import { unwrapExpression } from "./unwrap-expression";

export function getOkMemberObject(node) {
  const unwrappedNode = unwrapExpression(node);

  if (
    unwrappedNode.type !== "MemberExpression" ||
    unwrappedNode.object.type !== "Identifier" ||
    !isMemberPropertyNamed(unwrappedNode, "ok")
  ) {
    return null;
  }

  return {
    name: unwrappedNode.object.name,
    node: unwrappedNode.object,
  };
}
