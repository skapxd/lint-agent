import type { TSESTree } from "@typescript-eslint/utils";
import { getMemberChainDepth } from "#/utils/ast/get-member-chain-depth";
import { isGuardLiteral } from "#/utils/ast/is-guard-literal";

const guardOperators = new Set(["===", "!==", "==", "!="]);

// `result.ok === false`, `concesionario == null`, `x !== undefined`:
// comparar un operando ya nombrado contra un literal booleano o nullish es
// la escritura explicita de la afirmacion/negacion/presencia — sigue siendo
// un nombre (y cubre las formas oficiales del guard de Result). Comparar
// contra cualquier otro literal (`status === "ready"`) si es un computo
// anonimo: ahi la extraccion compra semantica.
export function isLiteralGuardComparison(
  node: TSESTree.Node,
  maxMemberDepth: number,
): boolean {
  const isBinaryExpressionNode = node.type === "BinaryExpression";
  if (!isBinaryExpressionNode) {
    return false;
  }

  const usesGuardOperator = !guardOperators.has(node.operator);
  if (usesGuardOperator) {
    return false;
  }

  const { left, right } = node;

  const leftIsGuard = isGuardLiteral(left);
  const rightIsGuard = isGuardLiteral(right);

  const lacksGuardLiteralSide = !leftIsGuard && !rightIsGuard;
  if (lacksGuardLiteralSide) {
    return false;
  }

  const namedSide = leftIsGuard ? right : left;
  const depth = getMemberChainDepth(namedSide);

  return depth !== null && depth <= maxMemberDepth;
}
