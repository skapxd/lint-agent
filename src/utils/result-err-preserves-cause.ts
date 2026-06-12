import type { LegacyAstNode } from "#/utils/rule-types";
import { isPropertyKeyNamed } from "./is-property-key-named";
import { isResultErrorMember } from "./is-result-error-member";
import { unwrapExpression } from "./unwrap-expression";

export function resultErrPreservesCause(node: LegacyAstNode, resultName: LegacyAstNode) {
  const unwrappedNode = unwrapExpression(node);

  if (isResultErrorMember(unwrappedNode, resultName)) {
    return true;
  }

  if (unwrappedNode.type !== "ObjectExpression") {
    return false;
  }

  return unwrappedNode.properties.some((property: LegacyAstNode) => {
    if (property.type !== "Property" || !isPropertyKeyNamed(property, "cause")) {
      return false;
    }

    return isResultErrorMember(property.value, resultName);
  });
}
