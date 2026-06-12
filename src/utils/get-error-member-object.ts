import type { RuleNode } from "#/utils/rule-types";
import { isMemberPropertyNamed } from "./is-member-property-named";
import { unwrapExpression } from "./unwrap-expression";

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
