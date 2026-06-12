import type { TSESTree } from "@typescript-eslint/utils";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

// `result.error` usado como condición: la presencia del error es el guard.
export function getErrorMemberObject(node: TSESTree.Node) {
  const unwrappedNode = unwrapExpression(node);

  const isMemberExpressionNode = unwrappedNode.type === "MemberExpression";
  if (!isMemberExpressionNode) {
    return null;
  }

  const object = unwrappedNode.object;
  const lacksResultErrorMember = object.type !== "Identifier" || !isMemberPropertyNamed(unwrappedNode, "error");
  if (lacksResultErrorMember) {
    return null;
  }

  return {
    name: object.name,
    node: object,
  };
}
