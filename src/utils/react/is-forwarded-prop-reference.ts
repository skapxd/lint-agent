import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isPascalCaseJsxElement } from "./is-pascal-case-jsx-element";

// La referencia es el valor directo de una prop hacia un componente
// PascalCase (`game={game}`, `handler={onSelect}`): un reenvío, sin importar
// el nombre del atributo. Reenviar a un elemento nativo (`value={value}` en
// un <input>) es uso real, no reenvío.
export function isForwardedPropReference(identifier: RuleNode) {
  const container = identifier.parent;

  if (container?.type !== "JSXExpressionContainer") {
    return false;
  }

  const attribute = container.parent;

  if (attribute?.type !== "JSXAttribute") {
    return false;
  }

  return isPascalCaseJsxElement(attribute.parent);
}
