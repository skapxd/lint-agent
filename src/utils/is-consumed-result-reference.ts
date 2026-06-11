// @ts-nocheck
import { collectIdentifiersNamed } from "./collect-identifiers-named";
import { getDeclaredAliasNames } from "./get-declared-alias-names";
import { isInsideNode } from "./is-inside-node";

// Una referencia al result fallido cuenta como "consumo" del error salvo que
// sea un descarte: `void result.error`, una expresión suelta sin efecto, o un
// ALIAS que nunca se consume (`const e = result.error; return;`). Los alias
// se siguen recursivamente dentro del guard: aliasar no es consumir.
export function isConsumedResultReference(identifier, searchRoot, visited = new Set()) {
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

  if (parent?.type === "ExpressionStatement") {
    return false;
  }

  if (parent?.type !== "VariableDeclarator" || parent.init !== reference) {
    return true;
  }

  const aliasNames = getDeclaredAliasNames(parent.id).filter(
    (name) => !visited.has(name),
  );

  return aliasNames.some((aliasName) => {
    visited.add(aliasName);

    return collectIdentifiersNamed(searchRoot, aliasName)
      .filter((aliasReference) => !isInsideNode(aliasReference, parent.id))
      .some((aliasReference) =>
        isConsumedResultReference(aliasReference, searchRoot, visited),
      );
  });
}
