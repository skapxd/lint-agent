// @ts-nocheck
export function isTypeReferenceNamed(node, names) {
  const typeName = node.typeName;

  return typeName.type === "Identifier" && names.includes(typeName.name);
}
