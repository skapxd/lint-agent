import type { TSESTree } from "@typescript-eslint/utils";
// `const [error, setError] = useState(...)` → "setError". El setter se
// identifica por POSICIÓN en el destructuring, no por su nombre: la
// evidencia es estructural y un rename no la esquiva.
export function getUseStateSetterName(callExpression: TSESTree.CallExpression) {
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

  const second = tuplePattern.elements[1];

  return second?.type === "Identifier" ? second.name : null;
}
