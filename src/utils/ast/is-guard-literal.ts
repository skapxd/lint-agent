type LiteralNode = {
  type: string;
  name?: string;
  value?: unknown;
};

// Literales de guard: true/false/null (Literal) y `undefined` (que en el AST
// es un Identifier, no un Literal). Compararse contra ellos es la escritura
// explicita de la afirmacion/negacion/presencia de un valor.
export function isGuardLiteral(node: LiteralNode): boolean {
  if (node.type === "Literal") {
    return typeof node.value === "boolean" || node.value === null;
  }

  return node.type === "Identifier" && node.name === "undefined";
}
