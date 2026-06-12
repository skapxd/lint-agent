import { countOwnUseStateCalls } from "#/utils/react/count-own-use-state-calls";
import { getFunctionExpressionName } from "#/utils/get-function-expression-name";
import { getFunctionLineCount } from "#/utils/get-function-line-count";
import { getMaxHookSizeOptions } from "#/utils/options/get-max-hook-size-options";
import { getParentFunctionName } from "#/utils/get-parent-function-name";
import { getParentFunctionReportNode } from "#/utils/get-parent-function-report-node";
import { isHookName } from "#/utils/react/is-hook-name";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

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
            "El hook `{{name}}` declara {{useStateCount}} useState. Maximo permitido: {{maxUseState}}. Usa useReducer con acciones semanticas cuando varios campos cambian juntos, o extrae estado a hooks especializados.",
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
          node: RuleNode,
          name: string | null | undefined,
          reportNode: RuleNode = node,
        ) {
          if (!isHookName(name)) {
            return;
          }

          const lines = getFunctionLineCount(node);
          const useStateCount = countOwnUseStateCalls(node);
          const reportName = name ?? "anonymous";

          if (lines > options.maxLines) {
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

          if (useStateCount > options.maxUseState) {
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
          ArrowFunctionExpression(node: RuleNode) {
            reportIfOversizedHook(
              node,
              getParentFunctionName(node),
              getParentFunctionReportNode(node),
            );
          },
          FunctionDeclaration(node: RuleNode) {
            reportIfOversizedHook(node, node.id?.name, node.id ?? node);
          },
          FunctionExpression(node: RuleNode) {
            reportIfOversizedHook(
              node,
              getFunctionExpressionName(node),
              getParentFunctionReportNode(node),
            );
          },
        };
      },
    };
