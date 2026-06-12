import type { TSESTree } from "@typescript-eslint/utils";
// Una flecha "de expresión": sin cuerpo de bloque. Solo puede contener una
// expresión (JSX, una llamada), así que es declarativa por construcción. Un
// cuerpo con llaves (`=> { return ... }`) ya da pie a ifs, variables y lógica
// — eso debe vivir fuera del componente. Las function expressions siempre
// tienen bloque, así que nunca califican.
export function isExpressionArrowFunction(node: TSESTree.Node) {
  return (
    node.type === "ArrowFunctionExpression" &&
    node.body.type !== "BlockStatement"
  );
}
