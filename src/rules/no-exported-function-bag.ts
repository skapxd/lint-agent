import type { TSESTree } from "@typescript-eslint/utils";
import { getExportedFunctionBagEntries } from "#/utils/no-exported-function-bag/get-exported-function-bag-entries";
import { getExportedObjectExpressions } from "#/utils/no-exported-function-bag/get-exported-object-expressions";
import { getLocalObjectDeclarations } from "#/utils/no-exported-function-bag/get-local-object-declarations";
import { getNoExportedFunctionBagOptions } from "#/utils/options/get-no-exported-function-bag-options";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

const MIN_FUNCTIONS_IN_EXPORTED_BAG = 2;

export const noExportedFunctionBag: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe exportar objetos que publican varias funciones: una bolsa de funciones es una clase o namespace disfrazado.",
    },
    messages: {
      exportedFunctionBag:
        "[REFACTOR REQUERIDO] El objeto exportado `{{exportName}}` publica {{count}} funciones ({{functionNames}}): eso es una clase/namespace disfrazado. Exporta una sola capacidad publica por modulo: crea funciones o modulos con nombres semanticos, deja helpers privados junto a cada entrypoint y actualiza los imports para depender solo de la capacidad que usan.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNoExportedFunctionBagOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    return {
      Program(program: TSESTree.Program) {
        const localObjectDeclarations = getLocalObjectDeclarations(program);
        const exportedObjectExpressions = getExportedObjectExpressions(
          program,
          localObjectDeclarations,
        );

        for (const exportedObjectExpression of exportedObjectExpressions) {
          const functionEntries = getExportedFunctionBagEntries(
            exportedObjectExpression.node,
            (name) => localObjectDeclarations.get(name),
          );
          const staysWithinSingleCapability = functionEntries.length <
            MIN_FUNCTIONS_IN_EXPORTED_BAG;
          if (staysWithinSingleCapability) {
            continue;
          }

          context.report({
            data: {
              count: String(functionEntries.length),
              exportName: exportedObjectExpression.exportName,
              functionNames: functionEntries
                .map((functionEntry) => functionEntry.name)
                .join(", "),
            },
            messageId: "exportedFunctionBag",
            node: exportedObjectExpression.reportNode,
          });
        }
      },
    };
  },
};
