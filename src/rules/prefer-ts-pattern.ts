// @ts-nocheck
export const preferTsPattern = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefiere match() de ts-pattern sobre switch/case y ternarios anidados.",
    },
    messages: {
      noSwitch:
        "Usa `match()` de ts-pattern en lugar de switch/case para un control de flujo exhaustivo y tipado.",
      noNestedTernary:
        "Usa `match()` de ts-pattern en lugar de ternarios anidados; mejora la legibilidad y la exhaustividad.",
    },
    schema: [],
  },
  create(context) {
    return {
      ConditionalExpression(node) {
        if (node.parent?.type === "ConditionalExpression") {
          context.report({
            messageId: "noNestedTernary",
            node,
          });
        }
      },
      SwitchStatement(node) {
        context.report({
          messageId: "noSwitch",
          node,
        });
      },
    };
  },
};
