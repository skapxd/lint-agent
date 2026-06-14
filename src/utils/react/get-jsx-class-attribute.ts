import type { TSESTree } from "@typescript-eslint/utils";

export function getJsxClassAttribute(element: TSESTree.JSXElement) {
  return element.openingElement.attributes.find(
    (attribute): attribute is TSESTree.JSXAttribute => {
      const isJsxAttribute = attribute.type === "JSXAttribute";
      if (!isJsxAttribute) {
        return false;
      }

      const isClassName =
        attribute.name.type === "JSXIdentifier" &&
        attribute.name.name === "className";
      return isClassName;
    },
  );
}
