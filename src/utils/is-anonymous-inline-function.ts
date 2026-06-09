// @ts-nocheck
// Una función inline sin nombre propio: arrow o function expression anónima.
// Las declaraciones (`function helper() {}`) nunca cuentan como inline.
export function isAnonymousInlineFunction(node) {
  if (node.type === "ArrowFunctionExpression") {
    return true;
  }

  return node.type === "FunctionExpression" && !node.id;
}
