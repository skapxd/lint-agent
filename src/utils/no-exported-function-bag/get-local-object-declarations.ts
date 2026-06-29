import type { TSESTree } from "@typescript-eslint/utils";
import { getObjectExpressionFromExpression } from "#/utils/no-exported-function-bag/get-object-expression-from-expression";

export function getLocalObjectDeclarations(program: TSESTree.Program) {
  const localObjectDeclarations = new Map<string, TSESTree.ObjectExpression>();

  for (const statement of program.body) {
    const isVariableDeclaration = statement.type === "VariableDeclaration";
    if (!isVariableDeclaration) {
      continue;
    }

    for (const declarator of statement.declarations) {
      const declaratorId = declarator.id;
      const hasIdentifierName = declaratorId.type === "Identifier";
      if (!hasIdentifierName) {
        continue;
      }

      const objectExpression = getObjectExpressionFromExpression(declarator.init);
      const hasObjectExpressionInitializer = objectExpression !== undefined;
      if (!hasObjectExpressionInitializer) {
        continue;
      }

      localObjectDeclarations.set(declaratorId.name, objectExpression);
    }
  }

  return localObjectDeclarations;
}
