import { getMemberChainDepth } from "#/utils/ast/get-member-chain-depth";
import { isGuardLiteral } from "#/utils/ast/is-guard-literal";

type ComparisonNode = {
  type: string;
  operator?: string;
  left?: ComparisonNode;
  right?: ComparisonNode;
  name?: string;
  value?: unknown;
};

const guardOperators = new Set(["===", "!==", "==", "!="]);

// `result.ok === false`, `concesionario == null`, `x !== undefined`:
// comparar un operando ya nombrado contra un literal booleano o nullish es
// la escritura explicita de la afirmacion/negacion/presencia — sigue siendo
// un nombre (y cubre las formas oficiales del guard de Result). Comparar
// contra cualquier otro literal (`status === "ready"`) si es un computo
// anonimo: ahi la extraccion compra semantica.
export function isLiteralGuardComparison(
  node: ComparisonNode,
  maxMemberDepth: number,
): boolean {
  const isBinaryExpressionNode = node.type === "BinaryExpression";
  if (!isBinaryExpressionNode) {
    return false;
  }

  const usesGuardOperator = node.operator === undefined || !guardOperators.has(node.operator);
  if (usesGuardOperator) {
    return false;
  }

  const { left, right } = node;

  const lacksComparisonSides = left === undefined || right === undefined;
  if (lacksComparisonSides) {
    return false;
  }

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
