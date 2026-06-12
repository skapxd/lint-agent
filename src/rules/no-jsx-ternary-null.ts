import type { RuleNode, RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";
export const noJsxTernaryNull: RuleModule = {
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
  create(context: RuleContext) {
    function isNullLiteral(node: RuleNode | null) {
      return node?.type === "Literal" && node.value === null;
    }

    return {
      ConditionalExpression(node: RuleNode) {
        const container = node.parent;

        const isJsxExpressionContainer = container?.type === "JSXExpressionContainer";
        if (!isJsxExpressionContainer) {
          return;
        }

        const host = container.parent;

        const lacksJsxHost = host?.type !== "JSXElement" && host?.type !== "JSXFragment";
        if (lacksJsxHost) {
          return;
        }

        const omitsNullBranch = !isNullLiteral(node.alternate) && !isNullLiteral(node.consequent);
        if (omitsNullBranch) {
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
