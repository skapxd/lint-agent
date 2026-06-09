// @ts-nocheck
import { getContainingFunction } from "#/utils/get-containing-function";
import { getFunctionName } from "#/utils/get-function-name";
import { isFunctionNode } from "#/utils/is-function-node";
import { isPascalCaseName } from "#/utils/is-pascal-case-name";

export const noFunctionsInsideComponents = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe definir funciones dentro de componentes React; se recrean en cada render.",
    },
    messages: {
      functionInsideComponent:
        "No definas funciones dentro del componente `{{component}}`: se recrean en cada render. Muevela a un hook (`useX`) o a un helper fuera del componente.",
    },
    schema: [],
  },
  create(context) {
    function isComponentFunction(node) {
      return isFunctionNode(node) && isPascalCaseName(getFunctionName(node));
    }

    function reportIfInsideComponent(node) {
      const enclosingFunction = getContainingFunction(node);

      if (!enclosingFunction || !isComponentFunction(enclosingFunction)) {
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
