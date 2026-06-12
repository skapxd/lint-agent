import { getMemberChainDepth } from "#/utils/get-member-chain-depth";
import { isGuardLiteral } from "#/utils/is-guard-literal";

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
  if (node.type !== "BinaryExpression") {
    return false;
  }

  if (node.operator === undefined || !guardOperators.has(node.operator)) {
    return false;
  }

  const { left, right } = node;

  if (left === undefined || right === undefined) {
    return false;
  }

  const leftIsGuard = isGuardLiteral(left);
  const rightIsGuard = isGuardLiteral(right);

  if (!leftIsGuard && !rightIsGuard) {
    return false;
  }

  const namedSide = leftIsGuard ? right : left;
  const depth = getMemberChainDepth(namedSide);

  return depth !== null && depth <= maxMemberDepth;
}
