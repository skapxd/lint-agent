import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isPropertyKeyNamed } from "#/utils/ast/is-property-key-named";
import { isResultErrorMember } from "./is-result-error-member";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

export function resultErrPreservesCause(node: unknown, resultName: string) {
  if (!isAstNode(node)) {
    return false;
  }

  const unwrappedNode = unwrapExpression(node);

  const isResultErrorMemberRead = isResultErrorMember(unwrappedNode, resultName);
  if (isResultErrorMemberRead) {
    return true;
  }

  const isObjectExpressionNode = unwrappedNode.type === "ObjectExpression";
  if (!isObjectExpressionNode) {
    return false;
  }

  return unwrappedNode.properties.some((property: RuleNode) => {
    const lacksCauseProperty = property.type !== "Property" || !isPropertyKeyNamed(property, "cause");
    if (lacksCauseProperty) {
      return false;
    }

    return isAstNode(property.value) && isResultErrorMember(property.value, resultName);
  });
}
