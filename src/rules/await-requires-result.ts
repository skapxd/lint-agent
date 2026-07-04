import type { TSESTree } from "@typescript-eslint/utils";
import { getAwaitRequiresResultOptions } from "#/utils/options/get-await-requires-result-options";
import { getAwaitScopeName } from "#/utils/ast/get-await-scope-name";
import { getEnclosingTrySafeCall } from "#/utils/result/get-enclosing-try-safe-call";
import { getTrySafeAwaitSuggestion } from "#/utils/suggestions/get-try-safe-await-suggestion";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isClassDecoratedBySkapxdNest } from "#/utils/nest/is-class-decorated-by-skapxd-nest";
import { isSkapxdResultOrPromiseResultExpression } from "#/utils/result/is-skapxd-result-or-promise-result-expression";
import { isSymbolFromSkapxdResult } from "#/utils/result/is-symbol-from-skapxd-result";
import { isTrySafeCall } from "#/utils/result/is-try-safe-call";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { resolveAliasSymbol } from "#/utils/type-aware/resolve-alias-symbol";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";
import ts from "typescript";

export const awaitRequiresResult: RuleModule = {
      meta: {
        type: "problem",
        docs: {
          description:
            "Exige que todo await resuelva en un Result, trySafe, o un @UseCase real de @skapxd/nest como frontera de aplicacion.",
        },
        messages: {
          awaitWithoutResult:
            "El await dentro de `{{name}}` no resuelve en un Result. Mejor opcion: extrae la operacion a una funcion que retorne Promise<Result<...>> y modela ahi los errores de dominio con `{ type, message, cause }` (el trySafe vive dentro de esa funcion). Alternativa: envuelvela aqui mismo: `{{suggestion}}`. En ambos casos, consume el Result con `match()` de ts-pattern.",
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
              useCaseDecoratorNames: {
                items: { type: "string" },
                type: "array",
              },
              useCaseDecoratorSource: { type: "string" },
            },
            type: "object",
          },
        ],
      },
      create(context: RuleContext) {
        const options = getAwaitRequiresResultOptions(context.options[0]);
        const filename = context.filename ?? context.getFilename();
        const sourceCode = context.sourceCode ?? context.getSourceCode();
        const typeContext = getTypeContext(context);

        // Una llamada protege el await solo si es trySafe de @skapxd/result.
        // Con info de tipos se verifica por símbolo; sin ella, el nombre basta.
        function isSkapxdTrySafe(callNode: TSESTree.CallExpression | null) {
          if (!callNode) {
            return false;
          }

          if (!typeContext) {
            return true;
          }

          const symbol = typeContext.services.getSymbolAtLocation(callNode.callee);

          return Boolean(symbol && isSymbolFromSkapxdResult(symbol, typeContext));
        }

        function awaitsUseCaseCall(node: TSESTree.AwaitExpression) {
          const activeTypeContext = typeContext;
          const lacksTypeContext = !activeTypeContext;
          if (lacksTypeContext) {
            return false;
          }

          const arg = node.argument;
          const isCallExpression = arg.type === "CallExpression";
          if (!isCallExpression) {
            return false;
          }

          const callee = arg.callee;
          const isMemberExpression = callee.type === "MemberExpression";
          if (!isMemberExpression) {
            return false;
          }

          // No se eximen autollamadas: un use-case que toca infra propia por
          // `this.fetchRaw()` debe bajar esa frontera a repository/provider.
          const isSelfOrSuperCall = callee.object.type === "ThisExpression" ||
            callee.object.type === "Super";
          if (isSelfOrSuperCall) {
            return false;
          }

          const receiverType = activeTypeContext.services.getTypeAtLocation(callee.object);
          const symbol = receiverType.getSymbol();
          const lacksSymbol = !symbol;
          if (lacksSymbol) {
            return false;
          }

          const resolvedSymbol = resolveAliasSymbol(symbol, activeTypeContext);
          const declaration = (resolvedSymbol.getDeclarations() ?? []).find((candidate: ts.Declaration) =>
            ts.isClassDeclaration(candidate),
          );
          const lacksClassDeclaration = !declaration;
          if (lacksClassDeclaration) {
            return false;
          }

          return isClassDecoratedBySkapxdNest(
            declaration,
            activeTypeContext,
            options.useCaseDecoratorNames,
            options.useCaseDecoratorSource,
          );
        }

        return {
          AwaitExpression(node: TSESTree.AwaitExpression) {
            const isAllowedFilePattern = matchesAnyGlob(filename, options.allowFilePatterns);
            if (isAllowedFilePattern) {
              return;
            }

            // Si lo awaiteado ya es Result/Promise<Result> de @skapxd/result,
            // los errores ya están modelados y trySafe sería redundante.
            const awaitsSkapxdResult = typeContext &&
              isSkapxdResultOrPromiseResultExpression(node.argument, typeContext);
            if (
              awaitsSkapxdResult
            ) {
              return;
            }

            const directCall = isTrySafeCall(node.argument, options.trySafeCallNames)
              ? node.argument
              : null;
            const enclosingCall = getEnclosingTrySafeCall(
              node,
              options.trySafeCallNames,
            );

            const awaitsTrySafeCall = isSkapxdTrySafe(directCall) || isSkapxdTrySafe(enclosingCall);
            if (awaitsTrySafeCall) {
              return;
            }

            const awaitsUseCase = awaitsUseCaseCall(node);
            if (awaitsUseCase) {
              return;
            }

            context.report({
              data: {
                name: getAwaitScopeName(node),
                suggestion: getTrySafeAwaitSuggestion(node.argument, sourceCode),
              },
              messageId: "awaitWithoutResult",
              node,
            });
          },
        };
      },
    };
