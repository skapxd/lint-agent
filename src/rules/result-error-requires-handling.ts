// @ts-nocheck
import { collectIdentifiersNamed } from "#/utils/collect-identifiers-named";
import { getFailedResultGuard } from "#/utils/get-failed-result-guard";
import { getResultErrorRequiresHandlingOptions } from "#/utils/get-result-error-requires-handling-options";
import { getTypeContext } from "#/utils/get-type-context";
import { isConsumedResultReference } from "#/utils/is-consumed-result-reference";
import { isSkapxdResultExpression } from "#/utils/is-skapxd-result-expression";
import { matchesAnyGlob } from "#/utils/matches-any-glob";

export const resultErrorRequiresHandling = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe descartar en silencio un Result fallido: el error se transforma o se entrega, nunca se ignora.",
    },
    messages: {
      unhandledResultError:
        "El guard detecta que `{{name}}` fallo, pero `{{name}}.error` muere aqui sin seguimiento. Transformalo (`Result.err({ cause: {{name}}.error, ... })`), entregaselo a alguien (telemetria, estado de error, log de dominio) o propaga el result completo. Si darle seguimiento es critico o no, no es una interpretacion: todo error fluye a alguna parte.",
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
  create(context) {
    const options = getResultErrorRequiresHandlingOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);

    if (matchesAnyGlob(filename, options.allowFilePatterns)) {
      return {};
    }

    return {
      IfStatement(node) {
        const resultGuard = getFailedResultGuard(node.test);

        if (
          !typeContext ||
          !resultGuard ||
          !isSkapxdResultExpression(resultGuard.node, typeContext)
        ) {
          return;
        }

        const references = collectIdentifiersNamed(
          node.consequent,
          resultGuard.name,
        );

        if (
          references.some((reference) =>
            isConsumedResultReference(reference, node.consequent),
          )
        ) {
          return;
        }

        context.report({
          data: { name: resultGuard.name },
          messageId: "unhandledResultError",
          node: node.test,
        });
      },
    };
  },
};
