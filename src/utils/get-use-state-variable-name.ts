import type { RuleNode } from "#/utils/rule-types";
// `const [error, setError] = useState(...)` → "error". Devuelve null si el
// resultado del useState no se destructura con nombre.
export function getUseStateVariableName(callExpression: RuleNode) {
  const declarator = callExpression.parent;

  if (
    declarator?.type !== "VariableDeclarator" ||
    declarator.id?.type !== "ArrayPattern"
  ) {
    return null;
  }

  const first = declarator.id.elements[0];

  return first?.type === "Identifier" ? first.name : null;
}
