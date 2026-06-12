import type { RuleNode } from "#/utils/rule-types";
// `items.map((item) => <Item ... />)`: la función es el primer argumento de
// una llamada `.map(...)`.
export function isArrayMapCallback(node: RuleNode) {
  const parent = node.parent;

  if (parent?.type !== "CallExpression" || parent.arguments[0] !== node) {
    return false;
  }

  const callee = parent.callee;

  return (
    callee?.type === "MemberExpression" &&
    !callee.computed &&
    callee.property?.type === "Identifier" &&
    callee.property.name === "map"
  );
}
