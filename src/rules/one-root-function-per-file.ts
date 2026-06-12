import { getMoveSuggestion } from "#/utils/get-move-suggestion";
import { getRootFunctionEntries } from "#/utils/get-root-function-entries";
import { getStructureSuggestion } from "#/utils/get-structure-suggestion";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-types";

export const oneRootFunctionPerFile: RuleModule = {
      meta: {
        type: "suggestion",
        docs: {
          description:
            "Limita cada archivo a una sola funcion declarada en la raiz.",
        },
        messages: {
          tooManyRootFunctions:
            "Este archivo tiene {{count}} funciones en la raiz. Deja solo una funcion top-level por archivo. {{moveSuggestion}}\n\nEstructura sugerida:\n{{structureSuggestion}}\n\nSi se reutiliza, muevela a un modulo compartido con nombre de dominio.",
        },
        schema: [],
      },
      create(context: RuleContext) {
        return {
          Program(node: RuleNode) {
            const rootFunctions = node.body.flatMap((statement: RuleNode) =>
              getRootFunctionEntries(statement),
            );

            if (rootFunctions.length <= 1) {
              return;
            }

            const firstHelper = rootFunctions[1];

            if (!firstHelper) {
              return;
            }

            const helperFunctionNames = rootFunctions
              .slice(1)
              .map((rootFunction) => rootFunction.name);

            context.report({
              data: {
                count: String(rootFunctions.length),
                moveSuggestion: getMoveSuggestion({
                  filename: context.filename ?? context.getFilename(),
                  functionName: firstHelper.name,
                }),
                structureSuggestion: getStructureSuggestion({
                  filename: context.filename ?? context.getFilename(),
                  functionNames: helperFunctionNames,
                }),
              },
              messageId: "tooManyRootFunctions",
              node: firstHelper.node,
            });
          },
        };
      },
    };
