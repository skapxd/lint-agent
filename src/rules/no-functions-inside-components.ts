import type { TSESTree } from "@typescript-eslint/utils";
import { getContainingFunction } from "#/utils/ast/get-containing-function";
import { getFunctionName } from "#/utils/ast/get-function-name";
import { getNoFunctionsInsideComponentsOptions } from "#/utils/options/get-no-functions-inside-components-options";
import { isArrayMapCallback } from "#/utils/react/is-array-map-callback";
import { isExpressionArrowFunction } from "#/utils/react/is-expression-arrow-function";
import { isFunctionNode } from "#/utils/ast/is-function-node";
import { isJsxAttributeCallback } from "#/utils/react/is-jsx-attribute-callback";
import { isPascalCaseName } from "#/utils/naming/is-pascal-case-name";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const noFunctionsInsideComponents: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe definir funciones dentro de componentes React; se recrean en cada render.",
    },
    messages: {
      functionInsideComponent:
        "No definas funciones dentro del componente `{{component}}`: se recrean en cada render. Muevela a un hook (`useX`) o a un helper fuera del componente. Los callbacks inline de JSX y .map solo se permiten como flecha de expresion (sin cuerpo `{ }`): un bloque ya da pie a ifs y logica que pertenece fuera.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowArrayMapCallbacks: { type: "boolean" },
          allowJsxCallbacks: { type: "boolean" },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNoFunctionsInsideComponentsOptions(context.options[0]);

    function isComponentFunction(node: TSESTree.Node) {
      return isFunctionNode(node) && isPascalCaseName(getFunctionName(node));
    }

    function isAllowedInlineCallback(node: TSESTree.Node) {
      const isExpressionArrowCallback = isExpressionArrowFunction(node);
      if (!isExpressionArrowCallback) {
        return false;
      }

      const isAllowedJsxCallback = options.allowJsxCallbacks && isJsxAttributeCallback(node);
      if (isAllowedJsxCallback) {
        return true;
      }

      return options.allowArrayMapCallbacks && isArrayMapCallback(node);
    }

    function reportIfInsideComponent(node: TSESTree.Node) {
      const enclosingFunction = getContainingFunction(node);

      const lacksComponentScope = !enclosingFunction || !isComponentFunction(enclosingFunction);
      if (lacksComponentScope) {
        return;
      }

      const isInlineCallbackAllowed = isAllowedInlineCallback(node);
      if (isInlineCallbackAllowed) {
        return;
      }

      context.report({
        data: {
          component: getFunctionName(enclosingFunction),
        },
        messageId: "functionInsideComponent",
        node,
      });
    }

    return {
      ArrowFunctionExpression: reportIfInsideComponent,
      FunctionDeclaration: reportIfInsideComponent,
      FunctionExpression: reportIfInsideComponent,
    };
  },
};
