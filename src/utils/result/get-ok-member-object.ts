import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "#/utils/is-member-property-named";
import { unwrapExpression } from "#/utils/unwrap-expression";

export function getOkMemberObject(node: RuleNode) {
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
