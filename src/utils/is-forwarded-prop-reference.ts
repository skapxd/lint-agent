// @ts-nocheck
import { isPascalCaseJsxElement } from "./is-pascal-case-jsx-element";

// `game={game}` hacia un componente PascalCase: la referencia es el valor
// directo de una prop con el MISMO nombre. Reenviar a un elemento nativo
// (`value={value}` en un <input>) cuenta como uso real, no como túnel.
export function isForwardedPropReference(identifier, propName) {
  const container = identifier.parent;

  if (container?.type !== "JSXExpressionContainer") {
    return false;
  }

  const attribute = container.parent;

  if (attribute?.type !== "JSXAttribute" || attribute.name?.name !== propName) {
    return false;
  }

  return isPascalCaseJsxElement(attribute.parent);
}
