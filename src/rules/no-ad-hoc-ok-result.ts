import { getContainingFunction } from "#/utils/get-containing-function";
import { getFunctionName } from "#/utils/get-function-name";
import { getReturnedObjectExpression } from "#/utils/get-returned-object-expression";
import { hasBooleanOkProperty } from "#/utils/has-boolean-ok-property";
import { isExportedFunction } from "#/utils/is-exported-function";
import type { RuleModule, LegacyAstNode } from "#/utils/rule-types";

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
      create(context: LegacyAstNode) {
        return {
          ReturnStatement(node: LegacyAstNode) {
            const returnedObject = getReturnedObjectExpression(node.argument);

            if (!returnedObject || !hasBooleanOkProperty(returnedObject)) {
              return;
            }

            const containingFunction = getContainingFunction(node);

            if (
              !containingFunction?.async ||
              !isExportedFunction(containingFunction)
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
