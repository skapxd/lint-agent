import type { RuleNode } from "#/utils/rule-types";
// `const [error, setError] = useState(...)` → "setError". El setter se
// identifica por POSICIÓN en el destructuring, no por su nombre: la
// evidencia es estructural y un rename no la esquiva.
export function getUseStateSetterName(callExpression: RuleNode) {
  const declarator = callExpression.parent;

  if (
    declarator?.type !== "VariableDeclarator" ||
    declarator.id?.type !== "ArrayPattern"
  ) {
    return null;
  }

  const second = declarator.id.elements[1];

  return second?.type === "Identifier" ? second.name : null;
}
