import type { TSESTree } from "@typescript-eslint/utils";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function isResultErrorMember(node: TSESTree.Node, resultName: string) {
  const unwrappedNode = unwrapExpression(node);

  return (
    unwrappedNode.type === "MemberExpression" &&
    unwrappedNode.object.type === "Identifier" &&
    unwrappedNode.object.name === resultName &&
    isMemberPropertyNamed(unwrappedNode, "error")
  );
}
