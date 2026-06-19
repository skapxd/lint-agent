import type { TSESTree } from "@typescript-eslint/utils";
import { getFunctionExpressionName } from "#/utils/ast/get-function-expression-name";
import { getFunctionReturnType } from "#/utils/type-aware/get-function-return-type";
import { getParentFunctionName } from "#/utils/ast/get-parent-function-name";
import { getParentFunctionReportNode } from "#/utils/ast/get-parent-function-report-node";
import { getResultErrorTypes } from "#/utils/result/get-result-error-types";
import { getTypeContext } from "#/utils/type-aware/get-type-context";
import { isAnonymousGeneratedFunctionName } from "#/utils/ast/is-anonymous-generated-function-name";
import { isSkapxdResultOrPromiseResultType } from "#/utils/result/is-skapxd-result-or-promise-result-type";
import { isUnknownOrAnyType } from "#/utils/type-aware/is-unknown-or-any-type";
import { matchesAnyGlob } from "#/utils/matching/matches-any-glob";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";
import type { FunctionNode } from "#/utils/ast/is-function-node";

function readAllowFilePatterns(options: unknown): string[] {
  const isRecord = typeof options === "object" && options !== null;
  const value = isRecord
    ? (options as { allowFilePatterns?: unknown }).allowFilePatterns
    : undefined;

  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
}

export const resultErrorRequiresModeling: RuleModule = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibe que una funcion que retorna Result deje el canal de error como `unknown`/`any`: la frontera debe modelar el error de dominio.",
    },
    messages: {
      unmodeledError:
        "El canal de error de `{{name}}` es `unknown`: la frontera capturo con trySafe pero no modelo el error. Mapea el error crudo a un error de dominio (tagged union: `{ _tag, cause }`) antes de devolver el Result, para que el consumidor lo discrimine con `match()` en vez de tratar todo fallo como opaco.",
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
    const typeContext = getTypeContext(context);
    const filename = context.filename ?? context.getFilename();
    const allowFilePatterns = readAllowFilePatterns(context.options[0]);

    function reportIfUnmodeledResultError(
      node: FunctionNode,
      name: string | null | undefined,
      reportNode: TSESTree.Node = node,
    ) {
      // Sin informacion de tipos no se puede leer el canal de error: la regla
      // es type-aware y se mantiene en silencio antes que adivinar.
      const lacksTypeContext = !typeContext || matchesAnyGlob(filename, allowFilePatterns);
      if (lacksTypeContext) {
        return;
      }

      const functionName = name ?? "anonymous";
      if (isAnonymousGeneratedFunctionName(functionName)) {
        return;
      }

      const returnType = getFunctionReturnType(node, typeContext);
      if (!returnType) {
        return;
      }

      const returnsResult = isSkapxdResultOrPromiseResultType(
        returnType,
        typeContext,
      );
      if (!returnsResult) {
        return;
      }

      const errorTypes = getResultErrorTypes(returnType, typeContext);
      const leavesErrorUnmodeled = errorTypes.some((errorType) =>
        isUnknownOrAnyType(errorType),
      );
      if (!leavesErrorUnmodeled) {
        return;
      }

      context.report({
        data: { name: functionName },
        messageId: "unmodeledError",
        node: reportNode,
      });
    }

    return {
      ArrowFunctionExpression(node: TSESTree.ArrowFunctionExpression) {
        reportIfUnmodeledResultError(
          node,
          getParentFunctionName(node),
          node.returnType?.typeAnnotation ?? getParentFunctionReportNode(node),
        );
      },
      FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
        reportIfUnmodeledResultError(
          node,
          node.id?.name,
          node.returnType?.typeAnnotation ?? node.id ?? node,
        );
      },
      FunctionExpression(node: TSESTree.FunctionExpression) {
        reportIfUnmodeledResultError(
          node,
          getFunctionExpressionName(node),
          node.returnType?.typeAnnotation ?? getParentFunctionReportNode(node),
        );
      },
    };
  },
};
