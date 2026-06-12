import type { LegacyAstNode, RuleModule } from "#/utils/rule-types";
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
  create(context: LegacyAstNode) {
    function isNullLiteral(node: LegacyAstNode) {
      return node?.type === "Literal" && node.value === null;
    }

    return {
      ConditionalExpression(node: LegacyAstNode) {
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
