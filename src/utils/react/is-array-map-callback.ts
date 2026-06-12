import type { TSESTree } from "@typescript-eslint/utils";
// `items.map((item) => <Item ... />)`: la función es el primer argumento de
// una llamada `.map(...)`.
export function isArrayMapCallback(node: TSESTree.Node) {
  const parent = node.parent;

  const hasCallExpressionParent = parent?.type === "CallExpression";
  if (!hasCallExpressionParent) {
    return false;
  }

  const isFirstCallArgument = parent.arguments[0] === node;
  if (!isFirstCallArgument) {
    return false;
  }

  const callee = parent.callee;

  return (
    callee.type === "MemberExpression" &&
    !callee.computed &&
    callee.property.type === "Identifier" &&
    callee.property.name === "map"
  );
}
