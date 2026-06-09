// @ts-nocheck
export function getPropertyName(node) {
  if (!node) {
    return "anonymous";
  }

  if (node.type === "Identifier") {
    return node.name;
  }

  if (node.type === "Literal") {
    return String(node.value);
  }

  return "anonymous";
}
