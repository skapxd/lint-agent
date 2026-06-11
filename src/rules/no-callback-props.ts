// @ts-nocheck
import { getNoCallbackPropsOptions } from "#/utils/get-no-callback-props-options";
import { isPascalCaseJsxElement } from "#/utils/is-pascal-case-jsx-element";
import { matchesAnyGlob } from "#/utils/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matches-any-pattern";

export const noCallbackProps = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe pasar funciones como props a componentes propios; usa un store global o un custom hook.",
    },
    messages: {
      noCallbackProps:
        "No pases funciones como props entre componentes (`{{prop}}`): es el vector del prop drilling. Mueve la accion a un store global (p. ej. zustand) o a un custom hook y llamala desde el componente que la necesita. Los handlers de elementos nativos (`<button onClick={...}>`) si estan permitidos: esa es la frontera con el DOM.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          allowPropPatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context) {
    const options = getNoCallbackPropsOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    function isFunctionValuedAttribute(node) {
      const expression = node.value?.expression;

      return (
        expression?.type === "ArrowFunctionExpression" ||
        expression?.type === "FunctionExpression"
      );
    }

    return {
      JSXAttribute(node) {
        if (!isPascalCaseJsxElement(node.parent)) {
          return;
        }

        const propName = node.name?.name;

        if (
          typeof propName !== "string" ||
          matchesAnyPattern(propName, options.allowPropPatterns)
        ) {
          return;
        }

        const isHandlerName = /^on[A-Z]/.test(propName);

        if (isHandlerName || isFunctionValuedAttribute(node)) {
          context.report({
            data: { prop: propName },
            messageId: "noCallbackProps",
            node,
          });
        }
      },
    };
  },
};
