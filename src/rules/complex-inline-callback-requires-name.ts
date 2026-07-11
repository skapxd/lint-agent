import type { TSESTree } from "@typescript-eslint/utils";
import { countFunctionDecisions } from "#/utils/ast/count-function-decisions";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

type InlineCallbackNode =
  | TSESTree.ArrowFunctionExpression
  | TSESTree.FunctionExpression;

export const complexInlineCallbackRequiresName: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Exige extraer callbacks inline que acumulan dos o mas decisiones propias.",
    },
    messages: {
      complexInlineCallback:
        "Este callback inline toma {{decisionCount}} decisiones y obliga a reconstruir su intencion dentro de la llamada. Extraelo a una funcion con nombre semantico y pasa la referencia: `const isRelevantItem = (...) => ...; items.filter(isRelevantItem)`. Conserva sus capturas en el scope valido mas cercano; si queda dentro de un componente, muevelo fuera como exige `no-functions-inside-components`; si queda top-level y crea otra unidad, usa un archivo con nombre semantico como exige `one-root-unit-per-file`.",
    },
    schema: [],
  },
  create(context: RuleContext) {
    function reportIfComplexInlineCallback(node: InlineCallbackNode) {
      const parent = node.parent;
      const isDirectCallArgument =
        (parent.type === "CallExpression" || parent.type === "NewExpression") &&
        parent.arguments.includes(node);
      if (!isDirectCallArgument) {
        return;
      }

      const decisionCount = countFunctionDecisions(node);
      const lacksComplexDecisionCount = decisionCount < 2;
      if (lacksComplexDecisionCount) {
        return;
      }

      context.report({
        data: { decisionCount: String(decisionCount) },
        messageId: "complexInlineCallback",
        node,
      });
    }

    return {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression) {
        reportIfComplexInlineCallback(node);
      },
      FunctionExpression(node: TSESTree.FunctionExpression) {
        reportIfComplexInlineCallback(node);
      },
    };
  },
};
