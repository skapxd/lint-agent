import type { TSESTree } from "@typescript-eslint/utils";

export function getJsxClassAttribute(element: TSESTree.JSXElement) {
  for (const attribute of element.openingElement.attributes) {
    const isJsxAttribute = attribute.type === "JSXAttribute";
    if (!isJsxAttribute) {
      continue;
    }

    const isClassName =
      attribute.name.type === "JSXIdentifier" &&
      attribute.name.name === "className";
    if (isClassName) {
      return attribute;
    }
  }

  return undefined;
}
