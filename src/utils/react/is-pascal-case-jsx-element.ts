import type { TSESTree } from "@typescript-eslint/utils";
import { isAstNode } from "#/utils/ast/is-ast-node";
import { isPascalCaseName } from "#/utils/naming/is-pascal-case-name";

// `<Child ... />` es un componente propio; `<button ... />` es la frontera
// con el DOM. Solo el primero cuenta para las reglas de prop drilling.
export function isPascalCaseJsxElement(openingElement: TSESTree.Node) {
  const isJsxOpeningElement = openingElement.type === "JSXOpeningElement";
  if (!isJsxOpeningElement) {
    return false;
  }

  const elementName: unknown = openingElement.name;

  return (
    isAstNode(elementName) &&
    elementName.type === "JSXIdentifier" &&
    isPascalCaseName(elementName.name)
  );
}
