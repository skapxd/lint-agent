import type { RuleNode, RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";
export const preferTsPattern: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefiere match() de ts-pattern sobre switch/case y ternarios anidados.",
    },
    messages: {
      noSwitch:
        "Usa `match()` de ts-pattern en lugar de switch/case para un control de flujo exhaustivo y tipado. Es la pieza que cierra el sistema de errores: un Result con errores `{ type: ... }` se consume con una rama `.with()` por variante y `.exhaustive()` garantiza que ninguna quede sin manejar.",
      noNestedTernary:
        "Usa `match()` de ts-pattern en lugar de ternarios anidados; mejora la legibilidad y `.exhaustive()` obliga a cubrir todos los casos.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      ConditionalExpression(node: RuleNode) {
        const isConditionalExpressionNode = node.parent?.type === "ConditionalExpression";
        if (isConditionalExpressionNode) {
          context.report({
            messageId: "noNestedTernary",
            node,
          });
        }
      },
      SwitchStatement(node: RuleNode) {
        context.report({
          messageId: "noSwitch",
          node,
        });
      },
    };
  },
};
