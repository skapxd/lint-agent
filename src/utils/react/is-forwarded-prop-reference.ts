import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isPascalCaseJsxElement } from "./is-pascal-case-jsx-element";

// La referencia es el valor directo de una prop hacia un componente
// PascalCase (`game={game}`, `handler={onSelect}`): un reenvío, sin importar
// el nombre del atributo. Reenviar a un elemento nativo (`value={value}` en
// un <input>) es uso real, no reenvío.
export function isForwardedPropReference(identifier: RuleNode) {
  const container = identifier.parent;

  const isJsxExpressionContainer = container?.type === "JSXExpressionContainer";
  if (!isJsxExpressionContainer) {
    return false;
  }

  const attribute = container.parent;

  const isJsxAttribute = attribute?.type === "JSXAttribute";
  if (!isJsxAttribute) {
    return false;
  }

  return isPascalCaseJsxElement(attribute.parent);
}
