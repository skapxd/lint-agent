// @ts-nocheck
import { functionReturnsJsx } from "#/utils/function-returns-jsx";
import { isFunctionNode } from "#/utils/is-function-node";
import { isPascalCaseName } from "#/utils/is-pascal-case-name";
import { toPascalCase } from "#/utils/to-pascal-case";

export const jsxReturnNamePascalCase = {
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
      create(context) {
        function reportIfJsxReturningFunction(node, name, reportNode = node) {
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
          FunctionDeclaration(node) {
            reportIfJsxReturningFunction(node, node.id?.name, node.id ?? node);
          },
          VariableDeclarator(node) {
            if (!isFunctionNode(node.init) || node.id.type !== "Identifier") {
              return;
            }

            reportIfJsxReturningFunction(node.init, node.id.name, node.id);
          },
        };
      },
    };
