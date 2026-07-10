import type { TSESTree } from "@typescript-eslint/utils";
export function getPropertyName(node: TSESTree.Node) {
  const isIdentifierNode = node.type === "Identifier";
  if (isIdentifierNode) {
    return node.name;
  }

  const isPrivateIdentifierNode = node.type === "PrivateIdentifier";
  if (isPrivateIdentifierNode) {
    return `#${node.name}`;
  }

  const isLiteralNode = node.type === "Literal";
  if (isLiteralNode) {
    return String(node.value);
  }

  return "anonymous";
}
