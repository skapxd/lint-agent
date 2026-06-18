import type { TSESTree } from "@typescript-eslint/utils";
import { getNoRethrowResultErrorOptions } from "#/utils/options/get-no-rethrow-result-error-options";
import { getRawResultError } from "#/utils/result/get-raw-result-error";
import { getResultErrorOriginMessageId } from "#/utils/result/get-result-error-origin-message-id";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isResultErrorThrowExempt } from "#/utils/result/is-result-error-throw-exempt";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleContext, RuleModule } from "#/utils/rule-authoring/rule-types";

export const noRethrowResultError: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe re-lanzar el error crudo de un Result: el error modelado no vuelve a salir por excepcion.",
    },
    messages: {
      rethrowDomainError:
        "El error de este Result ya es de dominio. Propaga el Result (`return result`) en vez de re-lanzarlo o re-envolverlo; envolver un HttpException de dominio puede cambiar un 400/404 a 500.",
      rethrowResultError:
        "`throw` del error de un Result: `trySafe` lo capturo para modelarlo en el flujo y este `throw` lo reconvierte en excepcion. Propaga el Result (`return result`) o transformalo conservando `{ cause: result.error }`.",
      rethrowRuntimeError:
        "El error de este Result viene de runtime/paquete y este `throw` lo saca crudo otra vez. Envuelvelo en un error de dominio conservando `{ cause: result.error }` o retorna `Result.err({ cause, ... })`; no pierdas el contexto que capturo `trySafe`.",
    },
    schema: [
      {
        additionalProperties: false,
        properties: {
          allowFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          bootstrapCallNames: {
            items: { type: "string" },
            type: "array",
          },
          controllerDecoratorNames: {
            items: { type: "string" },
            type: "array",
          },
          controllerFilePatterns: {
            items: { type: "string" },
            type: "array",
          },
          lifecycleFunctionNames: {
            items: { type: "string" },
            type: "array",
          },
        },
        type: "object",
      },
    ],
  },
  create(context: RuleContext) {
    const options = getNoRethrowResultErrorOptions(context.options[0]);
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
      ThrowStatement(node: TSESTree.ThrowStatement) {
        const isExemptThrow = isResultErrorThrowExempt(node, filename, options);
        if (isExemptThrow) {
          return;
        }

        const rawError = getRawResultError(node.argument, typeContext);
        if (!rawError) {
          return;
        }

        context.report({
          messageId: getResultErrorOriginMessageId(
            rawError,
            sourceCode,
            typeContext,
          ),
          node: rawError.errorExpression,
        });
      },
    };
  },
};
