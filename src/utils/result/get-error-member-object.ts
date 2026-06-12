import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "#/utils/is-member-property-named";
import { unwrapExpression } from "#/utils/unwrap-expression";

// `result.error` usado como condición: la presencia del error es el guard.
export function getErrorMemberObject(node: RuleNode) {
  const unwrappedNode = unwrapExpression(node);

  if (
    unwrappedNode.type !== "MemberExpression" ||
    unwrappedNode.object.type !== "Identifier" ||
    !isMemberPropertyNamed(unwrappedNode, "error")
  ) {
    return null;
  }

  return {
    name: unwrappedNode.object.name,
    node: unwrappedNode.object,
  };
}
