import type { LegacyAstNode } from "#/utils/rule-types";
import { isMemberPropertyNamed } from "./is-member-property-named";
import { unwrapExpression } from "./unwrap-expression";

// Extrae el Result de una guarda con type-guard, p. ej. `Result.isErr(result)`
// o `Result.isOk(result)`. Devuelve `{ name, node }` del argumento, o null.
export function getResultCheckArgument(node: LegacyAstNode, methodName: LegacyAstNode) {
  const unwrappedNode = unwrapExpression(node);

  if (
    unwrappedNode.type !== "CallExpression" ||
    unwrappedNode.callee.type !== "MemberExpression" ||
    !isMemberPropertyNamed(unwrappedNode.callee, methodName)
  ) {
    return null;
  }

  const argument = unwrappedNode.arguments[0];

  if (argument?.type !== "Identifier") {
    return null;
  }

  return { name: argument.name, node: argument };
}
