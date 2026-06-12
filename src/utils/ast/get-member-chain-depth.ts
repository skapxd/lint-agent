type ChainNode = {
  type: string;
  expression?: ChainNode;
  object?: ChainNode;
};

// Profundidad de una cadena de acceso PURA, contando saltos de propiedad
// desde la base (que es nivel 0): `isReady` → 0, `result.ok` → 1,
// `options.rules.flag` → 2. Devuelve null si la expresion no es una cadena
// pura (contiene llamadas, indices computados con expresiones, etc.).
export function getMemberChainDepth(node: ChainNode): number | null {
  let current =
    node.type === "ChainExpression" && node.expression !== undefined
      ? node.expression
      : node;
  let depth = 0;

  while (current.type === "MemberExpression") {
    depth += 1;

    if (current.object === undefined) {
      return null;
    }

    current = current.object;
  }

  const reachedChainRoot = current.type === "Identifier" || current.type === "ThisExpression";
  if (reachedChainRoot) {
    return depth;
  }

  return null;
}
