import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

// `result.error` usado como condición: la presencia del error es el guard.
export function getErrorMemberObject(node: RuleNode) {
  const unwrappedNode = unwrapExpression(node);

  const lacksResultErrorMember = unwrappedNode.type !== "MemberExpression" ||
    unwrappedNode.object.type !== "Identifier" ||
    !isMemberPropertyNamed(unwrappedNode, "error");
  if (
    lacksResultErrorMember
  ) {
    return null;
  }

  return {
    name: unwrappedNode.object.name,
    node: unwrappedNode.object,
  };
}
