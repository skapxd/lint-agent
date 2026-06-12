import { getFailedResultGuard } from "#/utils/result/get-failed-result-guard";
import { getOwnResultErrCalls } from "#/utils/result/get-own-result-err-calls";
import { getTypeContext } from "#/utils/get-type-context";
import { isInsideSkapxdResultReturningFunction } from "#/utils/result/is-inside-skapxd-result-returning-function";
import { isSkapxdResultErrCall } from "#/utils/result/is-skapxd-result-err-call";
import { isSkapxdResultExpression } from "#/utils/result/is-skapxd-result-expression";
import { resultErrPreservesCause } from "#/utils/result/result-err-preserves-cause";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

export const resultErrorRequiresCause: RuleModule = {
      meta: {
        type: "problem",
        docs: {
          description:
            "Exige preservar result.error como cause cuando una funcion que retorna Result transforma un Result fallido en Result.err.",
        },
        messages: {
          missingCause:
            "El error de `{{name}}` ya existe como `{{name}}.error`. Preservalo en Result.err con `cause: {{name}}.error`: la cadena de causas conecta el error de dominio con la excepcion original que capturo `trySafe`; sin ella el debugging pierde el contexto.",
        },
        schema: [],
      },
      create(context: RuleContext) {
        const typeContext = getTypeContext(context);

        return {
          IfStatement(node: RuleNode) {
            const resultGuard = getFailedResultGuard(node.test);

            if (
              !typeContext ||
              !resultGuard ||
              !isSkapxdResultExpression(resultGuard.node, typeContext) ||
              !isInsideSkapxdResultReturningFunction(node, typeContext)
            ) {
              return;
            }

            for (const resultErrCall of getOwnResultErrCalls(node.consequent)) {
              if (!isSkapxdResultErrCall(resultErrCall, typeContext)) {
                continue;
              }

              // `Result.err()` sin argumentos descarta el error por completo:
              // es el peor caso, no una exención.
              if (
                resultErrCall.arguments.length > 0 &&
                resultErrPreservesCause(resultErrCall.arguments[0], resultGuard.name)
              ) {
                continue;
              }

              context.report({
                data: {
                  name: resultGuard.name,
                },
                messageId: "missingCause",
                node: resultErrCall,
              });
            }
          },
        };
      },
    };
