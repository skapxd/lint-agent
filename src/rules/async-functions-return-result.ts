import { containsCallNamed } from "#/utils/contains-call-named";
import { getAsyncResultRuleOptions } from "#/utils/options/get-async-result-rule-options";
import { getFunctionExpressionName } from "#/utils/get-function-expression-name";
import { getParentFunctionName } from "#/utils/get-parent-function-name";
import { getParentFunctionReportNode } from "#/utils/get-parent-function-report-node";
import { getTypeContext } from "#/utils/get-type-context";
import { isAnonymousGeneratedFunctionName } from "#/utils/is-anonymous-generated-function-name";
import { isPromiseOfResultType } from "#/utils/result/is-promise-of-result-type";
import { isSkapxdResultOrPromiseResultType } from "#/utils/result/is-skapxd-result-or-promise-result-type";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import { matchesAnyPattern } from "#/utils/matching/matches-any-pattern";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-authoring/rule-types";

export const asyncFunctionsReturnResult: RuleModule = {
      meta: {
        type: "problem",
        docs: {
          description:
            "Exige Promise<Result<...>> en funciones async de dominio.",
        },
        messages: {
          missingReturnType:
            "La funcion async `{{name}}` debe declarar Promise<Result<...>> como tipo de retorno: trySafe en la frontera, errores de dominio con `cause`, y el consumidor decide con `match()` de ts-pattern.",
          invalidReturnType:
            "La funcion async `{{name}}` debe retornar Promise<Result<...>> para modelar errores de forma explicita: trySafe en la frontera, errores de dominio con `cause`, y el consumidor decide con `match()` de ts-pattern.",
        },
        schema: [
          {
            additionalProperties: false,
            properties: {
              allowFilePatterns: {
                items: { type: "string" },
                type: "array",
              },
              allowNamePatterns: {
                items: { type: "string" },
                type: "array",
              },
              checkMissingReturnType: { type: "boolean" },
              checkMissingReturnTypeWhenCallNames: {
                items: { type: "string" },
                type: "array",
              },
              requireCallNames: {
                items: { type: "string" },
                type: "array",
              },
              promiseTypeNames: {
                items: { type: "string" },
                type: "array",
              },
              resultTypeNames: {
                items: { type: "string" },
                type: "array",
              },
            },
            type: "object",
          },
        ],
      },
      create(context: RuleContext) {
        const options = getAsyncResultRuleOptions(context.options[0]);
        const filename = context.filename ?? context.getFilename();
        const typeContext = getTypeContext(context);

        // Verifica que el tipo de retorno sea un Result de @skapxd/result.
        // Con información de tipos (projectService) resuelve el símbolo hasta
        // el paquete; sin ella, cae a una comprobación por nombre.
        function isSkapxdResultReturnType(annotation: RuleNode) {
          if (typeContext) {
            const type = typeContext.services.getTypeFromTypeNode(annotation);

            return isSkapxdResultOrPromiseResultType(type, typeContext);
          }

          return isPromiseOfResultType(annotation, options);
        }

        function reportIfInvalidAsyncReturn(
          node: RuleNode,
          name: string | null | undefined,
          reportNode: RuleNode = node,
        ) {
          if (!node.async || matchesAnyGlob(filename, options.allowFilePatterns)) {
            return;
          }

          const functionName = name ?? "anonymous";

          if (isAnonymousGeneratedFunctionName(functionName)) {
            return;
          }

          if (matchesAnyPattern(functionName, options.allowNamePatterns)) {
            return;
          }

          if (
            options.requireCallNames.length &&
            !containsCallNamed(node.body, options.requireCallNames)
          ) {
            return;
          }

          const returnType = node.returnType?.typeAnnotation;
          const missingReturnTypeIsReportable =
            options.checkMissingReturnType ||
            containsCallNamed(node.body, options.checkMissingReturnTypeWhenCallNames);

          if (!returnType && missingReturnTypeIsReportable) {
            context.report({
              data: { name: functionName },
              messageId: "missingReturnType",
              node: reportNode,
            });

            return;
          }

          if (!returnType) {
            return;
          }

          if (isSkapxdResultReturnType(returnType)) {
            return;
          }

          context.report({
            data: { name: functionName },
            messageId: "invalidReturnType",
            node: reportNode,
          });
        }

        return {
          ArrowFunctionExpression(node: RuleNode) {
            reportIfInvalidAsyncReturn(
              node,
              getParentFunctionName(node),
              getParentFunctionReportNode(node),
            );
          },
          FunctionDeclaration(node: RuleNode) {
            reportIfInvalidAsyncReturn(node, node.id?.name, node.id ?? node);
          },
          FunctionExpression(node: RuleNode) {
            reportIfInvalidAsyncReturn(
              node,
              getFunctionExpressionName(node),
              getParentFunctionReportNode(node),
            );
          },
        };
      },
    };
