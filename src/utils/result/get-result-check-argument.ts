import type { RuleNode } from "#/utils/rule-authoring/rule-types";
import { isMemberPropertyNamed } from "#/utils/ast/is-member-property-named";
import { unwrapExpression } from "#/utils/ast/unwrap-expression";

// Extrae el Result de una guarda con type-guard, p. ej. `Result.isErr(result)`
// o `Result.isOk(result)`. Devuelve `{ name, node }` del argumento, o null.
export function getResultCheckArgument(node: RuleNode, methodName: string) {
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
