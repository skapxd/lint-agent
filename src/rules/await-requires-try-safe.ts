// @ts-nocheck
import { getAwaitRequiresTrySafeOptions } from "#/utils/get-await-requires-try-safe-options";
import { getAwaitScopeName } from "#/utils/get-await-scope-name";
import { getEnclosingTrySafeCall } from "#/utils/get-enclosing-try-safe-call";
import { getTrySafeAwaitSuggestion } from "#/utils/get-try-safe-await-suggestion";
import { getTypeContext } from "#/utils/get-type-context";
import { isSymbolFromSkapxdResult } from "#/utils/is-symbol-from-skapxd-result";
import { isTrySafeCall } from "#/utils/is-try-safe-call";
import { matchesAnyPattern } from "#/utils/matches-any-pattern";

export const awaitRequiresTrySafe = {
      meta: {
        type: "problem",
        docs: {
          description:
            "Exige que los await esten protegidos por trySafe.",
        },
        messages: {
          unprotectedAwait:
            "El await dentro de `{{name}}` no esta protegido por trySafe. Envuelve la operacion asi: `{{suggestion}}`.",
        },
        schema: [
          {
            additionalProperties: false,
            properties: {
              allowFilePatterns: {
                items: { type: "string" },
                type: "array",
              },
              trySafeCallNames: {
                items: { type: "string" },
                type: "array",
              },
            },
            type: "object",
          },
        ],
      },
      create(context) {
        const options = getAwaitRequiresTrySafeOptions(context.options[0]);
        const filename = context.filename ?? context.getFilename();
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const typeContext = getTypeContext(context);

        // Una llamada protege el await solo si es trySafe de @skapxd/result.
        // Con info de tipos se verifica por símbolo; sin ella, el nombre basta.
        function isSkapxdTrySafe(callNode) {
          if (!callNode) {
            return false;
          }

          if (!typeContext) {
            return true;
          }

          const symbol = typeContext.services.getSymbolAtLocation(callNode.callee);

          return Boolean(symbol && isSymbolFromSkapxdResult(symbol, typeContext));
        }

        return {
          AwaitExpression(node) {
            if (matchesAnyPattern(filename, options.allowFilePatterns)) {
              return;
            }

            const directCall = isTrySafeCall(node.argument, options.trySafeCallNames)
              ? node.argument
              : null;
            const enclosingCall = getEnclosingTrySafeCall(
              node,
              options.trySafeCallNames,
            );

            if (isSkapxdTrySafe(directCall) || isSkapxdTrySafe(enclosingCall)) {
              return;
            }

            context.report({
              data: {
                name: getAwaitScopeName(node),
                suggestion: getTrySafeAwaitSuggestion(node.argument, sourceCode),
              },
              messageId: "unprotectedAwait",
              node,
            });
          },
        };
      },
    };
