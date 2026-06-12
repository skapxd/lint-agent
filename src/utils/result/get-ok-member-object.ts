import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getOkMemberObject(node: RuleNode) {
  const unwrappedNode = unwrapExpression(node);

  const lacksResultOkMember = unwrappedNode.type !== "MemberExpression" ||
    unwrappedNode.object.type !== "Identifier" ||
    !isMemberPropertyNamed(unwrappedNode, "ok");
  if (
    lacksResultOkMember
  ) {
    return null;
  }

  return {
    name: unwrappedNode.object.name,
    node: unwrappedNode.object,
  };
}
