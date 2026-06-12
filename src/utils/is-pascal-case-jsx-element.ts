import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isAstNode } from "./is-ast-node";
import { isPascalCaseName } from "./is-pascal-case-name";

// `<Child ... />` es un componente propio; `<button ... />` es la frontera
// con el DOM. Solo el primero cuenta para las reglas de prop drilling.
export function isPascalCaseJsxElement(openingElement: RuleNode) {
  const elementName: unknown = openingElement.name;

  return (
    openingElement?.type === "JSXOpeningElement" &&
    isAstNode(elementName) &&
    elementName.type === "JSXIdentifier" &&
    isPascalCaseName(elementName.name)
  );
}
