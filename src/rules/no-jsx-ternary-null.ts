import type { TSESTree } from "@typescript-eslint/utils";
import { isNullLiteral } from "#/utils/ast/is-null-literal";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

// Una rama que renderiza NADA: el literal `null` o el identificador
// `undefined` (ambos no pintan en JSX). Ampliar a undefined cubre el nullish
// completo sin cambiar el contrato: mismo messageId.
function rendersNothing(node: TSESTree.Node) {
  const isUndefinedIdentifier = node.type === "Identifier" && node.name === "undefined";

  return isNullLiteral(node) || isUndefinedIdentifier;
}

export const noJsxTernaryNull: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prefiere `condicion && <Elemento />` sobre un ternario con `null`/`undefined` al renderizar JSX.",
    },
    messages: {
      preferLogicalAnd:
        "Usa `condicion && elemento` en lugar de un ternario con `null` para renderizar JSX condicional. Si `condicion` es un booleano genuino, basta con `&&`; si esconde un estado de una union (loading/success/error), el ternario-con-null ignora los demas estados en silencio y un estado nuevo se renderiza como nada — consume ese estado con `match(estado).with(...).exhaustive()` de ts-pattern.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    return {
      ConditionalExpression(node: TSESTree.ConditionalExpression) {
        const container = node.parent;

        const isJsxExpressionContainer = container.type === "JSXExpressionContainer";
        if (!isJsxExpressionContainer) {
          return;
        }

        const host = container.parent;

        const lacksJsxHost = host.type !== "JSXElement" && host.type !== "JSXFragment";
        if (lacksJsxHost) {
          return;
        }

        const omitsNullBranch = !rendersNothing(node.alternate) && !rendersNothing(node.consequent);
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
