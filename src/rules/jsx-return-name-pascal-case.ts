import { functionReturnsJsx } from "#/utils/function-returns-jsx";
import { isFunctionNode } from "#/utils/is-function-node";
import { isPascalCaseName } from "#/utils/is-pascal-case-name";
import { toPascalCase } from "#/utils/to-pascal-case";
import type { RuleModule, RuleNode, RuleContext } from "#/utils/rule-types";

export const jsxReturnNamePascalCase: RuleModule = {
      meta: {
        type: "problem",
        docs: {
          description:
            "Exige nombres PascalCase para funciones que devuelven JSX.",
        },
        messages: {
          invalidName:
            "La funcion `{{name}}` devuelve JSX. Nombrala como componente, por ejemplo `{{suggestedName}}`, y usala con sintaxis JSX si aplica.",
        },
        schema: [],
      },
      create(context: RuleContext) {
        function reportIfJsxReturningFunction(
          node: RuleNode,
          name: string | null | undefined,
          reportNode: RuleNode = node,
        ) {
          if (!name || isPascalCaseName(name) || !functionReturnsJsx(node)) {
            return;
          }

          context.report({
            data: {
              name,
              suggestedName: toPascalCase(name),
            },
            messageId: "invalidName",
            node: reportNode,
          });
        }

        return {
          FunctionDeclaration(node: RuleNode) {
            reportIfJsxReturningFunction(node, node.id?.name, node.id ?? node);
          },
          VariableDeclarator(node: RuleNode) {
            if (!isFunctionNode(node.init) || node.id.type !== "Identifier") {
              return;
            }

            reportIfJsxReturningFunction(node.init, node.id.name, node.id);
          },
        };
      },
    };
