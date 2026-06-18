import type { TSESTree } from "@typescript-eslint/utils";
import { getProjectCallInsideTrySafe } from "#/utils/result/get-project-call-inside-try-safe";
import { getTrySafeOnlyAtBoundaryOptions } from "#/utils/options/get-try-safe-only-at-boundary-options";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

export const trysafeOnlyAtBoundary: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Marca trySafe sobre codigo del proyecto: la captura pertenece a la frontera que toca runtime o paquetes.",
    },
    messages: {
      trySafeMisplaced:
        "`trySafe` sobre codigo del proyecto (`{{callee}}`): estas capturando el error una capa demasiado arriba. La captura pertenece a la frontera donde ESE codigo llama al runtime/paquete (el repository que toca el driver, no el use-case). Haz que la frontera devuelva `Promise<Result<...>>` y consume el Result directo aqui, sin re-envolver.",
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
    const options = getTrySafeOnlyAtBoundaryOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const typeContext = getTypeContext(context);
    const lacksTypeContext = !typeContext;
    const isAllowedFile = matchesAnyGlob(filename, options.allowFilePatterns);
    const shouldSkipRule = lacksTypeContext || isAllowedFile;
    if (shouldSkipRule) {
      return {};
    }

    return {
      CallExpression(node: TSESTree.CallExpression) {
        const sourceCall = getProjectCallInsideTrySafe(node, typeContext);
        if (!sourceCall) {
          return;
        }

        context.report({
          data: {
            callee: sourceCode.getText?.(sourceCall.callee) ?? "operacion",
          },
          messageId: "trySafeMisplaced",
          node,
        });
      },
    };
  },
};
