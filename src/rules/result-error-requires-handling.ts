import type { TSESTree } from "@typescript-eslint/utils";
import { collectIdentifiersNamed } from "#/utils/ast/collect-identifiers-named";
import { getFailedResultGuard } from "#/utils/result/get-failed-result-guard";
import { getResultErrorRequiresHandlingOptions } from "#/utils/options/get-result-error-requires-handling-options";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isConsumedResultReference } from "#/utils/result/is-consumed-result-reference";
import { isSkapxdResultExpression } from "#/utils/result/is-skapxd-result-expression";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const resultErrorRequiresHandling: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe descartar en silencio un Result fallido: el error se transforma o se entrega, nunca se ignora.",
    },
    messages: {
      unhandledResultError:
        "El guard detecta que `{{name}}` fallo, pero `{{name}}.error` no fluye COMPLETO a ninguna parte. Transformalo (`Result.err({ cause: {{name}}.error, ... })`), entrega el objeto entero a alguien (`reportDomainError({{name}}.error)`) o propaga el result completo. Una proyeccion (`{{name}}.error.message`) no basta: el `cause` se pierde justo en la ultima milla. La UI puede leer el mensaje, pero ADEMAS el error entero debe salir hacia el trace.",
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
    const options = getResultErrorRequiresHandlingOptions(context.options[0]);
    const filename = context.filename ?? context.getFilename();
    const typeContext = getTypeContext(context);

    const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
    if (isAllowedFilePattern) {
      return {};
    }

    return {
      IfStatement(node: TSESTree.IfStatement) {
        const resultGuard = getFailedResultGuard(node.test);

        const lacksResultGuardContext = !typeContext ||
          !resultGuard ||
          !isSkapxdResultExpression(resultGuard.node, typeContext);
        if (
          lacksResultGuardContext
        ) {
          return;
        }

        const references = collectIdentifiersNamed(
          node.consequent,
          resultGuard.name,
        );

        const hasMatchingReference = references.some((reference: TSESTree.Node) =>
            isConsumedResultReference(reference, node.consequent),
          );
        if (
          hasMatchingReference
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
