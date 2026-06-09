// @ts-nocheck
import { isMemberPropertyNamed } from "./is-member-property-named";
import { unwrapExpression } from "./unwrap-expression";

export function isResultErrorMember(node, resultName) {
  const unwrappedNode = unwrapExpression(node);

  return (
    unwrappedNode.type === "MemberExpression" &&
    unwrappedNode.object.type === "Identifier" &&
    unwrappedNode.object.name === resultName &&
    isMemberPropertyNamed(unwrappedNode, "error")
  );
}
