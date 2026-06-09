// @ts-nocheck
export const noJsxTernaryNull = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefiere `condicion && <Elemento />` sobre un ternario con `null` al renderizar JSX.",
    },
    messages: {
      preferLogicalAnd:
        "Usa `condicion && elemento` en lugar de un ternario con `null` para renderizar JSX condicional.",
    },
    schema: [],
  },
  create(context) {
    function isNullLiteral(node) {
      return node?.type === "Literal" && node.value === null;
    }

    return {
      ConditionalExpression(node) {
        const container = node.parent;

        if (container?.type !== "JSXExpressionContainer") {
          return;
        }

        const host = container.parent;

        if (host?.type !== "JSXElement" && host?.type !== "JSXFragment") {
          return;
        }

        if (!isNullLiteral(node.alternate) && !isNullLiteral(node.consequent)) {
          return;
        }

        context.report({
          messageId: "preferLogicalAnd",
          node,
        });
      },
    };
  },
};
