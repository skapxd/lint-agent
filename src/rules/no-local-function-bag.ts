import type { TSESTree } from "@typescript-eslint/utils";
import { getExportedFunctionBagEntries } from "#/utils/no-exported-function-bag/get-exported-function-bag-entries";
import { getExportedObjectExpressions } from "#/utils/no-exported-function-bag/get-exported-object-expressions";
import { getLocalObjectDeclarations } from "#/utils/no-exported-function-bag/get-local-object-declarations";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { getNoLocalFunctionBagOptions } from "#/utils/options/get-no-local-function-bag-options";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

const MIN_FUNCTIONS_IN_LOCAL_BAG = 2;

export const noLocalFunctionBag: RuleModule = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Prohibe objetos locales que definen varias funciones inline: una bolsa local de funciones es un namespace disfrazado.",
    },
    messages: {
      localFunctionBag:
        "[REFACTOR REQUERIDO] El objeto local `{{objectName}}` define {{count}} funciones ({{functionNames}}): eso es un namespace disfrazado. Separa funciones con nombres semanticos por modulo, llama helpers privados directamente y deja que el arbol de archivos muestre la capacidad real en vez de esconderla detras de un objeto literal.",
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
    const options = getNoLocalFunctionBagOptions(context.options[0]);
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
        const exportedObjectExpressionNodes = new Set(
          exportedObjectExpressions.map((exportedObjectExpression) =>
            exportedObjectExpression.node,
          ),
        );

        for (const [objectName, objectExpression] of localObjectDeclarations) {
          const isExportedObjectExpression =
            exportedObjectExpressionNodes.has(objectExpression);
          if (isExportedObjectExpression) {
            continue;
          }

          const functionEntries = getExportedFunctionBagEntries(
            objectExpression,
            (name) => localObjectDeclarations.get(name),
          );
          const staysWithinSingleCapability = functionEntries.length <
            MIN_FUNCTIONS_IN_LOCAL_BAG;
          if (staysWithinSingleCapability) {
            continue;
          }

          context.report({
            data: {
              count: String(functionEntries.length),
              functionNames: functionEntries
                .map((functionEntry) => functionEntry.name)
                .join(", "),
              objectName,
            },
            messageId: "localFunctionBag",
            node: objectExpression,
          });
        }
      },
    };
  },
};
