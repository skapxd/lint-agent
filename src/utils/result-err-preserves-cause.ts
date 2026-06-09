// @ts-nocheck
import { isPropertyKeyNamed } from "./is-property-key-named";
import { isResultErrorMember } from "./is-result-error-member";
import { unwrapExpression } from "./unwrap-expression";

export function resultErrPreservesCause(node, resultName) {
  const unwrappedNode = unwrapExpression(node);

  if (isResultErrorMember(unwrappedNode, resultName)) {
    return true;
  }

  if (unwrappedNode.type !== "ObjectExpression") {
    return false;
  }

  return unwrappedNode.properties.some((property) => {
    if (property.type !== "Property" || !isPropertyKeyNamed(property, "cause")) {
      return false;
    }

    return isResultErrorMember(property.value, resultName);
  });
}
