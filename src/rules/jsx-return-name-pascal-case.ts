import type { TSESTree } from "@typescript-eslint/utils";
import { functionReturnsJsx } from "#/utils/react/function-returns-jsx";
import { isFunctionNode } from "#/utils/ast/is-function-node";
import type { FunctionNode } from "#/utils/ast/is-function-node";
import { isPascalCaseName } from "#/utils/naming/is-pascal-case-name";
import { toPascalCase } from "#/utils/naming/to-pascal-case";
import type { RuleModule, RuleContext } from "#/utils/rule-authoring/rule-types";

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
          node: FunctionNode,
          name: string | null | undefined,
          reportNode: TSESTree.Node = node,
        ) {
          const hasValidJsxReturnName = !name || isPascalCaseName(name) || !functionReturnsJsx(node);
          if (hasValidJsxReturnName) {
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
          FunctionDeclaration(node: TSESTree.FunctionDeclaration) {
            reportIfJsxReturningFunction(node, node.id?.name, node.id ?? node);
          },
          VariableDeclarator(node: TSESTree.VariableDeclarator) {
            const functionInitializer = node.init;
            const hasFunctionInitializer = isFunctionNode(functionInitializer);
            if (!hasFunctionInitializer) {
              return;
            }

            const variableName = node.id;
            const hasIdentifierName = variableName.type === "Identifier";
            if (!hasIdentifierName) {
              return;
            }

            reportIfJsxReturningFunction(functionInitializer, variableName.name, variableName);
          },
        };
      },
    };
