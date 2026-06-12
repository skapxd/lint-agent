import type { RuleNode } from "#/utils/rule-authoring/rule-types";
// `const [error, setError] = useState(...)` → "error". Devuelve null si el
// resultado del useState no se destructura con nombre.
export function getUseStateVariableName(callExpression: RuleNode) {
  const declarator = callExpression.parent;

  const lacksUseStateTuple = declarator?.type !== "VariableDeclarator" ||
    declarator.id?.type !== "ArrayPattern";
  if (
    lacksUseStateTuple
  ) {
    return null;
  }

  const first = declarator.id.elements[0];

  return first?.type === "Identifier" ? first.name : null;
}
