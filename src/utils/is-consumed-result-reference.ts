// @ts-nocheck
// Una referencia al result fallido cuenta como "consumo" del error salvo que
// sea un descarte: `void result.error` o una expresión suelta sin efecto.
// Pasarlo a una función, retornarlo, meterlo en un objeto o asignarlo sí
// mantienen el seguimiento.
export function isConsumedResultReference(identifier) {
  const member =
    identifier.parent?.type === "MemberExpression" &&
    identifier.parent.object === identifier
      ? identifier.parent
      : null;

  const reference = member ?? identifier;
  const parent = reference.parent;

  if (parent?.type === "UnaryExpression" && parent.operator === "void") {
    return false;
  }

  return parent?.type !== "ExpressionStatement";
}
