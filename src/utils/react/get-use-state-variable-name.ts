import type { TSESTree } from "@typescript-eslint/utils";
// `const [error, setError] = useState(...)` → "error". Devuelve null si el
// resultado del useState no se destructura con nombre.
export function getUseStateVariableName(callExpression: TSESTree.CallExpression) {
  const declarator = callExpression.parent;

  const hasVariableDeclaratorParent = declarator.type === "VariableDeclarator";
  if (!hasVariableDeclaratorParent) {
    return null;
  }

  const tuplePattern = declarator.id;
  const hasArrayPattern = tuplePattern.type === "ArrayPattern";
  if (!hasArrayPattern) {
    return null;
  }

  const first = tuplePattern.elements[0];

  return first?.type === "Identifier" ? first.name : null;
}
