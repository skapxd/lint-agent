import type { TSESTree } from "@typescript-eslint/utils";

// Quita los `!` exteriores de una expresion: la negacion de un nombre sigue
// siendo un nombre (`!isReady` se lee como prosa igual que `isReady`).
export function unwrapNegations(node: TSESTree.Expression): TSESTree.Expression {
  let current = node;

  while (
    current.type === "UnaryExpression" &&
    current.operator === "!"
  ) {
    current = current.argument;
  }

  return current;
}
