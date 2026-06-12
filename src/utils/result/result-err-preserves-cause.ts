import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "#/utils/is-ast-node";
import { isPropertyKeyNamed } from "#/utils/is-property-key-named";
import { isResultErrorMember } from "./is-result-error-member";
import { unwrapExpression } from "#/utils/unwrap-expression";

export function resultErrPreservesCause(node: unknown, resultName: string) {
  if (!isAstNode(node)) {
    return false;
  }

  const unwrappedNode = unwrapExpression(node);

  if (isResultErrorMember(unwrappedNode, resultName)) {
    return true;
  }

  if (unwrappedNode.type !== "ObjectExpression") {
    return false;
  }

  return unwrappedNode.properties.some((property: RuleNode) => {
    if (property.type !== "Property" || !isPropertyKeyNamed(property, "cause")) {
      return false;
    }

    return isAstNode(property.value) && isResultErrorMember(property.value, resultName);
  });
}
