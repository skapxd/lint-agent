import type { RuleNode } from "#/utils/rule-types";
// Las propiedades que participan del contrato HTTP de un DTO: públicas y de
// instancia. Las private/protected/#/static no se serializan ni se validan.
export function isPublicInstanceProperty(node: RuleNode) {
  return (
    !node.static &&
    node.key?.type !== "PrivateIdentifier" &&
    !["private", "protected"].includes(node.accessibility)
  );
}
