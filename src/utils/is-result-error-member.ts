import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "./is-member-property-named";
import { unwrapExpression } from "./unwrap-expression";

export function isResultErrorMember(node: RuleNode, resultName: string) {
  const unwrappedNode = unwrapExpression(node);

  return (
    unwrappedNode.type === "MemberExpression" &&
    unwrappedNode.object.type === "Identifier" &&
    unwrappedNode.object.name === resultName &&
    isMemberPropertyNamed(unwrappedNode, "error")
  );
}
