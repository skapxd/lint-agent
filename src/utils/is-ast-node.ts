// @ts-nocheck
export function isAstNode(value) {
  return Boolean(value && typeof value === "object" && "type" in value);
}
