import type { TSESTree } from "@typescript-eslint/utils";
// `<button onClick={() => ...} />`: la función es el valor directo de una
// prop JSX (ArrowFunction → JSXExpressionContainer → JSXAttribute).
export function isJsxAttributeCallback(node: TSESTree.Node) {
  const parent = node.parent;
  const hasJsxExpressionContainerParent = parent?.type === "JSXExpressionContainer";
  if (!hasJsxExpressionContainerParent) {
    return false;
  }

  return parent.parent.type === "JSXAttribute";
}
