import type { LegacyAstNode } from "#/utils/rule-types";
// `<button onClick={() => ...} />`: la función es el valor directo de una
// prop JSX (ArrowFunction → JSXExpressionContainer → JSXAttribute).
export function isJsxAttributeCallback(node: LegacyAstNode) {
  return (
    node.parent?.type === "JSXExpressionContainer" &&
    node.parent.parent?.type === "JSXAttribute"
  );
}
