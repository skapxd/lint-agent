type NegatableNode = {
  type: string;
  operator?: string;
  argument?: NegatableNode;
};

// Quita los `!` exteriores de una expresion: la negacion de un nombre sigue
// siendo un nombre (`!isReady` se lee como prosa igual que `isReady`).
export function unwrapNegations(node: NegatableNode): NegatableNode {
  let current = node;

  while (
    current.type === "UnaryExpression" &&
    current.operator === "!" &&
    current.argument !== undefined
  ) {
    current = current.argument;
  }

  return current;
}
