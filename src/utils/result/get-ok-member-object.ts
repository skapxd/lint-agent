import type { TSESTree } from "@typescript-eslint/utils";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function getOkMemberObject(node: TSESTree.Node) {
  const unwrappedNode = unwrapExpression(node);

  const isMemberExpressionNode = unwrappedNode.type === "MemberExpression";
  if (!isMemberExpressionNode) {
    return null;
  }

  const object = unwrappedNode.object;
  const lacksResultOkMember = object.type !== "Identifier" || !isMemberPropertyNamed(unwrappedNode, "ok");
  if (lacksResultOkMember) {
    return null;
  }

  return {
    name: object.name,
    node: object,
  };
}
