import type { TSESTree } from "@typescript-eslint/utils";
import { getContainingFunction } from "#/utils/ast/get-containing-function";
import { getFunctionName } from "#/utils/ast/get-function-name";
import { getReturnedObjectExpression } from "#/utils/ast/get-returned-object-expression";
import { hasBooleanOkProperty } from "#/utils/result/has-boolean-ok-property";
import { isExportedFunction } from "#/utils/ast/is-exported-function";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

export const noAdHocOkResult: RuleModule = {
      meta: {
        type: "problem",
        docs: {
          description:
            "Prohibe retornar contratos ad hoc con ok en funciones async exportadas.",
        },
        messages: {
          adHocOkResult:
            "No retornes objetos ad hoc con `ok` desde la funcion async `{{name}}`. Usa Result.ok(...) / Result.err(...) de @skapxd/result con un error discriminado `{ type: ... }`: un unico contrato Result permite consumir cada variante con `match()` de ts-pattern y `.exhaustive()`.",
        },
        schema: [],
      },
      create(context: RuleContext) {
        return {
          ReturnStatement(node: TSESTree.ReturnStatement) {
            const returnedObject = getReturnedObjectExpression(node.argument);

            const lacksBooleanOkReturn = !returnedObject || !hasBooleanOkProperty(returnedObject);
            if (lacksBooleanOkReturn) {
              return;
            }

            const containingFunction = getContainingFunction(node);

            const lacksExportedAsyncFunction = !containingFunction?.async ||
              !isExportedFunction(containingFunction);
            if (
              lacksExportedAsyncFunction
            ) {
              return;
            }

            context.report({
              data: {
                name: getFunctionName(containingFunction),
              },
              messageId: "adHocOkResult",
              node,
            });
          },
        };
      },
    };
