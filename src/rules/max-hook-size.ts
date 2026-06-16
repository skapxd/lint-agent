import type { TSESTree } from "@typescript-eslint/utils";
import { countOwnUseStateCalls } from "#/utils/react/count-own-use-state-calls";
import { getFunctionExpressionName } from "#/utils/ast/get-function-expression-name";
import { getFunctionLineCount } from "#/utils/ast/get-function-line-count";
import { getMaxHookSizeOptions } from "#/utils/options/get-max-hook-size-options";
import { getParentFunctionName } from "#/utils/ast/get-parent-function-name";
import { getParentFunctionReportNode } from "#/utils/ast/get-parent-function-report-node";
import { isHookName } from "#/utils/react/is-hook-name";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";
import type { FunctionNode } from "#/utils/ast/is-function-node";

export const maxHookSize: RuleModule = {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Limita el tamaño y cantidad de estados propios en hooks React.",
        },
        messages: {
          tooLargeHook:
            "El hook `{{name}}` es demasiado grande: tiene {{lines}} lineas. Maximo permitido: {{maxLines}} lineas. Extrae efectos, handlers o flujos a hooks/archivos semanticos.",
          tooManyUseState:
            "El hook `{{name}}` declara {{useStateCount}} useState. Maximo permitido: {{maxUseState}}. Si son fases de un mismo estado, colapsalos en UN useState con union discriminada (evita isLoading+error+value simultaneo); si cambian juntos por transiciones, usa useReducer con acciones de union discriminada; si son independientes entre si, divide el componente/hook para acotar su estado.",
        },
        schema: [
          {
            additionalProperties: false,
            properties: {
              maxLines: { type: "number" },
              maxUseState: { type: "number" },
            },
            type: "object",
          },
        ],
      },
      create(context: RuleContext) {
        const options = getMaxHookSizeOptions(context.options[0]);

        function reportIfOversizedHook(
          node: FunctionNode,
          name: string | null | undefined,
          reportNode: TSESTree.Node = node,
        ) {
          const isHook = isHookName(name);
          if (!isHook) {
            return;
          }

          const lines = getFunctionLineCount(node);
          const useStateCount = countOwnUseStateCalls(node);
          const reportName = name ?? "anonymous";

          const exceedsLineBudget = lines > options.maxLines;
          if (exceedsLineBudget) {
            context.report({
              data: {
                lines: String(lines),
                maxLines: String(options.maxLines),
                name: reportName,
              },
              messageId: "tooLargeHook",
              node: reportNode,
            });
          }

          const exceedsStateBudget = useStateCount > options.maxUseState;
          if (exceedsStateBudget) {
            context.report({
              data: {
                maxUseState: String(options.maxUseState),
                name: reportName,
                useStateCount: String(useStateCount),
              },
              messageId: "tooManyUseState",
              node: reportNode,
            });
          }
        }

        return {
          ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression) {
            reportIfOversizedHook(
              node,
              getParentFunctionName(node),
              getParentFunctionReportNode(node),
            );
          },
          FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
            reportIfOversizedHook(node, node.id?.name, node.id ?? node);
          },
          FunctionExpression(node: TSESTree.FunctionExpression) {
            reportIfOversizedHook(
              node,
              getFunctionExpressionName(node),
              getParentFunctionReportNode(node),
            );
          },
        };
      },
    };
