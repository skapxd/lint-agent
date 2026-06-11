// @ts-nocheck
import { isPascalCaseName } from "./is-pascal-case-name";

// `<Child ... />` es un componente propio; `<button ... />` es la frontera
// con el DOM. Solo el primero cuenta para las reglas de prop drilling.
export function isPascalCaseJsxElement(openingElement) {
  return (
    openingElement?.type === "JSXOpeningElement" &&
    openingElement.name?.type === "JSXIdentifier" &&
    isPascalCaseName(openingElement.name.name)
  );
}
