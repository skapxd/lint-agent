// @ts-nocheck
// `const [error, setError] = useState(...)` → "error". Devuelve null si el
// resultado del useState no se destructura con nombre.
export function getUseStateVariableName(callExpression) {
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
